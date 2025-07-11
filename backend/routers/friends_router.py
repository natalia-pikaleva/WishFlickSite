from fastapi import (APIRouter, Depends, status)
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from typing import List

from database import Base, engine, get_db
import models as models
import schemas as schemas

import services.crud as crud
from services.auth import get_current_user, verify_password

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{friend_id}", status_code=status.HTTP_201_CREATED)
async def add_friend_endpoint(
        friend_id: int,
        current_user: models.User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    friend = await crud.get_user_by_id(db, friend_id)
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    if friend.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")

    await crud.add_friend(db, current_user, friend)
    return {"detail": "Friend added"}


@router.delete("/{friend_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_friend_endpoint(
        friend_id: int,
        current_user: models.User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    friend = await crud.get_user_by_id(db, friend_id)
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")

    await crud.remove_friend(db, current_user, friend)
    return None


@router.get("/", response_model=List[schemas.UserOut])
async def get_friends_list(
        current_user: models.User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    friends = await crud.get_friends(db, current_user)
    if friends is None:
        # Вряд ли случится, но можно обработать
        raise HTTPException(status_code=404, detail="Друзья не найдены")
    return friends
