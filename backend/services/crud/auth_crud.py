from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
import logging
import secrets
import uuid

from models import (User, Wish, Comment, Activity, ActivityType, Like,
                    ActivityLike, EmailVerification, friend_association)
from services.auth import get_password_hash

logger = logging.getLogger(__name__)


async def create_email_verification(db: AsyncSession, user_id: int, code: str):
    logger.info("start create_email_verification")

    verification = EmailVerification(user_id=user_id, code=code)
    db.add(verification)
    await db.commit()
    await db.refresh(verification)
    return verification


async def get_email_verification(db, user_id: int, code: str):
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user_id,
            EmailVerification.code == code
        )
    )
    return result.scalars().first()


async def mark_user_email_verified(db, user_id: int):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalars().first()
    if user:
        user.is_verified = True
        await db.commit()
        await db.refresh(user)
    return user


async def delete_email_verification(db, verification_id: int):
    result = await db.execute(
        select(EmailVerification).where(EmailVerification.id == verification_id)
    )
    verification = result.scalars().first()
    if verification:
        await db.delete(verification)
        await db.commit()


async def get_user_by_vk_id(db: AsyncSession, vk_id: int) -> User | None:
    result = await db.execute(select(User).filter(User.vk_id == vk_id))
    return result.scalars().first()


async def create_user_from_vk(
        db: AsyncSession,
        email: str,
        vk_id: int,
        name: Optional[str] = None,
        avatar_url: Optional[str] = None
) -> User:
    # Для пользователей ВК пароль не обязателен, но в вашей модели hashed_password не nullable,
    # поэтому можно сгенерировать случайный пароль или заглушку
    fake_password = secrets.token_urlsafe(16)

    user = User(
        email=email,
        vk_id=vk_id,
        name=name,
        avatar_url=avatar_url,
        hashed_password=get_password_hash(fake_password),
        is_verified=True,
        is_guest=False
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def link_vk_to_user(db: AsyncSession, user_id: int, vk_id: int) -> User:
    user = await db.get(User, user_id)
    if user:
        user.vk_id = vk_id
        await db.commit()
        await db.refresh(user)
    return user


async def create_guest_user(db: AsyncSession):
    # Создаем уникальный email для гостя, например, с префиксом guest и uuid
    guest_email = f"guest_{uuid.uuid4()}@example.com"
    guest_user = User(
        email=guest_email,
        hashed_password=get_password_hash(uuid.uuid4().hex),
        name="Гость",
        is_guest=True,
        is_verified=True
    )
    db.add(guest_user)
    await db.commit()
    await db.refresh(guest_user)
    # Возвращайте нужные данные, например, токен или id
    return guest_user
