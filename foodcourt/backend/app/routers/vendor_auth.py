from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Vendor, User

router = APIRouter(prefix="/vendor-auth", tags=["vendor-auth"])

@router.post("/login")
def vendor_login(email: str, password: str, db: Session = Depends(get_db)):
    """Authenticate vendor user"""
    # Link vendor to user account
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.check_password(password):
        raise HTTPException(401, "Invalid credentials")
    
    # Get vendor associated with user (add vendor_user_id to User model)
    # Return vendor-specific token
    return {
        "vendor_token": f"vendor-{user.id}-xxx",
        "vendor_id": 1,  # from user.vendor_id
        "vendor_name": "Pizza Hub"
    }