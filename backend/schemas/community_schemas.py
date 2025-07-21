from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CommunityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    rules: Optional[str] = None


class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    rules: Optional[str] = None


class Community(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    rules: Optional[str] = None
    created_at: datetime
    members_count: Optional[int] = None
    wishes_count: Optional[int] = None

    class Config:
        orm_mode = True


class Member(BaseModel):
    id: str
    name: str
    avatar_url: str | None = None
    role: str  # 'admin' | 'member' | 'moderator'
    isOnline: bool
    contributions: float


class CommunityMemberCreate(BaseModel):
    user_id: int
    role: str = "member"
