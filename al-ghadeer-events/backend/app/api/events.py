from datetime import datetime
from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user, PaginationParams, DateRangeParams
from app.models.user import User
from app.models.event import Event, EventPricing, EventContact
from app.models.employee import Employee
from app.models.enums import EventStatus, CompensationType
from app.api.schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    PaginatedResponse,
    MessageResponse,
)

router = APIRouter()


def _compute_labor_cost(event: Event) -> float:
    total = 0.0
    for a in event.assignments or []:
        emp = None
        if a.employee_id:
            emp = Employee.get(a.employee_id)
        # since Beanie get is async, skip here; this is placeholder utility not used directly
    return event.labor_cost

@router.get("/", response_model=PaginatedResponse)
async def get_events(
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    date_range: Annotated[DateRangeParams, Depends()],
    status: Optional[str] = Query(None, description="Filter by status"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    search: Optional[str] = Query(None, description="Search in event names"),
):
    """Get all events with optional filters."""
    # Build query
    query_filter = {}
    
    if status:
        query_filter["status"] = status
    if event_type:
        query_filter["event_type"] = event_type
    if location:
        query_filter["location"] = location
    if search:
        query_filter["event_name"] = {"$regex": search, "$options": "i"}
    
    # Date range filter
    if date_range.start_date or date_range.end_date:
        date_filter = {}
        if date_range.start_date:
            date_filter["$gte"] = datetime.fromisoformat(date_range.start_date)
        if date_range.end_date:
            date_filter["$lte"] = datetime.fromisoformat(date_range.end_date)
        query_filter["event_date"] = date_filter
    
    # Get total count
    total = await Event.find(query_filter).count()
    
    # Get paginated results
    events = await Event.find(query_filter).skip(
        pagination.skip
    ).limit(
        pagination.limit
    ).sort("-event_date").to_list()
    
    # Calculate total pages
    total_pages = (total + pagination.limit - 1) // pagination.limit
    
    return {
        "items": events,
        "total": total,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total_pages": total_pages,
    }

@router.get("/upcoming", response_model=List[EventResponse])
async def get_upcoming_events(
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(10, ge=1, le=50),
):
    """Get upcoming events."""
    events = await Event.find(
        Event.event_date >= datetime.utcnow(),
        Event.status != EventStatus.CANCELLED
    ).sort("event_date").limit(limit).to_list()
    
    return events

@router.get("/stats/overview")
async def get_events_stats(
    current_user: Annotated[User, Depends(get_current_user)],
    date_range: Annotated[DateRangeParams, Depends()],
):
    """Get event statistics overview."""
    # Build date filter
    date_filter = {}
    if date_range.start_date:
        date_filter["$gte"] = datetime.fromisoformat(date_range.start_date)
    if date_range.end_date:
        date_filter["$lte"] = datetime.fromisoformat(date_range.end_date)
    
    query = {}
    if date_filter:
        query["event_date"] = date_filter
    
    # Get all events in range
    events = await Event.find(query).to_list()
    
    # Calculate statistics
    total_events = len(events)
    total_revenue = sum(e.total_revenue for e in events)
    total_expenses = sum(e.total_expenses for e in events)
    total_profit = sum(e.profit for e in events)
    avg_profit_margin = sum(e.profit_margin for e in events) / total_events if total_events > 0 else 0
    
    # Count by status
    status_counts = {}
    for event in events:
        status_counts[event.status] = status_counts.get(event.status, 0) + 1
    
    # Count by type
    type_counts = {}
    for event in events:
        type_counts[event.event_type] = type_counts.get(event.event_type, 0) + 1
    
    return {
        "total_events": total_events,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_profit": total_profit,
        "average_profit_margin": avg_profit_margin,
        "status_breakdown": status_counts,
        "type_breakdown": type_counts,
        "upcoming_events": await Event.find(
            Event.event_date >= datetime.utcnow(),
            Event.status != EventStatus.CANCELLED
        ).count(),
    }

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a specific event by ID."""
    event = await Event.get(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return event

@router.post("/", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new event."""
    # Convert schemas to embedded documents
    pricing = EventPricing(**event_data.pricing.dict())
    contacts = [EventContact(**contact.dict()) for contact in event_data.contacts]
    
    # Create event
    event = Event(
        **event_data.dict(exclude={"pricing", "contacts"}),
        pricing=pricing,
        contacts=contacts,
        created_by=str(current_user.id),
        total_revenue=pricing.total_price,  # initial
    )
    
    # Set initial payment status
    if event.deposit_paid and event.deposit_amount >= event.pricing.total_price:
        event.payment_status = "paid"
    elif event.deposit_paid and event.deposit_amount > 0:
        event.payment_status = "partial"
    
    await event.create()
    return event

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update an event."""
    event = await Event.get(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    update_data = event_update.dict(exclude_unset=True)

    # If assignments/hours/roles are provided within update, recompute labor cost
    if "assignments" in update_data and isinstance(update_data["assignments"], list):
        new_assignments = []
        total_labor = 0.0
        for a in update_data["assignments"]:
            emp_id = a.get("employee_id")
            role = a.get("role")
            hours = a.get("hours")
            cost = 0.0
            if emp_id:
                emp = await Employee.get(emp_id)
                if emp:
                    if emp.compensation_type == CompensationType.HOURLY and hours:
                        cost = (emp.hourly_rate or 0) * float(hours)
                    elif emp.compensation_type == CompensationType.ROLE and role:
                        cost = float(emp.role_rate_map.get(role, 0))
            new_assignments.append({"employee_id": emp_id, "role": role, "hours": hours, "cost": cost})
            total_labor += cost
        event.assignments = [Event.assignments.item_type(**a) for a in new_assignments]  # type: ignore
        event.labor_cost = total_labor
        # update total expenses/profit naive rollup
        event.total_expenses = (event.total_expenses or 0)  # leave existing
        # keep labor separately; profit can consider labor as part of expenses if you prefer
    
    for field, value in update_data.items():
        if field == "assignments":
            continue
        setattr(event, field, value)
    
    event.update_timestamp(str(current_user.id))
    await event.save()
    return event

@router.delete("/{event_id}", response_model=MessageResponse)
async def delete_event(
    event_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete an event (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete events"
        )
    
    event = await Event.get(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    await event.delete()
    return {"message": "Event deleted successfully"}

@router.post("/{event_id}/cancel", response_model=EventResponse)
async def cancel_event(
    event_id: str,
    reason: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Cancel an event."""
    event = await Event.get(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.status == EventStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is already cancelled"
        )
    
    event.status = EventStatus.CANCELLED
    event.internal_notes = f"{event.internal_notes or ''}\n\nCANCELLED: {reason}"
    event.update_timestamp(str(current_user.id))
    
    await event.save()
    return event

@router.post("/{event_id}/assign-employees", response_model=EventResponse)
async def assign_employees(
    event_id: str,
    employee_ids: List[str],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Assign employees to an event."""
    event = await Event.get(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event.assigned_employees = employee_ids
    event.update_timestamp(str(current_user.id))
    
    await event.save()
    return event