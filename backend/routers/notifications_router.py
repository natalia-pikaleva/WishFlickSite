from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from database import get_db
from models import Notification, User
from schemas.notification_schemas import NotificationOut, NotificationCreate
import services.crud.notification_crud as notification_crud
from services.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[NotificationOut])
async def get_notifications(
        read_filter: Optional[bool] = None,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
        limit: int = 25
):
    notifications = await notification_crud.get_notifications_for_user(
        db, user_id=current_user.id, read_filter=read_filter, limit=limit
    )
    result = []
    for notification in notifications:
        result.append(NotificationOut(
            id=notification.id,
            recipient_id=notification.recipient_id,
            sender_id=notification.sender_id,
            type=notification.type,
            message=notification.message,
            is_read=notification.is_read,
            created_at=notification.created_at,
            avatar_url=notification.sender.avatar_url if notification.sender else None
        ))

    return result


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=NotificationOut)
async def create_notification(
        notification: NotificationCreate,
        db: AsyncSession = Depends(get_db),
):
    try:
        # Можно добавить проверку прав, например, что sender_id существует
        new_notification = await notification_crud.create_notification(
            db,
            recipient_id=notification.recipient_id,
            sender_id=notification.sender_id,
            type=notification.type,
            message=notification.message,
        )
        return new_notification
    except Exception as e:
        logging.error(f"Failed to create notification: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create notification {e}")


@router.put("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
        notification_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    notification = await notification_crud.get_notification(db, notification_id)
    if not notification or notification.recipient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")

    success = await notification_crud.mark_notification_as_read(db, notification_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")
    return None
