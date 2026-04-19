from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.todo import TodoStatus, TodoPriority


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TodoPriority = TodoPriority.medium


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TodoStatus] = None
    priority: Optional[TodoPriority] = None


class TodoOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TodoStatus
    priority: TodoPriority
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
