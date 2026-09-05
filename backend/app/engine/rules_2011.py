import re
from difflib import SequenceMatcher
from typing import Optional, Dict, Any, List, Tuple

# Common standard statutory keywords and OCR error candidates
STATUTORY_KEYWORDS = {
    "mrp": [
        "mrp", "m.r.p", "max retail price", "maximum retail price", 
        "retail price", "pnoo", "pnco", "pnce", "pnso", "price", "r.p"
    ],
    "taxes_inclusive": [
        "incl of all taxes", "inclusive of all taxes", "incl all taxes", 
        "incl. of all taxes", "all taxes incl", "ncotallxa", "incofalltax", 
        "nclofall", "ncofall", "taxes included"
    ],
    "net_quantity": [
        "net quantity", "net qty", "net weight", "net wt", "net vol", 
        "net volume", "n.w", "contents", "net content"
    ],
    "usp": [
        "unit sale price", "unit price", "usp", "u.s.p", "u s p", 
        "unit selling price", "per g", "per ml", "per unit"
    ],
    "mfg_date": [
        "date of manufacture", "mfg date", "mfg dt", "mfd", "date of mfg", 
        "packed date", "pkd date", "pkd", "packed", "date of packing"
    ],
    "exp_date": [
        "expiry date", "exp date", "exp dt", "use by", "best before", 
        "expiry", "use before", "exp."
    ],
    "manufacturer": [
        "manufactured by", "mfg by", "marketed by", "mktg by", "packed by", 
        "pkg by", "mfg. by", "mkt by", "produced by", "imported by"
    ],
    "consumer_care": [
        "consumer care", "customer care", "helpline", "toll free", "feedback", 
        "grievance", "complaint", "queries", "care manager", "manager consumer"
    ],
    "country_of_origin": [
        "country of origin", "made in", "product of", "origin", "mfg in", "pkd in"
    ]
}


def fuzzy_similarity(a: str, b: str) -> float:
    """Calculates Levenshtein-like similarity ratio between two lowercase strings."""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def find_fuzzy_keyword_match(line: str, key_category: str, threshold: float = 0.72) -> Tuple[bool, float, str]:
    """
    Checks if any standard phrase in key_category matches tokens in the line.
    Handles sliding window multi-word matching (e.g. 'max retail pnoo' ~ 'maximum retail price').
    """
    line_clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', line.lower())
    words = line_clean.split()
    target_phrases = STATUTORY_KEYWORDS.get(key_category, [])

    best_score = 0.0
    matched_target = ""

    for target in target_phrases:
        target_len = len(target.split())
        
        # 1. Direct sub-string or token check
        if target in line.lower():
            return True, 1.0, target

        # 2. Sliding window n-gram match
        if len(words) >= target_len:
            for i in range(len(words) - target_len + 1):
                window_phrase = " ".join(words[i:i + target_len])
                score = fuzzy_similarity(window_phrase, target)
                if score > best_score:
                    best_score = score
                    matched_target = target

        # 3. Single-word fallback comparison
        for w in words:
            score = fuzzy_similarity(w, target)
            if score > best_score:
                best_score = score
                matched_target = target

    return (best_score >= threshold), best_score, matched_target


