from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user, PaginationParams
from app.models.user import User
from app.models.reminder import Reminder
from app.api.schemas import PaginatedResponse, MessageResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def list_reminders(
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    assigned_to: Optional[str] = Query(None),
    is_done: Optional[bool] = Query(None),
):
    query: dict = {}
    if assigned_to:
        query["assigned_to"] = assigned_to
    if is_done is not None:
        query["is_done"] = is_done

    total = await Reminder.find(query).count()
    items = await Reminder.find(query).skip(pagination.skip).limit(pagination.limit).sort("due_at").to_list()
    return {
        "items": items,
        "total": total,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total_pages": (total + pagination.page_size - 1) // pagination.page_size,
    }

@router.post("/")
async def create_reminder(data: dict, current_user: Annotated[User, Depends(get_current_user)]):
    reminder = Reminder(**data)
    await reminder.create()
    return reminder

@router.put("/{reminder_id}")
async def update_reminder(reminder_id: str, update: dict, current_user: Annotated[User, Depends(get_current_user)]):
    reminder = await Reminder.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    for k, v in update.items():
        setattr(reminder, k, v)
    reminder.update_timestamp()
    await reminder.save()
    return reminder

@router.post("/{reminder_id}/complete", response_model=MessageResponse)
async def complete_reminder(reminder_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    reminder = await Reminder.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    reminder.is_done = True
    reminder.update_timestamp()
    await reminder.save()
    return {"message": "Reminder completed"}

@router.delete("/{reminder_id}", response_model=MessageResponse)
async def delete_reminder(reminder_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    reminder = await Reminder.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    await reminder.delete()
    return {"message": "Reminder deleted"}