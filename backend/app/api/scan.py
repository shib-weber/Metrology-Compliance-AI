import json
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from db.database import get_db, DBInspection
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

@router.post("/analyze")
async def analyze_commodity(
    files: List[UploadFile] = File(...),
    panel_ids: str = Form(""),
    db: Session = Depends(get_db)
):
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No package image files uploaded."
        )

    parsed_ids = [p.strip() for p in panel_ids.split(",") if p.strip()]
    cleaned_textures = {}
    panel_extracted_texts = {}
    primary_cropped_bytes = None
    primary_vision_meta = None

    # 1. Clean background and extract OCR per face
    for idx, file in enumerate(files):
        panel_id = parsed_ids[idx] if idx < len(parsed_ids) else f"panel_{idx + 1}"
        raw_bytes = await file.read()
        if not raw_bytes:
            continue

        try:
            if panel_id.lower() == "front" or primary_cropped_bytes is None:
                cropped_bytes, clean_b64, vision_meta, _ = segment_and_analyze_shape(raw_bytes)
                primary_cropped_bytes = cropped_bytes
                primary_vision_meta = vision_meta
            else:
                cropped_bytes, clean_b64 = clean_and_crop_panel(raw_bytes)

            cleaned_textures[panel_id] = clean_b64
        except Exception:
            cropped_bytes = raw_bytes
            cleaned_textures[panel_id] = ""

        # On-device PaddleOCR
        extracted_text = extract_raw_text_single_image(cropped_bytes, panel_id)
        panel_extracted_texts[panel_id] = extracted_text

    # 2. Synthesize multi-face declarations
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

    # 6. Persist to Database
    db_item = DBInspection(
        product_name=product_name,
        status=compliance.get("status", "NON-COMPLIANT"),
        compliance_score=compliance.get("compliance_score", 0),
        health_score=health["health_score"] if health else 0,
        violations_json=json.dumps(compliance.get("violations", [])),
        raw_declarations_json=json.dumps({
            "declarations": extracted,
            "compliance": compliance
        })
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

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
        "clean_textures": cleaned_textures
    }


@router.post("/generate-digital-twin")
async def generate_digital_twin(file: UploadFile = File(...)):
    """
    Builds and returns a true customized 3D GLB model conforming to the package silhouette.
    """
    raw_bytes = await file.read()
    glb_data = DigitalTwin3DGenerator.generate_mesh_glb(raw_bytes)
    return Response(
        content=glb_data,
        media_type="model/gltf-binary",
        headers={"Content-Disposition": "attachment; filename=digital_twin.glb"}
    )