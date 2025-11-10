# foodcourt/backend/app/routers/vendor.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal
from app.db import get_db
from app.models import Vendor, Menu, Order, OrderLine, OrderStatus
from typing import List, Optional
from sqlalchemy import func
from pydantic import BaseModel

router = APIRouter(prefix="/vendor", tags=["vendor"])

# ============= Schemas =============
class UpdateMenuPriceIn(BaseModel):
    price: Optional[Decimal] = None
    is_active: Optional[bool] = None

class UpdateOrderStatusIn(BaseModel):
    status: str

class AddMenuItemIn(BaseModel):
    item_name: str
    price: Decimal
    category: Optional[str] = "General"
    is_active: bool = True

class MenuOut(BaseModel):
    id: int
    vendor_id: int
    item_name: str
    price: Decimal
    is_active: bool
    
    class Config:
        from_attributes = True

class OrderDetailOut(BaseModel):
    order_id: int
    status: str
    total_gross: Decimal
    customer_name: Optional[str] = "Customer"
    items: List[dict]
    created_at: datetime
    table_no: Optional[str] = None

class VendorDashboardOut(BaseModel):
    total_orders_today: int
    total_revenue_today: Decimal
    pending_orders: int
    avg_rating: float
    top_items: List[dict]

class VendorStatsOut(BaseModel):
    total_orders: int
    completed_orders: int
    revenue: float
    pending_orders: int
    menu_items: int

# ============= Helpers =============
def _get_vendor(db: Session, vendor_id: int) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found")
    return vendor

# ============= Dashboard Endpoints =============

@router.get("/{vendor_id}/dashboard", response_model=VendorDashboardOut)
def get_vendor_dashboard(vendor_id: int, db: Session = Depends(get_db)):
    """Get vendor dashboard with key metrics"""
    vendor = _get_vendor(db, vendor_id)
    
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Total orders today
    total_orders_query = db.query(Order).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.created_at >= today_start
    )
    total_orders = total_orders_query.count()
    
    # Total revenue today
    total_revenue_result = db.query(func.sum(Order.total_gross)).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.created_at >= today_start
    ).scalar()
    total_revenue = Decimal(total_revenue_result) if total_revenue_result else Decimal("0")
    
    # Pending orders
    pending_orders_query = db.query(Order).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.status.in_([OrderStatus.created, OrderStatus.preparing])
    )
    pending_orders = pending_orders_query.count()
    
    # Top items
    top_items_result = db.query(
        Menu.item_name,
        func.count(OrderLine.id).label("order_count")
    ).join(
        OrderLine, OrderLine.menu_id == Menu.id
    ).filter(
        Menu.vendor_id == vendor_id,
        OrderLine.order_id.in_(
            db.query(Order.id).filter(Order.created_at >= today_start)
        )
    ).group_by(Menu.item_name).order_by(
        func.count(OrderLine.id).desc()
    ).limit(5).all()
    
    top_items = [{"name": name, "orders": count} for name, count in top_items_result]
    
    return VendorDashboardOut(
        total_orders_today=total_orders,
        total_revenue_today=total_revenue,
        pending_orders=pending_orders,
        avg_rating=4.6,
        top_items=top_items
    )

@router.get("/{vendor_id}/stats", response_model=VendorStatsOut)
def get_vendor_stats(vendor_id: int, db: Session = Depends(get_db)):
    """Get quick stats for vendor"""
    vendor = _get_vendor(db, vendor_id)
    
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_orders = db.query(Order).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.created_at >= today
    ).count()
    
    completed_orders = db.query(Order).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.status == OrderStatus.completed,
        Order.created_at >= today
    ).count()
    
    revenue_result = db.query(func.sum(Order.total_gross)).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.created_at >= today
    ).scalar()
    revenue = float(revenue_result) if revenue_result else 0.0
    
    pending_orders = db.query(Order).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.status.in_([OrderStatus.created, OrderStatus.preparing])
    ).count()
    
    menu_items = db.query(Menu).filter(Menu.vendor_id == vendor_id).count()
    
    return VendorStatsOut(
        total_orders=total_orders,
        completed_orders=completed_orders,
        revenue=revenue,
        pending_orders=pending_orders,
        menu_items=menu_items
    )

# ============= Order Endpoints =============

