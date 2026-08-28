import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from db.database import get_db, DBInspection
from models.schemas import ActionUpdatePayload, FlagReportPayload
from engine.pdf_generator import generate_inspection_notice
from engine.rules_2011 import run_metrology_audit

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/list")
def list_inspection_reports(
    email: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    flagged_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """
    Role-isolated inspection list:
    - Citizen: Only sees inspections where created_by == their email.
    - Inspector: Only sees inspections submitted by inspectors OR inspections flagged/reported by citizens.
    """
    try:
        clean_email = email.strip().lower() if email else ""
        query = db.query(DBInspection)

        if role == "citizen" and clean_email:
            query = query.filter(DBInspection.created_by == clean_email)
        elif role == "inspector":
            if flagged_only:
                query = query.filter(DBInspection.flagged_for_review == True)
            else:
                # Inspector sees their own scans + any scans flagged by citizens
                query = query.filter(
                    or_(
                        DBInspection.flagged_for_review == True,
                        DBInspection.created_by == clean_email,
                        DBInspection.created_by.ilike("%inspector%")
                    )
                )
        elif clean_email:
            query = query.filter(DBInspection.created_by == clean_email)

        records = query.order_by(desc(DBInspection.id)).all()
        result = []

        for r in records:
            try:
                viols = json.loads(r.violations_json) if r.violations_json else []
            except Exception:
                viols = []

            try:
                comps = json.loads(r.compliances_json) if r.compliances_json else []
            except Exception:
                comps = []

            try:
                decls = json.loads(r.raw_declarations_json) if r.raw_declarations_json else {}
            except Exception:
                decls = {}

            try:
                panel_txts = json.loads(r.panel_texts_json) if r.panel_texts_json else {}
            except Exception:
                panel_txts = {}

            try:
                textures = json.loads(r.textures_json) if r.textures_json else {}
            except Exception:
                textures = {}

            result.append({
                "id": r.id,
                "product_name": r.product_name,
                "category": r.category,
                "status": r.status,
                "compliance_score": r.compliance_score,
                "health_score": r.health_score,
                "glb_url": r.glb_url,
                "created_by": r.created_by,
                "flagged_for_review": r.flagged_for_review,
                "inspector_action": r.inspector_action,
                "action_notes": r.action_notes,
                "action_by": r.action_by,
                "action_taken_at": r.action_taken_at.isoformat() if r.action_taken_at else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "violations": viols,
                "compliances": comps,
                "declarations": decls,
                "panel_texts": panel_txts,
                "textures": textures
            })
        return result
    except Exception as e:
        print(f"[Reports API Error]: {e}")
        return []


@router.post("/flag")
def flag_inspection_to_inspector(payload: FlagReportPayload, db: Session = Depends(get_db)):
    """Citizens call this when a product is non-compliant to report it to the Inspector."""
    rec = db.query(DBInspection).filter(DBInspection.id == payload.report_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found")
    
    rec.flagged_for_review = True
    if payload.notes:
        rec.action_notes = f"Citizen Report Note: {payload.notes}"
    db.commit()
    return {"status": "success", "message": f"Scan #{payload.report_id} forwarded to Enforcement Desk"}


@router.post("/{inspection_id}/action")
def update_inspector_action(inspection_id: int, payload: ActionUpdatePayload, db: Session = Depends(get_db)):
    """Inspectors take legal action against reported/audited products."""
    rec = db.query(DBInspection).filter(DBInspection.id == inspection_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    rec.inspector_action = payload.action
    rec.action_notes = payload.notes
    rec.action_by = payload.inspector_email
    rec.action_taken_at = datetime.now(timezone.utc)
    
    db.commit()
    return {
        "status": "success",
        "action": rec.inspector_action,
        "action_taken_at": rec.action_taken_at.isoformat()
    }


@router.get("/{inspection_id}/pdf")
def export_pdf_report(inspection_id: int, db: Session = Depends(get_db)):
    rec = db.query(DBInspection).filter(DBInspection.id == inspection_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection report not found")

    try:
        raw_decl = json.loads(rec.raw_declarations_json or "{}")
        audit_data = {
            "status": rec.status,
            "compliance_score": rec.compliance_score,
            "violations": json.loads(rec.violations_json or "[]"),
            "compliances": json.loads(rec.compliances_json or "[]")
        }
    except Exception:
        raw_decl = {}
        audit_data = run_metrology_audit(raw_decl)

    buffer = generate_inspection_notice(audit_data, rec.product_name, raw_decl)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=notice_inspection_{inspection_id}.pdf"}
    )