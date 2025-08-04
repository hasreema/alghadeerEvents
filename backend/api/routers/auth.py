from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from datetime import datetime

from models.user import User, UserCreate, UserUpdate, UserResponse, UserLogin, Token, UserRole
from auth.auth import (
    authenticate_user, 
    create_user_token, 
    get_password_hash, 
    get_current_user,
    require_admin
)

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    return create_user_token(user)

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, admin_user: User = Depends(require_admin)):
    """Register a new user (admin only)"""
    # Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role
    )
    
    await user.insert()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        settings=user.settings,
        created_at=user.created_at,
        last_login=user.last_login
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        settings=current_user.settings,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_user)
):
    """Update current user information"""
    update_data = user_update.dict(exclude_unset=True)
    
    # Users can't change their own role
    if "role" in update_data:
        del update_data["role"]
    
    # Update user
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        settings=current_user.settings,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user: User = Depends(require_admin)):
    """Get all users (admin only)"""
    users = await User.find_all().to_list()
    
    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            is_active=user.is_active,
            settings=user.settings,
            created_at=user.created_at,
            last_login=user.last_login
        )
        for user in users
    ]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, admin_user: User = Depends(require_admin)):
    """Get user by ID (admin only)"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        settings=user.settings,
        created_at=user.created_at,
        last_login=user.last_login
    )

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str, 
    user_update: UserUpdate, 
    admin_user: User = Depends(require_admin)
):
    """Update user by ID (admin only)"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Update user
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        settings=user.settings,
        created_at=user.created_at,
        last_login=user.last_login
    )

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin_user: User = Depends(require_admin)):
    """Delete user by ID (admin only)"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if str(user.id) == str(admin_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    await user.delete()
    return {"message": "User deleted successfully"}

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    return create_user_token(current_user)