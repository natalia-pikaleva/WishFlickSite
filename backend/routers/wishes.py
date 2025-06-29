from dotenv import load_dotenv
from fastapi import (Depends, UploadFile, File,
                     Form, HTTPException, status, APIRouter)

from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

import os
import shutil
import uuid
import logging

from database import get_db
import models as models
import schemas as schemas
import crud as crud
import auth as auth
from backend_conf import API_URL

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "/var/www/wishflick/uploads/"
UPLOAD_DIR_AVATARS = os.path.join(UPLOAD_DIR, "avatars")
UPLOAD_DIR_WISHES = os.path.join(UPLOAD_DIR, "wishes")

os.makedirs(UPLOAD_DIR_AVATARS, exist_ok=True)
os.makedirs(UPLOAD_DIR_WISHES, exist_ok=True)


@router.post("/",
             response_model=schemas.Wish,
             status_code=status.HTTP_201_CREATED,
             )
async def create_wish_endpoint(
        title: str = Form(...),
        description: Optional[str] = Form(None),
        image_url: Optional[str] = Form(None),
        image_file: Optional[UploadFile] = File(None),
        goal: float = Form(...),
        is_public: bool = Form(...),
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        # Если загружен файл, сохраняем и получаем URL
        final_image_url = image_url
        if image_file:
            # Генерируем уникальное имя файла
            filename = f"{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
            file_path = os.path.join(UPLOAD_DIR_WISHES, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image_file.file, buffer)

            # Формируем URL для доступа к файлу
            relative_path = f"/uploads/wishes/{filename}"
            final_image_url = f"{API_URL}{relative_path}"

        wish_create = schemas.WishCreate(
            title=title,
            description=description,
            image_url=final_image_url,
            goal=goal,
            is_public=is_public,
        )

        wish = await crud.create_wish(db, wish_create, owner=current_user)
        return wish
    except Exception as e:
        logging.error("Failed to create wish: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to create wish: {e}")


@router.get("/",
            response_model=List[schemas.Wish],
            )
async def get_user_wishes(
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        wishes = await crud.get_wishes_by_owner(db, owner_id=current_user.id)
        return wishes
    except Exception as e:
        logging.error("Failed to get user wishes: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get user wishes")


@router.delete("/{wish_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               )
async def delete_wish(
        wish_id: int,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        wish = await crud.get_wish_by_id(db, wish_id)
        if not wish:
            raise HTTPException(status_code=404, detail="Wish not found")
        if wish.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this wish")

        await crud.delete_wish(db, wish)
        return None
    except Exception as e:
        logging.error("Failed to delete wish: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete wish")


@router.get("/{wish_id}/comments",
            response_model=List[schemas.CommentResponse],
            )
async def get_comments(wish_id: int, db: AsyncSession = Depends(get_db)):
    try:
        comments = await crud.get_comments_by_wish(db, wish_id)
        return comments
    except Exception as e:
        logging.error("Failed to get comments: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get comments")


@router.get("/{wish_id}/likes/count",
            )
async def get_likes_count_endpoint(wish_id: int, db: AsyncSession = Depends(get_db)):
    try:
        count = await crud.get_likes_count(db, wish_id)
        return {"count": count}
    except Exception as e:
        logging.error("Failed to get count likes: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get count likes")


@router.get("/influencer",
            response_model=List[schemas.WishWithOwner],
            )
async def get_public_influencer_wishes(
        db: AsyncSession = Depends(get_db),
):
    try:
        wishes = await crud.get_influencer_wishes(db,
                                                  public=True,
                                                  influencer=True
                                                  )
        return wishes
    except Exception as e:
        logging.error("Failed to get influencers wishes: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get influencers wishes")


@router.get("/{wish_id}",
            response_model=schemas.Wish,
            )
async def get_wish(wish_id: int, db: AsyncSession = Depends(get_db)):
    try:
        wish = await crud.get_wish_by_id(db, wish_id)
        if not wish:
            raise HTTPException(status_code=404, detail="Wish not found")
        return wish
    except Exception as e:
        logging.error("Failed to get wish by id: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get wish by id")


@router.patch("/{wish_id}",
              response_model=schemas.Wish,
              )
async def update_wish(
        wish_id: int,
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        image_url: Optional[str] = Form(None),
        goal: Optional[float] = Form(None),
        is_public: Optional[bool] = Form(None),
        image_file: Optional[UploadFile] = File(None),
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db),
):
    try:
        wish = await crud.get_wish_by_id(db, wish_id)
        if not wish:
            raise HTTPException(status_code=404, detail="Wish not found")
        if wish.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this wish")

        # Обработка файла, если он есть
        final_image_url = image_url
        if image_file:
            # Сохраняем файл, формируем URL
            filename = f"{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
            file_path = os.path.join(UPLOAD_DIR_WISHES, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image_file.file, buffer)

            # Формируем URL для доступа к файлу
            relative_path = f"/uploads/wishes/{filename}"
            final_image_url = f"{API_URL}{relative_path}"

        # Формируем данные для обновления
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if description is not None:
            update_data['description'] = description
        if goal is not None:
            update_data['goal'] = goal
        if is_public is not None:
            update_data['is_public'] = is_public
        if final_image_url is not None:
            update_data['image_url'] = final_image_url

        wish_update_obj = schemas.WishUpdate(**update_data)
        updated_wish = await crud.update_wish(db, wish, wish_update_obj)
        return updated_wish
    except Exception as e:
        logging.error("Failed to update wish: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to update wish: {str(e)}")
