import io
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_inspection_notice(audit_data: dict, product_name: str = "Packaged Commodity", declarations: dict = None) -> io.BytesIO:
    declarations = declarations or {}
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
    title_style = ParagraphStyle('TStyle', parent=styles['Heading1'], fontSize=15, leading=19, textColor=colors.HexColor("#0f172a"), spaceAfter=4)
    meta_style = ParagraphStyle('MStyle', parent=styles['Normal'], fontSize=8.5, leading=12, textColor=colors.HexColor("#475569"))
    cell_style = ParagraphStyle('CStyle', parent=styles['Normal'], fontSize=8, leading=11, textColor=colors.HexColor("#0f172a"))
    header_cell_style = ParagraphStyle('HCStyle', parent=styles['Normal'], fontSize=8, leading=11, fontName='Helvetica-Bold', textColor=colors.whitesmoke)

    story = []

    # Title
    story.append(Paragraph("LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011", title_style))
    story.append(Paragraph("<b>Statutory Inspection & Compliance Audit Certificate</b>", styles['Heading3']))
    story.append(Spacer(1, 6))

    status = audit_data.get("status", "NON-COMPLIANT")
    score = audit_data.get("compliance_score", 0)

    story.append(Paragraph(
        f"<b>Product Inspected:</b> {product_name} | <b>Compliance Status:</b> {status} ({score}/100)",
        meta_style
    ))
    story.append(Spacer(1, 8))

    # --- 1. VERIFIED STATUTORY DECLARATIONS TABLE ---
    story.append(Paragraph("<b>Extracted Statutory Declarations Summary:</b>", styles['Heading4']))
    story.append(Spacer(1, 3))

    decl_records = [
        [
            Paragraph(f"<b>MRP:</b> {declarations.get('mrp') or 'N/A'}", cell_style),
            Paragraph(f"<b>Unit Sale Price:</b> {declarations.get('unit_sale_price') or 'N/A'}", cell_style)
        ],
        [
            Paragraph(f"<b>Net Quantity:</b> {declarations.get('net_quantity') or 'N/A'}", cell_style),
            Paragraph(f"<b>Dates:</b> MFD: {declarations.get('mfg_date') or 'N/A'} | EXP: {declarations.get('expiry_date') or 'N/A'}", cell_style)
        ],
        [
            Paragraph(f"<b>Generic Name:</b> {declarations.get('generic_name') or 'N/A'}", cell_style),
            Paragraph(f"<b>Origin:</b> {declarations.get('country_of_origin') or 'India'}", cell_style)
        ],
        [
            Paragraph(f"<b>Manufacturer / Packer:</b> {str(declarations.get('manufacturer_details') or 'N/A')[:90]}", cell_style),
            Paragraph(f"<b>Consumer Helpline:</b> {declarations.get('consumer_care') or 'N/A'}", cell_style)
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
        Paragraph("Observed Compliance & Evidence", header_cell_style)
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
            Paragraph("No statutory provisions could be verified.", cell_style)
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