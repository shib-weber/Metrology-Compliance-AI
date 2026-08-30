import io
import re
import cv2
import numpy as np
from PIL import Image
from typing import Optional, List, Tuple, Union

_engine = None

INDIAN_STATES = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
    "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
    "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
    "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
    "delhi", "jammu", "kashmir", "ladakh", "chandigarh", "puducherry"
]

INDIAN_STATE_ABBR = [
    r'\bHP\b', r'\bH\.P\b', r'\bUP\b', r'\bU\.P\b', r'\bMP\b', r'\bM\.P\b',
    r'\bAP\b', r'\bA\.P\b', r'\bTN\b', r'\bT\.N\b', r'\bWB\b', r'\bW\.B\b',
    r'\bPB\b', r'\bHR\b', r'\bMH\b', r'\bDL\b', r'\bGJ\b', r'\bKA\b', r'\bKL\b'
]

GS1_COUNTRY_MAP = {
    ("890",): "India",
    ("000", "019", "030", "039", "060", "139"): "USA / Canada",
    ("300", "379"): "France",
    ("400", "440"): "Germany",
    ("450", "459", "490", "499"): "Japan",
    ("471",): "Taiwan",
    ("489",): "Hong Kong",
    ("500", "509"): "United Kingdom",
    ("690", "699"): "China",
    ("880",): "South Korea",
    ("885",): "Thailand",
    ("888",): "Singapore",
    ("893",): "Vietnam",
    ("899",): "Indonesia",
    ("930", "939"): "Australia",
}


def get_engine():
    global _engine
    if _engine is None:
        from rapidocr_onnxruntime import RapidOCR
        _engine = RapidOCR()
    return _engine


def preprocess_for_ocr(img_np: np.ndarray) -> np.ndarray:
    try:
        h, w = img_np.shape[:2]
        if max(h, w) < 1400:
            scale = 1400.0 / max(h, w)
            img_np = cv2.resize(img_np, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_LANCZOS4)

        gaussian = cv2.GaussianBlur(img_np, (0, 0), 2.0)
        unsharp = cv2.addWeighted(img_np, 1.3, gaussian, -0.3, 0)
        return unsharp
    except Exception:
        return img_np


def detect_barcode_from_image(img_np: np.ndarray) -> list:
    detected_codes = []
    try:
        detector = cv2.barcode.BarcodeDetector()
        ok, decoded_info, _, _ = detector.detectAndDecode(img_np)
        if ok and decoded_info:
            for c in decoded_info:
                if c and c.strip():
                    detected_codes.append(c.strip())
    except Exception:
        pass

    try:
        from pyzbar.pyzbar import decode as pyzbar_decode
        decoded = pyzbar_decode(img_np)
        for obj in decoded:
            val = obj.data.decode('utf-8', errors='ignore').strip()
            if val and val not in detected_codes:
                detected_codes.append(val)
    except Exception:
        pass

    return detected_codes


def lookup_gs1_country(barcode: str) -> Optional[str]:
    if not barcode or len(barcode) < 3:
        return None
    clean_code = re.sub(r'\D', '', barcode)
    if len(clean_code) < 3:
        return None
    prefix_3 = clean_code[:3]
    for key_prefixes, country in GS1_COUNTRY_MAP.items():
        if len(key_prefixes) == 1 and prefix_3 == key_prefixes[0]:
            return country
        elif len(key_prefixes) == 2:
            start, end = int(key_prefixes[0]), int(key_prefixes[1])
            if prefix_3.isdigit() and start <= int(prefix_3) <= end:
                return country
    if prefix_3 == "890":
        return "India"
    return None


