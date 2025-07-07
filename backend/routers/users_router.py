from fastapi import (APIRouter, Depends, status)
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from typing import List

import logging

from database import Base, engine, get_db
from models import Post, User
import schemas as schemas

import services.crud as crud
from services.auth import get_current_user, verify_password

logger = logging.getLogger(__name__)

router = APIRouter()


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


@router.get("/{user_id}", response_model=schemas.UserOut)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    try:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        logging.error(f"Failed to get user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user")
