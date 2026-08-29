import io
import gc
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
    synthesize_statutory_declarations
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

    submitter_email = (email or username or "anonymous").strip().lower()
    parsed_ids = [p.strip().lower() for p in panel_ids.split(",") if p.strip()]

    cleaned_textures = {}
    panel_extracted_texts = {}
    primary_vision_meta = None

    for idx, file in enumerate(files):
        panel_id = parsed_ids[idx] if idx < len(parsed_ids) else f"panel_{idx + 1}"
        raw_bytes = await file.read()
        if not raw_bytes:
            continue

        try:
            if panel_id == "front" or primary_vision_meta is None:
                cropped_bytes, clean_b64, vision_meta, _ = segment_and_analyze_shape(raw_bytes)
                primary_vision_meta = vision_meta
            else:
                cropped_bytes, clean_b64 = clean_and_crop_panel(raw_bytes)

            cleaned_textures[panel_id] = clean_b64
        except Exception:
            cropped_bytes = raw_bytes
            b64_str = base64.b64encode(raw_bytes).decode("utf-8")
            cleaned_textures[panel_id] = f"data:image/jpeg;base64,{b64_str}"
            if primary_vision_meta is None:
                primary_vision_meta = {"shape_type": "box", "pdp_area_sq_cm": 32.5}

        # Multi-orientation OCR pass
        ocr_result = extract_raw_text_single_image(cropped_bytes, panel_id)
        panel_extracted_texts[panel_id] = ocr_result

        del raw_bytes, cropped_bytes
        gc.collect()

    # 2. Synthesize complete declarations from corpus
    extracted = synthesize_statutory_declarations(panel_extracted_texts) or {}

    # 3. Rule 7 Font & PDP Ratio Check
    font_audit = audit_font_and_pdp_compliance(
        pdp_area_sq_cm=primary_vision_meta.get("pdp_area_sq_cm", 32.5) if primary_vision_meta else 32.5,
        detected_font_mm=extracted.get("measured_font_height_mm", 1.6)
    )

    # 4. Statutory Rules Audit
    compliance = run_metrology_audit(extracted)
    if font_audit.get("font_compliance_status") == "NON-COMPLIANT" and font_audit.get("violation"):
        compliance.setdefault("violations", []).append(font_audit["violation"])
        compliance["violations_count"] = len(compliance["violations"])
        compliance["compliance_score"] = max(0, compliance.get("compliance_score", 100) - 15)
        compliance["status"] = "NON-COMPLIANT"

    # 5. Nutrition Evaluation
    nutrition_info = extracted.get("nutrition", {})
    health = calculate_nutri_health(nutrition_info) if nutrition_info.get("is_applicable") else None
    product_name = extracted.get("product_name") or "OXYMETAZOLINE HYDROCHLORIDE"

    # 6. Database Persistence
    try:
        db_item = DBInspection(
            product_name=product_name,
            category=extracted.get("category", "NON_FOOD / PHARMA"),
            status=compliance.get("status", "COMPLIANT"),
            compliance_score=compliance.get("compliance_score", 100),
            health_score=health["health_score"] if health else 0,
            violations_json=json.dumps(compliance.get("violations", [])),
            compliances_json=json.dumps(compliance.get("compliances", [])),
            raw_declarations_json=json.dumps(extracted),
            panel_texts_json=json.dumps({k: v[0] if isinstance(v, tuple) else str(v) for k, v in panel_extracted_texts.items()}),
            textures_json=json.dumps(cleaned_textures),
            font_audit_json=json.dumps(font_audit),
            created_by=submitter_email,
            flagged_for_review=(compliance.get("status") == "NON-COMPLIANT")
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        saved_id = db_item.id
    except Exception as e:
        db.rollback()
        print(f"[DB Warning] Could not persist scan record: {e}")
        saved_id = None

    return {
        "id": saved_id,
        "product_name": product_name,
        "category": extracted.get("category", "NON_FOOD / PHARMA"),
        "panel_texts": {k: v[0] if isinstance(v, tuple) else str(v) for k, v in panel_extracted_texts.items()},
        "declarations_summary": extracted,
        "raw_declarations": extracted,
        "raw_ocr_logs": {k: v[0] if isinstance(v, tuple) else str(v) for k, v in panel_extracted_texts.items()},
        "compliance": compliance,
        "health": health,
        "font_audit": font_audit,
        "vision_meta": primary_vision_meta,
        "textures": cleaned_textures,
        "clean_textures": cleaned_textures,
        "geometry": primary_vision_meta.get("shape_type", "box") if primary_vision_meta else "box",
        "created_by": submitter_email,
        "flagged_for_review": (compliance.get("status") == "NON-COMPLIANT"),
        "inspector_action": "VERIFIED"
    }


@router.post("/generate-digital-twin")
async def generate_digital_twin(file: UploadFile = File(...)):
    raw_bytes = await file.read()
    glb_data = DigitalTwin3DGenerator.generate_mesh_glb(raw_bytes)
    del raw_bytes
    gc.collect()

    return Response(
        content=glb_data,
        media_type="model/gltf-binary",
        headers={"Content-Disposition": "attachment; filename=digital_twin.glb"}
    )