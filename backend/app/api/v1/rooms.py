from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.variables.database import get_db
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse
from app.services.room_service import RoomService
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.utils.exceptions import NotFoundException, BadRequestException
from app.core.config import settings

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", response_model=List[RoomResponse], status_code=status.HTTP_200_OK)
def get_all_rooms(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE, description="Number of records to return"),
    active_only: bool = Query(True, description="Return only active rooms"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all rooms with pagination.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **active_only**: Filter to show only active rooms
    
    Requires authentication.
    """
    rooms = RoomService.get_all(db, skip=skip, limit=limit, active_only=active_only)
    return rooms


@router.get("/{room_id}", response_model=RoomResponse, status_code=status.HTTP_200_OK)
def get_room(
    room_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get room by ID.
    
    Requires authentication.
    """
    room = RoomService.get_by_id(db, room_id)
    
    if not room:
        raise NotFoundException("Room not found")
    
    return room


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_data: RoomCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new room.
    
    - **name**: Room name
    - **floor**: Floor location
    - **room_number**: Unique room number
    - **capacity**: Maximum number of people
    - **image_url**: URL to room image (optional)
    - **features**: List of room features (optional)
    
    Requires admin authentication.
    """
    # Check if room number already exists
    existing_room = RoomService.get_by_room_number(db, room_data.room_number)
    if existing_room:
        raise BadRequestException(f"Room number {room_data.room_number} already exists")
    
    room = RoomService.create(db, room_data)
    return room


@router.put("/{room_id}", response_model=RoomResponse, status_code=status.HTTP_200_OK)
def update_room(
    room_id: str,
    room_data: RoomUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update room information.
    
    Requires admin authentication.
    """
    room = RoomService.update(db, room_id, room_data)
    
    if not room:
        raise NotFoundException("Room not found")
    
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a room.
    
    Requires admin authentication.
    Note: This will also delete all associated bookings (CASCADE).
    """
    success = RoomService.delete(db, room_id)
    
    if not success:
        raise NotFoundException("Room not found")
    
    return None