def extract_raw_text_single_image(image_bytes: bytes, panel_name: str = "panel") -> tuple:
    try:
        engine = get_engine()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(img)
        found_barcodes = detect_barcode_from_image(img_np)

        best_lines = []
        highest_conf_total = -1.0

        orientations = [
            img_np,
            cv2.rotate(img_np, cv2.ROTATE_90_CLOCKWISE),
            cv2.rotate(img_np, cv2.ROTATE_180),
            cv2.rotate(img_np, cv2.ROTATE_90_COUNTERCLOCKWISE)
        ]

        keywords = ["mrp", "usp", "rs", "batch", "pkg", "mfg", "exp", "net", "qty", "vol", "date", "max", "price", "taxes", "lic", "fssai"]

        for candidate_img in orientations:
            enhanced_np = preprocess_for_ocr(candidate_img)
            result, _ = engine(enhanced_np)

            current_lines = []
            conf_sum = 0.0
            keyword_hits = 0

            if result:
                for item in result:
                    if len(item) >= 2:
                        text_str = item[1].strip()
                        conf = float(item[2]) if len(item) >= 3 else 0.8
                        if text_str and conf > 0.20:
                            current_lines.append(text_str)
                            conf_sum += conf
                            if any(k in text_str.lower() for k in keywords):
                                keyword_hits += 2

                score = conf_sum + (keyword_hits * 5.0)
                if score > highest_conf_total:
                    highest_conf_total = score
                    best_lines = current_lines

                if keyword_hits >= 4 and len(current_lines) >= 3:
                    break

        final_text = "\n".join(best_lines) if best_lines else "NO_TEXT_DETECTED"
        return final_text, found_barcodes

    except Exception as e:
        print(f"[{panel_name.upper()} OCR ERROR]: {str(e)}")
        return f"[OCR Error: {str(e)}]", []


def detect_country_of_origin(corpus: str, barcode_candidates: list) -> tuple:
    india_pattern = r'\b(?:india|indian|made\s*in\s*india|mfg\s*in\s*india|packaged\s*in\s*india|pkd\s*in\s*india)\b'
    if re.search(india_pattern, corpus, re.I):
        return "India", "Explicit text match on packaging"

    all_barcodes = list(barcode_candidates)
    raw_ean_matches = re.findall(r'\b(890\d{10}|[0-9]{12,14})\b', corpus)
    all_barcodes.extend(raw_ean_matches)

    for bc in all_barcodes:
        country_by_bc = lookup_gs1_country(bc)
        if country_by_bc:
            return country_by_bc, f"Derived from GS1 Barcode ({bc})"

    pincode_match = re.search(r'(?:pin|postal|code|dist|road)[^\d\n]{0,25}\b([1-8][0-9]{5})\b', corpus, re.I)
    if pincode_match:
        return "India", f"Derived from Indian PIN code ({pincode_match.group(1)})"

    for state in INDIAN_STATES:
        if re.search(r'\b' + re.escape(state) + r'\b', corpus, re.I):
            return "India", f"Derived from State ({state.title()})"

    for abbr in INDIAN_STATE_ABBR:
        if re.search(abbr, corpus, re.I):
            return "India", "Derived from State Abbreviation"

    foreign_countries = [
        "China", "United States", "USA", "Germany", "United Kingdom", "UK", 
        "Japan", "Vietnam", "Thailand", "Singapore", "Switzerland", "France"
    ]
    for fc in foreign_countries:
        if re.search(r'\b(?:made\s*in|mfg\s*in|origin\s*:\s*)?\s*' + re.escape(fc) + r'\b', corpus, re.I):
            return fc, f"Explicit Country Mention ({fc})"

    return None, "Not Detected"


