from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.variables.security import get_password_hash
from app.schemas.user import UserCreate, UserUpdate

class UserService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        from app.variables.security import verify_password
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=get_password_hash(user_data.password),
            role=user_data.role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user_id: str, user_data: UserUpdate) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user

    # Example of a method that needs AuthService (use local import)
    @staticmethod
    def some_auth_related_method(db: Session, token: str):
        from app.services.auth_service import AuthService  # local import
        user = AuthService.get_current_user(db, token)
        return user
