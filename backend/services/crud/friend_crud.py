from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_, and_
from typing import List
import logging

from models import (User, Wish, Comment, Activity, ActivityType, Like,
                    ActivityLike, EmailVerification, friend_association)
from schemas.user_schemas import UserOut

logger = logging.getLogger(__name__)


async def add_friend(db: AsyncSession, user: User, friend: User):
    if friend not in user.friends:
        user.friends.append(friend)
        await db.commit()

    if user not in friend.friends:
        friend.friends.append(user)
        await db.commit()
    await db.refresh(user)
    return user


async def remove_friend(db: AsyncSession, user: User, friend: User):
    # Удаляем запись где user -> friend
    if friend in user.friends:
        user.friends.remove(friend)
    # Удаляем запись где friend -> user
    if user in friend.friends:
        friend.friends.remove(user)
    await db.commit()
    await db.refresh(user)
    await db.refresh(friend)
    return user


async def get_friends(db: AsyncSession, user: User) -> List[UserOut]:
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
            UserOut(
                id=friend.id,
                email=friend.email,
                name=friend.name,
                avatar_url=friend.avatar_url,
                mutualFriends=mutual_friends_count,
                wishlistsCount=wishlists_count,
            )
        )

    return friends_out


async def get_friends_by_user_id(db: AsyncSession, user_id: int) -> List[UserOut]:
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
            UserOut(
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


async def check_if_friends(db: AsyncSession, user_id: int, friend_id: int) -> bool:
    """
    Проверяет, являются ли user_id и friend_id друзьями (в любую сторону).
    """
    stmt = select(friend_association).where(
        or_(
            and_(
                friend_association.c.user_id == user_id,
                friend_association.c.friend_id == friend_id
            ),
            and_(
                friend_association.c.user_id == friend_id,
                friend_association.c.friend_id == user_id
            )
        )
    )
    result = await db.execute(stmt)
    return result.first() is not None
