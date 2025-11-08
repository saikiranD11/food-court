from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.db import Base, engine, SessionLocal
from app.seed import seed
from app.routers.catalog import router as catalog_router
from app.routers.cart import router as cart_router
from app.routers.checkout import router as checkout_router
from app.routers.orders import router as orders_router

app = FastAPI(title="FoodCourt Backend", version="0.1.0")

# --- CORS (allow your Next.js dev server) ---
# Add more origins if you open the site from another device on your LAN.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Example LAN origin (replace with your machine IP if you test on phone):
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

# Routers
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(checkout_router)
app.include_router(orders_router)

@app.get("/health")
def health():
    return {"ok": True}


# ... existing code above

app.include_router(auth_router)
