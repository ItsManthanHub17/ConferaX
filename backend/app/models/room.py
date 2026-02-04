from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.variables.database import Base


class Room(Base):
    """Room model for meeting spaces."""
    
    __tablename__ = "rooms"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    floor = Column(String(100), nullable=False)
    room_number = Column(String(50), unique=True, nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    image_url = Column(String(500), nullable=True)
    features = Column(JSON, nullable=True, default=list)  # Array of feature strings
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    bookings = relationship("Booking", back_populates="room", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Room(id={self.id}, name={self.name}, room_number={self.room_number})>"