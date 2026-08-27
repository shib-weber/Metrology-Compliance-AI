import re

def run_metrology_audit(decl: dict) -> dict:
    """
    Evaluates extracted statutory declarations against Legal Metrology Rules, 2011.
    Returns both compliant laws and infractions.
    """
    violations = []
    compliances = []
    score = 100

    def is_present(val):
        if val is None:
            return False
        s = str(val).strip().lower()
        return s not in ("", "null", "none", "not declared", "missing", "unidentified", "n/a")

    # 1. Rule 6(1)(a) - Manufacturer / Packer Identity
    mfg = decl.get("manufacturer_details") or decl.get("manufacturer") or decl.get("packer_details")
    if is_present(mfg):
        compliances.append({
            "section": "Rule 6(1)(a)",
            "title": "Manufacturer / Packer Identity",
            "detail": f"Name and complete address declared: {str(mfg)[:60]}..."
        })
    else:
        violations.append({
            "section": "Rule 6(1)(a)",
            "severity": "CRITICAL",
            "detail": "Missing Manufacturer / Packer Identity: Name and complete address is missing."
        })
        score -= 15

    # 2. Rule 6(1)(b) - Generic / Common Product Name
    generic = decl.get("generic_name") or decl.get("product_name")
    if is_present(generic):
        compliances.append({
            "section": "Rule 6(1)(b)",
            "title": "Generic Product Name",
            "detail": f"Generic/common commodity identity declared: '{generic}'."
        })
    else:
        violations.append({
            "section": "Rule 6(1)(b)",
            "severity": "HIGH",
            "detail": "Missing Generic Product Name: Common name of commodity is missing."
        })
        score -= 10

    # 3. Rule 6(1)(c) - Net Quantity Declaration
    net_q = decl.get("net_quantity") or decl.get("net_qty")
    if is_present(net_q) and re.search(r'\d+\s*(?:ml|g|kg|l|ltr|gm|mg|n|pcs|unit)', str(net_q), re.I):
        compliances.append({
            "section": "Rule 6(1)(c)",
            "title": "Net Quantity in Standard SI Units",
            "detail": f"Declared with standard metric units: {net_q}."
        })
    else:
        violations.append({
            "section": "Rule 6(1)(c)",
            "severity": "CRITICAL",
            "detail": "Missing Net Quantity: Net quantity declaration in standard SI units is missing."
        })
        score -= 20

    # 4. Rule 6(1)(d) - Maximum Retail Price (MRP)
    mrp = decl.get("mrp")
    if is_present(mrp) and re.search(r'(?:₹|rs|\d+)', str(mrp), re.I):
        compliances.append({
            "section": "Rule 6(1)(d)",
            "title": "Retail Sale Price (MRP)",
            "detail": f"MRP declared inclusive of all taxes: {mrp}."
        })
    else:
        violations.append({
            "section": "Rule 6(1)(d)",
            "severity": "CRITICAL",
            "detail": "Missing MRP: Retail sale price declaration inclusive of all taxes is missing."
        })
        score -= 20

    # 5. Rule 6(11) - Unit Sale Price (USP)
    usp = decl.get("unit_sale_price") or decl.get("usp")
    if is_present(usp):
        compliances.append({
            "section": "Rule 6(11)",
            "title": "Unit Sale Price (USP)",
            "detail": f"Unit sale price declared/computed: {usp}."
        })
    else:
        violations.append({
            "section": "Rule 6(11)",
            "severity": "HIGH",
            "detail": "Missing Unit Sale Price: Package must state Unit Sale Price (₹/g or ₹/ml)."
        })
        score -= 10

    # 6. Rule 6(1)(e) - Month & Year of Manufacture
    mfg_date = decl.get("mfg_date") or decl.get("date_of_manufacture")
    if is_present(mfg_date):
        compliances.append({
            "section": "Rule 6(1)(e)",
            "title": "Date of Manufacture / Packing",
            "detail": f"Manufacturing date declaration present: {mfg_date}."
        })
    else:
        violations.append({
            "section": "Rule 6(1)(e)",
            "severity": "HIGH",
            "detail": "Missing Date of Manufacture: Month and year of packing/manufacturing is missing."
        })
        score -= 10

    # 7. Rule 6(1)(f) - Consumer Care Helpline / Grievance Redressal
    care = decl.get("consumer_care") or decl.get("customer_care")
    if is_present(care):
        compliances.append({
            "section": "Rule 6(1)(f)",
            "title": "Consumer Grievance Redressal Details",
            "detail": f"Consumer care contact/email declared: {care}."
        })
    else:
        violations.append({
            "section": "Rule 6(1)(f)",
            "severity": "HIGH",
            "detail": "Missing Consumer Care: Name, address, or email/phone of grievance cell is missing."
        })
        score -= 10

    # 8. Rule 6(10) - Country of Origin
    origin = decl.get("country_of_origin") or decl.get("origin")
    if is_present(origin):
        compliances.append({
            "section": "Rule 6(10)",
            "title": "Country of Origin",
            "detail": f"Country of origin declared: {origin}."
        })
    else:
        violations.append({
            "section": "Rule 6(10)",
            "severity": "MEDIUM",
            "detail": "Missing Country of Origin."
        })
        score -= 5

    final_score = max(0, min(100, score))
    status_verdict = "COMPLIANT" if len(violations) == 0 else "NON-COMPLIANT"

    return {
        "status": status_verdict,
        "compliance_score": final_score,
        "violations_count": len(violations),
        "compliances_count": len(compliances),
        "violations": violations,
        "compliances": compliances
    }