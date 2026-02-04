import os
from typing import Iterable

from sqlalchemy import create_engine, delete, select
from sqlalchemy.orm import sessionmaker

from app.models import User, Room, Booking
from app.models.booking import PriorityEnum, BookingStatusEnum
from app.models.user import RoleEnum
from app.variables.database import Base


MYSQL_URL = os.getenv(
    "MYSQL_URL",
    "mysql+pymysql://root:RootStrongPass@localhost:3306/roombook_db",
)
POSTGRES_URL = os.getenv(
    "POSTGRES_URL",
    "postgresql+psycopg2://postgres:Postgres_Project@localhost:5432/conference_db",
)

CLEAR_POSTGRES = os.getenv("CLEAR_POSTGRES", "true").lower() in {"1", "true", "yes"}
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "500"))


def _coerce_enum(enum_cls, value):
    if value is None:
        return None
    if isinstance(value, enum_cls):
        return value

    raw = str(value)

    # Try direct match on name/value
    for item in enum_cls:
        if raw == item.value or raw == item.name:
            return item

    # Normalize common casing differences
    normalized = raw.strip().lower()
    for item in enum_cls:
        if normalized == item.value.strip().lower() or normalized == item.name.strip().lower():
            return item

    raise ValueError(f"Unsupported enum value '{value}' for {enum_cls.__name__}")


def _clone_users(rows: Iterable[User]) -> list[User]:
    cloned = []
    for row in rows:
        cloned.append(
            User(
                id=row.id,
                email=row.email,
                name=row.name,
                password_hash=row.password_hash,
                role=_coerce_enum(RoleEnum, row.role),
                avatar=row.avatar,
                is_active=row.is_active,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
        )
    return cloned


def _clone_rooms(rows: Iterable[Room]) -> list[Room]:
    cloned = []
    for row in rows:
        cloned.append(
            Room(
                id=row.id,
                name=row.name,
                floor=row.floor,
                room_number=row.room_number,
                capacity=row.capacity,
                image_url=row.image_url,
                features=row.features,
                is_active=row.is_active,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
        )
    return cloned


def _clone_bookings(rows: Iterable[Booking]) -> list[Booking]:
    cloned = []
    for row in rows:
        cloned.append(
            Booking(
                id=row.id,
                user_id=row.user_id,
                room_id=row.room_id,
                date=row.date,
                start_time=row.start_time,
                end_time=row.end_time,
                title=row.title,
                attendees=row.attendees,
                description=row.description,
                priority=_coerce_enum(PriorityEnum, row.priority),
                status=_coerce_enum(BookingStatusEnum, row.status),
                equipment=row.equipment,
                notes=row.notes,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
        )
    return cloned


def _copy_in_batches(source_session, target_session, model, clone_fn):
    offset = 0
    while True:
        rows = (
            source_session.execute(
                select(model).offset(offset).limit(BATCH_SIZE)
            )
            .scalars()
            .all()
        )
        if not rows:
            break
        target_session.bulk_save_objects(clone_fn(rows))
        target_session.commit()
        offset += len(rows)
        print(f"Copied {offset} {model.__tablename__} records...")


def main():
    print("Starting MySQL -> PostgreSQL migration")
    print(f"MySQL: {MYSQL_URL}")
    print(f"PostgreSQL: {POSTGRES_URL}")

    mysql_engine = create_engine(MYSQL_URL)
    pg_engine = create_engine(POSTGRES_URL)

    MySQLSession = sessionmaker(bind=mysql_engine)
    PostgresSession = sessionmaker(bind=pg_engine)

    Base.metadata.create_all(bind=pg_engine)

    with MySQLSession() as mysql_session, PostgresSession() as pg_session:
        if CLEAR_POSTGRES:
            pg_session.execute(delete(Booking))
            pg_session.execute(delete(Room))
            pg_session.execute(delete(User))
            pg_session.commit()
            print("Cleared existing PostgreSQL data")

        _copy_in_batches(mysql_session, pg_session, User, _clone_users)
        _copy_in_batches(mysql_session, pg_session, Room, _clone_rooms)
        _copy_in_batches(mysql_session, pg_session, Booking, _clone_bookings)

    print("Migration complete")


if __name__ == "__main__":
    main()
