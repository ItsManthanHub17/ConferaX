from sqlalchemy.orm import Session
from typing import Optional, Dict
from app.variables.security import create_access_token, create_refresh_token, decode_token

class AuthService:
    @staticmethod
    def login(db: Session, email: str, password: str) -> Optional[Dict[str, str]]:
        from app.services.user_service import UserService  # local import
        user = UserService.authenticate(db, email, password)
        if not user:
            return None
        token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token({"sub": user.id}),
            "token_type": "bearer",
        }

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Optional[str]:
        from app.services.user_service import UserService  # local import
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        user_id = payload.get("sub")
        user = UserService.get_by_id(db, user_id)
        if not user or not user.is_active:
            return None
        token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
        return create_access_token(token_data)

    @staticmethod
    def get_current_user(db: Session, token: str):
        from app.services.user_service import UserService  # local import
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        user = UserService.get_by_id(db, user_id)
        if not user or not user.is_active:
            return None
        return user
