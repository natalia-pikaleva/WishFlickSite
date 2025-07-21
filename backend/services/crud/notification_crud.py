from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from models import Notification
from typing import List, Optional

# Создать уведомление
async def create_notification(
    db: AsyncSession,
    recipient_id: int,
    type: str,
    message: str,
    sender_id: Optional[int] = None,
    community_id: Optional[int] = None,

) -> Notification:
    new_notification = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        community_id=community_id,
        type=type,
        message=message,
        is_read=False,
    )
    db.add(new_notification)
    await db.commit()
    await db.refresh(new_notification)
    return new_notification

# Получить одно уведомление по id
async def get_notification(
    db: AsyncSession,
    notification_id: int,
) -> Optional[Notification]:
    result = await db.execute(
        select(Notification).filter(Notification.id == notification_id)
    )
    return result.scalars().first()

# Получить список уведомлений для пользователя (с опциональным фильтром по статусу прочтения)
async def get_notifications_for_user(
    db: AsyncSession,
    user_id: int,
    read_filter: Optional[bool] = None,
    limit: int = 25,
) -> List[Notification]:
    query = (
        select(Notification)
        .options(selectinload(Notification.sender))  # Подгружаем отправителя
        .filter(Notification.recipient_id == user_id)
    )
    if read_filter is not None:
        query = query.filter(Notification.is_read == read_filter)
    query = query.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

# Пометить уведомление как прочитанное
async def mark_notification_as_read(
    db: AsyncSession,
    notification_id: int,
) -> bool:
    result = await db.execute(
        update(Notification)
        .where(Notification.id == notification_id)
        .values(is_read=True)
        .execution_options(synchronize_session="fetch")
    )
    await db.commit()
    return result.rowcount > 0
