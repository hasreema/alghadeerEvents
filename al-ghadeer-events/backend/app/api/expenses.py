from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user, PaginationParams
from app.models.user import User
from app.models.expense import Expense
from app.api.schemas import PaginatedResponse, MessageResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def list_expenses(
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    event_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
):
    query: dict = {}
    if event_id:
        query["event_id"] = event_id
    if category:
        query["category"] = category

    total = await Expense.find(query).count()
    items = await Expense.find(query).skip(pagination.skip).limit(pagination.limit).sort("-expense_date").to_list()

    return {
        "items": items,
        "total": total,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total_pages": (total + pagination.page_size - 1) // pagination.page_size,
    }

@router.post("/")
async def create_expense(
    data: dict,
    current_user: Annotated[User, Depends(get_current_user)],
):
    expense = Expense(**data)
    await expense.create()
    return expense

@router.get("/{expense_id}")
async def get_expense(expense_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    expense = await Expense.get(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense

@router.put("/{expense_id}")
async def update_expense(expense_id: str, update: dict, current_user: Annotated[User, Depends(get_current_user)]):
    expense = await Expense.get(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    for k, v in update.items():
        setattr(expense, k, v)
    expense.update_timestamp()
    await expense.save()
    return expense

@router.delete("/{expense_id}", response_model=MessageResponse)
async def delete_expense(expense_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    expense = await Expense.get(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    await expense.delete()
    return {"message": "Expense deleted"}