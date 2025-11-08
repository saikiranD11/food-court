from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Vendor, Menu
from app.schemas import VendorOut, MenuOut
from typing import List, Optional

router = APIRouter(prefix="/catalog", tags=["catalog"])

@router.get("/vendors", response_model=List[VendorOut])
def list_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).order_by(Vendor.name).all()

@router.get("/menus", response_model=List[MenuOut])
def list_menus(vendor_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Menu).filter(Menu.is_active == True)
    if vendor_id:
        q = q.filter(Menu.vendor_id == vendor_id)
    return q.order_by(Menu.item_name).all()
