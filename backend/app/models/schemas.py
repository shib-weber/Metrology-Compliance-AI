from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserSignup(BaseModel):
    username: str
    password: str
    role: str = "citizen"  # "inspector" or "citizen"

    @field_validator("role")
    def validate_role(cls, v):
        if v.lower() not in ["inspector", "citizen"]:
            raise ValueError("Role must be either 'inspector' or 'citizen'")
        return v.lower()

class NutritionData(BaseModel):
    sugar_per_100g: float = 0.0
    saturated_fat_per_100g: float = 0.0
    sodium_per_100g: float = 0.0
    ins_additives_count: int = 0

class ExtractedDeclarations(BaseModel):
    product_name: str
    manufacturer_details: Optional[str] = None
    generic_name: Optional[str] = None
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    consumer_care: Optional[str] = None
    country_of_origin: Optional[str] = None
    unit_sale_price: Optional[str] = None
    font_legibility: str = "Compliant"
    nutrition: NutritionData

class ScanResponse(BaseModel):
    id: Optional[int] = None
    product_name: str
    raw_declarations: Dict[str, Any]
    compliance: Dict[str, Any]
    health: Dict[str, Any]