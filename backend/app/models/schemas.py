import re
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str
    user_id: Optional[int] = None


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, clean):
            raise ValueError("Invalid email format.")
        return clean


class UserSignup(BaseModel):
    email: str
    password: str
    role: str = "citizen"

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, clean):
            raise ValueError("Invalid email address.")
        return clean

    @field_validator("role")
    def validate_role(cls, v: str) -> str:
        clean_v = v.lower().strip()
        if clean_v not in ["inspector", "citizen"]:
            raise ValueError("Role must be either 'inspector' or 'citizen'")
        return clean_v


class NutritionData(BaseModel):
    is_applicable: bool = False
    sugar_per_100g: float = 0.0
    saturated_fat_per_100g: float = 0.0
    sodium_per_100g: float = 0.0
    ins_additives_count: int = 0


class ExtractedDeclarations(BaseModel):
    is_legible: bool = True
    category: str = "NON_FOOD"
    product_name: str = "Packaged Commodity"
    generic_name: Optional[str] = "Consumer Commodity"
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    unit_sale_price: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    manufacturer_details: Optional[str] = None
    consumer_care: Optional[str] = None
    country_of_origin: Optional[str] = None
    measured_font_height_mm: float = 2.0
    nutrition: NutritionData = NutritionData()


class ActionUpdatePayload(BaseModel):
    action: str
    notes: Optional[str] = None
    inspector_email: str


class FlagReportPayload(BaseModel):
    report_id: int
    notes: Optional[str] = None


class ScanResponse(BaseModel):
    id: Optional[int] = None
    product_name: str
    category: str
    panel_texts: Dict[str, str]
    declarations_summary: Dict[str, Any]
    raw_declarations: Dict[str, Any]
    raw_ocr_logs: Dict[str, str]
    compliance: Dict[str, Any]
    health: Optional[Dict[str, Any]] = None
    font_audit: Optional[Dict[str, Any]] = None
    vision_meta: Optional[Dict[str, Any]] = None
    textures: Dict[str, str]
    clean_textures: Dict[str, str]
    geometry: str = "box"
    created_by: str
    flagged_for_review: bool = False
    inspector_action: str = "PENDING"