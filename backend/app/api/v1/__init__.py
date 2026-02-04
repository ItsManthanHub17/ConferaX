from fastapi import APIRouter

from app.api.v1 import auth, users, rooms, bookings

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(rooms.router)
api_router.include_router(bookings.router)