from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from app.variables.database import get_db, engine, Base

from app.variables.database import get_db, engine, Base
from app.models.models import User
from app.core.config import settings
from app.api.v1 import api_router


# ---------------------------
# Lifespan manager
# ---------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting up Smart RoomBook API...")
    print(f"📊 Database: {settings.DATABASE_URL.split('@')[-1]}")  # hide credentials
    print(f"🔐 JWT Algorithm: {settings.ALGORITHM}")
    print(f"🌐 CORS Origins: {settings.CORS_ORIGINS}")
    
    # Create tables (only once)
    Base.metadata.create_all(bind=engine)

    yield

    # Shutdown
    print("👋 Shutting down Smart RoomBook API...")


# ---------------------------
# FastAPI app initialization
# ---------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
Smart RoomBook API - A comprehensive room booking management system.

## Features
* 🔐 JWT Authentication
* 👥 User Management
* 🏢 Room Management
* 📅 Booking System
* ⚡ Conflict Detection
* 👨‍💼 Admin Dashboard
* 🔒 Role-Based Access

## Authentication
Most endpoints require an access token in the Authorization header:
## Roles
- USER: Can manage own bookings
- ADMIN: Can manage all bookings
""",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# ---------------------------
# Middleware
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Include API router
# ---------------------------
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# ---------------------------
# Health & root endpoints
# ---------------------------
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Smart RoomBook API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }

# ---------------------------
# Example: get all users (for testing)
# ---------------------------
@app.get("/users", tags=["Test"])
def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# ---------------------------
# Run app with uvicorn
# ---------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )