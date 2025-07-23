from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from database import get_db
from models import Notification, User, NotificationType, NotificationStatus
from schemas.notification_schemas import NotificationOut, NotificationCreate
import services.crud.notification_crud as notification_crud
from services.auth import get_current_user
from services.crud import user_crud, friend_crud, community_crud

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
            community_id=notification.community_id if notification.community_id else None,
            is_read=notification.is_read,
            created_at=notification.created_at,
            avatar_url=notification.sender.avatar_url if notification.sender else None,
            status=notification.status
        ))

    return result


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=NotificationOut)
async def create_notification(
        notification: NotificationCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    try:
        if current_user.is_guest:
            raise HTTPException(status_code=403, detail="Для данного действия необходимо зарегистрироваться")
        # Можно добавить проверку прав, например, что sender_id существует
        new_notification = await notification_crud.create_notification(
            db,
            recipient_id=notification.recipient_id,
            sender_id=notification.sender_id,
            type=notification.type,
            community_id=notification.community_id if notification.community_id else None,
            message=notification.message,
        )
        return new_notification
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to create notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to create notification")


@router.put("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
        notification_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    try:
        if current_user.is_guest:
            raise HTTPException(status_code=403, detail="Для данного действия необходимо зарегистрироваться")
        notification = await notification_crud.get_notification(db, notification_id)
        if not notification or notification.recipient_id != current_user.id:
            raise HTTPException(status_code=404, detail="Notification not found")

        success = await notification_crud.mark_notification_as_read(db, notification_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to mark notification as read")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to mark read notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark read notification")


@router.post(
    "/{notification_id}/friend-request/accept",
    status_code=status.HTTP_200_OK
)
async def accept_friend_request(
        notification_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    try:
        notif = await db.get(Notification, notification_id)
        if not notif:
            raise HTTPException(404, "Notification not found")
        if notif.type != NotificationType.friend_request:
            raise HTTPException(400, "Notification is not a friend_request")
        if notif.recipient_id != current_user.id:
            raise HTTPException(403, "This notification is not for you")

        # Получаем отправителя
        friend = await user_crud.get_user_by_id(db, notif.sender_id)
        if not friend:
            raise HTTPException(404, "Sender user not found")

        # Проверяем, уже ли они друзья
        already_friends = await friend_crud.check_if_friends(db, current_user.id, friend.id)
        if not already_friends:
            await friend_crud.add_friend(db, current_user, friend)
            notif.status = NotificationStatus.accepted
            notif.is_read = True
            await db.commit()
            return {"detail": "Friend request accepted"}
        else:
            # Даже если уже друзья, всё равно помечаем уведомление
            notif.status = NotificationStatus.accepted
            notif.is_read = True
            await db.commit()
            return {"detail": "Already friends: notification updated"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to add friend from notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to add friend from notification")


@router.post(
    "/{notification_id}/friend-request/reject",
    status_code=status.HTTP_200_OK
)
async def reject_friend_request(
        notification_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    try:
        notif = await db.get(Notification, notification_id)
        if not notif:
            raise HTTPException(404, "Notification not found")
        if notif.type != NotificationType.friend_request:
            raise HTTPException(400, "Notification is not a friend_request")
        if notif.recipient_id != current_user.id:
            raise HTTPException(403, "This notification is not for you")

        # Тут неважно состояние, просто меняем статус
        notif.status = NotificationStatus.rejected
        notif.is_read = True
        await db.commit()
        return {"detail": "Friend request rejected"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to reject friend from notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to reject friend from notification")


@router.post(
    "/{notification_id}/join-request/accept",
    status_code=status.HTTP_200_OK
)
async def accept_join_request(
        notification_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    try:
        notif = await db.get(Notification, notification_id)
        if not notif:
            raise HTTPException(404, "Notification not found")
        if notif.type != NotificationType.join_request:
            raise HTTPException(400, "Notification is not a join_request")
        if notif.recipient_id != current_user.id:
            raise HTTPException(403, "This notification is not for you")

        # Проверяем, состоит ли уже отправитель в этом сообществе (sender_id)
        is_member = await community_crud.is_community_member(
            db, notif.community_id, notif.sender_id)
        if not is_member:
            await community_crud.add_community_member(
                db=db,
                community_id=notif.community_id,
                user_id=notif.sender_id,
                role="member"
            )

        notif.status = NotificationStatus.accepted
        notif.is_read = True
        await db.commit()
        return {"detail": "Join request accepted (statuses normalized)"}

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to add member in community from notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to add member in community from notification")


@router.post(
    "/{notification_id}/join-request/reject",
    status_code=status.HTTP_200_OK
)
async def reject_join_request(
        notification_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    try:
        notif = await db.get(Notification, notification_id)
        if not notif:
            raise HTTPException(404, "Notification not found")
        if notif.type != NotificationType.join_request:
            raise HTTPException(400, "Notification is not a join_request")
        if notif.recipient_id != current_user.id:
            raise HTTPException(403, "This notification is not for you")

        notif.status = NotificationStatus.rejected
        notif.is_read = True
        await db.commit()
        return {"detail": "Join request rejected"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to reject member in community from notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to reject member in community from notification")
