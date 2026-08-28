import io
import gc
import json
import base64
import cv2
import numpy as np
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


def enhance_image_for_ocr(image_bytes: bytes) -> bytes:
    """
    Applies adaptive contrast equalization (CLAHE) and de-noising 
    to maximize text extraction clarity on live camera captures.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return image_bytes

        # Convert to LAB color space to equalize luminance channel
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

        # Encode back to high-quality JPEG
        _, buffer = cv2.imencode(".jpg", enhanced, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
        return buffer.tobytes()
    except Exception:
        return image_bytes


def perform_multi_orientation_ocr(image_bytes: bytes, panel_id: str) -> str:
    """
    Runs OCR on the normal orientation. If text density is low (e.g. rotated top flap),
    rotates 90/180/270 degrees to guarantee statutory text capture.
    """
    enhanced_bytes = enhance_image_for_ocr(image_bytes)
    
    # 1. Primary pass
    res = extract_raw_text_single_image(enhanced_bytes, panel_id)
    text = str(res[0]) if isinstance(res, tuple) else str(res)
    
    # If standard pass found substantial text (MRP, Batch, etc.), return immediately
    keywords = ["mrp", "rs", "batch", "pkg", "mfg", "exp", "net", "qty", "date"]
    if any(k in text.lower() for k in keywords) and len(text.strip()) > 15:
        return text

    # 2. Rotational fallback if text is sideways (common in mobile turntable snaps)
    nparr = np.frombuffer(enhanced_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return text

    best_text = text
    for angle in [cv2.ROTATE_90_CLOCKWISE, cv2.ROTATE_180, cv2.ROTATE_90_COUNTERCLOCKWISE]:
        rotated = cv2.rotate(img, angle)
        _, rot_buf = cv2.imencode(".jpg", rotated, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        rot_res = extract_raw_text_single_image(rot_buf.tobytes(), panel_id)
        rot_text = str(rot_res[0]) if isinstance(rot_res, tuple) else str(rot_res)
        
        if len(rot_text.strip()) > len(best_text.strip()):
            best_text = rot_text
        if any(k in rot_text.lower() for k in keywords):
            return rot_text

    return best_text


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

            cleaned_textures[panel_id] = clean_b64 if clean_b64.startswith("data:image") else f"data:image/jpeg;base64,{clean_b64}"
        except Exception:
            cropped_bytes = raw_bytes
            b64_str = base64.b64encode(raw_bytes).decode("utf-8")
            cleaned_textures[panel_id] = f"data:image/jpeg;base64,{b64_str}"
            if primary_vision_meta is None:
                primary_vision_meta = {"shape_type": "box", "pdp_area_sq_cm": 100.0}

        # Multi-orientation adaptive OCR pipeline
        extracted_text = perform_multi_orientation_ocr(cropped_bytes, panel_id)
        panel_extracted_texts[panel_id] = extracted_text

        del raw_bytes, cropped_bytes
        gc.collect()

    # 2. Synthesize declarations from extracted text corpus
    extracted = synthesize_statutory_declarations(panel_extracted_texts) or {}

    # 3. Rule 7 Font & PDP Ratio Check
    font_audit = audit_font_and_pdp_compliance(
        pdp_area_sq_cm=primary_vision_meta.get("pdp_area_sq_cm", 100.0) if primary_vision_meta else 100.0,
        detected_font_mm=extracted.get("measured_font_height_mm", 2.0)
    )

    # 4. Statutory Rules Evaluation
    compliance = run_metrology_audit(extracted)
    if font_audit.get("font_compliance_status") == "NON-COMPLIANT" and font_audit.get("violation"):
        compliance.setdefault("violations", []).append(font_audit["violation"])
        compliance["violations_count"] = len(compliance["violations"])
        compliance["compliance_score"] = max(0, compliance.get("compliance_score", 100) - 15)
        compliance["status"] = "NON-COMPLIANT"

    # 5. Nutrition Evaluation
    nutrition_info = extracted.get("nutrition", {})
    health = calculate_nutri_health(nutrition_info) if nutrition_info.get("is_applicable") else None
    product_name = extracted.get("product_name") or "Packaged Commodity"

    # 6. Database Persistence
    try:
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
        saved_id = db_item.id
    except Exception as e:
        db.rollback()
        print(f"[DB Warning] Could not persist scan record: {e}")
        saved_id = None

    return {
        "id": saved_id,
        "product_name": product_name,
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
        "created_by": submitter_email,
        "flagged_for_review": (compliance.get("status") == "NON-COMPLIANT"),
        "inspector_action": "PENDING"
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