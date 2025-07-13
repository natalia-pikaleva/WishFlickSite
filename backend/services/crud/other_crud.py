from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import Optional
import logging

from models import (User, Wish, Comment, Activity, ActivityType, Like,
                    ActivityLike, EmailVerification, friend_association)
from schemas.user_schemas import PrivacyEnum

logger = logging.getLogger(__name__)


async def create_comment(db: AsyncSession, user_id: int, wish_id: int, content: str):
    comment = Comment(user_id=user_id, wish_id=wish_id, content=content)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


async def get_comments_by_wish(db: AsyncSession, wish_id: int):
    result = await db.execute(
        select(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.wish_id == wish_id)
        .order_by(Comment.created_at.desc())
    )
    return result.scalars().all()


async def create_like(db: AsyncSession, user_id: int, wish_id: int):
    # Проверка, есть ли уже лайк
    existing = await db.execute(select(Like)
                                .filter(Like.user_id == user_id, Like.wish_id == wish_id))
    if existing.scalars().first():
        raise Exception("User already liked this wish")
    like = Like(user_id=user_id, wish_id=wish_id)
    db.add(like)
    await db.commit()
    await db.refresh(like)
    return like


async def get_likes_count(db: AsyncSession, wish_id: int):
    result = await db.execute(select(func.count(Like.id))
                              .filter(Like.wish_id == wish_id))
    return result.scalar_one()


async def create_activity(db: AsyncSession, user_id: int,
                          type: ActivityType, target_type: Optional[str] = None,
                          target_id: Optional[int] = None):
    activity = Activity(user_id=user_id, type=type, target_type=target_type, target_id=target_id)
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity


async def get_activities(db: AsyncSession, limit: int = 20):
    result = await db.execute(
        select(Activity)
        .join(User, Activity.user_id == User.id)
        .filter(User.privacy != PrivacyEnum.private)
        .options(
            joinedload(Activity.user),
            joinedload(Activity.wish)  # теперь работает благодаря связи
        )
        .order_by(Activity.created_at.desc())
        .limit(limit)
    )
    activities = result.scalars().all()
    return activities


async def like_activity(
        db: AsyncSession,
        activity_id: int,
        user_id: int
):
    # Проверяем существование активности
    result = await db.execute(select(Activity).filter(Activity.id == activity_id))
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Проверяем, не лайкал ли пользователь уже
    result = await db.execute(
        select(ActivityLike).filter(
            ActivityLike.user_id == user_id,
            ActivityLike.activity_id == activity_id
        )
    )
    existing_like = result.scalar_one_or_none()
    if existing_like:
        raise HTTPException(status_code=400, detail="You have already liked this activity")

    # Создаём лайк
    new_like = ActivityLike(user_id=user_id, activity_id=activity_id)
    db.add(new_like)

    # Обновляем счетчик лайков у активности
    if hasattr(activity, "likes_count"):
        activity.likes_count = (activity.likes_count or 0) + 1

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Failed to like activity")

    return new_like


