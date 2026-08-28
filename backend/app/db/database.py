import os
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Load backend/app/.env
APP_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = APP_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./metrology_inspections.db"
else:
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), default="citizen")  # "inspector" or "citizen"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inspections = relationship("DBInspection", back_populates="owner")


class DBInspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(200), default="Packaged Commodity")
    category = Column(String(50), default="NON_FOOD")
    status = Column(String(50), default="NON-COMPLIANT")
    compliance_score = Column(Integer, default=0)
    health_score = Column(Integer, default=0)

    # Supabase public S3 URL for GLB mesh
    glb_url = Column(String(500), nullable=True)

    # Serialized JSON audit payloads
    violations_json = Column(Text, default="[]")
    compliances_json = Column(Text, default="[]")
    raw_declarations_json = Column(Text, default="{}")
    panel_texts_json = Column(Text, default="{}")
    textures_json = Column(Text, default="{}")
    font_audit_json = Column(Text, default="{}")

    # Ownership & Enforcement Workflow
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(String(120), default="anonymous")
    flagged_for_review = Column(Boolean, default=False)

    inspector_action = Column(String(50), default="PENDING")
    action_notes = Column(Text, nullable=True)
    action_by = Column(String(120), nullable=True)
    action_taken_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("DBUser", back_populates="inspections")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()