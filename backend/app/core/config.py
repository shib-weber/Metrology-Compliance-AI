from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Metronox"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "LEGAL_METROLOGY_SECURE_JWT_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # Supabase & Database configuration
    DATABASE_URL: str = "sqlite:///./metrology_inspections.db"
    SUPABASE_URL: Optional[str] = ""
    SUPABASE_KEY: Optional[str] = ""

    # Optional legacy keys
    GEMINI_API_KEY: Optional[str] = ""
    GROQ_API_KEY: Optional[str] = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )


settings = Settings()