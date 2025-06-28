from fastapi import (FastAPI, Request, Depends, UploadFile, File,
                     Form, HTTPException, status)
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from httpx import URL
from sqlalchemy import select, func

import random
import os
import uuid
import logging
import httpx

from database import Base, engine, get_db
import models as models
import schemas as schemas
import crud as crud
import auth as auth
from router_wishes import router as router_wishes
from backend_conf import (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
                          GOOGLE_REDIRECT_URI, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET,
                          FACEBOOK_REDIRECT_URI)
from services.other_helpers import send_email_async

logger = logging.getLogger(__name__)

app = FastAPI(title="WishFlick API")
app.include_router(router_wishes, prefix="/api/wishes", tags=["wishes"])

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

app.mount("/uploads",
          StaticFiles(directory=os.path.join(os.path.dirname(__file__), "uploads")),
          name="uploads")

UPLOAD_DIR_AVATARS = os.path.join(os.path.dirname(__file__), "uploads", "avatars")
UPLOAD_DIR_WISHES = os.path.join(os.path.dirname(__file__), "uploads", "wishes")

os.makedirs(UPLOAD_DIR_AVATARS, exist_ok=True)
os.makedirs(UPLOAD_DIR_WISHES, exist_ok=True)


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


@app.post("/api/register", response_model=schemas.User)
async def register(
        user_create: schemas.UserCreate,
        db: AsyncSession = Depends(get_db)
):
    try:
        db_user = await crud.get_user_by_email(db, email=user_create.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = await crud.create_user(db, user_create)
        user = await crud.get_user_by_email(db, user.email)

        # Генерируем код и сохраняем его
        code = generate_verification_code()
        # Сохраняем код в отдельной таблице EmailVerification
        await crud.create_email_verification(db, user_id=user.id, code=code)

        # Отправляем письмо с кодом
        subject = "Код подтверждения регистрации"
        await send_email_async(to_email=user.email, subject=subject, code=code)

        return user
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to register user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to register user")


@app.post("/api/verify-email")
async def verify_email(data: schemas.EmailVerificationRequest, db: AsyncSession = Depends(get_db)):
    """
    Проверяет код подтверждения email.
    Если код верный — делает пользователя подтверждённым.
    """
    try:
        # Найти пользователя по email
        user = await crud.get_user_by_email(db, email=data.email)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        # Найти запись о подтверждении email
        verification = await crud.get_email_verification(db, user_id=user.id, code=data.code)
        if not verification:
            raise HTTPException(status_code=400, detail="Неверный код")

        # Сделать пользователя подтверждённым
        await crud.mark_user_email_verified(db, user.id)

        # (Необязательно) удалить запись о подтверждении, чтобы код нельзя было использовать повторно
        await crud.delete_email_verification(db, verification.id)

        return {"detail": "Email успешно подтвержден"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to verify email user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to verify email user")


@app.post("/api/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    try:
        user = await crud.get_user_by_email(db, email=form_data.username)
        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        access_token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to login user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to login user")


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


@app.post("/api/guest-register")
async def guest_register(db: AsyncSession = Depends(get_db)):
    try:
        guest_email = f"guest_{uuid.uuid4()}@example.com"
        guest_user = schemas.UserCreate(
            email=guest_email,
            password=uuid.uuid4().hex,
            name="Guest",
            privacy=schemas.PrivacyEnum.anonymous,
        )
        user = await crud.create_user(db, guest_user)
        # Создаём и возвращаем токен (JWT) для гостя
        access_token = auth.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}
    except Exception as e:
        logging.error("Failed to register guest user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to register guest user")


@app.get("/api/auth/google", tags=["auth"])
async def google_oauth_redirect():
    try:
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "response_type": "code",
            "scope": "openid email profile",
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "access_type": "offline",
            "prompt": "consent",
        }

        url = URL("https://accounts.google.com/o/oauth2/v2/auth").copy_with(params=params)
        return RedirectResponse(url)
    except Exception as e:
        logging.error("Failed to auth with google: %s", e)
        raise HTTPException(status_code=500, detail="Failed to auth with google")


@app.get("/api/auth/google/callback", tags=["auth"])
async def google_oauth_callback(
        request: Request,
        code: str,
        db: AsyncSession = Depends(get_db)
):
    try:
        # Обмен кода на токен
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(token_url, data=data)
            token_resp.raise_for_status()
            tokens = token_resp.json()

            # Получаем информацию о пользователе
            userinfo_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            userinfo_resp.raise_for_status()
            userinfo = userinfo_resp.json()

        email = userinfo.get("email")
        name = userinfo.get("name")
        avatar_url = userinfo.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Email not available from Google")

        # Создаём или получаем пользователя из БД
        user = await crud.get_user_by_email(db, email=email)
        if not user:
            # Создаём нового пользователя с дефолтным паролем или без пароля
            user_create = models.UserCreate(
                email=email,
                name=name,
                avatar_url=avatar_url,
                password=os.urandom(16).hex(),
                privacy="public",
            )
            user = await crud.create_user(db, user_create)

        # Создаём JWT токен
        access_token = auth.create_access_token(data={"sub": user.email})

        # Здесь можно вернуть токен в куки или в URL для фронтенда
        # Например, редирект на фронтенд с токеном в параметре
        frontend_url = f"http://localhost:3000/oauth-callback?token={access_token}"
        return RedirectResponse(frontend_url)
    except Exception as e:
        logging.error("Failed to callback with google: %s", e)
        raise HTTPException(status_code=500, detail="Failed to callback with google")


@app.get("/api/auth/facebook", tags=["auth"])
async def facebook_oauth_redirect():
    try:
        if not FACEBOOK_CLIENT_ID or not FACEBOOK_CLIENT_SECRET:
            raise HTTPException(status_code=500, detail="Facebook OAuth credentials not set")

        params = {
            "client_id": FACEBOOK_CLIENT_ID,
            "redirect_uri": FACEBOOK_REDIRECT_URI,
            "state": "random_string_for_csrf_protection",  # можно реализовать защиту
            "scope": "email,public_profile",
            "response_type": "code",
            "auth_type": "rerequest",
        }
        url = httpx.URL("https://www.facebook.com/v15.0/dialog/oauth").copy_with(params=params)
        return RedirectResponse(url)
    except Exception as e:
        logging.error("Failed to auth wiyh facebook: %s", e)
        raise HTTPException(status_code=500, detail="Failed to auth with facebook")


@app.get("/api/auth/facebook/callback", tags=["auth"])
async def facebook_oauth_callback(
        code: str,
        state: str,
        db: AsyncSession = Depends(get_db)
):
    try:
        # Обмен кода на access token
        token_url = "https://graph.facebook.com/v15.0/oauth/access_token"
        params = {
            "client_id": FACEBOOK_CLIENT_ID,
            "redirect_uri": FACEBOOK_REDIRECT_URI,
            "client_secret": FACEBOOK_CLIENT_SECRET,
            "code": code,
        }
        async with httpx.AsyncClient() as client:
            token_resp = await client.get(token_url, params=params)
            token_resp.raise_for_status()
            token_data = token_resp.json()

            access_token = token_data.get("access_token")
            if not access_token:
                raise HTTPException(status_code=400, detail="Failed to get access token from Facebook")

            # Получение информации о пользователе
            userinfo_resp = await client.get(
                "https://graph.facebook.com/me",
                params={"fields": "id,name,email,picture", "access_token": access_token}
            )
            userinfo_resp.raise_for_status()
            userinfo = userinfo_resp.json()

        email = userinfo.get("email")
        name = userinfo.get("name")
        avatar_url = userinfo.get("picture", {}).get("data", {}).get("url")

        if not email:
            raise HTTPException(status_code=400, detail="Email not available from Facebook")

        # Создаём или получаем пользователя из БД
        user = await crud.get_user_by_email(db, email=email)
        if not user:
            user_create = models.UserCreate(
                email=email,
                name=name,
                avatar_url=avatar_url,
                password=os.urandom(16).hex(),
                privacy="public",
            )
            user = await crud.create_user(db, user_create)

        access_token_jwt = auth.create_access_token(data={"sub": user.email})

        frontend_url = f"http://80.78.243.30:5173/oauth-callback?token={access_token_jwt}"
        return RedirectResponse(frontend_url)
    except Exception as e:
        logging.error("Failed to callbak with facebook: %s", e)
        raise HTTPException(status_code=500, detail="Failed to callback with facebook")


@app.post("/api/auth/facebook/token", tags=["auth"])
async def facebook_token_login(token_data: schemas.FacebookToken, db: AsyncSession = Depends(get_db)):
    try:
        access_token = token_data.access_token

        async with httpx.AsyncClient() as client:
            userinfo_resp = await client.get(
                "https://graph.facebook.com/me",
                params={"fields": "id,name,email,picture", "access_token": access_token}
            )
            if userinfo_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid Facebook token")

            userinfo = userinfo_resp.json()

        email = userinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Facebook")

        user = await crud.get_user_by_email(db, email=email)
        if not user:
            user_create = models.UserCreate(
                email=email,
                name=userinfo.get("name"),
                avatar_url=userinfo.get("picture", {}).get("data", {}).get("url"),
                password="random_generated_password",  # OAuth, пароль не нужен
                privacy="public",
            )
            user = await crud.create_user(db, user_create)

        jwt_token = auth.create_access_token(data={"sub": user.email})

        return {"access_token": jwt_token, "token_type": "bearer"}
    except Exception as e:
        logging.error("Failed to get token with facebook: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get token with facebook")


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
