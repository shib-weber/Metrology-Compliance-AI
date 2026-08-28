import io
import cv2
import numpy as np
import trimesh
from PIL import Image
from rembg import remove, new_session

_rembg_session = None

def get_session():
    global _rembg_session
    if _rembg_session is None:
        _rembg_session = new_session("u2netp")
    return _rembg_session

class DigitalTwin3DGenerator:
    @staticmethod
    def generate_mesh_glb(front_image_bytes: bytes) -> bytes:
        """
        Creates a 3D digital twin GLB mesh adapted to the product's silhouette contour.
        """
        input_image = Image.open(io.BytesIO(front_image_bytes)).convert("RGB")
        rgba_img = remove(input_image, session=get_session())
        rgba_np = np.array(rgba_img)
        alpha = rgba_np[:, :, 3]

        # 1. Extract contour polygon from alpha mask
        blur = cv2.GaussianBlur(alpha, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 127, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_TC89_KCOS)

        mesh = None
        if contours:
            contour = max(contours, key=cv2.contourArea)
            # Simplify polygon to reduce vertex complexity
            epsilon = 0.005 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True).reshape(-1, 2)

            if len(approx) >= 3:
                h, w = alpha.shape
                scale = max(w, h) / 2.0
                poly2d = np.zeros_like(approx, dtype=np.float64)
                poly2d[:, 0] = (approx[:, 0] - (w / 2.0)) / scale
                poly2d[:, 1] = -(approx[:, 1] - (h / 2.0)) / scale

                polygon = trimesh.path.polygons.Polygon(poly2d)
                if not polygon.is_valid:
                    polygon = polygon.buffer(0)

                depth = 0.55
                try:
                    # Uses mapbox_earcut or triangle engine
                    mesh = trimesh.creation.extrude_polygon(polygon, height=depth)
                    mesh.apply_translation([0, 0, -depth / 2.0])
                except Exception:
                    mesh = None

        # Fallback to bounding box mesh if contour extrusion is unviable
        if mesh is None:
            mesh = trimesh.creation.box(extents=(1.5, 2.2, 0.8))

        # 2. Export standard binary GLB
        glb_bytes = trimesh.exchange.gltf.export_glb(mesh)
        return glb_bytes