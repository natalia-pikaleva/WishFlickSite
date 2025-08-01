from fastapi import (FastAPI, Request, Depends, UploadFile, File,
                     Form, status)
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
from schemas.user_schemas import UserProfileResponse, PrivacyEnum
from schemas.other_schemas import LikeResponse, LikeCreate, ActivityResponse
from schemas.wish_schemas import WishWithStats
from schemas.comment_schemas import CommentResponse, CommentCreate
import services.crud.user_crud as user_crud
import services.crud.other_crud as other_crud
import services.auth as auth
from routers.wishes_router import router as router_wishes
from routers.auth_router import router as router_auth
from routers.friends_router import router as router_friends
from routers.users_router import router as router_users
from routers.posts_router import router as router_posts
from routers.notifications_router import router as router_notifications
from routers.likes_router import router as router_likes
from routers.community_router import router as router_community
from routers.community_chat_router import router as router_community_chat

from config import LOGGING_CONFIG, UPLOAD_DIR
import logging.config

logger = logging.getLogger(__name__)
logging.config.dictConfig(LOGGING_CONFIG)

app = FastAPI(title="WishFlick API")
app.include_router(router_wishes, prefix="/api/wishes", tags=["wishes"])
app.include_router(router_auth, prefix="/api/auth", tags=["wishes"])
app.include_router(router_friends, prefix="/api/friends", tags=["friends"])
app.include_router(router_users, prefix="/api/users", tags=["users"])
app.include_router(router_posts, prefix="/api/posts", tags=["posts"])
app.include_router(router_notifications, prefix="/api/notifications", tags=["notifications"])
app.include_router(router_likes, prefix="/api/likes", tags=["likes"])
app.include_router(router_community, prefix="/api/communities", tags=["communities"])
app.include_router(router_community_chat, prefix="/api/community-chat", tags=["community chat"])

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

UPLOAD_DIR_AVATARS = os.path.join(UPLOAD_DIR, "avatars")
UPLOAD_DIR_WISHES = os.path.join(UPLOAD_DIR, "wishes")

os.makedirs(UPLOAD_DIR_AVATARS, exist_ok=True)
os.makedirs(UPLOAD_DIR_WISHES, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


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


@app.put("/api/profile", response_model=UserProfileResponse)
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
        user = await user_crud.update_user_profile(
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


@app.post("/api/comments", response_model=CommentResponse)
async def post_comment(
        comment_create: CommentCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        comment = await other_crud.create_comment(db, current_user.id, comment_create.wish_id, comment_create.content)
        await other_crud.create_activity(db, current_user.id, models.ActivityType.comment, target_type="wish",
                                         target_id=comment_create.wish_id)
        return comment
    except Exception as e:
        logging.error("Failed to create comment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create comment")


@app.post("/api/likes", response_model=LikeResponse)
async def post_like(
        like_create: LikeCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        like = await other_crud.create_like(db, current_user.id, like_create.wish_id)
        await other_crud.create_activity(db, current_user.id, models.ActivityType.like, target_type="wish",
                                         target_id=like_create.wish_id)
        return like
    except Exception as e:
        logging.error("Failed to create like: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create like")


@app.get("/api/activities", response_model=List[ActivityResponse])
async def get_activities_feed(db: AsyncSession = Depends(get_db)):
    try:
        activities = await other_crud.get_activities(db)
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
        await other_crud.like_activity(db, activity_id, current_user.id)
        return {"message": "Activity liked successfully"}

    except HTTPException as e:
        # Пробрасываем HTTPException, которые возникли в crud
        logging.error("Failed to create like for activity: %s", e)

        raise e
    except Exception as e:
        logging.error("Failed to create like for activity: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create like for activity")


@app.get("/api/community/wishes",
         response_model=List[WishWithStats])
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
            .where(models.User.privacy != PrivacyEnum.private)
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
