from fastapi import (APIRouter, Request, Depends, Query, status)
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import RedirectResponse
from httpx import URL
import requests
import random
import os
import logging
import httpx

from database import Base, engine, get_db
import models as models
import schemas as schemas

import services.crud as crud
from services.auth import (create_access_token, verify_password,
                           create_refresh_token, decode_refresh_token)

from backend_conf import (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
                          GOOGLE_REDIRECT_URI, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET,
                          FACEBOOK_REDIRECT_URI)
from services.other_helpers import send_email_async
from config import VK_CLIENT_ID, VK_CLIENT_SECRET, VK_REDIRECT_URI

logger = logging.getLogger(__name__)

router = APIRouter()


def generate_verification_code():
    return f"{random.randint(100000, 999999)}"


@router.get("/google", tags=["auth"])
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


@router.get("/google/callback", tags=["auth"])
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
        access_token = create_access_token(data={"sub": user.email})

        # Здесь можно вернуть токен в куки или в URL для фронтенда
        # Например, редирект на фронтенд с токеном в параметре
        frontend_url = f"http://localhost:3000/oauth-callback?token={access_token}"
        return RedirectResponse(frontend_url)
    except Exception as e:
        logging.error("Failed to callback with google: %s", e)
        raise HTTPException(status_code=500, detail="Failed to callback with google")


@router.get("/facebook", tags=["auth"])
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


@router.get("/facebook/callback", tags=["auth"])
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

        access_token_jwt = create_access_token(data={"sub": user.email})

        frontend_url = f"http://80.78.243.30:5173/oauth-callback?token={access_token_jwt}"
        return RedirectResponse(frontend_url)
    except Exception as e:
        logging.error("Failed to callbak with facebook: %s", e)
        raise HTTPException(status_code=500, detail="Failed to callback with facebook")


@router.post("/facebook/token", tags=["auth"])
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

        jwt_token = create_access_token(data={"sub": user.email})

        return {"access_token": jwt_token, "token_type": "bearer"}
    except Exception as e:
        logging.error("Failed to get token with facebook: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get token with facebook")


@router.post("/register", response_model=schemas.User)
async def register(
        user_create: schemas.UserCreate,
        db: AsyncSession = Depends(get_db)
):
    try:
        db_user = await crud.get_user_by_email(db, email=user_create.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = await crud.create_user(db, user_create)
        logger.info("user created")

        user = await crud.get_user_by_email(db, user.email)
        logger.info("got user by email")

        # Генерируем код и сохраняем его
        code = generate_verification_code()
        # Сохраняем код в отдельной таблице EmailVerification
        await crud.create_email_verification(db, user_id=user.id, code=code)
        logger.info("email verification created")

        # Отправляем письмо с кодом
        subject = "Код подтверждения регистрации"
        await send_email_async(to_email=user.email, subject=subject, code=code)
        logger.info("The email has been sent")

        return user
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to register user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to register user")


@router.post("/verify-email")
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



@router.post("/token", response_model=schemas.TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await crud.get_user_by_email(db, email=form_data.username)
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        access_token = create_access_token(data={"sub": user.email})
        refresh_token = create_refresh_token(data={"sub": user.email})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to login user: %s", e)
        raise HTTPException(status_code=500, detail="Failed to login user")



@router.get("/vk/callback")
async def vk_callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    # Здесь просто редиректим на фронтенд с кодом и state
    # Фронтенд должен получить их из URL и отправить вместе с code_verifier на сервер
    redirect_url = f"https://wishflick.ru/auth/vk/callback?code={code}&state={state}"
    return RedirectResponse(url=redirect_url)


@router.post("/vk")
async def vk_auth(vk_auth_request: dict, db: AsyncSession = Depends(get_db)):
    code = vk_auth_request.get("code")
    code_verifier = vk_auth_request.get("code_verifier")
    device_id = vk_auth_request.get("device_id")

    if not code or not code_verifier:
        raise HTTPException(status_code=400, detail="Missing code or code_verifier")

    # Обмен кода на токен у ВКонтакте
    async with httpx.AsyncClient() as client:
        params = {
            "client_id": "53840991",  # ваш VK_CLIENT_ID
            "redirect_uri": "https://wishflick.ru/api/auth/vk/callback",
            "client_secret": "ВАШ_CLIENT_SECRET",  # если требуется
            "code": code,
            "code_verifier": code_verifier,
            "grant_type": "authorization_code",
        }
        response = await client.post("https://oauth.vk.com/access_token", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token from VK")

        data = response.json()
        access_token = data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received")

        # Здесь ваша логика создания JWT, сохранения пользователя и т.п.
        # Например:
        # jwt_token = create_jwt_for_user(...)
        return {"access_token": access_token, "token_type": "bearer"}



@router.post("/refresh-token", response_model=schemas.TokenResponse)
async def refresh_access_token(
    token_request: schemas.TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        # Валидация и декодирование refresh токена
        payload = decode_refresh_token(token_request.refresh_token)
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user = await crud.get_user_by_email(db, email=email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        # При необходимости можно проверить, что refresh_token не отозван (реализуйте логику, если нужно)

        # Создаем новые токены
        access_token = create_access_token(data={"sub": user.email})
        refresh_token = create_refresh_token(data={"sub": user.email})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to refresh token: %s", e)
        raise HTTPException(status_code=500, detail="Failed to refresh token")