def dynamic_extract_from_ocr(raw_text_corpus: str) -> Dict[str, Any]:
    """
    Dynamically scans unorganized OCR lines, corrects character anomalies, 
    and returns parsed statutory candidate values.
    """
    lines = [line.strip() for line in raw_text_corpus.split("\n") if line.strip()]
    extracted = {
        "mrp": None,
        "is_taxes_included": False,
        "net_quantity": None,
        "net_quantity_numeric": None,
        "net_quantity_unit": None,
        "unit_sale_price": None,
        "mfg_date": None,
        "expiry_date": None,
        "manufacturer_details": None,
        "consumer_care": None,
        "country_of_origin": None,
        "generic_name": None,
        "product_name": None
    }

    # Pre-cleaning token confusions
    clean_corpus = raw_text_corpus
    clean_corpus = re.sub(r'\b(Pnoo|Pnco|Pnce|Pnso|Pnoe|Prc|Prce|Pric)\b', 'Price', clean_corpus, flags=re.I)
    clean_corpus = re.sub(r'\b(?:ncotallxa|incofalltax|nclofall|ncofall|ncl\s*of\s*all|incl\s*of\s*all)\b', 'incl of all taxes', clean_corpus, flags=re.I)
    clean_corpus = re.sub(r'\b(?:DCT|0CT|QCT)(\d{4})\b', r'OCT \1', clean_corpus, flags=re.I)
    clean_corpus = re.sub(r'\b([0-9]+)\s*m[1lI]\b', r'\1 ml', clean_corpus, flags=re.I)

    # 1. Tax Inclusion Flag
    for line in lines:
        is_match, _, _ = find_fuzzy_keyword_match(line, "taxes_inclusive", threshold=0.68)
        if is_match or re.search(r'incl(?:usive)?\s*(?:of)?\s*(?:all)?\s*tax', line, re.I):
            extracted["is_taxes_included"] = True
            break

    # 2. MRP Extraction (Handles spaced decimals like '120 7' or standard '120.70')
    mrp_match = re.search(
        r'(?:M\.?R\.?P|Max\.?\s*Retail\s*Price|Retail\s*Price|Price|Pnoo)[^\d\n]{0,12}(?:Rs\.?|₹|INR)?\s*([0-9]{1,5})(?:[\s.·,]([0-9]{1,2}))?',
        clean_corpus,
        re.I
    )
    if not mrp_match:
        mrp_match = re.search(r'(?:Rs\.?|₹|INR)\s*([0-9]{1,5})(?:[\s.·,]([0-9]{1,2}))?', clean_corpus, re.I)

    if mrp_match:
        int_p = mrp_match.group(1)
        dec_p = mrp_match.group(2)
        dec_str = f"{dec_p}0" if dec_p and len(dec_p) == 1 else (dec_p or "00")
        formatted_price = f"₹ {int_p}.{dec_str}"
        if extracted["is_taxes_included"]:
            formatted_price += " (Incl. of all taxes)"
        extracted["mrp"] = formatted_price

    # 3. Net Quantity Extraction (Metric SI Verification)
    qty_match = re.search(
        r'(?:Net\s*(?:Qty|Quantity|Weight|Wt|Vol|Volume)|N\.W\.|Contents)[^\d\n]{0,10}([0-9]+(?:\.[0-9]+)?)\s*(kg|g|gm|gms|ml|l|ltr|ltrs|mg|n|pcs|tablets|capsules|doses?)\b',
        clean_corpus,
        re.I
    )
    if not qty_match:
        qty_match = re.search(r'\b([0-9]+(?:\.[0-9]+)?)\s*(ml|g|gm|gms|kg|l|ltr|mg|tablets|capsules)\b', clean_corpus, re.I)

    if qty_match:
        q_num = float(qty_match.group(1))
        unit = qty_match.group(2).lower()
        std_unit = {"gm": "g", "gms": "g", "ltr": "L", "ltrs": "L", "m1": "ml", "pcs": "N"}.get(unit, unit)
        extracted["net_quantity_numeric"] = q_num
        extracted["net_quantity_unit"] = std_unit
        extracted["net_quantity"] = f"{q_num if q_num % 1 != 0 else int(q_num)} {std_unit}"

    # 4. Unit Sale Price (USP) Extraction & Cross-Computation
    usp_match = re.search(
        r'(?:USP|Unit\s*Sale\s*Price|Unit\s*Price)[^\d\n]{0,12}(?:Rs\.?|₹|INR)?\s*([0-9]{1,5})(?:[\s.·,]([0-9]{1,2}))?\s*(?:/|per)\s*([a-zA-Z]+)',
        clean_corpus,
        re.I
    )
    if usp_match:
        int_p = usp_match.group(1)
        dec_p = usp_match.group(2)
        dec_str = f"{dec_p}0" if dec_p and len(dec_p) == 1 else (dec_p or "00")
        unit_p = usp_match.group(3).lower()
        extracted["unit_sale_price"] = f"₹ {int_p}.{dec_str} / {unit_p}"
    elif extracted["mrp"] and extracted["net_quantity_numeric"] and extracted["net_quantity_numeric"] > 0:
        # Computed fallback for verification
        mrp_val_match = re.search(r'[\d\.]+', extracted["mrp"])
        if mrp_val_match:
            val_mrp = float(mrp_val_match.group(0))
            calc_val = round(val_mrp / extracted["net_quantity_numeric"], 2)
            extracted["unit_sale_price"] = f"₹ {calc_val:.2f} / {extracted['net_quantity_unit']}"

    # 5. Manufacturing and Expiry Dates
    mfg_match = re.search(
        r'(?:MFD|Mfg(?:\s*Date)?|Pkd|Packed|Date\s*of\s*Mfg)[^\w\n]{0,6}([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3,9}\s*(?:20)?\d{2})',
        clean_corpus,
        re.I
    )
    if mfg_match:
        extracted["mfg_date"] = mfg_match.group(1).strip()

    exp_match = re.search(
        r'(?:EXP|Expiry(?:\s*Date)?|Use\s*by|Best\s*Before)[^\w\n]{0,6}([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3,9}\s*(?:20)?\d{2})',
        clean_corpus,
        re.I
    )
    if exp_match:
        extracted["expiry_date"] = exp_match.group(1).strip()

    # 6. Manufacturer / Packer Details
    for i, line in enumerate(lines):
        is_match, _, _ = find_fuzzy_keyword_match(line, "manufacturer", threshold=0.75)
        if is_match:
            # Aggregate matched line plus adjacent continuation lines
            combined_mfg = " ".join(lines[i:min(len(lines), i + 3)])
            clean_mfg = re.sub(r'^[\[A-Z_\s\]]+:\s*', '', combined_mfg).strip()
            extracted["manufacturer_details"] = clean_mfg[:120]
            break

    # 7. Consumer Care
    for i, line in enumerate(lines):
        is_match, _, _ = find_fuzzy_keyword_match(line, "consumer_care", threshold=0.75)
        if is_match:
            care_block = " ".join(lines[i:min(len(lines), i + 2)])
            extracted["consumer_care"] = care_block.strip()[:90]
            break

    # 8. Country of Origin
    if re.search(r'\b(?:india|indian|made\s*in\s*india|mfg\s*in\s*india)\b', clean_corpus, re.I):
        extracted["country_of_origin"] = "India"
    else:
        for i, line in enumerate(lines):
            is_match, _, _ = find_fuzzy_keyword_match(line, "country_of_origin", threshold=0.75)
            if is_match:
                extracted["country_of_origin"] = line.strip()
                break

    # 9. Generic / Commodity Name
    pharma_match = re.search(
        r'([A-Za-z\s]+(?:HYDROCHLORIDE|SOLUTION|DROPS|SYRUP|TABLETS|CAPSULES|OINTMENT|CREAM|GEL|SPRAY|SUSPENSION|OIL|POWDER|SOAP|CLEANSER|PASTE)(?:\s+I\.?P\.?|\s+B\.?P\.?|\s+U\.?S\.?P\.?)?)',
        clean_corpus,
        re.I
    )
    if pharma_match:
        extracted["generic_name"] = pharma_match.group(1).strip()

    for line in lines:
        clean_l = re.sub(r'^[\[A-Z_\s\]]+:\s*', '', line).strip()
        if 3 < len(clean_l) < 45 and not any(k in clean_l.lower() for k in [
            "mrp", "usp", "exp", "mfd", "batch", "net", "rs", "₹", "incl", "panel", "contains",
            "face", "dosage", "keep", "protect", "warning", "store", "lic", "price", "taxes"
        ]):
            extracted["product_name"] = clean_l
            if not extracted["generic_name"]:
                extracted["generic_name"] = clean_l
            break

    return extracted


