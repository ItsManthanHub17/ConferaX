from typing import Optional

from fastapi import Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.variables.database import get_db
from app.models.user import User, RoleEnum
from app.services.auth_service import AuthService
from app.utils.exceptions import UnauthorizedException, ForbiddenException

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Return the currently authenticated user, or raise UnauthorizedException."""
    token = credentials.credentials
    user = AuthService.get_current_user(db, token)
    if not user:
        raise UnauthorizedException("Invalid authentication credentials")
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Return current user only if active."""
    if not current_user.is_active:
        raise ForbiddenException("Inactive user")
    return current_user


def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Return current user only if admin."""
    if current_user.role != RoleEnum.ADMIN:
        raise ForbiddenException("Admin access required")
    return current_user


def get_optional_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Return current user if authenticated, None otherwise.
    Useful for endpoints accessible both with and without login.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "")
    return AuthService.get_current_user(db, token)
