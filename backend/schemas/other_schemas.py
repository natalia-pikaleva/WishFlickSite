from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LikeCreate(BaseModel):
    wish_id: int


class LikeResponse(BaseModel):
    id: int
    user_id: int
    wish_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class UserSummary(BaseModel):
    id: int
    name: Optional[str]
    avatar_url: Optional[str]

    class Config:
        orm_mode = True


class WishSummary(BaseModel):
    id: int
    title: str
    raised: float
    goal: float

    class Config:
        orm_mode = True


class ActivityResponse(BaseModel):
    id: int
    user: UserSummary
    type: str
    target_type: Optional[str]
    target_id: Optional[int]
    wish: Optional[WishSummary]
    created_at: datetime

    class Config:
        orm_mode = True


class PostBase(BaseModel):
    content: str


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class PostOut(PostBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "arbitrary_types_allowed": True
    }
