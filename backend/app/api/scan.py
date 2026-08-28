import json
import base64
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from db.database import get_db, DBInspection
from models.schemas import ScanResponse
from engine.vision_preprocessor import segment_and_analyze_shape, clean_and_crop_panel
from engine.font_ratio_auditor import audit_font_and_pdp_compliance
from engine.ocr_engine import (
    extract_raw_text_single_image,
    synthesize_statutory_declarations,
    extract_label_data
)
from engine.rules_2011 import run_metrology_audit
from engine.nutri_engine import calculate_nutri_health
from engine.mesh_reconstructor import DigitalTwin3DGenerator

router = APIRouter(prefix="/scan", tags=["Scan"])


@router.post("/analyze", response_model=ScanResponse)
async def analyze_commodity(
    files: List[UploadFile] = File(...),
    panel_ids: str = Form(""),
    email: Optional[str] = Form(None),
    username: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No package image files uploaded."
        )

    # Resolve submitter email (handles either email or username form parameter)
    submitter_email = (email or username or "anonymous").strip().lower()

    parsed_ids = [p.strip().lower() for p in panel_ids.split(",") if p.strip()]
    cleaned_textures = {}
    panel_extracted_texts = {}
    primary_cropped_bytes = None
    primary_vision_meta = None
    primary_raw_bytes = None

    # 1. Clean background and extract OCR per face
    for idx, file in enumerate(files):
        panel_id = parsed_ids[idx] if idx < len(parsed_ids) else f"panel_{idx + 1}"
        raw_bytes = await file.read()
        if not raw_bytes:
            continue

        if primary_raw_bytes is None or panel_id == "front":
            primary_raw_bytes = raw_bytes

        try:
            if panel_id == "front" or primary_cropped_bytes is None:
                cropped_bytes, clean_b64, vision_meta, _ = segment_and_analyze_shape(raw_bytes)
                primary_cropped_bytes = cropped_bytes
                primary_vision_meta = vision_meta
            else:
                cropped_bytes, clean_b64 = clean_and_crop_panel(raw_bytes)

            cleaned_textures[panel_id] = clean_b64 if clean_b64.startswith("data:image") else f"data:image/jpeg;base64,{clean_b64}"
        except Exception:
            cropped_bytes = raw_bytes
            b64_str = base64.b64encode(raw_bytes).decode("utf-8")
            cleaned_textures[panel_id] = f"data:image/jpeg;base64,{b64_str}"

        # Safe OCR text extraction (ensures text is always a pure string, not a tuple)
        raw_ocr_result = extract_raw_text_single_image(cropped_bytes, panel_id)
        if isinstance(raw_ocr_result, tuple):
            extracted_text = str(raw_ocr_result[0])
        else:
            extracted_text = str(raw_ocr_result)

        panel_extracted_texts[panel_id] = extracted_text

    # 2. Synthesize multi-face statutory declarations
    extracted = synthesize_statutory_declarations(panel_extracted_texts)

    if not extracted or not extracted.get("is_legible", True):
        if primary_cropped_bytes:
            extracted = extract_label_data(primary_cropped_bytes)

    # 3. Rule 7 Font & PDP Ratio Check
    font_audit = audit_font_and_pdp_compliance(
        pdp_area_sq_cm=primary_vision_meta.get("pdp_area_sq_cm", 100.0) if primary_vision_meta else 100.0,
        detected_font_mm=extracted.get("measured_font_height_mm", 2.0)
    )

    # 4. Statutory Rules Evaluation (Legal Metrology Rules, 2011)
    compliance = run_metrology_audit(extracted)
    if font_audit.get("font_compliance_status") == "NON-COMPLIANT" and font_audit.get("violation"):
        compliance["violations"].append(font_audit["violation"])
        compliance["violations_count"] = len(compliance["violations"])
        compliance["compliance_score"] = max(0, compliance.get("compliance_score", 100) - 15)
        compliance["status"] = "NON-COMPLIANT"

    # 5. Nutrition Score
    nutrition_info = extracted.get("nutrition", {})
    health = calculate_nutri_health(nutrition_info) if nutrition_info.get("is_applicable") else None
    product_name = extracted.get("product_name") or "Packaged Commodity"

    # 6. Build and persist database record to Supabase
    db_item = DBInspection(
        product_name=product_name,
        category=extracted.get("category", "NON_FOOD"),
        status=compliance.get("status", "NON-COMPLIANT"),
        compliance_score=compliance.get("compliance_score", 0),
        health_score=health["health_score"] if health else 0,
        violations_json=json.dumps(compliance.get("violations", [])),
        compliances_json=json.dumps(compliance.get("compliances", [])),
        raw_declarations_json=json.dumps(extracted),
        panel_texts_json=json.dumps(panel_extracted_texts),
        textures_json=json.dumps(cleaned_textures),
        font_audit_json=json.dumps(font_audit),
        created_by=submitter_email,
        flagged_for_review=(compliance.get("status") == "NON-COMPLIANT")
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # 7. Return complete ScanResponse payload conforming strictly to schemas.py
    return {
        "id": db_item.id,
        "product_name": db_item.product_name,
        "category": extracted.get("category", "NON_FOOD"),
        "panel_texts": panel_extracted_texts,
        "declarations_summary": extracted,
        "raw_declarations": extracted,
        "raw_ocr_logs": panel_extracted_texts,
        "compliance": compliance,
        "health": health,
        "font_audit": font_audit,
        "vision_meta": primary_vision_meta,
        "textures": cleaned_textures,
        "clean_textures": cleaned_textures,
        "geometry": primary_vision_meta.get("shape_type", "box") if primary_vision_meta else "box",
        "created_by": db_item.created_by,
        "flagged_for_review": db_item.flagged_for_review,
        "inspector_action": db_item.inspector_action
    }


@router.post("/generate-digital-twin")
async def generate_digital_twin(file: UploadFile = File(...)):
    """
    Builds and returns a customized 3D GLB model conforming to the package silhouette.
    """
    raw_bytes = await file.read()
    glb_data = DigitalTwin3DGenerator.generate_mesh_glb(raw_bytes)
    return Response(
        content=glb_data,
        media_type="model/gltf-binary",
        headers={"Content-Disposition": "attachment; filename=digital_twin.glb"}
    )