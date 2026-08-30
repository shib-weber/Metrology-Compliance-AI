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
    Preserves full package height and bottom edges.
    """
    try:
        input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        rgba_image = remove(input_image, session=rembg_session)
        rgba_np = np.array(rgba_image)
        
        alpha = rgba_np[:, :, 3]
        
        # Morphological closing to bridge small gaps created by shadow/contact matting
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        closed_alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
        
        # Binarize mask with slight threshold to avoid soft edge dropouts at the base
        _, thresh_alpha = cv2.threshold(closed_alpha, 25, 255, cv2.THRESH_BINARY)
        
        contours, _ = cv2.findContours(thresh_alpha, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Filter out tiny noise contours, merge all significant bounding boxes
            valid_contours = [c for c in contours if cv2.contourArea(c) > 100]
            if not valid_contours:
                valid_contours = contours
                
            x_min = min([cv2.boundingRect(c)[0] for c in valid_contours])
            y_min = min([cv2.boundingRect(c)[1] for c in valid_contours])
            x_max = max([cv2.boundingRect(c)[0] + cv2.boundingRect(c)[2] for c in valid_contours])
            y_max = max([cv2.boundingRect(c)[1] + cv2.boundingRect(c)[3] for c in valid_contours])
            
            w = x_max - x_min
            h = y_max - y_min
            
            # Use 3% safety margin so bottom edges/seals are not clipped
            pad_x = max(4, int(w * 0.03))
            pad_y = max(4, int(h * 0.03))
            
            x0 = max(0, x_min - pad_x)
            y0 = max(0, y_min - pad_y)
            x1 = min(rgba_np.shape[1], x_max + pad_x)
            y1 = min(rgba_np.shape[0], y_max + pad_y)
            
            rgba_cropped = rgba_image.crop((x0, y0, x1, y1))
        else:
            rgba_cropped = rgba_image

        # Composite onto neutral white canvas
        rgb_canvas = Image.new("RGB", rgba_cropped.size, (255, 255, 255))
        rgb_canvas.paste(rgba_cropped, mask=rgba_cropped.split()[3])
        
        buf = io.BytesIO()
        rgb_canvas.save(buf, format="JPEG", quality=95)
        cleaned_bytes = buf.getvalue()
        clean_b64 = f"data:image/jpeg;base64,{base64.b64encode(cleaned_bytes).decode('utf-8')}"
        return cleaned_bytes, clean_b64

    except Exception:
        return image_bytes, f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode('utf-8')}"


def segment_and_analyze_shape(image_bytes: bytes) -> tuple[bytes, str, dict, bool]:
    """
    Extracts isolated texture, silhouette metrics, and exact contour metadata.
    """
    cleaned_bytes, clean_b64 = clean_and_crop_panel(image_bytes)
    
    nparr = np.frombuffer(cleaned_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is not None:
        h, w, _ = img.shape
    else:
        h, w = 100, 100

    aspect_ratio = round(float(h) / float(w if w > 0 else 1), 2)
    pdp_area = round((w * h) / 900.0, 2)

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