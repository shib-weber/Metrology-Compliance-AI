import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db, DBInspection
from engine.pdf_generator import generate_inspection_notice
from engine.rules_2011 import run_metrology_audit

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/list")
def list_inspection_reports(db: Session = Depends(get_db)):
    """Returns all past commodity inspection records."""
    try:
        records = db.query(DBInspection).order_by(desc(DBInspection.id)).all()
        result = []
        for r in records:
            # Safely parse violations and declarations
            try:
                viols = json.loads(r.violations_json) if r.violations_json else []
            except Exception:
                viols = []

            try:
                decls = json.loads(r.raw_declarations_json) if r.raw_declarations_json else {}
            except Exception:
                decls = {}

            result.append({
                "id": r.id,
                "product_name": r.product_name,
                "status": r.status,
                "compliance_score": r.compliance_score,
                "health_score": r.health_score,
                "violations": viols,
                "declarations": decls
            })
        return result
    except Exception as e:
        print(f"[Reports API Error]: {e}")
        return []


@router.get("/{inspection_id}/pdf")
def export_pdf_report(inspection_id: int, db: Session = Depends(get_db)):
    rec = db.query(DBInspection).filter(DBInspection.id == inspection_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection report not found")

    try:
        raw_payload = json.loads(rec.raw_declarations_json or "{}")
        if isinstance(raw_payload, dict) and "compliance" in raw_payload:
            audit_data = raw_payload["compliance"]
            raw_decl = raw_payload.get("declarations", {})
        else:
            raw_decl = raw_payload
            audit_data = run_metrology_audit(raw_decl)
    except Exception:
        raw_decl = {}
        audit_data = {
            "status": rec.status,
            "compliance_score": rec.compliance_score,
            "violations": json.loads(rec.violations_json or "[]"),
            "compliances": []
        }

    buffer = generate_inspection_notice(audit_data, rec.product_name, raw_decl)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=notice_inspection_{inspection_id}.pdf"}
    )