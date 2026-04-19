from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.user import User
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


class BreakdownRequest(BaseModel):
    title: str


class SuggestTitleRequest(BaseModel):
    rough_input: str


class BreakdownResponse(BaseModel):
    subtasks: list[str]


class SuggestTitleResponse(BaseModel):
    suggested_title: str


@router.post("/breakdown", response_model=BreakdownResponse)
def breakdown(
    body: BreakdownRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    subtasks = ai_service.breakdown_task(body.title)
    return BreakdownResponse(subtasks=subtasks)


@router.post("/suggest-title", response_model=SuggestTitleResponse)
def suggest_title(
    body: SuggestTitleRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.rough_input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    title = ai_service.suggest_title(body.rough_input)
    return SuggestTitleResponse(suggested_title=title)
