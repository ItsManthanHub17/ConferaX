from sqlalchemy import Column, String, Integer, Date, Time, DateTime, Enum as SQLEnum, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

from app.variables.database import Base


class PriorityEnum(str, enum.Enum):
    """Booking priority enumeration."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class BookingStatusEnum(str, enum.Enum):
    """Booking status enumeration."""
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"


class Booking(Base):
    """Booking model for room reservations."""
    
    __tablename__ = "bookings"
    
    id = Column(String(50), primary_key=True)  # Format: BK-YYYY-NNNN
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    title = Column(String(255), nullable=False)
    attendees = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(SQLEnum(PriorityEnum), nullable=False, default=PriorityEnum.MEDIUM)
    status = Column(SQLEnum(BookingStatusEnum), nullable=False, default=BookingStatusEnum.PENDING, index=True)
    equipment = Column(JSON, nullable=True, default=list)  # Array of equipment strings
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    
    # Composite index for conflict detection
    __table_args__ = (
        Index('idx_booking_conflict', 'room_id', 'date', 'status'),
    )
    
    def __repr__(self):
        return f"<Booking(id={self.id}, user_id={self.user_id}, room_id={self.room_id}, status={self.status})>"
    
    @staticmethod
    def generate_booking_id() -> str:
        """Generate a unique booking ID in format BK-YYYY-NNNN."""
        from random import randint
        year = datetime.now().year
        random_num = randint(1000, 9999)
        return f"BK-{year}-{random_num}"