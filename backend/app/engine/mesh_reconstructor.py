import io
import cv2
import numpy as np
import trimesh
from PIL import Image

class DigitalTwin3DGenerator:
    @staticmethod
    def extract_clean_white_background_texture(image_bytes: bytes) -> Image.Image:
        """
        Extracts the packaging object and forcefully converts all surrounding 
        background (hands, desks, keyboards) into a pure, solid white substrate (#FFFFFF).
        """
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return Image.new("RGB", (1024, 1024), (255, 255, 255))

            h, w = img.shape[:2]

            # 1. Convert to grayscale and calculate gradient magnitude
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (7, 7), 0)

            # 2. Otsu adaptive binarization + edge synthesis
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            edges = cv2.Canny(blurred, 30, 150)
            combined_mask = cv2.bitwise_or(thresh, edges)

            # Close internal packaging holes (text, barcodes)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
            closed_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel, iterations=3)

            # 3. Find primary packaging contour
            contours, _ = cv2.findContours(closed_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            mask = np.zeros((h, w), dtype=np.uint8)
            img_area = w * h

            if contours:
                # Filter out tiny noise contours and grab the prominent specimen
                valid_contours = [c for c in contours if cv2.contourArea(c) > (img_area * 0.08)]
                if valid_contours:
                    main_contour = max(valid_contours, key=cv2.contourArea)
                    hull = cv2.convexHull(main_contour)
                    cv2.drawContours(mask, [hull], -1, 255, thickness=cv2.FILLED)
                else:
                    # Central focus box fallback (center 70% width, 80% height)
                    pad_x = int(w * 0.15)
                    pad_y = int(h * 0.10)
                    mask[pad_y:h - pad_y, pad_x:w - pad_x] = 255
            else:
                pad_x = int(w * 0.15)
                pad_y = int(h * 0.10)
                mask[pad_y:h - pad_y, pad_x:w - pad_x] = 255

            # Smooth mask edges to avoid jagged pixel cutoffs
            mask = cv2.GaussianBlur(mask, (5, 5), 0)
            mask_norm = (mask.astype(np.float32) / 255.0)[:, :, np.newaxis]

            # 4. Composite: Keep object pixels, replace all remaining pixels with pure #FFFFFF White
            solid_white_bg = np.ones_like(img, dtype=np.float32) * 255.0
            img_float = img.astype(np.float32)

            composited = (img_float * mask_norm) + (solid_white_bg * (1.0 - mask_norm))
            composited = np.clip(composited, 0, 255).astype(np.uint8)

            # Crop tightly to the detected mask bounding box
            ys, xs = np.where(mask > 50)
            if len(xs) > 0 and len(ys) > 0:
                min_x, max_x = max(0, int(np.min(xs))), min(w, int(np.max(xs)))
                min_y, max_y = max(0, int(np.min(ys))), min(h, int(np.max(ys)))
                cropped = composited[min_y:max_y, min_x:max_x]
            else:
                cropped = composited

            cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(cropped_rgb)
            
            # Place the cropped packaging centered on a crisp 1024x1024 pure white square canvas
            final_canvas = Image.new("RGB", (1024, 1024), (255, 255, 255))
            pil_img.thumbnail((960, 960), Image.Resampling.LANCZOS)
            offset = ((1024 - pil_img.width) // 2, (1024 - pil_img.height) // 2)
            final_canvas.paste(pil_img, offset)

            return final_canvas

        except Exception as e:
            print(f"[3D Texture White-Mask Notice]: {e}")
            try:
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                canvas = Image.new("RGB", (1024, 1024), (255, 255, 255))
                img.thumbnail((960, 960), Image.Resampling.LANCZOS)
                canvas.paste(img, ((1024 - img.width) // 2, (1024 - img.height) // 2))
                return canvas
            except Exception:
                return Image.new("RGB", (1024, 1024), (255, 255, 255))

    @classmethod
    def generate_mesh_glb(cls, image_bytes: bytes, geometry_type: str = "box") -> bytes:
        """
        Creates a photorealistic 3D specimen mesh with calibrated geometry and clean UV texture.
        """
        texture_pil = cls.extract_clean_white_background_texture(image_bytes)

        if geometry_type == "cylinder":
            mesh = trimesh.creation.cylinder(radius=0.95, height=2.8, sections=64)
        else:
            mesh = trimesh.creation.box(extents=[1.6, 2.6, 1.6])

        # Apply pure-white composited texture
        mesh.visual = trimesh.visual.TextureVisuals(image=texture_pil)

        return mesh.export(file_type="glb")