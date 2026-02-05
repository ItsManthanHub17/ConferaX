"""
Pytest configuration and shared fixtures for testing.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.variables.database import Base, get_db
from app.models.user import User, RoleEnum
from app.models.room import Room
from app.models.booking import Booking
from app.variables.security import get_password_hash


# Test database setup - using in-memory SQLite
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with dependency override."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Create a test regular user."""
    user = User(
        id="test-user-id-123",
        email="john.doe@cygnet.one",
        name="John Doe",
        password_hash=get_password_hash("john@2026"),
        role=RoleEnum.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db):
    """Create a test admin user."""
    admin = User(
        id="test-admin-id-456",
        email="admin.user@cygnet.one",
        name="Admin User",
        password_hash=get_password_hash("admin@2026"),
        role=RoleEnum.ADMIN,
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def user_token(client, test_user):
    """Get authentication token for regular user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "john.doe@cygnet.one", "password": "john@2026"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def admin_token(client, test_admin):
    """Get authentication token for admin user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin.user@cygnet.one", "password": "admin@2026"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(user_token):
    """Get authorization headers for regular user."""
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_headers(admin_token):
    """Get authorization headers for admin user."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def test_room(db):
    """Create a test room."""
    room = Room(
        id="test-room-id-789",
        name="Conference Room A",
        floor="1st Floor",
        room_number="CR-101",
        capacity=10,
        image_url="https://example.com/room.jpg",
        features=["Projector", "Whiteboard", "Video Conference"],
        is_active=True
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@pytest.fixture
def test_booking(db, test_user, test_room):
    """Create a test booking."""
    from datetime import date, time
    booking = Booking(
        id="BK-2026-1234",
        user_id=test_user.id,
        room_id=test_room.id,
        date=date(2026, 2, 10),
        start_time=time(9, 0),
        end_time=time(10, 0),
        title="Team Meeting",
        attendees=5,
        description="Weekly team sync",
        priority="Medium",
        status="Approved"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
