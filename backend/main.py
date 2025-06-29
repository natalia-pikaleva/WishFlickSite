from fastapi import (FastAPI, Request, Depends, UploadFile, File,
                     Form, status)
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, func

import random
import os
import logging

from database import Base, engine, get_db
import models as models
import schemas as schemas
import crud as crud
import auth as auth
from routers.wishes import router as router_wishes
from routers.auth import router as router_auth


logger = logging.getLogger(__name__)

app = FastAPI(title="WishFlick API")
app.include_router(router_wishes, prefix="/api/wishes", tags=["wishes"])
app.include_router(router_auth, prefix="/api/auth", tags=["wishes"])

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://80.78.243.30",
    "http://80.78.243.30:5173",
    "http://wishflick.ru",
    "https://wishflick.ru",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # разрешить все методы
    allow_headers=["*"],
)

UPLOAD_ROOT = "/var/www/wishflick/uploads"
UPLOAD_DIR_AVATARS = os.path.join(UPLOAD_ROOT, "avatars")
UPLOAD_DIR_WISHES = os.path.join(UPLOAD_ROOT, "wishes")

os.makedirs(UPLOAD_DIR_AVATARS, exist_ok=True)
os.makedirs(UPLOAD_DIR_WISHES, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")


# Создание таблиц (запускайте один раз)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/api/")
async def api_root():
    return {"message": "API is working"}


def generate_verification_code():
    return f"{random.randint(100000, 999999)}"


@app.get("/api/users/me", response_model=schemas.User)
async def read_users_me(
        request: Request,
        current_user: models.User = Depends(auth.get_current_user),
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


@app.put("/api/profile", response_model=schemas.UserProfileResponse)
async def update_profile(
        request: Request,
        name: Optional[str] = Form(None),
        email: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        privacy: Optional[str] = Form("public"),
        social_facebook: Optional[str] = Form(None),
        social_twitter: Optional[str] = Form(None),
        social_instagram: Optional[str] = Form(None),
        is_influencer: Optional[bool] = Form(False),
        avatar: UploadFile = File(None),
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db),
):
    try:
        user = await crud.update_user_profile(
            db,
            current_user,
            UPLOAD_DIR=UPLOAD_DIR_AVATARS,
            name=name,
            email=email,
            description=description,
            privacy=privacy,
            social_facebook=social_facebook,
            social_twitter=social_twitter,
            social_instagram=social_instagram,
            is_influencer=is_influencer,
            avatar_file=avatar,
        )

        # Формируем полный URL для фронтенда
        if user.avatar_url and user.avatar_url.startswith('/'):
            base_url = str(request.base_url).rstrip('/')
            user.avatar_url = f"{base_url}{user.avatar_url}"

        return user
    except Exception as e:
        logging.error("Failed to update profile user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update profile user")


@app.post("/api/comments", response_model=schemas.CommentResponse)
async def post_comment(
        comment_create: schemas.CommentCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        comment = await crud.create_comment(db, current_user.id, comment_create.wish_id, comment_create.content)
        await crud.create_activity(db, current_user.id, models.ActivityType.comment, target_type="wish",
                                   target_id=comment_create.wish_id)
        return comment
    except Exception as e:
        logging.error("Failed to create comment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create comment")


@app.post("/api/likes", response_model=schemas.LikeResponse)
async def post_like(
        like_create: schemas.LikeCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        like = await crud.create_like(db, current_user.id, like_create.wish_id)
        await crud.create_activity(db, current_user.id, models.ActivityType.like, target_type="wish",
                                   target_id=like_create.wish_id)
        return like
    except Exception as e:
        logging.error("Failed to create like: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create like")


@app.get("/api/activities", response_model=List[schemas.ActivityResponse])
async def get_activities_feed(db: AsyncSession = Depends(get_db)):
    try:
        activities = await crud.get_activities(db)
        return activities
    except Exception as e:
        logging.error("Failed to get activities: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get activities")


@app.post("/api/activities/{activity_id}/like",
          status_code=status.HTTP_201_CREATED)
async def like_activity_endpoint(
        activity_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_user),
):
    try:
        # Вызываем функцию из crud
        await crud.like_activity(db, activity_id, current_user.id)
        return {"message": "Activity liked successfully"}

    except HTTPException as e:
        # Пробрасываем HTTPException, которые возникли в crud
        logging.error("Failed to create like for activity: %s", e)

        raise e
    except Exception as e:
        logging.error("Failed to create like for activity: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create like for activity")


@app.get("/api/community/wishes",
         response_model=List[schemas.WishWithStats])
async def get_public_wishes(db: AsyncSession = Depends(get_db)):
    try:
        # Алиасы для подсчёта лайков и комментариев
        likes_subq = select(
            models.Like.wish_id,
            func.count(models.Like.id).label("likes_count")
        ).group_by(models.Like.wish_id).subquery()

        comments_subq = select(
            models.Comment.wish_id,
            func.count(models.Comment.id).label("comments_count")
        ).group_by(models.Comment.wish_id).subquery()

        # Основной запрос — публичные вишлисты с подсчётами
        stmt = (
            select(
                models.Wish,
                func.coalesce(likes_subq.c.likes_count, 0),
                func.coalesce(comments_subq.c.comments_count, 0),
                models.User.name.label("owner_name"),
                models.User.avatar_url.label("owner_avatar"),
            )
            .join(models.User, models.Wish.owner_id == models.User.id)
            .outerjoin(likes_subq, likes_subq.c.wish_id == models.Wish.id)
            .outerjoin(comments_subq, comments_subq.c.wish_id == models.Wish.id)
            .where(models.Wish.is_public == True)
            .where(models.User.privacy != schemas.PrivacyEnum.private)
            .order_by(models.Wish.created_at.desc())
        )

        result = await db.execute(stmt)
        wishes_with_stats = []
        for wish, likes_count, comments_count, owner_name, owner_avatar in result.all():
            wishes_with_stats.append({
                "id": wish.id,
                "title": wish.title,
                "description": wish.description,
                "image_url": wish.image_url,
                "goal": wish.goal,
                "raised": wish.raised,
                "owner_id": wish.owner_id,
                "owner_name": owner_name,
                "owner_avatar": owner_avatar,
                "likes_count": likes_count,
                "comments_count": comments_count,
                "is_public": wish.is_public,
            })
        return wishes_with_stats
    except Exception as e:
        logging.error("Failed to get public wishes wish: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get public wishes")