def run_metrology_audit(decl_or_raw_text: Any) -> Dict[str, Any]:
    """
    Dynamically scans OCR text or parsed declaration dictionary 
    and checks statutory compliance under Legal Metrology Rules, 2011.
    """
    # If raw OCR text corpus is passed, dynamically parse it first
    if isinstance(decl_or_raw_text, str):
        decl = dynamic_extract_from_ocr(decl_or_raw_text)
    elif isinstance(decl_or_raw_text, dict):
        # Check if dict values contain raw text per panel
        sample_val = next(iter(decl_or_raw_text.values()), None)
        if isinstance(sample_val, (str, tuple, list)) and any(k.startswith("panel") or k in ["front", "back", "top", "left", "right", "bottom"] for k in decl_or_raw_text.keys()):
            text_lines = []
            for k, v in decl_or_raw_text.items():
                t = v[0] if isinstance(v, (tuple, list)) else str(v)
                text_lines.append(f"[{k.upper()}]\n{t}")
            decl = dynamic_extract_from_ocr("\n".join(text_lines))
        else:
            decl = decl_or_raw_text
    else:
        decl = {}

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
            "detail": f"Declared: {str(mfg)[:75]}"
        })
    else:
        violations.append({
            "section": "Rule 6(1)(a)",
            "severity": "CRITICAL",
            "detail": "Missing Manufacturer / Packer Identity: Name and complete physical address is missing."
        })
        score -= 15

    # 2. Rule 6(1)(b) - Generic / Common Product Name
    generic = decl.get("generic_name") or decl.get("product_name")
    if is_present(generic):
        compliances.append({
            "section": "Rule 6(1)(b)",
            "title": "Generic Product Name",
            "detail": f"Generic/common commodity identity declared: '{generic}'"
        })
    else:
        violations.append({
            "section": "Rule 6(1)(b)",
            "severity": "HIGH",
            "detail": "Missing Generic Product Name: Common name of commodity is missing from Principal Display Panel."
        })
        score -= 10

    # 3. Rule 6(1)(c) - Net Quantity Declaration (Standard SI Units)
    net_q = decl.get("net_quantity") or decl.get("net_qty")
    if is_present(net_q) and re.search(r'\d+(?:\.\d+)?\s*(?:ml|g|kg|l|ltr|gm|mg|n|pcs|unit|tablets|capsules)', str(net_q), re.I):
        compliances.append({
            "section": "Rule 6(1)(c)",
            "title": "Net Quantity in Standard SI Units",
            "detail": f"Declared in valid standard metric units: {net_q}"
        })
    else:
        violations.append({
            "section": "Rule 6(1)(c)",
            "severity": "CRITICAL",
            "detail": "Missing Net Quantity: Net quantity declaration in standard metric units (g, kg, ml, L, N) is missing."
        })
        score -= 20

    # 4. Rule 6(1)(d) & Rule 6(1)(e) - Maximum Retail Price (MRP) & Tax Inclusivity
    mrp = decl.get("mrp")
    is_tax_inclusive = decl.get("is_taxes_included", False) or "incl" in str(mrp).lower()
    
    if is_present(mrp) and re.search(r'(?:₹|rs|\d+)', str(mrp), re.I):
        if is_tax_inclusive:
            compliances.append({
                "section": "Rule 6(1)(e)",
                "title": "Retail Sale Price (MRP)",
                "detail": f"MRP declared in statutory format inclusive of all taxes: {mrp}"
            })
        else:
            compliances.append({
                "section": "Rule 6(1)(e)",
                "title": "Retail Sale Price (MRP)",
                "detail": f"MRP value detected: {mrp}"
            })
            violations.append({
                "section": "Rule 6(1)(e)",
                "severity": "MAJOR",
                "detail": f"MRP declared as '{mrp}' but missing mandatory statutory phrase 'Inclusive of all taxes'."
            })
            score -= 10
    else:
        violations.append({
            "section": "Rule 6(1)(e)",
            "severity": "CRITICAL",
            "detail": "Missing MRP: Retail sale price declaration is missing from the package."
        })
        score -= 20

    # 5. Rule 6(1)(da) - Unit Sale Price (USP)
    usp = decl.get("unit_sale_price") or decl.get("usp")
    if is_present(usp):
        compliances.append({
            "section": "Rule 6(1)(da)",
            "title": "Unit Sale Price (USP)",
            "detail": f"Unit sale price declared/calculated: {usp}"
        })
    else:
        violations.append({
            "section": "Rule 6(1)(da)",
            "severity": "HIGH",
            "detail": "Missing Unit Sale Price: Package must declare Unit Sale Price (₹/g, ₹/kg, ₹/ml, or ₹/L) alongside MRP."
        })
        score -= 10

    # 6. Rule 6(1)(d) - Month & Year of Manufacture / Packing
    mfg_date = decl.get("mfg_date") or decl.get("date_of_manufacture")
    if is_present(mfg_date):
        compliances.append({
            "section": "Rule 6(1)(d)",
            "title": "Date of Manufacture / Packing",
            "detail": f"Manufacturing date declaration present: {mfg_date}"
        })
    else:
        violations.append({
            "section": "Rule 6(1)(d)",
            "severity": "HIGH",
            "detail": "Missing Date of Manufacture: Month and year of packing/manufacturing is missing."
        })
        score -= 10

    # 7. Rule 6(1)(n) - Consumer Care Helpline / Grievance Redressal
    care = decl.get("consumer_care") or decl.get("customer_care")
    if is_present(care):
        compliances.append({
            "section": "Rule 6(1)(n)",
            "title": "Consumer Grievance Redressal Details",
            "detail": f"Consumer care helpline/email/address declared: {str(care)[:75]}"
        })
    else:
        violations.append({
            "section": "Rule 6(1)(n)",
            "severity": "HIGH",
            "detail": "Missing Consumer Care: Name, address, or email/phone of grievance redressal cell is missing."
        })
        score -= 10

    # 8. Rule 6(10) - Country of Origin
    origin = decl.get("country_of_origin") or decl.get("origin")
    if is_present(origin):
        compliances.append({
            "section": "Rule 6(10)",
            "title": "Country of Origin",
            "detail": f"Country of origin declared: {origin}"
        })
    else:
        violations.append({
            "section": "Rule 6(10)",
            "severity": "MEDIUM",
            "detail": "Missing Country of Origin: Country of origin/manufacturing is not declared."
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
        "compliances": compliances,
        "extracted_declarations": decl
    }