from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime, timedelta, timezone

import shutil
import os
import uuid
from models import User, Wish, Comment, Activity, ActivityType, Like, ActivityLike
from auth import get_password_hash
import schemas as schemas


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(
        select(User)
        .options(selectinload(User.wishes))  # загружаем wishes заранее
        .filter(User.email == email)
    )

    return result.scalars().first()


async def create_user(db: AsyncSession, user_create):
    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        hashed_password=hashed_password,
        name=user_create.name,
        avatar_url=user_create.avatar_url,
        description=user_create.description,
        privacy=user_create.privacy,
        social_facebook=user_create.social_facebook,
        social_twitter=user_create.social_twitter,
        social_instagram=user_create.social_instagram,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def create_wish(db: AsyncSession, wish_create: schemas.WishCreate, owner: User):
    is_influencer_public = False
    if owner.is_influencer and wish_create.is_public:
        is_influencer_public = True

    db_wish = Wish(
        title=wish_create.title,
        description=wish_create.description,
        image_url=str(wish_create.image_url) if wish_create.image_url else None,
        goal=wish_create.goal,
        owner_id=owner.id,
        is_public=wish_create.is_public,
        is_influencer_public=is_influencer_public,
    )
    db.add(db_wish)
    await db.commit()
    await db.refresh(db_wish)
    return db_wish


async def get_wishes_by_owner(db: AsyncSession, owner_id: int):
    result = await db.execute(
        select(Wish)
        .filter(Wish.owner_id == owner_id)
        .options(selectinload(Wish.owner))  # если нужно
    )
    return result.scalars().all()


async def get_wish_by_id(db: AsyncSession, wish_id: int):
    result = await db.execute(select(Wish).filter(Wish.id == wish_id))
    return result.scalars().first()


async def delete_wish(db: AsyncSession, wish: Wish):
    await db.delete(wish)
    await db.commit()


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
        .filter(User.privacy != schemas.PrivacyEnum.private)
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


async def get_influencer_wishes(db: AsyncSession, public=True, influencer=True):
    query = (
        select(Wish)
        .options(selectinload(Wish.owner), selectinload(Wish.supporters))
        .where(Wish.is_public == public, Wish.is_influencer_public == influencer)
    )
    result = await db.execute(query)
    wishes = result.scalars().all()

    enriched_wishes = []
    for wish in wishes:
        supporters_count = len(wish.supporters) if wish.supporters else 0

        enriched_wishes.append({
            **wish.__dict__,
            "supporters": supporters_count,
            "time_left": wish.time_left,
        })

    return enriched_wishes


async def update_wish(db: AsyncSession, db_wish: Wish, wish_update: schemas.WishUpdate):
    update_data = wish_update.dict(exclude_unset=True)

    # Если есть поле image_url и оно типа HttpUrl, преобразуем в строку
    if 'image_url' in update_data and update_data['image_url'] is not None:
        update_data['image_url'] = str(update_data['image_url'])

    for key, value in update_data.items():
        setattr(db_wish, key, value)

    db.add(db_wish)
    await db.commit()
    await db.refresh(db_wish)
    return db_wish
