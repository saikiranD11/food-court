from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db import get_db
from app.models import Cart, CartItem, Menu, Vendor
from app.schemas import AddToCartIn, RemoveFromCartIn, CartOut, CartItemOut

router = APIRouter(prefix="/cart", tags=["cart"])

def _get_or_create_cart(db, user_token: str) -> Cart:
    cart = db.query(Cart).filter(Cart.user_token == user_token).first()
    if not cart:
        cart = Cart(user_token=user_token)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.post("/add", response_model=CartOut)
def add_to_cart(payload: AddToCartIn, db: Session = Depends(get_db)):
    menu = db.query(Menu).filter(Menu.id == payload.menu_id, Menu.is_active == True).first()
    if not menu:
        raise HTTPException(404, "Menu item not found")

    cart = _get_or_create_cart(db, payload.user_token)

    # merge if same menu
    existing = (
        db.query(CartItem)
          .filter(CartItem.cart_id == cart.id, CartItem.menu_id == menu.id)
          .first()
    )
    if existing:
        existing.qty += payload.qty
    else:
        ci = CartItem(
            cart_id=cart.id,
            vendor_id=menu.vendor_id,
            menu_id=menu.id,
            qty=payload.qty,
            price_snapshot=menu.price
        )
        db.add(ci)

    db.commit()
    return _cart_out(db, cart.id, payload.user_token)

@router.post("/remove", response_model=CartOut)
def remove_from_cart(payload: RemoveFromCartIn, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_token == payload.user_token).first()
    if not cart:
        raise HTTPException(404, "Cart not found")

    item = db.query(CartItem).filter(CartItem.id == payload.cart_item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(404, "Cart item not found")

    db.delete(item)
    db.commit()
    return _cart_out(db, cart.id, payload.user_token)

@router.get("", response_model=CartOut)
def get_cart(user_token: str, db: Session = Depends(get_db)):
    cart = _get_or_create_cart(db, user_token)
    return _cart_out(db, cart.id, user_token)

def _cart_out(db: Session, cart_id: int, user_token: str) -> CartOut:
    items = (
        db.query(CartItem, Menu, Vendor)
          .join(Menu, CartItem.menu_id == Menu.id)
          .join(Vendor, CartItem.vendor_id == Vendor.id)
          .filter(CartItem.cart_id == cart_id)
          .all()
    )
    out_items = []
    subtotal = Decimal("0.00")
    for ci, menu, vendor in items:
        line_total = Decimal(ci.qty) * Decimal(ci.price_snapshot)
        subtotal += line_total
        out_items.append(
            CartItemOut(
                id=ci.id,
                vendor_id=vendor.id,
                menu_id=menu.id,
                item_name=menu.item_name,
                qty=ci.qty,
                price_each=menu.price,
                line_total=line_total
            )
        )
    return CartOut(cart_id=cart_id, user_token=user_token, items=out_items, subtotal=subtotal)
