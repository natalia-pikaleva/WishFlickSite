from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    friend_request = "friend_request"
    message = "message"
    # Добавьте другие типы по необходимости


class NotificationBase(BaseModel):
    recipient_id: int
    sender_id: Optional[int] = None
    type: NotificationType
    message: str


class NotificationCreate(NotificationBase):
    pass


class NotificationOut(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        orm_mode = True
