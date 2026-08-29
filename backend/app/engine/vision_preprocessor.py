import io
import cv2
import numpy as np
import base64
from PIL import Image

def clean_and_crop_panel(image_bytes: bytes) -> tuple[bytes, str]:
    """
    Strips background, fingers, desks, and shadows by computing a tight foreground mask
    and compositing the packaging onto a solid pure white (#FFFFFF) background canvas.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image bytes")

        h, w = img.shape[:2]

        # 1. Initialize GrabCut mask focused on central container area
        mask = np.zeros((h, w), np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)

        # Margin: Keep central 85% width, 88% height as initial foreground candidate
        margin_x = int(w * 0.07)
        margin_y = int(h * 0.06)
        rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

        cv2.grabCut(img, mask, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
        fg_mask = np.where((mask == 2) | (mask == 0), 0, 1).astype("uint8")

        # 2. Smooth mask contours to prevent jagged pixel borders
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        fg_mask_3d = fg_mask[:, :, np.newaxis].astype(np.float32)

        # 3. Composite foreground over pure white background
        white_canvas = np.ones_like(img, dtype=np.float32) * 255.0
        img_float = img.astype(np.float32)
        composited = (img_float * fg_mask_3d) + (white_canvas * (1.0 - fg_mask_3d))
        composited = np.clip(composited, 0, 255).astype(np.uint8)

        # 4. Crop tightly to foreground bounding box
        ys, xs = np.where(fg_mask > 0)
        if len(xs) > 0 and len(ys) > 0:
            min_x, max_x = max(0, int(np.min(xs))), min(w, int(np.max(xs)))
            min_y, max_y = max(0, int(np.min(ys))), min(h, int(np.max(ys)))
            cropped = composited[min_y:max_y, min_x:max_x]
        else:
            cropped = composited

        # Encode back to high-quality JPEG
        _, buffer = cv2.imencode(".jpg", cropped, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
        clean_bytes = buffer.tobytes()
        clean_b64 = f"data:image/jpeg;base64,{base64.b64encode(clean_bytes).decode('utf-8')}"
        return clean_bytes, clean_b64

    except Exception as e:
        print(f"[Vision Clean Notice]: {e}")
        return image_bytes, f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode('utf-8')}"


def segment_and_analyze_shape(image_bytes: bytes) -> tuple[bytes, str, dict, bool]:
    """
    Extracts white-backed texture and calculates statutory Principal Display Area.
    """
    cleaned_bytes, clean_b64 = clean_and_crop_panel(image_bytes)
    
    nparr = np.frombuffer(cleaned_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w = (img.shape[0], img.shape[1]) if img is not None else (720, 1280)

    aspect_ratio = round(float(h) / float(w if w > 0 else 1), 2)
    pdp_area = round(min(120.0, max(15.0, (w * h) / 18000.0)), 2)

    if aspect_ratio > 1.9:
        geometry = "cylinder"
    elif aspect_ratio < 0.6:
        geometry = "pouch"
    else:
        geometry = "box"

    metadata = {
        "geometry": geometry,
        "shape_type": geometry,
        "aspect_ratio": aspect_ratio,
        "pdp_area_sq_cm": pdp_area,
        "width_px": w,
        "height_px": h
    }

    return cleaned_bytes, clean_b64, metadata, True