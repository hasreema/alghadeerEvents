from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/test")
async def send_test_notification(current_user: Annotated[User, Depends(get_current_user)]):
    # Placeholder for email/whatsapp notification logic
    return {"message": "Test notification queued"}