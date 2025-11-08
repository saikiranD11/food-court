from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Order
from app.schemas import OrderStatusOut
from typing import List
from sqlalchemy import func
from app.models import Order, OrderLine, Cart, Vendor, Menu
from app.schemas import OrderHistoryOut, OrderHistoryItem, OrderLineBrief

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/{order_id}", response_model=OrderStatusOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    return OrderStatusOut(order_id=order.id, status=order.status.value, total_gross=order.total_gross)

# For demo/testing: mark paid (simulating a payment webhook)
@router.post("/{order_id}/mark-paid", response_model=OrderStatusOut)
def mark_paid(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = "paid"
    db.commit()
    return OrderStatusOut(order_id=order.id, status=order.status.value, total_gross=order.total_gross)



@router.get("/history", response_model=OrderHistoryOut)
def order_history(user_token: str, limit: int = 20, db: Session = Depends(get_db)):
    # find carts for this user
    carts_subq = db.query(Cart.id).filter(Cart.user_token == user_token).subquery()

    # fetch orders for those carts
    orders = (
        db.query(Order)
        .filter(Order.cart_id.in_(carts_subq))
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )

    result: List[OrderHistoryItem] = []
    for o in orders:
        # fetch lines + vendor/menu names
        rows = (
            db.query(OrderLine, Vendor.name.label("vendor_name"), Menu.item_name.label("item_name"))
            .join(Vendor, OrderLine.vendor_id == Vendor.id)
            .join(Menu, OrderLine.menu_id == Menu.id)
            .filter(OrderLine.order_id == o.id)
            .all()
        )
        lines: List[OrderLineBrief] = []
        vendor_names = set()
        for ol, vendor_name, item_name in rows:
            vendor_names.add(vendor_name)
            lines.append(
                OrderLineBrief(
                    vendor_name=vendor_name,
                    item_name=item_name,
                    qty=ol.qty,
                    line_total=(ol.price * ol.qty + ol.tax),
                )
            )
        result.append(
            OrderHistoryItem(
                order_id=o.id,
                status=o.status.value,
                total_gross=o.total_gross,
                created_at=o.created_at,
                payment_id=o.payment_id,
                vendors=sorted(list(vendor_names)),
                lines=lines,
            )
        )
    return OrderHistoryOut(user_token=user_token, orders=result)
