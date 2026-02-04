from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from app.models.room import Room
from app.schemas.room import RoomCreate, RoomUpdate


class RoomService:
    """Service for room-related operations."""
    
    @staticmethod
    def get_by_id(db: Session, room_id: str) -> Optional[Room]:
        """Get room by ID."""
        return db.query(Room).filter(Room.id == room_id).first()
    
    @staticmethod
    def get_by_room_number(db: Session, room_number: str) -> Optional[Room]:
        """Get room by room number."""
        return db.query(Room).filter(Room.room_number == room_number).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Room]:
        """Get all rooms with pagination."""
        query = db.query(Room)
        
        if active_only:
            query = query.filter(Room.is_active == True)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def create(db: Session, room_data: RoomCreate) -> Room:
        """Create a new room."""
        room = Room(
            id=str(uuid.uuid4()),
            name=room_data.name,
            floor=room_data.floor,
            room_number=room_data.room_number,
            capacity=room_data.capacity,
            image_url=room_data.image_url,
            features=room_data.features,
            is_active=True
        )
        
        db.add(room)
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def update(db: Session, room_id: str, room_data: RoomUpdate) -> Optional[Room]:
        """Update room information."""
        room = RoomService.get_by_id(db, room_id)
        if not room:
            return None
        
        update_dict = room_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(room, field, value)
        
        db.commit()
        db.refresh(room)
        return room
    
    @staticmethod
    def delete(db: Session, room_id: str) -> bool:
        """Delete a room."""
        room = RoomService.get_by_id(db, room_id)
        if not room:
            return False
        
        db.delete(room)
        db.commit()
        return True