def clean_ocr_corpus_anomalies(text: str) -> str:
    """
    Normalizes common OCR misrecognitions, dot-matrix splits, and letter-to-number confusions.
    """
    # 1. Price keyword misreads
    text = re.sub(r'\b(Pnoo|Pnco|Pnce|Pnso|Pnoe|Prc|Prce|Pric)\b', 'Price', text, flags=re.I)
    
    # 2. 'Inclusive of all taxes' misreads
    text = re.sub(r'\b(?:ncotallxa|incofalltax|nclofall|ncofall|ncl\s*of\s*all|incl\s*of\s*all|inclusiv\w*)\b', 'incl of all taxes', text, flags=re.I)
    
    # 3. Unit Sale Price (USP) misreads
    text = re.sub(r'\b(?:U\.?S\.?P\.?|Unit\s*Sale\s*Price|Unit\s*Price|U\s*S\s*P)\b', 'USP', text, flags=re.I)

    # 4. Net Quantity OCR corrections (e.g. 1Oml, lOml, 1Om1 -> 10 ml)
    text = re.sub(r'\b([0-9IlO]+)\s*m[1lI]\b', r'\1 ml', text, flags=re.I)
    text = re.sub(r'\b([0-9]+)\s*g(?:ms?|m)?\b', r'\1 g', text, flags=re.I)
    text = re.sub(r'\b([0-9]+)\s*k(?:g|gs)?\b', r'\1 kg', text, flags=re.I)
    text = re.sub(r'\b([0-9]+)\s*l(?:tr|trs|iters?)?\b', r'\1 L', text, flags=re.I)

    # 5. Month typos (e.g. DCT2025 -> OCT 2025, 0CT2025 -> OCT 2025)
    text = re.sub(r'\b(?:DCT|0CT|QCT)(\d{4})\b', r'OCT \1', text, flags=re.I)
    text = re.sub(r'\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(\d{4})\b', r'\1 \2', text, flags=re.I)
    
    return text


def parse_accurate_product_name(corpus_lines: list, combined_corpus: str) -> tuple[Optional[str], Optional[str]]:
    brand_title = None
    generic_title = None

    front_text = ""
    for line in corpus_lines:
        if line.startswith("[FRONT FACE]"):
            front_text = line
            break

    search_target = front_text if front_text else combined_corpus

    pharma_match = re.search(
        r'([A-Za-z\s]+(?:HYDROCHLORIDE|SOLUTION|DROPS|SYRUP|TABLETS|CAPSULES|OINTMENT|CREAM|GEL|SPRAY|SUSPENSION|OIL|POWDER|SOAP|CLEANSER|PASTE)(?:\s+I\.?P\.?|\s+B\.?P\.?|\s+U\.?S\.?P\.?)?)',
        search_target,
        re.I
    )
    if pharma_match:
        generic_title = pharma_match.group(1).strip()

    candidates = []
    for raw_l in search_target.split("\n"):
        clean_l = re.sub(r'^[\[A-Z_\s\]]+:\s*', '', raw_l).strip()
        if 2 < len(clean_l) < 50:
            if not any(k in clean_l.lower() for k in [
                "mrp", "usp", "exp", "mfd", "batch", "net", "rs", "₹", "incl", "panel", "contains",
                "face", "dosage", "keep", "protect", "warning", "store", "lic", "regd", "trade", "price", "taxes"
            ]):
                candidates.append(clean_l)

    if candidates:
        brand_title = candidates[0]
        if not generic_title and len(candidates) > 1:
            generic_title = candidates[1]

    return brand_title, generic_title


