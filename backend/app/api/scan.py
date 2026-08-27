import json
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
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

    # 1. Background cleanup & text extraction per face
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

        # Extract OCR text for this panel
        extracted_text = extract_raw_text_single_image(cropped_bytes, panel_id)
        panel_extracted_texts[panel_id] = extracted_text

    if not primary_cropped_bytes and not panel_extracted_texts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package images could not be processed."
        )

    # 2. Synthesize declarations across all faces
    extracted = synthesize_statutory_declarations(panel_extracted_texts)
    
    # Trigger fallback if synthesis marked the batch as illegible
    if not extracted or not extracted.get("is_legible", True):
        if primary_cropped_bytes:
            fallback_res = extract_label_data(primary_cropped_bytes)
            if fallback_res and fallback_res.get("is_legible", False):
                extracted = fallback_res

    # 3. Build a graceful fallback payload if OCR text was completely blank
    if not extracted or not extracted.get("is_legible", True):
        extracted = {
            "is_legible": True,
            "category": "NON_FOOD",
            "product_name": "Unidentified Commodity (Unreadable / Missing Declarations)",
            "manufacturer_details": None,
            "generic_name": None,
            "net_quantity": None,
            "mrp": None,
            "unit_sale_price": None,
            "mfg_date": None,
            "expiry_date": None,
            "consumer_care": None,
            "country_of_origin": None,
            "measured_font_height_mm": 1.5,
            "nutrition": {"is_applicable": False}
        }

    # 4. Rule 7 Font & PDP Ratio Check
    font_audit = audit_font_and_pdp_compliance(
        pdp_area_sq_cm=primary_vision_meta.get("pdp_area_sq_cm", 100.0) if primary_vision_meta else 100.0,
        detected_font_mm=extracted.get("measured_font_height_mm", 1.5)
    )

    # 5. Statutory Rules Evaluation (Legal Metrology Rules, 2011)
    compliance = run_metrology_audit(extracted)
    if font_audit.get("font_compliance_status") == "NON-COMPLIANT" and font_audit.get("violation"):
        compliance["violations"].append(font_audit["violation"])
        compliance["violations_count"] = len(compliance["violations"])
        compliance["compliance_score"] = max(0, compliance.get("compliance_score", 100) - 15)
        compliance["status"] = "NON-COMPLIANT"

    # 6. Nutrition Score (Edible Products Only)
    nutrition_info = extracted.get("nutrition", {})
    health = calculate_nutri_health(nutrition_info) if nutrition_info.get("is_applicable") else None
    product_name = extracted.get("product_name") or "Packaged Commodity"

    # 7. Persist to Database
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

    # 8. Return response
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