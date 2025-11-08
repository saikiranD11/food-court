from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from secrets import token_hex
from app.db import get_db
from app.models import User, Cart
from app.schemas import SignupIn, LoginIn, AuthOut

router = APIRouter(prefix="/auth", tags=["auth"])

def _issue_user_token(user_id: int) -> str:
    return f"user-{user_id}-{token_hex(6)}"

def _migrate_cart(db: Session, old_token: str | None, new_token: str):
    if not old_token or old_token == new_token:
        return
    for c in db.query(Cart).filter(Cart.user_token == old_token).all():
        c.user_token = new_token

@router.post("/signup", response_model=AuthOut)
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(409, "Email already registered")

    user = User(
        email=email,
        password_hash=User.make_hash(payload.password),  # argon2
        display_name=payload.display_name or email.split("@")[0],
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_token = _issue_user_token(user.id)
    _migrate_cart(db, payload.guest_token, user_token)
    db.commit()

    return AuthOut(user_token=user_token, user_id=user.id, email=user.email, display_name=user.display_name)

@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.check_password(payload.password):
        raise HTTPException(401, "Invalid credentials")

    # Seamless upgrade: if old hash was bcrypt, rehash to argon2 now
    user.maybe_upgrade_hash(payload.password)
    db.commit()

    user_token = _issue_user_token(user.id)
    _migrate_cart(db, payload.guest_token, user_token)
    db.commit()

    return AuthOut(user_token=user_token, user_id=user.id, email=user.email, display_name=user.display_name)
