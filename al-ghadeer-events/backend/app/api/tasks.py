from datetime import datetime
from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user, PaginationParams
from app.models.user import User
from app.models.task import Task, TaskComment
from app.models.event import Event
from app.models.enums import TaskStatus, TaskPriority
from app.api.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    PaginatedResponse,
    MessageResponse,
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def get_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user"),
    event_id: Optional[str] = Query(None, description="Filter by event"),
    overdue: Optional[bool] = Query(None, description="Filter overdue tasks"),
):
    """Get all tasks with optional filters."""
    # Build query
    query_filter = {}
    
    if status:
        query_filter["status"] = status
    if priority:
        query_filter["priority"] = priority
    if assigned_to:
        query_filter["assigned_to"] = assigned_to
    if event_id:
        query_filter["event_id"] = event_id
    
    # Handle overdue filter
    if overdue:
        query_filter["due_date"] = {"$lt": datetime.utcnow()}
        query_filter["status"] = {"$nin": [TaskStatus.COMPLETED, TaskStatus.CANCELLED]}
    
    # Get total count
    total = await Task.find(query_filter).count()
    
    # Get paginated results
    tasks = await Task.find(query_filter).skip(
        pagination.skip
    ).limit(
        pagination.limit
    ).sort([("priority", -1), ("due_date", 1)]).to_list()
    
    # Calculate total pages
    total_pages = (total + pagination.limit - 1) // pagination.limit
    
    return {
        "items": tasks,
        "total": total,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total_pages": total_pages,
    }


@router.get("/my-tasks", response_model=List[TaskResponse])
async def get_my_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """Get tasks assigned to current user."""
    query_filter = {"assigned_to": str(current_user.id)}
    
    if status:
        query_filter["status"] = status
    
    tasks = await Task.find(query_filter).sort([
        ("priority", -1),
        ("due_date", 1)
    ]).to_list()
    
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a specific task by ID."""
    task = await Task.get(task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new task."""
    # Verify event exists if event_id provided
    event_name = None
    if task_data.event_id:
        event = await Event.get(task_data.event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        event_name = event.event_name
    
    # Get assigned user name if assigned
    assigned_to_name = None
    if task_data.assigned_to:
        assigned_user = await User.get(task_data.assigned_to)
        if assigned_user:
            assigned_to_name = assigned_user.full_name
    
    # Create task
    task = Task(
        **task_data.dict(),
        event_name=event_name,
        assigned_to_name=assigned_to_name,
        assigned_by=str(current_user.id),
        assigned_by_name=current_user.full_name,
        created_by=str(current_user.id),
    )
    
    await task.create()
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a task."""
    task = await Task.get(task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update fields
    update_data = task_update.dict(exclude_unset=True)
    
    # Handle status change
    if "status" in update_data and update_data["status"] == TaskStatus.COMPLETED:
        update_data["completed_date"] = datetime.utcnow()
    
    # Update assigned user name if changed
    if "assigned_to" in update_data and update_data["assigned_to"]:
        assigned_user = await User.get(update_data["assigned_to"])
        if assigned_user:
            update_data["assigned_to_name"] = assigned_user.full_name
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.update_timestamp(str(current_user.id))
    await task.save()
    
    return task


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete a task."""
    task = await Task.get(task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Only creator or admin can delete
    if str(task.created_by) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own tasks"
        )
    
    await task.delete()
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/comment")
async def add_comment(
    task_id: str,
    comment: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Add a comment to a task."""
    task = await Task.get(task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Create comment
    task_comment = TaskComment(
        user_id=str(current_user.id),
        user_name=current_user.full_name,
        comment=comment,
    )
    
    task.comments.append(task_comment)
    task.update_timestamp(str(current_user.id))
    await task.save()
    
    return {"message": "Comment added successfully", "comment": task_comment}


@router.put("/{task_id}/checklist")
async def update_checklist(
    task_id: str,
    checklist: List[dict],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update task checklist."""
    task = await Task.get(task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.checklist = checklist
    task.progress_percentage = task.calculate_checklist_progress()
    task.update_timestamp(str(current_user.id))
    await task.save()
    
    return {
        "message": "Checklist updated successfully",
        "progress": task.progress_percentage
    }


@router.get("/stats/summary")
async def get_task_stats(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get task statistics summary."""
    # Get all tasks
    all_tasks = await Task.find().to_list()
    
    # Calculate stats
    total_tasks = len(all_tasks)
    
    # By status
    by_status = {}
    for task in all_tasks:
        status = task.status
        by_status[status] = by_status.get(status, 0) + 1
    
    # By priority
    by_priority = {}
    for task in all_tasks:
        priority = task.priority
        by_priority[priority] = by_priority.get(priority, 0) + 1
    
    # Overdue tasks
    overdue_tasks = [
        task for task in all_tasks
        if task.is_overdue()
    ]
    
    # My tasks
    my_tasks = [
        task for task in all_tasks
        if task.assigned_to == str(current_user.id)
    ]
    
    return {
        "total_tasks": total_tasks,
        "by_status": by_status,
        "by_priority": by_priority,
        "overdue_count": len(overdue_tasks),
        "my_tasks": {
            "total": len(my_tasks),
            "todo": len([t for t in my_tasks if t.status == TaskStatus.TODO]),
            "in_progress": len([t for t in my_tasks if t.status == TaskStatus.IN_PROGRESS]),
            "completed": len([t for t in my_tasks if t.status == TaskStatus.COMPLETED]),
        },
    }