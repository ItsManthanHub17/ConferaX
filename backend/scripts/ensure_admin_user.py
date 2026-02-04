import os

from sqlalchemy.orm import Session

from app.models.user import User, RoleEnum
from app.variables.database import SessionLocal
from app.variables.security import get_password_hash


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin.user@cygnet.one")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "user.one@cygnet.one")
ADMIN_NAME = os.getenv("ADMIN_NAME", "admin.user")


def ensure_admin(db: Session) -> User:
    user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if user:
        user.name = ADMIN_NAME
        user.role = RoleEnum.ADMIN
        user.password_hash = get_password_hash(ADMIN_PASSWORD)
        db.commit()
        db.refresh(user)
        return user

    user = User(
        email=ADMIN_EMAIL,
        name=ADMIN_NAME,
        password_hash=get_password_hash(ADMIN_PASSWORD),
        role=RoleEnum.ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def main() -> None:
    with SessionLocal() as db:
        user = ensure_admin(db)
        print(f"Admin user ready: {user.email}")


if __name__ == "__main__":
    main()
