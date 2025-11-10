from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Boolean, DateTime, Enum, func
from sqlalchemy.orm import relationship
from app.db import Base
import enum
from sqlalchemy import UniqueConstraint
from passlib.hash import bcrypt

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    stall_no = Column(String)
    gstin = Column(String)

    menus = relationship("Menu", back_populates="vendor")

class Menu(Base):
    __tablename__ = "menus"
    id = Column(Integer, primary_key=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    item_name = Column(String, nullable=False)
    price = Column(Numeric(10,2), nullable=False)
    is_active = Column(Boolean, default=True)

    vendor = relationship("Vendor", back_populates="menus")

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True)
    user_token = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    qty = Column(Integer, nullable=False, default=1)
    price_snapshot = Column(Numeric(10,2), nullable=False)

    cart = relationship("Cart", back_populates="items")
    vendor = relationship("Vendor")
    menu = relationship("Menu")

class OrderStatus(str, enum.Enum):
    created = "created"
    paid = "paid"
    preparing = "preparing"
    ready = "ready"
    completed = "completed"
    cancelled = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.created, nullable=False)
    total_gross = Column(Numeric(10,2), nullable=False, default=0)
    total_tax = Column(Numeric(10,2), nullable=False, default=0)
    total_net = Column(Numeric(10,2), nullable=False, default=0)
    payment_id = Column(String)  # placeholder for future gateway
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    table_no = Column(String)  # e.g., "T-5", "T-12"

    lines = relationship("OrderLine", back_populates="order", cascade="all, delete-orphan")

class OrderLine(Base):
    __tablename__ = "order_lines"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    qty = Column(Integer, nullable=False)
    price = Column(Numeric(10,2), nullable=False)
    tax = Column(Numeric(10,2), nullable=False, default=0)
    prepared_at = Column(DateTime(timezone=True), nullable=True)
    ready_at = Column(DateTime(timezone=True), nullable=True)

    order = relationship("Order", back_populates="lines")
    vendor = relationship("Vendor")
    menu = relationship("Menu")
# ... existing imports



from sqlalchemy import Column, Integer, String, DateTime, func
from app.db import Base
from app.security import hash_password, verify_password, needs_rehash

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    display_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # When creating/updating a password
    @staticmethod
    def make_hash(plain: str) -> str:
        return hash_password(plain)

    # When checking a login password
    def check_password(self, plain: str) -> bool:
        return verify_password(plain, self.password_hash)

    # Optional: after a successful login, rehash legacy bcrypt to argon2
    def maybe_upgrade_hash(self, plain: str):
        if needs_rehash(self.password_hash):
            self.password_hash = hash_password(plain)
