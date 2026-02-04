from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings  # Make sure settings.DATABASE_URL exists

# 1️⃣ Create the SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # Ensures connections are alive before using
    pool_recycle=3600,    # Recycle connections every 1 hour
    echo=settings.DEBUG   # Logs all SQL queries if DEBUG=True
)

# 2️⃣ Create a configured "Session" class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 3️⃣ Base class for models
Base = declarative_base()

# 4️⃣ Dependency for FastAPI routes
def get_db() -> Generator[Session, None, None]:
    """
    Provide a database session to FastAPI endpoints.
    Usage in routes:
        def endpoint(db: Session = Depends(get_db))
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 5️⃣ Optional: helper to create all tables if not using Alembic yet
def init_db():
    """
    Create all tables in the database.
    Only use this if you are not using Alembic migrations.
    """
    from app.models import User, Room, Booking  # import all your models
    Base.metadata.create_all(bind=engine)
