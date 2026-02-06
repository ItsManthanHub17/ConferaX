from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService
from app.variables.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticate with email and password to receive JWT tokens",
    responses={
        200: {
            "description": "Login successful",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "user": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "admin.user@cygnet.one",
                            "name": "Admin User",
                            "role": "ADMIN"
                        }
                    }
                }
            }
        },
        401: {"description": "Invalid credentials"}
    }
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access & refresh tokens.
    """
    tokens = AuthService.login(db, payload.email, payload.password)

    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return tokens


@router.get(
    "/me",
    status_code=status.HTTP_200_OK
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user info.
    Requires Authorization: Bearer <access_token>
    """
    return current_user
