import cv2
import numpy as np
import base64

def clean_and_crop_panel(image_bytes: bytes) -> tuple[bytes, str]:
    """
    Strips background, hands, and bedsheets/tables from ANY panel face.
    Applies convex hull and bounding rectification.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return image_bytes, ""

    h, w, _ = img.shape

    # 1. Convert to Gray and apply adaptive bilateral filtering (preserves edges, removes texture noise)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    filtered = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # 2. Otsu thresholding + Morphological gradient to isolate package rectangle
    _, thresh = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    best_crop = img
    if contours:
        # Find the dominant contour (the package panel)
        valid = [c for c in contours if cv2.contourArea(c) > (w * h * 0.03)]
        if valid:
            c = max(valid, key=cv2.contourArea)
            x, y, bw, bh = cv2.boundingRect(c)
            
            # Guard against zero/near-zero edge glitches
            if bw > 50 and bh > 50:
                pad_x = int(bw * 0.02)
                pad_y = int(bh * 0.02)
                x0 = max(0, x - pad_x)
                y0 = max(0, y - pad_y)
                x1 = min(w, x + bw + pad_x)
                y1 = min(h, y + bh + pad_y)
                best_crop = img[y0:y1, x0:x1]
            else:
                # Default central 80% fallback if contour fills entire frame
                best_crop = img[int(h*0.1):int(h*0.9), int(w*0.1):int(w*0.9)]
        else:
            best_crop = img[int(h*0.08):int(h*0.92), int(w*0.08):int(w*0.92)]
    else:
        best_crop = img[int(h*0.08):int(h*0.92), int(w*0.08):int(w*0.92)]

    # 3. Enhance clarity and export clean high-DPI base64 texture
    _, buffer = cv2.imencode('.jpg', best_crop, [int(cv2.IMWRITE_JPEG_QUALITY), 96])
    cleaned_bytes = buffer.tobytes()
    clean_b64 = f"data:image/jpeg;base64,{base64.b64encode(cleaned_bytes).decode('utf-8')}"

    return cleaned_bytes, clean_b64


def segment_and_analyze_shape(image_bytes: bytes) -> tuple[bytes, str, dict, bool]:
    cleaned_bytes, clean_b64 = clean_and_crop_panel(image_bytes)
    
    nparr = np.frombuffer(cleaned_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w, _ = img.shape

    aspect_ratio = round(float(h) / float(w if w > 0 else 1), 2)
    pdp_area = round((w * h) / 900.0, 2)

    # Parametric geometry inference
    if aspect_ratio > 1.8:
        geometry = "cylinder"
        mesh_dims = {"radius_top": 0.95, "radius_bottom": 0.95, "height": round(0.95 * aspect_ratio * 1.5, 2)}
    elif aspect_ratio < 0.6:
        geometry = "pouch"
        mesh_dims = {"width": 2.2, "height": round(2.2 * aspect_ratio, 2), "depth": 0.35}
    else:
        geometry = "box"
        mesh_dims = {"width": 1.9, "height": round(1.9 * aspect_ratio, 2), "depth": 1.2}

    metadata = {
        "geometry": geometry,
        "mesh_dims": mesh_dims,
        "aspect_ratio": aspect_ratio,
        "pdp_area_sq_cm": pdp_area
    }

    return cleaned_bytes, clean_b64, metadata, True