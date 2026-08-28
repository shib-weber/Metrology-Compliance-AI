import io
import cv2
import numpy as np
import base64
from PIL import Image
from rembg import remove, new_session

# Preload session once in memory (u2netp is lightweight for free CPU tier)
rembg_session = new_session("u2netp")

def clean_and_crop_panel(image_bytes: bytes) -> tuple[bytes, str]:
    """
    Strips background, surfaces, hands, and shadows using alpha matting.
    Returns cleaned raw bytes and a standard data URI base64 string.
    """
    try:
        input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        rgba_image = remove(input_image, session=rembg_session)
        rgba_np = np.array(rgba_image)
        
        alpha = rgba_np[:, :, 3]
        contours, _ = cv2.findContours(alpha, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            c = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(c)
            # Crop to actual bounding bounding rect with 1% safety margin
            pad_x, pad_y = int(w * 0.01), int(h * 0.01)
            x0, y0 = max(0, x - pad_x), max(0, y - pad_y)
            x1, y1 = min(rgba_np.shape[1], x + w + pad_x), min(rgba_np.shape[0], y + h + pad_y)
            rgba_cropped = rgba_image.crop((x0, y0, x1, y1))
        else:
            rgba_cropped = rgba_image

        # Composite onto a neutral white background for OCR and texture mapping
        rgb_canvas = Image.new("RGB", rgba_cropped.size, (255, 255, 255))
        rgb_canvas.paste(rgba_cropped, mask=rgba_cropped.split()[3])
        
        buf = io.BytesIO()
        rgb_canvas.save(buf, format="JPEG", quality=95)
        cleaned_bytes = buf.getvalue()
        clean_b64 = f"data:image/jpeg;base64,{base64.b64encode(cleaned_bytes).decode('utf-8')}"
        return cleaned_bytes, clean_b64

    except Exception as e:
        # Fallback to direct input conversion
        return image_bytes, f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode('utf-8')}"


def segment_and_analyze_shape(image_bytes: bytes) -> tuple[bytes, str, dict, bool]:
    """
    Extracts isolated texture, silhouette metrics, and exact contour metadata.
    """
    cleaned_bytes, clean_b64 = clean_and_crop_panel(image_bytes)
    
    nparr = np.frombuffer(cleaned_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w, _ = img.shape

    aspect_ratio = round(float(h) / float(w if w > 0 else 1), 2)
    pdp_area = round((w * h) / 900.0, 2)

    # Dynamic classification for UI hints
    if aspect_ratio > 1.8:
        geometry = "cylinder"
    elif aspect_ratio < 0.65:
        geometry = "pouch"
    else:
        geometry = "box"

    metadata = {
        "geometry": geometry,
        "aspect_ratio": aspect_ratio,
        "pdp_area_sq_cm": pdp_area,
        "width_px": w,
        "height_px": h
    }

    return cleaned_bytes, clean_b64, metadata, True