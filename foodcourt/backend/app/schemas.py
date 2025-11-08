from pydantic import BaseModel, conint
from typing import List, Optional
from decimal import Decimal
from enum import Enum
from datetime import datetime
from pydantic import EmailStr


# Catalog
class VendorOut(BaseModel):
    id: int
    name: str
    stall_no: Optional[str] = None
    class Config: from_attributes = True

class MenuOut(BaseModel):
    id: int
    vendor_id: int
    item_name: str
    price: Decimal
    is_active: bool
    class Config: from_attributes = True

# Cart
class AddToCartIn(BaseModel):
    user_token: str
    menu_id: int
    qty: conint(ge=1) = 1

class RemoveFromCartIn(BaseModel):
    user_token: str
    cart_item_id: int

class CartItemOut(BaseModel):
    id: int
    vendor_id: int
    menu_id: int
    item_name: str
    qty: int
    price_each: Decimal
    line_total: Decimal

class CartOut(BaseModel):
    cart_id: int
    user_token: str
    items: List[CartItemOut]
    subtotal: Decimal

# Checkout & orders
class CheckoutIn(BaseModel):
    user_token: str

class CheckoutOut(BaseModel):
    order_id: int
    status: str
    payable_amount: Decimal
    payment_link: str  # stub for now

class OrderStatusOut(BaseModel):
    order_id: int
    status: str
    total_gross: Decimal

class OrderLineBrief(BaseModel):
    vendor_name: str
    item_name: str
    qty: int
    line_total: Decimal

class OrderHistoryItem(BaseModel):
    order_id: int
    status: str
    total_gross: Decimal
    created_at: datetime
    payment_id: str | None = None
    vendors: list[str]
    lines: list[OrderLineBrief]

class OrderHistoryOut(BaseModel):
    user_token: str
    orders: list[OrderHistoryItem]


class SignupIn(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None
    guest_token: str | None = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str
    guest_token: str | None = None

class AuthOut(BaseModel):
    user_token: str   # use this instead of guest token going forward
    user_id: int
    email: EmailStr
    display_name: str | None = None
