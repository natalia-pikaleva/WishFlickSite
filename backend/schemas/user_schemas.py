from pydantic import BaseModel, EmailStr, HttpUrl, Field, validator
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid


class PrivacyEnum(str, Enum):
    public = "public"
    friends = "friends"
    private = "private"
    anonymous = "anonymous"


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    description: Optional[str] = None
    privacy: PrivacyEnum = PrivacyEnum.public
    social_facebook: Optional[HttpUrl] = None
    social_twitter: Optional[HttpUrl] = None
    social_instagram: Optional[HttpUrl] = None
    is_guest: Optional[bool] = None

    @validator('social_facebook', 'social_twitter', 'social_instagram', pre=True, always=True)
    def empty_str_to_none(cls, v):
        if isinstance(v, str) and v.strip() == '':
            return None
        return v


class UserCreate(UserBase):
    password: str


class Wish(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    goal: float = Field(..., gt=0)
    is_public: bool
    raised: float
    owner_id: int
    is_public: bool

    class Config:
        orm_mode = True


class User(UserBase):
    id: int
    is_guest: Optional[bool] = None
    wishes: List[Wish] = []

    class Config:
        orm_mode = True


class UserResponse(UserBase):
    id: int
    is_guest: Optional[bool] = None

    class Config:
        orm_mode = True


class UserProfileUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    description: Optional[str]
    privacy: Optional[str] = Field(default="public")
    social_facebook: Optional[HttpUrl]
    social_twitter: Optional[HttpUrl]
    social_instagram: Optional[HttpUrl]
    is_influencer: Optional[bool] = False
    is_guest: Optional[bool] = None


class UserProfileResponse(UserProfileUpdate):
    id: int
    name: Optional[str]
    email: Optional[EmailStr]
    description: Optional[str]
    privacy: Optional[str] = Field(default="public")
    social_facebook: Optional[HttpUrl] = None
    social_twitter: Optional[HttpUrl] = None
    social_instagram: Optional[HttpUrl] = None
    avatar_url: Optional[str]

    @validator('social_facebook', 'social_twitter', 'social_instagram', pre=True, always=True)
    def empty_str_to_none(cls, v):
        if isinstance(v, str) and v.strip() == '':
            return None
        return v

    class Config:
        orm_mode = True


class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    mutualFriends: int
    wishlistsCount: int
    is_guest: Optional[bool] = None

    class Config:
        orm_mode = True


class UserOutWithFriend(UserOut):
    isFriend: bool

    class Config:
        orm_mode = True