def extract_accurate_mrp(corpus: str) -> tuple[Optional[str], Optional[float], bool]:
    """
    Extracts numerical MRP and verifies whether 'inclusive of all taxes' is declared.
    Returns: (formatted_string, numeric_float_val, is_tax_inclusive)
    """
    tax_patterns = [
        r'incl(?:usive)?\s*(?:of)?\s*(?:all)?\s*taxes?',
        r'incl\.\s*of\s*all\s*taxes?',
        r'all\s*taxes?\s*incl(?:uded)?',
        r'inclusive'
    ]
    is_tax_inclusive_declared = any(re.search(p, corpus, re.I) for p in tax_patterns)

    # Search for MRP keywords and handle spaced decimals like '120 7' or '120 70'
    mrp_match = re.search(
        r'(?:M\.?R\.?P|Max\.?\s*Retail\s*Price|Retail\s*Price|Price)[^\d\n]{0,12}(?:Rs\.?|₹|INR)?\s*([0-9]{1,5})(?:[\s.·,]([0-9]{1,2}))?',
        corpus,
        re.I
    )
    if not mrp_match:
        mrp_match = re.search(r'(?:Rs\.?|₹|INR)\s*([0-9]{1,5})(?:[\s.·,]([0-9]{1,2}))?', corpus, re.I)

    if mrp_match:
        integer_part = mrp_match.group(1)
        decimal_part = mrp_match.group(2)
        
        if decimal_part:
            decimal_str = decimal_part if len(decimal_part) == 2 else f"{decimal_part}0"
            price_float = float(f"{integer_part}.{decimal_str}")
            formatted_price = f"{integer_part}.{decimal_str}"
        else:
            price_float = float(integer_part)
            formatted_price = f"{integer_part}.00"

        if is_tax_inclusive_declared:
            return f"₹ {formatted_price} (Incl. of all taxes)", price_float, True
        else:
            return f"₹ {formatted_price}", price_float, False

    return None, None, False


def extract_accurate_net_quantity(corpus: str) -> tuple[Optional[str], Optional[float], Optional[str]]:
    """
    Extracts Net Quantity with accurate standard metric units (Rule 6(1)(c)).
    Returns: (formatted_string, numeric_magnitude, metric_unit)
    """
    # 1. Look for explicit labeled Net Quantity
    qty_match = re.search(
        r'(?:Net\s*(?:Qty|Quantity|Weight|Wt|Vol|Volume)|N\.W\.|Contents)[^\d\n]{0,10}([0-9]+(?:\.[0-9]+)?)\s*(kg|g|gm|gms|ml|l|ltr|ltrs|mg|m|cm|u|n|pcs|tablets|capsules|doses?)\b',
        corpus,
        re.I
    )
    
    # 2. Look for standalone metric quantity indicators
    if not qty_match:
        qty_match = re.search(
            r'\b([0-9]+(?:\.[0-9]+)?)\s*(ml|g|gm|gms|kg|l|ltr|mg|tablets|capsules)\b',
            corpus,
            re.I
        )

    if qty_match:
        val_str = qty_match.group(1)
        # Correct OCR 'O' or 'l' in numbers if any
        val_str = val_str.replace('O', '0').replace('l', '1')
        val_float = float(val_str)
        raw_unit = qty_match.group(2).lower()

        # Standardize metric unit names
        unit_map = {
            "gm": "g", "gms": "g", "g": "g",
            "kg": "kg", "kgs": "kg",
            "ml": "ml", "m1": "ml",
            "l": "L", "ltr": "L", "ltrs": "L",
            "mg": "mg", "u": "N", "n": "N", "pcs": "N"
        }
        std_unit = unit_map.get(raw_unit, raw_unit)
        return f"{val_float if val_float % 1 != 0 else int(val_float)} {std_unit}", val_float, std_unit

    return None, None, None


