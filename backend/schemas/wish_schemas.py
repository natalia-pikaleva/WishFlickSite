from pydantic import BaseModel, EmailStr, HttpUrl, Field, validator
from typing import Optional, List
from enum import Enum
from datetime import datetime
from schemas.user_schemas import UserResponse


class WishBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    goal: float = Field(..., gt=0)
    is_public: bool


class WishCreate(WishBase):
    pass


class Wish(WishBase):
    id: int
    raised: float
    owner_id: int
    is_public: bool

    class Config:
        orm_mode = True


class WishOut(Wish):
    pass


class WishWithStats(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    goal: float
    raised: Optional[float]
    owner_id: int
    owner_name: Optional[str]
    owner_avatar: Optional[str]
    likes_count: int
    comments_count: int
    is_public: bool

    class Config:
        orm_mode = True


class WishWithOwner(Wish):
    owner: Optional[UserResponse]
    supporters: int
    time_left: str
    category: Optional[str] = None

    class Config:
        orm_mode = True


class WishUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    image_url: Optional[HttpUrl]
    goal: Optional[float] = Field(None, gt=0)
    is_public: Optional[bool]

    class Config:
        orm_mode = True
