from sqlalchemy import Column, String, Enum, Boolean, Integer, ForeignKey, Date, Time, Text, JSON, TIMESTAMP
from sqlalchemy.orm import declarative_base, relationship
import enum
import uuid

Base = declarative_base()

class UserRole(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class BookingPriority(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class BookingStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    avatar = Column(String(512))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP", onupdate="CURRENT_TIMESTAMP")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    floor = Column(String(50))
    room_number = Column(String(50), unique=True, index=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    image_url = Column(String(512))
    features = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP", onupdate="CURRENT_TIMESTAMP")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(20), primary_key=True)  # BK-YYYY-NNNN
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    title = Column(String(255), nullable=False)
    attendees = Column(Integer, default=1)
    description = Column(Text)
    priority = Column(Enum(BookingPriority), default=BookingPriority.MEDIUM)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    equipment = Column(JSON)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP", onupdate="CURRENT_TIMESTAMP")

    user = relationship("User")
    room = relationship("Room")