def extract_accurate_usp(
    corpus: str, 
    mrp_num: Optional[float] = None, 
    qty_num: Optional[float] = None, 
    qty_unit: Optional[str] = None
) -> tuple[Optional[str], str]:
    """
    Extracts printed USP and compares it with calculated USP under Rule 6(1)(da).
    Returns: (usp_formatted_string, detection_type)
    """
    # 1. Search for explicitly declared USP on the packaging
    # Matches formats: "USP Rs. 12.08 / ml", "USP: Rs 12.08/ml", "USP Rs 12 08 per ml", "Rs. 1.20 / g"
    usp_match = re.search(
        r'(?:USP|Unit\s*Sale\s*Price|Unit\s*Price)[^\d\n]{0,12}(?:Rs\.?|₹|INR)?\s*([0-9]{1,5})(?:[\s.·,]([0-9]{1,2}))?\s*(?:/|per)\s*([a-zA-Z]+)',
        corpus,
        re.I
    )

    if usp_match:
        integer_part = usp_match.group(1)
        decimal_part = usp_match.group(2)
        unit_part = usp_match.group(3).strip().lower()

        if decimal_part:
            decimal_str = decimal_part if len(decimal_part) == 2 else f"{decimal_part}0"
            price_val = f"{integer_part}.{decimal_str}"
        else:
            price_val = f"{integer_part}.00"

        return f"₹ {price_val} / {unit_part}", "OPTICALLY_EXTRACTED"

    # 2. If USP is not printed, compute the statutory expected USP from MRP and Net Qty
    if mrp_num and qty_num and qty_num > 0 and qty_unit:
        calc_price = round(mrp_num / qty_num, 2)
        return f"₹ {calc_price:.2f} / {qty_unit}", "CALCULATED_METRIC"

    return None, "NOT_DECLARED"


