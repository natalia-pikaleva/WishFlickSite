from dotenv import load_dotenv
from fastapi import (FastAPI, Request, Depends, UploadFile, File,
                     Form, HTTPException, status)
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from httpx import URL
from sqlalchemy import select, func
from sqlalchemy.orm import aliased

import os
import uuid
import logging
import httpx

from app.database import Base, engine, get_db
import app.models as models
import app.schemas as schemas
import app.crud as crud
import app.auth as auth

logger = logging.getLogger(__name__)

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"  # ваш redirect URI

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = "http://localhost:8000/auth/facebook/callback"  # ваш redirect URI

app = FastAPI(title="WishFlick API")

origins = [
    "http://localhost:5173",  # адрес фронтенда
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # разрешить все методы
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


# Создание таблиц (запускайте один раз)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.post("/register", response_model=schemas.User)
async def register(user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await crud.get_user_by_email(db, email=user_create.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await crud.create_user(db, user_create)
    # Перезагружаем пользователя с wishes
    user = await crud.get_user_by_email(db, user.email)
    return user


@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.User)
async def read_users_me(
        request: Request,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    user = await crud.get_user_by_email(db, current_user.email)

    # Формируем абсолютный URL для аватара, если он есть и начинается с '/'
    if user.avatar_url and user.avatar_url.startswith('/'):
        base_url = str(request.base_url).rstrip('/')
        user.avatar_url = f"{base_url}{user.avatar_url}"

    return user


@app.post("/wishes", response_model=schemas.Wish, status_code=status.HTTP_201_CREATED)
async def create_wish_endpoint(
        wish_create: schemas.WishCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    wish = await crud.create_wish(db, wish_create, owner_id=current_user.id)
    return wish


@app.get("/wishes", response_model=List[schemas.Wish])
async def get_user_wishes(
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    wishes = await crud.get_wishes_by_owner(db, owner_id=current_user.id)
    return wishes


@app.delete("/wishes/{wish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wish(
        wish_id: int,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    wish = await crud.get_wish_by_id(db, wish_id)
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    if wish.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this wish")

    await crud.delete_wish(db, wish)
    return None  # 204 No Content


@app.put("/profile", response_model=schemas.UserProfileResponse)
async def update_profile(
        request: Request,
        name: Optional[str] = Form(None),
        email: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        privacy: Optional[str] = Form("public"),
        social_facebook: Optional[str] = Form(None),
        social_twitter: Optional[str] = Form(None),
        social_instagram: Optional[str] = Form(None),
        avatar: UploadFile = File(None),
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db),
):
    user = await crud.update_user_profile(
        db,
        current_user,
        name=name,
        email=email,
        description=description,
        privacy=privacy,
        social_facebook=social_facebook,
        social_twitter=social_twitter,
        social_instagram=social_instagram,
        avatar_file=avatar,
    )

    # Формируем абсолютный URL для аватара
    if user.avatar_url and user.avatar_url.startswith('/'):
        base_url = str(request.base_url).rstrip('/')
        user.avatar_url = f"{base_url}{user.avatar_url}"

    return user


@app.post("/guest-register")
async def guest_register(db: AsyncSession = Depends(get_db)):
    guest_email = f"guest_{uuid.uuid4()}@example.com"
    guest_user = schemas.UserCreate(
        email=guest_email,
        password=uuid.uuid4().hex,
        name="Guest",
        privacy=schemas.PrivacyEnum.anonymous,
    )
    user = await crud.create_user(db, guest_user)
    # Создаём и возвращаем токен (JWT) для гостя
    access_token = crud.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/google")
async def google_oauth_redirect():
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


@app.get("/auth/google/callback")
async def google_oauth_callback(
        request: Request,
        code: str,
        db: AsyncSession = Depends(get_db)
):
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
            password=os.urandom(16).hex(),  # случайный пароль, т.к. OAuth
            privacy="public",
        )
        user = await crud.create_user(db, user_create)

    # Создаём JWT токен
    access_token = auth.create_access_token(data={"sub": user.email})

    # Здесь можно вернуть токен в куки или в URL для фронтенда
    # Например, редирект на фронтенд с токеном в параметре
    frontend_url = f"http://localhost:3000/oauth-callback?token={access_token}"
    return RedirectResponse(frontend_url)


@app.get("/auth/facebook")
async def facebook_oauth_redirect():
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


@app.get("/auth/facebook/callback")
async def facebook_oauth_callback(
        code: str,
        state: str,
        db: AsyncSession = Depends(get_db)
):
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
            password=os.urandom(16).hex(),  # случайный пароль, т.к. OAuth
            privacy="public",
        )
        user = await crud.create_user(db, user_create)

    access_token_jwt = auth.create_access_token(data={"sub": user.email})

    frontend_url = f"http://localhost:3000/oauth-callback?token={access_token_jwt}"
    return RedirectResponse(frontend_url)


@app.post("/auth/facebook/token")
async def facebook_token_login(token_data: schemas.FacebookToken, db: AsyncSession = Depends(get_db)):
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


@app.post("/comments", response_model=schemas.CommentResponse)
async def post_comment(
        comment_create: schemas.CommentCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    comment = await crud.create_comment(db, current_user.id, comment_create.wish_id, comment_create.content)
    await crud.create_activity(db, current_user.id, models.ActivityType.comment, target_type="wish",
                               target_id=comment_create.wish_id)
    return comment


@app.get("/wishes/{wish_id}/comments", response_model=List[schemas.CommentResponse])
async def get_comments(wish_id: int, db: AsyncSession = Depends(get_db)):
    comments = await crud.get_comments_by_wish(db, wish_id)
    return comments


@app.post("/likes", response_model=schemas.LikeResponse)
async def post_like(
        like_create: schemas.LikeCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    like = await crud.create_like(db, current_user.id, like_create.wish_id)
    await crud.create_activity(db, current_user.id, models.ActivityType.like, target_type="wish",
                               target_id=like_create.wish_id)
    return like


@app.get("/wishes/{wish_id}/likes/count")
async def get_likes_count_endpoint(wish_id: int, db: AsyncSession = Depends(get_db)):
    count = await crud.get_likes_count(db, wish_id)
    return {"count": count}


@app.get("/activities", response_model=List[schemas.ActivityResponse])
async def get_activities_feed(db: AsyncSession = Depends(get_db)):
    activities = await crud.get_activities(db)
    return activities


@app.get("/wishes/{wish_id}", response_model=schemas.Wish)
async def get_wish(wish_id: int, db: AsyncSession = Depends(get_db)):
    wish = await crud.get_wish_by_id(db, wish_id)
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    return wish


@app.post("/activities/{activity_id}/like", status_code=status.HTTP_201_CREATED)
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
        raise e


@app.get("/community/wishes", response_model=List[schemas.WishWithStats])
async def get_public_wishes(db: AsyncSession = Depends(get_db)):
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
