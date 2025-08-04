from datetime import datetime
from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user, PaginationParams, DateRangeParams
from app.models.user import User
from app.models.event import Event, EventPricing, EventContact
from app.models.enums import EventStatus
from app.api.schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    PaginatedResponse,
    MessageResponse,
)

router = APIRouter()


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
        total_revenue=pricing.total_price,  # Initial revenue equals pricing
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
    
    # Update fields
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    # Update timestamp and user
    event.update_timestamp(str(current_user.id))
    
    # Recalculate financial metrics if needed
    if "assigned_employees" in update_data:
        # TODO: Calculate labor cost based on assigned employees
        pass
    
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
    
    # Update status and add cancellation note
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
    
    # TODO: Validate employee IDs exist
    # TODO: Calculate labor cost based on employees and event duration
    
    event.assigned_employees = employee_ids
    event.update_timestamp(str(current_user.id))
    
    await event.save()
    return event