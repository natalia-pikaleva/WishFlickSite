from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from models import Like
import logging

logger = logging.getLogger(__name__)

async def create_like(db: AsyncSession, user_id: int, wish_id: int) -> Like:
    like = Like(user_id=user_id, wish_id=wish_id)
    db.add(like)
    try:
        await db.commit()
        await db.refresh(like)
        return like
    except IntegrityError:
        await db.rollback()
        logger.warning("Like already exists for user_id=%s, wish_id=%s", user_id, wish_id)
        return None  # или выбросьте исключение, если нужно

async def get_like(db: AsyncSession, user_id: int, wish_id: int):
    result = await db.execute(
        select(Like).where(and_(Like.user_id == user_id, Like.wish_id == wish_id))
    )
    return result.scalars().first()

async def get_likes_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(Like).filter(Like.user_id == user_id))
    return result.scalars().all()

async def get_likes_by_wish(db: AsyncSession, wish_id: int):
    result = await db.execute(select(Like).filter(Like.wish_id == wish_id))
    return result.scalars().all()

async def delete_like(db: AsyncSession, user_id: int, wish_id: int):
    like = await get_like(db, user_id, wish_id)
    if like:
        await db.delete(like)
        await db.commit()
        return True
    return False
