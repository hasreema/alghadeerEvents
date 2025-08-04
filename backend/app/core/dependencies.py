from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.security import verify_token, TokenData
from app.models.user import User
from app.core.config import settings


security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    
    try:
        token_data = verify_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await User.get(token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Get current user if they are an admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[User]:
    """Get current user if authenticated, otherwise None."""
    if not credentials:
        return None
    
    try:
        token_data = verify_token(credentials.credentials)
        user = await User.get(token_data.user_id)
        if user and user.is_active:
            return user
    except (JWTError, Exception):
        pass
    
    return None


class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(
            settings.default_page_size,
            ge=1,
            le=settings.max_page_size,
            description="Number of items per page"
        ),
    ):
        self.page = page
        self.page_size = page_size
        self.skip = (page - 1) * page_size
        self.limit = page_size


def get_language(
    accept_language: Optional[str] = Query(
        None,
        alias="lang",
        description="Language code (en, he, ar)"
    )
) -> str:
    """Get requested language or default."""
    if accept_language and accept_language in settings.supported_languages:
        return accept_language
    return settings.default_language


class DateRangeParams:
    def __init__(
        self,
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    ):
        self.start_date = start_date
        self.end_date = end_date