from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import case
from typing import Optional
import logging

import shutil
import os
import uuid
from models import (User, Wish, Comment, Activity, ActivityType, Like,
                    ActivityLike, EmailVerification, friend_association)
from schemas.user_schemas import UserOutWithFriend
from services.auth import get_password_hash

logger = logging.getLogger(__name__)


async def get_user_by_email(db: AsyncSession, email: str):
    logger.info("start get_user_by_email")

    result = await db.execute(
        select(User)
        .options(selectinload(User.wishes))  # загружаем wishes заранее
        .filter(User.email == email)
    )

    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(
        select(User).options(selectinload(User.friends)).where(User.id == user_id)
    )
    return result.scalars().first()

async def create_user(db: AsyncSession, user_create):
    logger.info("start create_user")
    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        hashed_password=hashed_password,
        name=user_create.name,
        avatar_url=user_create.avatar_url,
        description=user_create.description,
        privacy=user_create.privacy,
        social_facebook=str(user_create.social_facebook) if user_create.social_facebook else None,
        social_twitter=str(user_create.social_twitter) if user_create.social_twitter else None,
        social_instagram=str(user_create.social_instagram) if user_create.social_instagram else None,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user


async def update_user_profile(
        db: AsyncSession,
        user: User,
        *,
        UPLOAD_DIR: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        description: Optional[str] = None,
        privacy: Optional[str] = None,
        social_facebook: Optional[str] = None,
        social_twitter: Optional[str] = None,
        social_instagram: Optional[str] = None,
        is_influencer: Optional[bool] = None,
        avatar_file=None,
) -> User:
    avatar_url = user.avatar_url
    if avatar_file:
        ext = avatar_file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar_file.file, buffer)
        avatar_url = f"/uploads/avatars/{filename}"

    if name is not None:
        user.name = name
    if email is not None:
        user.email = email
    if description is not None:
        user.description = description
    if privacy is not None:
        user.privacy = privacy
    if social_facebook is not None:
        user.social_facebook = social_facebook
    if social_twitter is not None:
        user.social_twitter = social_twitter
    if social_instagram is not None:
        user.social_instagram = social_instagram
    if is_influencer is not None:
        user.is_influencer = is_influencer
    user.avatar_url = avatar_url

    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except Exception:
        await db.rollback()
        raise
    return user


async def get_users_list_with_is_friend(
        db: AsyncSession,
        current_user: User
):
    # Подзапрос для друзей текущего пользователя
    friends_subq = (
        select(friend_association.c.friend_id)
        .filter(friend_association.c.user_id == current_user.id)
    ).subquery()

    stmt = (
        select(
            User.id,
            User.email,
            User.name,
            User.avatar_url,
            case(
                (User.id.in_(select(friends_subq.c.friend_id)), True),
                else_=False
            ).label("isFriend")
        )
        .filter(User.id != current_user.id)
        .order_by(User.name)
    )

    result = await db.execute(stmt)
    users = result.mappings().all()

    return users
