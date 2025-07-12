from fastapi import (APIRouter, Depends, Request, status)
from fastapi.exceptions import HTTPException
from sqlalchemy import select, func, and_, case, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from typing import List

import logging

from database import Base, engine, get_db
from models import Post, User, friend_association, Wish
import schemas as schemas

import services.crud as crud
from services.auth import get_current_user, verify_password

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=schemas.User)
async def read_users_me(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        user = await crud.get_user_by_email(db, current_user.email)

        # Формируем абсолютный URL для аватара, если он есть и начинается с '/'
        if user.avatar_url and user.avatar_url.startswith('/'):
            base_url = str(request.base_url).rstrip('/')
            user.avatar_url = f"{base_url}{user.avatar_url}"

        return user
    except Exception as e:
        logging.error("Failed to get user info: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get user info")


@router.get("/{user_id}/posts", response_model=List[schemas.PostOut])
def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.owner_id == user_id).order_by(Post.created_at.desc()).all()
    return posts


@router.get("/{user_id}/wishes", response_model=List[schemas.Wish])
async def get_user_wishes_by_id(
        user_id: int,
        db: AsyncSession = Depends(get_db),
):
    try:
        wishes = await crud.get_wishes_by_owner(db, owner_id=user_id)
        return wishes
    except Exception as e:
        logging.error(f"Failed to get wishes for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user wishes")


@router.get("/{user_id}/friends", response_model=List[schemas.UserOut])
async def get_user_friends(
        user_id: int,
        db: AsyncSession = Depends(get_db),
):
    friends = await crud.get_friends_by_user_id(db, user_id)
    if friends is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return friends


@router.get("/{user_id}", response_model=schemas.UserOut)
async def get_user_by_id(
        user_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Подсчёт wishlistsCount
        wishlists_count_stmt = select(func.count(Wish.id)).filter(Wish.owner_id == user_id)
        result = await db.execute(wishlists_count_stmt)
        wishlists_count = result.scalar() or 0

        # Подсчёт mutualFriends через crud
        mutual_friends_count = await crud.count_mutual_friends(db, current_user.id, user_id)

        return schemas.UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            mutualFriends=mutual_friends_count,
            wishlistsCount=wishlists_count,
        )
    except Exception as e:
        logging.error(f"Failed to get user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user")


@router.get("/", response_model=list[schemas.UserOutWithFriend])
async def get_users_list(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        # Подзапрос для подсчёта wishlistsCount
        wishlists_subq = (
            select(Wish.owner_id, func.count(Wish.id).label("wishlists_count"))
            .group_by(Wish.owner_id)
            .subquery()
        )

        # Подзапрос для друзей текущего пользователя
        friends_subq = (
            select(friend_association.c.friend_id)
            .filter(friend_association.c.user_id == current_user.id)
            .subquery()
        )

        # Основной запрос: выбираем пользователей с wishlistsCount и isFriend
        stmt = (
            select(
                User.id,
                User.email,
                User.name,
                User.avatar_url,
                func.coalesce(wishlists_subq.c.wishlists_count, 0).label("wishlistsCount"),
                literal_column("0").label("mutualFriends"),  # можно добавить логику позже
                case(
                    (User.id.in_(select(friends_subq.c.friend_id)), True),
                    else_=False
                ).label("isFriend")
            )
            .outerjoin(wishlists_subq, User.id == wishlists_subq.c.owner_id)
            .filter(User.id != current_user.id)  # исключаем текущего пользователя
            .order_by(User.name)
        )

        result = await db.execute(stmt)
        rows = result.all()

        users_list = [
            schemas.UserOutWithFriend(
                id=row.id,
                email=row.email,
                name=row.name,
                avatar_url=row.avatar_url,
                wishlistsCount=row.wishlistsCount,
                mutualFriends=row.mutualFriends,
                isFriend=row.isFriend,
            )
            for row in rows
        ]

        return users_list

    except Exception as e:
        logging.error(f"Failed to get users list: {e}")
        raise HTTPException(status_code=500, detail="Failed to get users list")
