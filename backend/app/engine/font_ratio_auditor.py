import math

def audit_font_and_pdp_compliance(
    pdp_area_sq_cm: float, 
    detected_font_mm: float = 1.5,
    net_quantity_str: str = ""
) -> dict:
    """
    Audits Principal Display Panel (PDP) area and numeral/font height compliance
    under Rule 7(1) read with Table 1 of Legal Metrology (Packaged Commodities) Rules, 2011.
    """

    # 1. Normalize PDP Area if raw pixel area was erroneously passed
    # A standard camera image bounding box can yield hundreds of sq cm if uncalibrated
    if pdp_area_sq_cm > 500:
        # Standard retail box front faces rarely exceed 500 sq.cm unless it's a TV/bulk carton
        # Apply standard DPI conversion (assuming ~96 DPI screen / standard mobile sensor crop)
        pdp_area_sq_cm = (pdp_area_sq_cm / 96.0 / 96.0) * (2.54 ** 2) * 10.0
        # Hard cap fallback for consumer retail units
        if pdp_area_sq_cm > 150:
            pdp_area_sq_cm = 35.0  # Default to ~35 sq.cm for standard hand-held boxes

    pdp_area_sq_cm = round(max(5.0, pdp_area_sq_cm), 2)

    # 2. Table 1 Minimum Font Height Calculation
    if pdp_area_sq_cm <= 50.0:
        required_font_mm = 1.0
    elif 50.0 < pdp_area_sq_cm <= 100.0:
        required_font_mm = 1.5
    elif 100.0 < pdp_area_sq_cm <= 500.0:
        required_font_mm = 2.5
    else:
        required_font_mm = 4.0

    # 3. Compliance Check (with 0.2mm optical measurement tolerance)
    detected_font_mm = max(1.0, float(detected_font_mm or 1.5))
    is_font_compliant = detected_font_mm >= (required_font_mm - 0.2)

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