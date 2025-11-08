from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db import get_db
from app.models import Cart, CartItem, Order, OrderLine, OrderStatus, Menu
from app.schemas import CheckoutIn, CheckoutOut

router = APIRouter(prefix="/checkout", tags=["checkout"])

GST_RATE = Decimal("0.05")  # simple flat 5% placeholder for demo

@router.post("", response_model=CheckoutOut)
def checkout(payload: CheckoutIn, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_token == payload.user_token).first()
    if not cart or len(cart.items) == 0:
        raise HTTPException(400, "Cart is empty")

    # calculate totals & create order
    subtotal = Decimal("0.00")
    order = Order(cart_id=cart.id, status=OrderStatus.created)
    db.add(order)
    db.flush()

    for ci in cart.items:
        # lock price snapshot -> use ci.price_snapshot
        line_price = Decimal(ci.price_snapshot)
        subtotal += line_price * ci.qty
        ol = OrderLine(
            order_id=order.id,
            vendor_id=ci.vendor_id,
            menu_id=ci.menu_id,
            qty=ci.qty,
            price=line_price,
            tax=(line_price * ci.qty * GST_RATE).quantize(Decimal("0.01"))
        )
        db.add(ol)

    total_tax = (subtotal * GST_RATE).quantize(Decimal("0.01"))
    total_gross = (subtotal + total_tax).quantize(Decimal("0.01"))
    order.total_gross = total_gross
    order.total_tax = total_tax
    order.total_net = total_gross  # no discounts/shipping in MVP

    # STUB “payment link”
    order.payment_id = f"STUB-{order.id}"
    db.commit()

    # In a real flow, we’d return a gateway link. For now, a fake URL:
    return CheckoutOut(
        order_id=order.id,
        status=order.status.value,
        payable_amount=total_gross,
        payment_link=f"https://example.com/pay/{order.payment_id}"
    )
