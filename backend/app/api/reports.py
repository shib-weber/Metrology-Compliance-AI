import io
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db, DBInspection
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

router = APIRouter(prefix="/reports", tags=["Reports"])


def generate_inspection_notice(audit_data: dict, product_name: str = None, declarations: dict = None) -> io.BytesIO:
    declarations = declarations or {}
    
    resolved_name = (
        product_name or 
        declarations.get("product_name") or 
        audit_data.get("product_name") or 
        "Unidentified Packaged Specimen"
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TStyle', parent=styles['Heading1'], fontSize=14, leading=18, textColor=colors.HexColor("#0f172a"), spaceAfter=3)
    meta_style = ParagraphStyle('MStyle', parent=styles['Normal'], fontSize=8.5, leading=12, textColor=colors.HexColor("#475569"))
    cell_style = ParagraphStyle('CStyle', parent=styles['Normal'], fontSize=8, leading=11, textColor=colors.HexColor("#0f172a"))
    header_cell_style = ParagraphStyle('HCStyle', parent=styles['Normal'], fontSize=8, leading=11, fontName='Helvetica-Bold', textColor=colors.whitesmoke)

    story = []

    # Title & Legal Heading
    story.append(Paragraph("LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011", title_style))
    story.append(Paragraph("<b>Statutory Inspection &amp; Compliance Audit Certificate (Form V)</b>", styles['Heading3']))
    story.append(Spacer(1, 6))

    status_val = audit_data.get("status", "NON-COMPLIANT")
    score = audit_data.get("compliance_score", 0)

    story.append(Paragraph(
        f"<b>Product Inspected:</b> {resolved_name} | <b>Compliance Status:</b> {status_val} ({score}/100)",
        meta_style
    ))
    story.append(Spacer(1, 8))

    # --- 1. VERIFIED STATUTORY DECLARATIONS TABLE ---
    story.append(Paragraph("<b>Extracted Statutory Declarations Summary:</b>", styles['Heading4']))
    story.append(Spacer(1, 3))

    decl_records = [
        [
            Paragraph(f"<b>MRP:</b> {declarations.get('mrp') or 'NOT DETECTED (MISSING)'}", cell_style),
            Paragraph(f"<b>Unit Sale Price:</b> {declarations.get('unit_sale_price') or 'NOT DECLARED'}", cell_style)
        ],
        [
            Paragraph(f"<b>Net Quantity:</b> {declarations.get('net_quantity') or 'NOT DETECTED'}", cell_style),
            Paragraph(f"<b>Batch / Lot No:</b> {declarations.get('batch_number') or 'NOT DETECTED'}", cell_style)
        ],
        [
            Paragraph(f"<b>Manufacturing Date:</b> {declarations.get('mfg_date') or 'NOT DETECTED'}", cell_style),
            Paragraph(f"<b>Expiry / Best Before:</b> {declarations.get('expiry_date') or 'NOT DETECTED'}", cell_style)
        ],
        [
            Paragraph(f"<b>Generic Commodity Name:</b> {declarations.get('generic_name') or 'NOT DETECTED'}", cell_style),
            Paragraph(f"<b>Country of Origin:</b> {declarations.get('country_of_origin') or 'NOT DETECTED'}", cell_style)
        ],
        [
            Paragraph(f"<b>Manufacturer / Packer:</b> {str(declarations.get('manufacturer_details') or 'NOT DETECTED')[:90]}", cell_style),
            Paragraph(f"<b>Consumer Helpline:</b> {declarations.get('consumer_care') or 'NOT DETECTED'}", cell_style)
        ]
    ]

    t_decl = Table(decl_records, colWidths=[270, 270])
    t_decl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 4)
    ]))
    story.append(t_decl)
    story.append(Spacer(1, 10))

    # --- 2. SATISFIED STATUTORY PROVISIONS TABLE ---
    compliances = audit_data.get("compliances", [])
    story.append(Paragraph(f"<b>✓ Satisfied Statutory Provisions ({len(compliances)}):</b>", styles['Heading4']))
    story.append(Spacer(1, 3))

    comp_records = [[
        Paragraph("Rule Section", header_cell_style),
        Paragraph("Statutory Mandate", header_cell_style),
        Paragraph("Observed Compliance &amp; Evidence", header_cell_style)
    ]]

    if compliances:
        for c in compliances:
            comp_records.append([
                Paragraph(str(c.get("section", "Rule Passed")), cell_style),
                Paragraph(str(c.get("title", "Compliant")), cell_style),
                Paragraph(str(c.get("detail", "Satisfies metrological mandate")), cell_style)
            ])
    else:
        comp_records.append([
            Paragraph("N/A", cell_style),
            Paragraph("None", cell_style),
            Paragraph("No statutory provisions could be verified from extracted text.", cell_style)
        ])

    t_comp = Table(comp_records, colWidths=[90, 150, 300])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#065f46")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#f0fdf4"), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#bbf7d0"))
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 10))

    # --- 3. INFRACTIONS TABLE ---
    violations = audit_data.get("violations", [])
    if isinstance(violations, str):
        try:
            violations = json.loads(violations)
        except Exception:
            violations = []

    story.append(Paragraph(f"<b>✗ Identified Infractions ({len(violations)}):</b>", styles['Heading4']))
    story.append(Spacer(1, 3))

    viol_records = [[
        Paragraph("Rule Section", header_cell_style),
        Paragraph("Severity", header_cell_style),
        Paragraph("Infraction Details", header_cell_style)
    ]]

    if violations:
        for v in violations:
            viol_records.append([
                Paragraph(str(v.get("section", "Rule Violation")), cell_style),
                Paragraph(str(v.get("severity", "CRITICAL")), cell_style),
                Paragraph(str(v.get("detail", "Non-compliance noted")), cell_style)
            ])
    else:
        viol_records.append([
            Paragraph("N/A", cell_style),
            Paragraph("CLEAN", cell_style),
            Paragraph("All mandatory declarations are present and fully compliant.", cell_style)
        ])

    t_viol = Table(viol_records, colWidths=[90, 90, 360])
    t_viol.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#881337")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#fff1f2"), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#fecdd3"))
    ]))
    story.append(t_viol)

    doc.build(story)
    buffer.seek(0)
    return buffer


