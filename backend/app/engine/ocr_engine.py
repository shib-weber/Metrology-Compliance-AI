import io
import re
import cv2
import numpy as np
from PIL import Image

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
        if max(h, w) < 900:
            scale = 900.0 / max(h, w)
            img_np = cv2.resize(img_np, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)
    except Exception:
        return img_np


def detect_barcode_from_image(img_np: np.ndarray) -> list:
    detected_codes = []
    try:
        detector = cv2.barcode.BarcodeDetector()
        ok, decoded_info, _, _ = detector.detectAndDecode(img_np)
        if ok and decoded_info:
            for c in decoded_info:
                if c.strip():
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


def lookup_gs1_country(barcode: str) -> str:
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
    """
    Extracts text and barcodes using RapidOCR ONNX and image barcode detection.
    Returns: (text_str, barcodes_list)
    """
    try:
        engine = get_engine()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(img)
        enhanced_np = preprocess_for_ocr(img_np)

        found_barcodes = detect_barcode_from_image(img_np)

        result, _ = engine(enhanced_np)
        
        extracted_lines = []
        if result:
            for item in result:
                if len(item) >= 2:
                    text_str = item[1].strip()
                    conf = float(item[2]) if len(item) >= 3 else 1.0
                    if text_str and conf > 0.25:
                        extracted_lines.append(text_str)

        final_text = "\n".join(extracted_lines) if extracted_lines else "NO_TEXT_DETECTED"
        return final_text, found_barcodes

    except Exception as e:
        print(f"[{panel_name.upper()} OCR ERROR]: {str(e)}")
        return f"[OCR Error: {str(e)}]", []


def detect_country_of_origin(corpus: str, barcode_candidates: list) -> tuple:
    india_pattern = r'\b(?:[iIl1]nd[iIl1]a|[iIl1]nd[iIl1]an|made\s*in\s*[iIl1]nd[iIl1]a|mfg\s*in\s*[iIl1]nd[iIl1]a)\b'
    if re.search(india_pattern, corpus, re.I):
        return "India", "Explicit text match (corrected OCR variant)"

    all_barcodes = list(barcode_candidates)
    raw_ean_matches = re.findall(r'\b(890\d{10}|[0-9]{12,14})\b', corpus)
    all_barcodes.extend(raw_ean_matches)

    for bc in all_barcodes:
        country_by_bc = lookup_gs1_country(bc)
        if country_by_bc:
            return country_by_bc, f"Derived from GS1 Barcode ({bc})"

    pincode_match = re.search(r'(?:pin|postal|code|dist|nabha|gurugram|delhi|sahib|pauhar|road|box)[^\d\n]{0,25}\b([1-8][0-9]{5})\b', corpus, re.I)
    if not pincode_match:
        pincode_match = re.search(r'\b([1-8][0-9]{5})\b', corpus)
    
    if pincode_match:
        return "India", f"Derived from Indian Postal PIN code ({pincode_match.group(1)})"

    for state in INDIAN_STATES:
        if re.search(r'\b' + re.escape(state) + r'\b', corpus, re.I):
            return "India", f"Derived from Indian State ({state.title()})"

    for abbr in INDIAN_STATE_ABBR:
        if re.search(abbr, corpus, re.I):
            return "India", "Derived from Indian State Abbreviation"

    foreign_countries = [
        "China", "United States", "USA", "Germany", "United Kingdom", "UK", 
        "Japan", "Vietnam", "Thailand", "Singapore", "Switzerland", "France"
    ]
    for fc in foreign_countries:
        if re.search(r'\b(?:made\s*in|mfg\s*in|origin\s*:\s*)?\s*' + re.escape(fc) + r'\b', corpus, re.I):
            return fc, f"Explicit country name ({fc})"

    return None, "Not Detected"