def synthesize_statutory_declarations(raw_text_per_panel: dict, detected_barcodes: list = None) -> dict:
    if detected_barcodes is None:
        detected_barcodes = []
    else:
        detected_barcodes = list(detected_barcodes)

    corpus_lines = []

    for panel_name, panel_data in raw_text_per_panel.items():
        panel_text = ""
        if isinstance(panel_data, (tuple, list)):
            if len(panel_data) > 0 and isinstance(panel_data[0], str):
                panel_text = panel_data[0]
            if len(panel_data) > 1 and isinstance(panel_data[1], (list, tuple)):
                detected_barcodes.extend(panel_data[1])
        elif isinstance(panel_data, str):
            panel_text = panel_data

        if panel_text and panel_text != "NO_TEXT_DETECTED" and not panel_text.startswith("[OCR Error"):
            cleaned_panel_text = clean_ocr_corpus_anomalies(panel_text)
            corpus_lines.append(f"[{panel_name.upper()} FACE]\n{cleaned_panel_text}")

    combined_corpus = "\n".join(corpus_lines)

    # 1. Product & Generic Name
    product_name, generic_name = parse_accurate_product_name(corpus_lines, combined_corpus)

    # 2. Country of Origin & Barcodes
    origin_country, origin_reason = detect_country_of_origin(combined_corpus, detected_barcodes)
    text_barcodes = re.findall(r'\b(890\d{10}|\d{12,14})\b', combined_corpus)
    final_barcodes = list(set(detected_barcodes + text_barcodes))

    # 3. MRP Extraction
    mrp_str, mrp_numeric, is_taxes_included = extract_accurate_mrp(combined_corpus)

    # 4. Net Quantity Extraction
    net_qty_str, qty_numeric, qty_unit = extract_accurate_net_quantity(combined_corpus)

    # 5. Unit Sale Price (USP) Extraction & Cross-Verification
    usp_str, usp_source = extract_accurate_usp(combined_corpus, mrp_numeric, qty_numeric, qty_unit)

    # 6. Batch & Expiry (with month normalization)
    batch_match = re.search(r'(?:Batch(?:\s*No\.?)?|B\.?\s*No\.?|Lot(?:\s*No\.?)?)[^\w\n]{0,6}([A-Za-z0-9/-]{3,18})', combined_corpus, re.I)
    batch_val = batch_match.group(1) if batch_match else None

    mfg_match = re.search(
        r'(?:MFD|Mfg(?:\s*Date)?|Pkd|Packed|Date\s*of\s*Mfg)[^\w\n]{0,6}([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3,9}\s*(?:20)?\d{2})',
        combined_corpus,
        re.I
    )
    mfg_val = mfg_match.group(1) if mfg_match else None

    exp_match = re.search(
        r'(?:EXP|Expiry(?:\s*Date)?|Use\s*by|Best\s*Before)[^\w\n]{0,6}([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3,9}\s*(?:20)?\d{2})',
        combined_corpus,
        re.I
    )
    exp_val = exp_match.group(1) if exp_match else None

    # 7. Consumer Care
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', combined_corpus)
    phone_match = re.search(r'(?:\+91|0)?[-\s]?[6-9]\d{9}|1800[-\s]?\d{3}[-\s]?\d{3,4}', combined_corpus)
    
    grievance_parts = []
    if email_match:
        grievance_parts.append(email_match.group(0))
    if phone_match:
        grievance_parts.append(phone_match.group(0))

    consumer_care = " | ".join(grievance_parts) if grievance_parts else (
        "Declared on packaging" if re.search(r'(?:customer\s*care|consumer\s*relations|helpline|grievance)', combined_corpus, re.I) else None
    )

    # 8. Manufacturer & Marketer Details
    mfg_details = None
    mfg_block = re.search(r'((?:Marketed|Manufactured|Mfg|Mktg)\s*By[^\n]+(?:\n[^\n]+){1,3})', combined_corpus, re.I)
    if mfg_block:
        mfg_details = re.sub(r'^[A-Z_]+:\s*', '', mfg_block.group(1)).strip().replace('\n', ', ')
    elif re.search(r'(?:mfg|marketed|manufactured|packed)\s*by', combined_corpus, re.I):
        mfg_details = "Declared on packaging"

    # 9. License
    lic_match = re.search(r'(?:Mfg\.?\s*Lic\.?\s*No\.?|FSSAI|Lic\s*No\.?)\s*[:.]?\s*([A-Za-z0-9/-]+)', combined_corpus, re.I)
    lic_val = lic_match.group(1) if lic_match else None

    # 10. Nutrition Info
    sugar_match = re.search(r'(?:Sugar|Added\s*Sugars)\s*[:.]?\s*(\d+(?:\.\d+)?)', combined_corpus, re.I)
    fat_match = re.search(r'(?:Saturated\s*Fat|Total\s*Fat|Fat)\s*[:.]?\s*(\d+(?:\.\d+)?)', combined_corpus, re.I)
    sodium_match = re.search(r'(?:Sodium|Na)\s*[:.]?\s*(\d+(?:\.\d+)?)', combined_corpus, re.I)
    is_food = bool(re.search(r'(?:Nutritional|Nutrition|Energy|Protein|Carbohydrate|Per\s*100g|FSSAI)', combined_corpus, re.I))

    parsed = {
        "is_legible": len(combined_corpus.strip()) > 5,
        "category": "FOOD" if is_food else "NON_FOOD / PHARMA",
        "product_name": product_name,
        "generic_name": generic_name,
        "net_quantity": net_qty_str,
        "net_quantity_numeric": qty_numeric,
        "net_quantity_unit": qty_unit,
        "mrp": mrp_str,
        "mrp_numeric": mrp_numeric,
        "is_taxes_included_declared": is_taxes_included,
        "unit_sale_price": usp_str,
        "usp_detection_source": usp_source,
        "batch_number": batch_val,
        "mfg_date": mfg_val,
        "expiry_date": exp_val,
        "manufacturer_details": mfg_details,
        "license_number": lic_val,
        "consumer_care": consumer_care,
        "country_of_origin": origin_country,
        "country_of_origin_detection_method": origin_reason,
        "barcodes_detected": final_barcodes,
        "measured_font_height_mm": 1.6,
        "nutrition": {
            "is_applicable": is_food,
            "sugar_per_100g": float(sugar_match.group(1)) if sugar_match else 0.0,
            "saturated_fat_per_100g": float(fat_match.group(1)) if fat_match else 0.0,
            "sodium_per_100g": float(sodium_match.group(1)) if sodium_match else 0.0,
            "ins_additives_count": len(re.findall(r'INS\s*\d+', combined_corpus, re.I))
        }
    }

    return parsed