from sqlalchemy.orm import Session
from decimal import Decimal
from app.models import Vendor, Menu

def seed(db: Session):
    if db.query(Vendor).count() > 0:
        return
    v1 = Vendor(name="Pizza Hub", stall_no="A1", gstin="29ABCDE1234F1Z5")
    v2 = Vendor(name="Biryani Bay", stall_no="B4", gstin="29ABCDE1234F1Z6")
    v3 = Vendor(name="Chaat Corner", stall_no="C2", gstin="29ABCDE1234F1Z7")
    db.add_all([v1, v2, v3])
    db.flush()
    items = [
        Menu(vendor_id=v1.id, item_name="Margherita", price=Decimal("199.00")),
        Menu(vendor_id=v1.id, item_name="Farmhouse", price=Decimal("279.00")),
        Menu(vendor_id=v2.id, item_name="Chicken Biryani", price=Decimal("249.00")),
        Menu(vendor_id=v2.id, item_name="Veg Biryani", price=Decimal("199.00")),
        Menu(vendor_id=v3.id, item_name="Pani Puri", price=Decimal("59.00")),
        Menu(vendor_id=v3.id, item_name="Dahi Puri", price=Decimal("79.00")),
    ]
    db.add_all(items)
    db.commit()
