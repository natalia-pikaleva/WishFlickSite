from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
import logging
import secrets

import shutil
import os
import uuid
from models import (User, Wish, Comment, Activity, ActivityType, Like,
                    ActivityLike, EmailVerification, friend_association)
import schemas as schemas
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
        is_verified=True  # считаем email подтверждённым через ВК
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


async def add_friend(db: AsyncSession, user: User, friend: User):
    if friend not in user.friends:
        user.friends.append(friend)
        await db.commit()
        await db.refresh(user)
    return user


async def remove_friend(db: AsyncSession, user: User, friend: User):
    if friend in user.friends:
        user.friends.remove(friend)
        await db.commit()
        await db.refresh(user)
    return user


async def get_friends(db: AsyncSession, user: User) -> List[schemas.UserOut]:
    # Обновляем объект пользователя, чтобы получить актуальный список друзей
    await db.refresh(user)

    user_friends = user.friends
    user_friends_ids = {friend.id for friend in user_friends}

    friends_out = []

    for friend in user_friends:
        # Количество желаний друга
        wishlists_count = (await db.execute(
            select(func.count(Wish.id)).where(Wish.owner_id == friend.id)
        )).scalar() or 0

        # Количество общих друзей
        friend_obj = (await db.execute(
            select(User).options(selectinload(User.friends)).where(User.id == friend.id)
        )).scalars().first()
        friend_friends_ids = {f.id for f in friend_obj.friends} if friend_obj else set()

        mutual_friends_count = len(user_friends_ids.intersection(friend_friends_ids))

        friends_out.append(
            schemas.UserOut(
                id=friend.id,
                email=friend.email,
                name=friend.name,
                avatar_url=friend.avatar_url,
                mutualFriends=mutual_friends_count,
                wishlistsCount=wishlists_count,
            )
        )

    return friends_out


async def get_friends_by_user_id(db: AsyncSession, user_id: int) -> List[schemas.UserOut]:
    user = (await db.execute(
        select(User).options(selectinload(User.friends)).where(User.id == user_id)
    )).scalars().first()

    if not user:
        return None

    user_friends = user.friends
    user_friends_ids = {f.id for f in user_friends}

    friends_out = []
    for friend in user_friends:
        # Количество желаний друга
        wishlists_count = (await db.execute(
            select(func.count(Wish.id)).where(Wish.owner_id == friend.id)
        )).scalar() or 0

        # Количество общих друзей
        friend_obj = (await db.execute(
            select(User).options(selectinload(User.friends)).where(User.id == friend.id)
        )).scalars().first()
        friend_friends_ids = {f.id for f in friend_obj.friends} if friend_obj else set()

        mutual_friends_count = len(user_friends_ids.intersection(friend_friends_ids))

        friends_out.append(
            schemas.UserOut(
                id=friend.id,
                email=friend.email,
                name=friend.name,
                avatar_url=friend.avatar_url,
                mutualFriends=mutual_friends_count,
                wishlistsCount=wishlists_count,
            )
        )

    return friends_out

async def count_mutual_friends(db: AsyncSession, user_id_1: int, user_id_2: int) -> int:
    # Получаем друзей первого пользователя
    stmt1 = select(friend_association.c.friend_id).filter(friend_association.c.user_id == user_id_1)
    result1 = await db.execute(stmt1)
    friends_1 = set(row[0] for row in result1.fetchall())

    # Получаем друзей второго пользователя
    stmt2 = select(friend_association.c.friend_id).filter(friend_association.c.user_id == user_id_2)
    result2 = await db.execute(stmt2)
    friends_2 = set(row[0] for row in result2.fetchall())

    # Возвращаем размер пересечения множеств
    return len(friends_1.intersection(friends_2))
