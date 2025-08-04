from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from models.task import Task, TaskCreate, TaskUpdate, TaskResponse, TaskStats
from models.user import User
from auth.auth import get_current_user, require_admin_or_staff

router = APIRouter()

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Create a new task"""
    task = Task(
        **task_data.dict(),
        created_by=str(current_user.id)
    )
    
    await task.insert()
    
    return TaskResponse(
        id=str(task.id),
        title=task.title,
        description=task.description,
        category=task.category,
        status=task.status,
        priority=task.priority,
        assigned_to=task.assigned_to,
        assigned_by=task.assigned_by,
        event_id=task.event_id,
        due_date=task.due_date,
        estimated_duration=task.estimated_duration,
        actual_duration=task.actual_duration,
        completed_at=task.completed_at,
        completed_by=task.completed_by,
        completion_notes=task.completion_notes,
        depends_on=task.depends_on,
        blocked_by=task.blocked_by,
        attachments=task.attachments,
        notes=task.notes,
        is_recurring=task.is_recurring,
        recurrence_pattern=task.recurrence_pattern,
        next_occurrence=task.next_occurrence,
        created_at=task.created_at,
        updated_at=task.updated_at,
        is_overdue=task.is_overdue()
    )

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    event_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get tasks with filtering"""
    query = {}
    
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if assigned_to:
        query["assigned_to"] = assigned_to
    if event_id:
        query["event_id"] = event_id
    
    if query:
        tasks = await Task.find(query).skip(skip).limit(limit).to_list()
    else:
        tasks = await Task.find_all().skip(skip).limit(limit).to_list()
    
    return [
        TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            category=task.category,
            status=task.status,
            priority=task.priority,
            assigned_to=task.assigned_to,
            assigned_by=task.assigned_by,
            event_id=task.event_id,
            due_date=task.due_date,
            estimated_duration=task.estimated_duration,
            actual_duration=task.actual_duration,
            completed_at=task.completed_at,
            completed_by=task.completed_by,
            completion_notes=task.completion_notes,
            depends_on=task.depends_on,
            blocked_by=task.blocked_by,
            attachments=task.attachments,
            notes=task.notes,
            is_recurring=task.is_recurring,
            recurrence_pattern=task.recurrence_pattern,
            next_occurrence=task.next_occurrence,
            created_at=task.created_at,
            updated_at=task.updated_at,
            is_overdue=task.is_overdue()
        )
        for task in tasks
    ]

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, current_user: User = Depends(get_current_user)):
    """Get task by ID"""
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return TaskResponse(
        id=str(task.id),
        title=task.title,
        description=task.description,
        category=task.category,
        status=task.status,
        priority=task.priority,
        assigned_to=task.assigned_to,
        assigned_by=task.assigned_by,
        event_id=task.event_id,
        due_date=task.due_date,
        estimated_duration=task.estimated_duration,
        actual_duration=task.actual_duration,
        completed_at=task.completed_at,
        completed_by=task.completed_by,
        completion_notes=task.completion_notes,
        depends_on=task.depends_on,
        blocked_by=task.blocked_by,
        attachments=task.attachments,
        notes=task.notes,
        is_recurring=task.is_recurring,
        recurrence_pattern=task.recurrence_pattern,
        next_occurrence=task.next_occurrence,
        created_at=task.created_at,
        updated_at=task.updated_at,
        is_overdue=task.is_overdue()
    )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Update task"""
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    await task.save()
    
    return TaskResponse(
        id=str(task.id),
        title=task.title,
        description=task.description,
        category=task.category,
        status=task.status,
        priority=task.priority,
        assigned_to=task.assigned_to,
        assigned_by=task.assigned_by,
        event_id=task.event_id,
        due_date=task.due_date,
        estimated_duration=task.estimated_duration,
        actual_duration=task.actual_duration,
        completed_at=task.completed_at,
        completed_by=task.completed_by,
        completion_notes=task.completion_notes,
        depends_on=task.depends_on,
        blocked_by=task.blocked_by,
        attachments=task.attachments,
        notes=task.notes,
        is_recurring=task.is_recurring,
        recurrence_pattern=task.recurrence_pattern,
        next_occurrence=task.next_occurrence,
        created_at=task.created_at,
        updated_at=task.updated_at,
        is_overdue=task.is_overdue()
    )

@router.post("/{task_id}/complete")
async def complete_task(
    task_id: str,
    completion_notes: Optional[str] = None,
    actual_duration: Optional[int] = None,
    current_user: User = Depends(require_admin_or_staff)
):
    """Complete a task"""
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    from models.task import TaskStatus
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.utcnow()
    task.completed_by = str(current_user.id)
    task.completion_notes = completion_notes
    if actual_duration:
        task.actual_duration = actual_duration
    task.updated_at = datetime.utcnow()
    
    await task.save()
    
    return {"message": "Task completed successfully"}

@router.get("/stats/overview", response_model=TaskStats)
async def get_task_stats(current_user: User = Depends(get_current_user)):
    """Get task statistics"""
    tasks = await Task.find_all().to_list()
    
    from models.task import TaskStatus, TaskPriority, TaskCategory
    
    total_tasks = len(tasks)
    pending_tasks = len([t for t in tasks if t.status == TaskStatus.PENDING])
    in_progress_tasks = len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS])
    completed_tasks = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
    overdue_tasks = len([t for t in tasks if t.is_overdue()])
    
    # Group by priority
    by_priority = {}
    for task in tasks:
        priority = task.priority
        by_priority[priority] = by_priority.get(priority, 0) + 1
    
    # Group by category
    by_category = {}
    for task in tasks:
        category = task.category
        by_category[category] = by_category.get(category, 0) + 1
    
    # Group by status
    by_status = {}
    for task in tasks:
        status = task.status
        by_status[status] = by_status.get(status, 0) + 1
    
    return TaskStats(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
        by_priority=by_priority,
        by_category=by_category,
        by_status=by_status
    )