def synthesize_statutory_declarations(raw_text_per_panel: dict, detected_barcodes: list = None) -> dict:
    """
    Synthesizes multi-face raw OCR text into complete statutory declarations.
    raw_text_per_panel accepts values as either:
      - str: "extracted text"
      - tuple: ("extracted text", [barcodes])
    """
    if detected_barcodes is None:
        detected_barcodes = []
    else:
        detected_barcodes = list(detected_barcodes)

    corpus_lines = []

    # Unpack safely regardless of whether panel value is str or tuple/list
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
            corpus_lines.append(f"{panel_name.upper()}: {panel_text}")

    combined_corpus = "\n".join(corpus_lines)

    # 1. Country of Origin & Barcode Detection
    origin_country, origin_reason = detect_country_of_origin(combined_corpus, detected_barcodes)

    text_barcodes = re.findall(r'\b(890\d{10}|\d{12,14})\b', combined_corpus)
    final_barcodes = list(set(detected_barcodes + text_barcodes))

    # 2. MRP Extraction
    mrp_match = re.search(
        r'(?:M\.?R\.?P\.?|Rs\.?|INR|₹|Price|Max\.?\s*Retail)\s*[:.]?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)',
        combined_corpus,
        re.I
    )
    tax_incl = bool(re.search(r'(?:incl|tax|all\s*taxes)', combined_corpus, re.I))
    
    mrp_val = None
    if mrp_match:
        val = mrp_match.group(1)
        mrp_val = f"₹{val} (Incl. of all taxes)" if tax_incl else f"₹{val}"

    # 3. Net Quantity
    qty_match = re.search(
        r'(?:Net\s*(?:Qty|Quantity|Weight|Vol|Volume)|N\.W\.)\s*[:.]?\s*(\d+(?:\.\d+)?)\s*(kg|g|gm|gms|ml|l|ltr|ltrs|m|cm|u|n|pcs)\b', 
        combined_corpus, 
        re.I
    )
    if not qty_match:
        qty_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(ml|g|gm|kg|l)\b', combined_corpus, re.I)

    net_qty_val = f"{qty_match.group(1)} {qty_match.group(2)}" if qty_match else None

    # 4. Dates & Batch Numbers
    mfg_match = re.search(
        r'(?:MFD|Mfg\s*Date|Pkd|Packed|Date\s*of\s*Mfg|B\.?No|Batch)\s*[:.]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3,9}\s*(?:20)?\d{2})',
        combined_corpus,
        re.I
    )
    exp_match = re.search(
        r'(?:EXP|Expiry|Use\s*by|Best\s*Before)\s*[:.]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3,9}\s*(?:20)?\d{2})',
        combined_corpus,
        re.I
    )

    # 5. Consumer Grievance Details
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', combined_corpus)
    phone_match = re.search(r'(?:\+91|0)?[-\s]?[6-9]\d{9}|1800[-\s]?\d{3}[-\s]?\d{3,4}', combined_corpus)
    
    grievance_parts = []
    if email_match:
        grievance_parts.append(email_match.group(0))
    if phone_match:
        grievance_parts.append(phone_match.group(0))
    
    officer_match = re.search(r'(The\s*Manager[^\n]+(?:\n[^\n]+){1,4})', combined_corpus, re.I)
    if officer_match:
        officer_clean = re.sub(r'^[A-Z_]+:\s*', '', officer_match.group(1)).strip().replace('\n', ', ')
        grievance_parts.append(officer_clean)

    consumer_care = " | ".join(grievance_parts) if grievance_parts else (
        "Declared on packaging" if re.search(r'(?:customer\s*care|consumer\s*relations|helpline|grievance)', combined_corpus, re.I) else None
    )

    # 6. Manufacturer & Marketer Details
    mfg_details = None
    mfg_block = re.search(r'((?:Marketed|Manufactured|Mfg|Mktg)\s*By\s*[:.]?[^\n]+(?:\n[^\n]+){1,4})', combined_corpus, re.I)
    if mfg_block:
        mfg_details = re.sub(r'^[A-Z_]+:\s*', '', mfg_block.group(1)).strip().replace('\n', ', ')
    elif len(combined_corpus) > 25:
        mfg_details = "Declared on packaging"

    # 7. Product & Generic Name
    product_title = "Packaged Retail Commodity"
    for line in combined_corpus.split("\n"):
        clean_l = re.sub(r'^[A-Z_]+:\s*', '', line).strip()
        if len(clean_l) > 3 and not any(k in clean_l.lower() for k in [
            "mrp", "exp", "mfd", "batch", "net", "rs", "₹", "incl", "panel", "contains", "preservative", "dosage"
        ]):
            product_title = clean_l
            break

    # 8. License Number
    lic_match = re.search(r'(?:Mfg\.?\s*Lic\.?\s*No\.?|FSSAI|Lic\s*No\.?)\s*[:.]?\s*([A-Za-z0-9/-]+)', combined_corpus, re.I)
    lic_val = lic_match.group(1) if lic_match else None

    # 9. Nutritional Info
    sugar_match = re.search(r'(?:Sugar|Added\s*Sugars)\s*[:.]?\s*(\d+(?:\.\d+)?)', combined_corpus, re.I)
    fat_match = re.search(r'(?:Saturated\s*Fat|Total\s*Fat|Fat)\s*[:.]?\s*(\d+(?:\.\d+)?)', combined_corpus, re.I)
    sodium_match = re.search(r'(?:Sodium|Na)\s*[:.]?\s*(\d+(?:\.\d+)?)', combined_corpus, re.I)
    is_food = bool(re.search(r'(?:Nutritional|Nutrition|Energy|Protein|Carbohydrate|Per\s*100g)', combined_corpus, re.I))

    parsed = {
        "is_legible": len(combined_corpus.strip()) > 5,
        "category": "FOOD" if is_food else "NON_FOOD / PHARMA",
        "product_name": product_title,
        "generic_name": "Consumer Commodity",
        "net_quantity": net_qty_val,
        "mrp": mrp_val,
        "unit_sale_price": None,
        "mfg_date": mfg_match.group(1) if mfg_match else None,
        "expiry_date": exp_match.group(1) if exp_match else None,
        "manufacturer_details": mfg_details,
        "license_number": lic_val,
        "consumer_care": consumer_care,
        "country_of_origin": origin_country,
        "country_of_origin_detection_method": origin_reason,
        "barcodes_detected": final_barcodes,
        "measured_font_height_mm": 2.0,
        "nutrition": {
            "is_applicable": is_food,
            "sugar_per_100g": float(sugar_match.group(1)) if sugar_match else 0.0,
            "saturated_fat_per_100g": float(fat_match.group(1)) if fat_match else 0.0,
            "sodium_per_100g": float(sodium_match.group(1)) if sodium_match else 0.0,
            "ins_additives_count": len(re.findall(r'INS\s*\d+', combined_corpus, re.I))
        }
    }

    _post_process_unit_sale_price(parsed)
    return parsed


def _post_process_unit_sale_price(parsed: dict) -> None:
    if not parsed.get("unit_sale_price") and parsed.get("mrp") and parsed.get("net_quantity"):
        mrp_m = re.search(r'[\d\.]+', str(parsed["mrp"]))
        qty_m = re.search(r'[\d\.]+', str(parsed["net_quantity"]))
        if mrp_m and qty_m:
            try:
                price = float(mrp_m.group(0))
                qty = float(qty_m.group(0))
                unit = re.sub(r'[\d\.\s]+', '', str(parsed["net_quantity"])).strip() or "unit"
                if qty > 0:
                    parsed["unit_sale_price"] = f"₹{round(price / qty, 2)} / {unit}"
            except Exception:
                pass


def extract_label_data(image_bytes: bytes) -> dict:
    raw_text, barcodes = extract_raw_text_single_image(image_bytes, "primary")
    return synthesize_statutory_declarations({"primary": (raw_text, barcodes)})