from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.event import Event
from app.models.payment import Payment
from app.models.expense import Expense

router = APIRouter()

@router.get("/summary")
async def get_summary_report(current_user: Annotated[User, Depends(get_current_user)]):
    events = await Event.find({}).count()
    payments_total = sum([p.amount async for p in Payment.find({})])
    expenses_total = sum([e.amount async for e in Expense.find({})])
    profit = payments_total - expenses_total
    return {
        "total_events": events,
        "total_payments": payments_total,
        "total_expenses": expenses_total,
        "profit": profit,
    }