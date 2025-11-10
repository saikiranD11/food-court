# foodcourt/backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.catalog import router as catalog_router
from app.routers.cart import router as cart_router
from app.routers.checkout import router as checkout_router
from app.routers.orders import router as orders_router
from app.routers.vendor import router as vendor_router  # ADD THIS LINE
from app.db import Base, engine, SessionLocal
from app.seed import seed

app = FastAPI(title="FoodCourt Backend", version="0.1.0")

# --- CORS (allow your Next.js dev server) ---
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.107:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dev-only: create tables + seed sample data
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed(db)

# Include all routers
app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(checkout_router)
app.include_router(orders_router)
app.include_router(vendor_router)  # ADD THIS LINE

@app.get("/health")
def health():
    return {"ok": True, "message": "FoodCourt API is running"}