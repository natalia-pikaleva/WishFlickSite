from pydantic import BaseModel, EmailStr, HttpUrl, Field, validator
from typing import Optional, List
from enum import Enum
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class FacebookToken(BaseModel):
    access_token: str

class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str


class VKAuthRequest(BaseModel):
    code: str
    code_verifier: str
    device_id: Optional[str] = None