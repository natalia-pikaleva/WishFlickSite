from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from database import get_db
import models
import services.auth as auth
from services.crud.like_crud import (
    create_like,
    get_like,
    get_likes_by_wish,
    get_likes_by_user,
    delete_like,
)
from schemas.likes_schemas import LikeRequest

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def like_wish(
    like_data: LikeRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Поставить лайк желанию (авторизованный пользователь).
    """
    wish_id = like_data.wish_id

    if current_user.is_guest:
        raise HTTPException(status_code=403, detail="Гостям запрещено ставить лайки")
    # Проверим, не поставлен ли уже лайк этим пользователем
    like = await get_like(db, current_user.id, wish_id)
    if like:
        raise HTTPException(status_code=400, detail="Лайк уже поставлен")
    like = await create_like(db, current_user.id, wish_id)
    if not like:
        raise HTTPException(status_code=500, detail="Не удалось поставить лайк")
    return {"message": "Лайк добавлен"}

@router.delete("/{wish_id}", status_code=204)
async def unlike_wish(
    wish_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Удалить лайк (авторизованный пользователь).
    """
    if current_user.is_guest:
        raise HTTPException(status_code=403, detail="Гостям запрещено удалять лайки")
    result = await delete_like(db, current_user.id, wish_id)
    if not result:
        raise HTTPException(status_code=404, detail="Лайк не найден")
    return None

@router.get("/wish/{wish_id}", response_model=List[int])
async def get_wish_likes(
    wish_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Получить список user_id, кто лайкнул wish_id.
    """
    likes = await get_likes_by_wish(db, wish_id)
    return [like.user_id for like in likes]

@router.get("/user/{user_id}", response_model=List[int])
async def get_user_likes(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Получить список wish_id, которые лайкнул пользователь user_id.
    """
    likes = await get_likes_by_user(db, user_id)
    return [like.wish_id for like in likes]
