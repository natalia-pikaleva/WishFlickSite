from fastapi import (APIRouter, Depends, Request, status)
from fastapi.exceptions import HTTPException
from sqlalchemy import select, func, and_, case, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, selectinload

from typing import List

import logging

from database import Base, engine, get_db
from models import Post, User, friend_association, Wish
from schemas.user_schemas import UserOut, UserResponse, UserOutWithFriend
from schemas.wish_schemas import WishOut
from schemas.other_schemas import PostOut
from schemas.community_schemas import Community
import services.crud.user_crud as user_crud
import services.crud.wish_crud as wish_crud
import services.crud.friend_crud as friend_crud
import services.crud.community_crud as community_crud
from services.auth import get_current_user, verify_password
from backend_conf import API_URL

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def read_users_me(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        user = await user_crud.get_user_by_email(db, current_user.email)

        # Формируем абсолютный URL для аватара, если он есть и начинается с '/'
        if user.avatar_url and user.avatar_url.startswith('/'):
            base_url = str(request.base_url).rstrip('/')
            user.avatar_url = f"{base_url}{user.avatar_url}"

        return user
    except Exception as e:
        logging.error("Failed to get user info: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get user info")


@router.get("/{user_id}/posts", response_model=List[PostOut])
def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.owner_id == user_id).order_by(Post.created_at.desc()).all()
    return posts


@router.get("/{user_id}/wishes", response_model=List[WishOut])
async def get_user_wishes_by_id(
        user_id: int,
        db: AsyncSession = Depends(get_db),
):
    try:
        wishes = await wish_crud.get_wishes_by_owner(db, owner_id=user_id)
        return wishes
    except Exception as e:
        logging.error(f"Failed to get wishes for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user wishes")


@router.get("/{user_id}/friends", response_model=List[UserOut])
async def get_user_friends(
        user_id: int,
        db: AsyncSession = Depends(get_db),
):
    friends = await friend_crud.get_friends_by_user_id(db, user_id)
    if friends is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return friends


@router.get("/{user_id}/communities", response_model=List[Community])
async def get_user_communities(
        user_id: int,
        db: AsyncSession = Depends(get_db),
):
    try:
        communities = await community_crud.get_communities_by_user_id(db, user_id)
        if communities is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
        response = []
        for community in communities:
            community_response = Community(
                id=community.id,
                name=community.name,
                description=community.description,
                category=community.category,
                rules=community.rules,
                created_at=community.created_at,
                members_count=len(community.memberships),
                wishes_count=len(community.wishes)
            )
            if community.image_url and not community.image_url.startswith('http'):
                community_response.image_url = f'{API_URL}{community.image_url}'
            else:
                community_response.image_url = community.image_url
            response.append(community_response)
        return response
    except Exception as e:
        logging.error(f"Failed to get communities by user id: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user communities")


@router.get("/{user_id}", response_model=UserOutWithFriend)
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
        mutual_friends_count = await friend_crud.count_mutual_friends(db, current_user.id, user_id)

        is_friend = (user in current_user.friends)

        return UserOutWithFriend(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            mutualFriends=mutual_friends_count,
            wishlistsCount=wishlists_count,
            isFriend=is_friend
        )
    except Exception as e:
        logging.error(f"Failed to get user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user {e}")


@router.get("/", response_model=list[UserOutWithFriend])
async def get_users_list(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    try:
        rows = await user_crud.get_users_list_with_is_friend(db, current_user)
        users_list = [
            UserOutWithFriend(
                id=row["id"],
                email=row["email"],
                name=row["name"],
                avatar_url=row["avatar_url"],
                isFriend=row["isFriend"],
                mutualFriends=0,  # Заглушка, т.к. не считаем
                wishlistsCount=0  # Заглушка, т.к. не считаем
            )
            for row in rows
        ]
        return users_list

    except Exception as e:
        logging.error(f"Failed to get users list: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get users list {e}")
