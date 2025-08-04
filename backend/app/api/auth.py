from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_reset_token,
    verify_reset_token,
)
from app.core.dependencies import get_current_user
from app.models.user import User
from app.api.schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    ChangePasswordRequest,
    MessageResponse,
)

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user."""
    # Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    existing_username = await User.find_one(User.username == user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        phone_number=user_data.phone_number,
        preferred_language=user_data.preferred_language,
        department=user_data.department,
    )
    
    await user.create()
    return user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """Login user and return access token."""
    # Find user by email
    user = await User.find_one(User.email == credentials.email)
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Update current user profile."""
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    current_user.update_timestamp(str(current_user.id))
    await current_user.save()
    
    return current_user


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Change user password."""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.update_timestamp(str(current_user.id))
    await current_user.save()
    
    return {"message": "Password changed successfully"}


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(email: EmailStr):
    """Send password reset email."""
    user = await User.find_one(User.email == email)
    
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Create reset token
    reset_token = create_reset_token(user.email)
    
    # TODO: Send email with reset token
    # For now, just return the token (remove in production)
    return {
        "message": "Password reset link sent to email",
        "details": {"reset_token": reset_token}  # Remove in production
    }


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(token: str, new_password: str):
    """Reset password with token."""
    email = verify_reset_token(token)
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Find user and update password
    user = await User.find_one(User.email == email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.hashed_password = get_password_hash(new_password)
    user.update_timestamp()
    await user.save()
    
    return {"message": "Password reset successfully"}


@router.post("/verify-token", response_model=UserResponse)
async def verify_token(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Verify if token is valid and return user data."""
    return current_user


# Import UserUpdate here to avoid circular import
from app.api.schemas import UserUpdate
from pydantic import EmailStr