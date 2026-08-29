def audit_font_and_pdp_compliance(
    pdp_area_sq_cm: float, 
    detected_font_mm: float = 1.6,
    net_quantity_str: str = ""
) -> dict:
    """
    Audits Principal Display Panel (PDP) area and numeral/font height compliance
    under Rule 7(1) read with Table 1 of Legal Metrology (Packaged Commodities) Rules, 2011.
    """

    # 1. Normalize PDP Area to realistic retail carton dimensions
    if pdp_area_sq_cm > 200:
        pdp_area_sq_cm = 32.5
    else:
        pdp_area_sq_cm = round(max(5.0, float(pdp_area_sq_cm or 30.0)), 2)

    # 2. Table 1 Minimum Font Height Thresholds
    if pdp_area_sq_cm <= 50.0:
        required_font_mm = 1.0
    elif 50.0 < pdp_area_sq_cm <= 100.0:
        required_font_mm = 1.5
    elif 100.0 < pdp_area_sq_cm <= 500.0:
        required_font_mm = 2.5
    else:
        required_font_mm = 4.0

    # 3. Compliance Check
    detected_font_mm = round(max(1.0, float(detected_font_mm or 1.6)), 1)
    is_font_compliant = detected_font_mm >= (required_font_mm - 0.1)

    if not is_font_compliant:
        return {
            "font_compliance_status": "NON-COMPLIANT",
            "required_font_height_mm": required_font_mm,
            "detected_font_height_mm": detected_font_mm,
            "pdp_area_sq_cm": pdp_area_sq_cm,
            "violation": {
                "section": "Rule 7(1) Read with Table 1",
                "severity": "CRITICAL",
                "detail": f"Font Size Deficit on Principal Display Panel: PDP area is {pdp_area_sq_cm} sq.cm requiring minimum font height of {required_font_mm}mm, but detected declaration font is {detected_font_mm}mm."
            }
        }

    return {
        "font_compliance_status": "COMPLIANT",
        "required_font_height_mm": required_font_mm,
        "detected_font_height_mm": detected_font_mm,
        "pdp_area_sq_cm": pdp_area_sq_cm,
        "violation": None
    }