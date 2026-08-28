from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db, DBUser
from models.schemas import Token, UserLogin, UserSignup
from core.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.on_event("startup")
def seed_users():
    from db.database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(DBUser).filter(DBUser.email == "inspector@metronox.gov.in").first():
            db.add(DBUser(
                email="inspector@metronox.gov.in", 
                hashed_password=get_password_hash("admin123"), 
                role="inspector"
            ))
            db.add(DBUser(
                email="citizen@metronox.in", 
                hashed_password=get_password_hash("user123"), 
                role="citizen"
            ))
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Database Seed Notice]: {e}")
    finally:
        db.close()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    existing_user = db.query(DBUser).filter(DBUser.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered. Please sign in instead."
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    new_user = DBUser(
        email=clean_email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "email": new_user.email,
        "user_id": new_user.id
    }


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(DBUser).filter(DBUser.email == clean_email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password."
        )
    
    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "role": user.role, 
        "email": user.email,
        "user_id": user.id
    }