@router.get("/{vendor_id}/orders", response_model=List[OrderDetailOut])
def get_vendor_orders(
    vendor_id: int,
    status: Optional[str] = Query(None),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """Get all orders for a vendor"""
    vendor = _get_vendor(db, vendor_id)
    
    query = db.query(Order).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(OrderLine.vendor_id == vendor_id).distinct()
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    
    result = []
    for order in orders:
        lines = db.query(OrderLine, Menu).join(
            Menu, OrderLine.menu_id == Menu.id
        ).filter(
            OrderLine.order_id == order.id,
            OrderLine.vendor_id == vendor_id
        ).all()
        
        result.append(OrderDetailOut(
            order_id=order.id,
            status=order.status.value,
            total_gross=order.total_gross,
            customer_name="Customer",
            items=[{
                "name": menu.item_name,
                "qty": ol.qty,
                "price": str(ol.price)
            } for ol, menu in lines],
            created_at=order.created_at,
            table_no="T-5"
        ))
    
    return result

@router.patch("/{vendor_id}/orders/{order_id}/status")
def update_order_status(
    vendor_id: int,
    order_id: int,
    payload: UpdateOrderStatusIn,
    db: Session = Depends(get_db)
):
    """Update order status"""
    vendor = _get_vendor(db, vendor_id)
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    
    # Verify vendor has items in this order
    vendor_items = db.query(OrderLine).filter(
        OrderLine.order_id == order_id,
        OrderLine.vendor_id == vendor_id
    ).first()
    if not vendor_items:
        raise HTTPException(403, "Vendor not authorized for this order")
    
    # Update status
    valid_statuses = [s.value for s in OrderStatus]
    if payload.status not in valid_statuses:
        raise HTTPException(400, f"Invalid status. Must be one of {valid_statuses}")
    
    order.status = OrderStatus[payload.status]
    db.commit()
    db.refresh(order)
    
    return {
        "order_id": order.id,
        "status": order.status.value,
        "total_gross": str(order.total_gross)
    }

# ============= Menu Endpoints =============

@router.get("/{vendor_id}/menu", response_model=List[MenuOut])
def get_vendor_menu(vendor_id: int, db: Session = Depends(get_db)):
    """Get all menu items for a vendor"""
    vendor = _get_vendor(db, vendor_id)
    items = db.query(Menu).filter(Menu.vendor_id == vendor_id).all()
    return items

@router.post("/{vendor_id}/menu", response_model=MenuOut)
def add_menu_item(
    vendor_id: int,
    payload: AddMenuItemIn,
    db: Session = Depends(get_db)
):
    """Add new menu item"""
    vendor = _get_vendor(db, vendor_id)
    
    menu = Menu(
        vendor_id=vendor_id,
        item_name=payload.item_name,
        price=payload.price,
        is_active=payload.is_active
    )
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return menu

@router.patch("/{vendor_id}/menu/{menu_id}", response_model=MenuOut)
def update_menu_item(
    vendor_id: int,
    menu_id: int,
    payload: UpdateMenuPriceIn,
    db: Session = Depends(get_db)
):
    """Update menu item price or availability"""
    vendor = _get_vendor(db, vendor_id)
    
    menu = db.query(Menu).filter(
        Menu.id == menu_id,
        Menu.vendor_id == vendor_id
    ).first()
    if not menu:
        raise HTTPException(404, "Menu item not found")
    
    if payload.price is not None:
        menu.price = payload.price
    if payload.is_active is not None:
        menu.is_active = payload.is_active
    
    db.commit()
    db.refresh(menu)
    return menu

@router.delete("/{vendor_id}/menu/{menu_id}")
def delete_menu_item(
    vendor_id: int,
    menu_id: int,
    db: Session = Depends(get_db)
):
    """Delete menu item"""
    vendor = _get_vendor(db, vendor_id)
    
    menu = db.query(Menu).filter(
        Menu.id == menu_id,
        Menu.vendor_id == vendor_id
    ).first()
    if not menu:
        raise HTTPException(404, "Menu item not found")
    
    db.delete(menu)
    db.commit()
    return {"deleted": True, "menu_id": menu_id}

# ============= Analytics Endpoints =============

@router.get("/{vendor_id}/analytics")
def get_vendor_analytics(
    vendor_id: int,
    days: int = Query(7),
    db: Session = Depends(get_db)
):
    """Get analytics for past N days"""
    vendor = _get_vendor(db, vendor_id)
    
    start_date = datetime.now() - timedelta(days=days)
    
    daily_revenue = db.query(
        func.date(Order.created_at).label("date"),
        func.sum(Order.total_gross).label("revenue"),
        func.count(Order.id).label("orders")
    ).join(
        OrderLine, OrderLine.order_id == Order.id
    ).filter(
        OrderLine.vendor_id == vendor_id,
        Order.created_at >= start_date
    ).group_by(func.date(Order.created_at)).all()
    
    return {
        "daily_data": [
            {
                "date": str(date),
                "revenue": float(revenue) if revenue else 0,
                "orders": orders
            }
            for date, revenue, orders in daily_revenue
        ],
        "period_days": days
    }