@router.get("/list")
async def get_inspection_reports(
    email: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(DBInspection).order_by(desc(DBInspection.created_at))

    if role and role.lower() in ["inspector", "admin"]:
        pass
    elif email:
        query = query.filter(DBInspection.created_by == email.strip().lower())

    records = query.all()
    
    results = []
    for item in records:
        try:
            violations = json.loads(item.violations_json) if item.violations_json else []
        except Exception:
            violations = []

        try:
            compliances = json.loads(item.compliances_json) if item.compliances_json else []
        except Exception:
            compliances = []

        try:
            raw_decl = json.loads(item.raw_declarations_json) if item.raw_declarations_json else {}
        except Exception:
            raw_decl = {}

        try:
            textures = json.loads(item.textures_json) if item.textures_json else {}
        except Exception:
            textures = {}

        try:
            font_audit = json.loads(item.font_audit_json) if item.font_audit_json else {}
        except Exception:
            font_audit = {}

        results.append({
            "id": item.id,
            "product_name": item.product_name,
            "category": item.category,
            "status": item.status,
            "compliance_score": item.compliance_score,
            "health_score": item.health_score,
            "violations": violations,
            "compliances": compliances,
            "raw_declarations": raw_decl,
            "textures": textures,
            "font_audit": font_audit,
            "created_by": item.created_by,
            "created_at": item.created_at.isoformat() if hasattr(item, "created_at") and item.created_at else None,
            "flagged_for_review": item.flagged_for_review,
            "inspector_action": "VERIFIED" if item.status == "COMPLIANT" else "PENDING"
        })

    return results


# Support both /api/reports/{id}/pdf and /api/reports/download/{id}
@router.get("/{inspection_id}/pdf")
@router.get("/download/{inspection_id}")
async def download_inspection_notice(inspection_id: int, db: Session = Depends(get_db)):
    record = db.query(DBInspection).filter(DBInspection.id == inspection_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection record with ID {inspection_id} not found."
        )

    try:
        violations = json.loads(record.violations_json) if record.violations_json else []
    except Exception:
        violations = []

    try:
        compliances = json.loads(record.compliances_json) if record.compliances_json else []
    except Exception:
        compliances = []

    try:
        raw_declarations = json.loads(record.raw_declarations_json) if record.raw_declarations_json else {}
    except Exception:
        raw_declarations = {}

    audit_data = {
        "status": record.status,
        "compliance_score": record.compliance_score,
        "violations": violations,
        "compliances": compliances
    }

    pdf_buffer = generate_inspection_notice(
        audit_data=audit_data,
        product_name=record.product_name,
        declarations=raw_declarations
    )

    filename = f"Inspection_Report_{inspection_id}.pdf"
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )