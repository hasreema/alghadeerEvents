from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from models.event import (
    Event, EventCreate, EventUpdate, EventResponse, EventStats,
    EventStatus, EventType, Venue, PaymentStatus
)
from models.user import User
from auth.auth import get_current_user, require_admin_or_staff

router = APIRouter()

@router.post("/", response_model=EventResponse)
async def create_event(
    event_data: EventCreate, 
    current_user: User = Depends(require_admin_or_staff)
):
    """Create a new event"""
    # Calculate total price
    total_price = event_data.base_price + sum(
        addon.price * addon.quantity for addon in event_data.service_addons
    )
    
    event = Event(
        **event_data.dict(),
        total_price=total_price,
        created_by=str(current_user.id)
    )
    
    await event.insert()
    
    return EventResponse(
        id=str(event.id),
        title=event.title,
        event_type=event.event_type,
        status=event.status,
        contact=event.contact,
        event_date=event.event_date,
        start_time=event.start_time,
        end_time=event.end_time,
        venue=event.venue,
        guest_count=event.guest_count,
        base_price=event.base_price,
        service_addons=event.service_addons,
        total_price=event.total_price,
        amount_paid=event.amount_paid,
        payment_status=event.payment_status,
        assigned_employees=event.assigned_employees,
        labor_cost=event.labor_cost,
        notes=event.notes,
        special_requirements=event.special_requirements,
        equipment_needed=event.equipment_needed,
        profit_margin=event.profit_margin,
        created_at=event.created_at,
        updated_at=event.updated_at
    )

@router.get("/", response_model=List[EventResponse])
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[EventStatus] = None,
    event_type: Optional[EventType] = None,
    venue: Optional[Venue] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_status: Optional[PaymentStatus] = None,
    current_user: User = Depends(get_current_user)
):
    """Get events with filtering options"""
    query = {}
    
    # Apply filters
    if status:
        query["status"] = status
    if event_type:
        query["event_type"] = event_type
    if venue:
        query["venue"] = venue
    if payment_status:
        query["payment_status"] = payment_status
    if start_date:
        query["event_date"] = {"$gte": start_date}
    if end_date:
        if "event_date" in query:
            query["event_date"]["$lte"] = end_date
        else:
            query["event_date"] = {"$lte": end_date}
    
    # Execute query
    if query:
        events = await Event.find(query).skip(skip).limit(limit).to_list()
    else:
        events = await Event.find_all().skip(skip).limit(limit).to_list()
    
    return [
        EventResponse(
            id=str(event.id),
            title=event.title,
            event_type=event.event_type,
            status=event.status,
            contact=event.contact,
            event_date=event.event_date,
            start_time=event.start_time,
            end_time=event.end_time,
            venue=event.venue,
            guest_count=event.guest_count,
            base_price=event.base_price,
            service_addons=event.service_addons,
            total_price=event.total_price,
            amount_paid=event.amount_paid,
            payment_status=event.payment_status,
            assigned_employees=event.assigned_employees,
            labor_cost=event.labor_cost,
            notes=event.notes,
            special_requirements=event.special_requirements,
            equipment_needed=event.equipment_needed,
            profit_margin=event.profit_margin,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
        for event in events
    ]

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, current_user: User = Depends(get_current_user)):
    """Get event by ID"""
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return EventResponse(
        id=str(event.id),
        title=event.title,
        event_type=event.event_type,
        status=event.status,
        contact=event.contact,
        event_date=event.event_date,
        start_time=event.start_time,
        end_time=event.end_time,
        venue=event.venue,
        guest_count=event.guest_count,
        base_price=event.base_price,
        service_addons=event.service_addons,
        total_price=event.total_price,
        amount_paid=event.amount_paid,
        payment_status=event.payment_status,
        assigned_employees=event.assigned_employees,
        labor_cost=event.labor_cost,
        notes=event.notes,
        special_requirements=event.special_requirements,
        equipment_needed=event.equipment_needed,
        profit_margin=event.profit_margin,
        created_at=event.created_at,
        updated_at=event.updated_at
    )

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Update event by ID"""
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    update_data = event_update.dict(exclude_unset=True)
    
    # Update fields
    for field, value in update_data.items():
        setattr(event, field, value)
    
    # Recalculate total price if base_price or service_addons changed
    if "base_price" in update_data or "service_addons" in update_data:
        event.total_price = event.calculate_total_price()
    
    # Update payment status based on amount paid
    if event.amount_paid >= event.total_price:
        event.payment_status = PaymentStatus.PAID
    elif event.amount_paid > Decimal("0.00"):
        event.payment_status = PaymentStatus.PARTIALLY_PAID
    else:
        event.payment_status = PaymentStatus.NOT_PAID
    
    # Calculate profit margin
    event.profit_margin = event.calculate_profit()
    
    event.updated_at = datetime.utcnow()
    await event.save()
    
    return EventResponse(
        id=str(event.id),
        title=event.title,
        event_type=event.event_type,
        status=event.status,
        contact=event.contact,
        event_date=event.event_date,
        start_time=event.start_time,
        end_time=event.end_time,
        venue=event.venue,
        guest_count=event.guest_count,
        base_price=event.base_price,
        service_addons=event.service_addons,
        total_price=event.total_price,
        amount_paid=event.amount_paid,
        payment_status=event.payment_status,
        assigned_employees=event.assigned_employees,
        labor_cost=event.labor_cost,
        notes=event.notes,
        special_requirements=event.special_requirements,
        equipment_needed=event.equipment_needed,
        profit_margin=event.profit_margin,
        created_at=event.created_at,
        updated_at=event.updated_at
    )

@router.delete("/{event_id}")
async def delete_event(
    event_id: str, 
    current_user: User = Depends(require_admin_or_staff)
):
    """Delete event by ID"""
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    await event.delete()
    return {"message": "Event deleted successfully"}

@router.get("/stats/overview", response_model=EventStats)
async def get_event_stats(current_user: User = Depends(get_current_user)):
    """Get event statistics overview"""
    # Get all events
    all_events = await Event.find_all().to_list()
    
    # Calculate stats
    total_events = len(all_events)
    confirmed_events = len([e for e in all_events if e.status == EventStatus.CONFIRMED])
    completed_events = len([e for e in all_events if e.status == EventStatus.COMPLETED])
    
    total_revenue = sum(e.amount_paid for e in all_events)
    total_profit = sum(e.calculate_profit() for e in all_events)
    
    # Upcoming events (within next 30 days)
    today = date.today()
    upcoming_events = len([
        e for e in all_events 
        if e.event_date >= today and e.status in [EventStatus.PENDING, EventStatus.CONFIRMED]
    ])
    
    # Overdue payments
    overdue_payments = len([
        e for e in all_events 
        if e.payment_status in [PaymentStatus.NOT_PAID, PaymentStatus.PARTIALLY_PAID]
        and e.event_date < today
    ])
    
    return EventStats(
        total_events=total_events,
        confirmed_events=confirmed_events,
        completed_events=completed_events,
        total_revenue=total_revenue,
        total_profit=total_profit,
        upcoming_events=upcoming_events,
        overdue_payments=overdue_payments
    )

@router.get("/upcoming/next", response_model=List[EventResponse])
async def get_upcoming_events(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming events"""
    today = date.today()
    
    events = await Event.find(
        {"event_date": {"$gte": today}}
    ).sort("event_date").limit(limit).to_list()
    
    return [
        EventResponse(
            id=str(event.id),
            title=event.title,
            event_type=event.event_type,
            status=event.status,
            contact=event.contact,
            event_date=event.event_date,
            start_time=event.start_time,
            end_time=event.end_time,
            venue=event.venue,
            guest_count=event.guest_count,
            base_price=event.base_price,
            service_addons=event.service_addons,
            total_price=event.total_price,
            amount_paid=event.amount_paid,
            payment_status=event.payment_status,
            assigned_employees=event.assigned_employees,
            labor_cost=event.labor_cost,
            notes=event.notes,
            special_requirements=event.special_requirements,
            equipment_needed=event.equipment_needed,
            profit_margin=event.profit_margin,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
        for event in events
    ]

@router.post("/{event_id}/assign-employee")
async def assign_employee_to_event(
    event_id: str,
    employee_id: str,
    current_user: User = Depends(require_admin_or_staff)
):
    """Assign employee to event"""
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if employee_id not in event.assigned_employees:
        event.assigned_employees.append(employee_id)
        event.updated_at = datetime.utcnow()
        await event.save()
    
    return {"message": "Employee assigned to event successfully"}

@router.delete("/{event_id}/remove-employee/{employee_id}")
async def remove_employee_from_event(
    event_id: str,
    employee_id: str,
    current_user: User = Depends(require_admin_or_staff)
):
    """Remove employee from event"""
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if employee_id in event.assigned_employees:
        event.assigned_employees.remove(employee_id)
        event.updated_at = datetime.utcnow()
        await event.save()
    
    return {"message": "Employee removed from event successfully"}