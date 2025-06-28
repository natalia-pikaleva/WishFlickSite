from pydantic import BaseModel, EmailStr, HttpUrl, Field, validator
from typing import Optional, List
from enum import Enum
import datetime


class PrivacyEnum(str, Enum):
    public = "public"
    friends = "friends"
    private = "private"
    anonymous = "anonymous"


class WishBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    goal: float = Field(..., gt=0)
    is_public: bool


class WishCreate(WishBase):
    pass


class Wish(WishBase):
    id: int
    raised: float
    owner_id: int
    is_public: bool

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    description: Optional[str] = None
    privacy: PrivacyEnum = PrivacyEnum.public
    social_facebook: Optional[HttpUrl] = None
    social_twitter: Optional[HttpUrl] = None
    social_instagram: Optional[HttpUrl] = None

    @validator('social_facebook', 'social_twitter', 'social_instagram', pre=True, always=True)
    def empty_str_to_none(cls, v):
        if isinstance(v, str) and v.strip() == '':
            return None
        return v


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    wishes: List[Wish] = []

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    description: Optional[str]
    privacy: Optional[str] = Field(default="public")
    social_facebook: Optional[HttpUrl]
    social_twitter: Optional[HttpUrl]
    social_instagram: Optional[HttpUrl]
    is_influencer: Optional[bool] = False


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


class FacebookToken(BaseModel):
    access_token: str


class CommentCreate(BaseModel):
    wish_id: int
    content: str


class CommentUser(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    user: CommentUser
    created_at: datetime.datetime

    class Config:
        orm_mode = True


class LikeCreate(BaseModel):
    wish_id: int


class LikeResponse(BaseModel):
    id: int
    user_id: int
    wish_id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True


class UserSummary(BaseModel):
    id: int
    name: Optional[str]
    avatar_url: Optional[str]

    class Config:
        orm_mode = True


class WishSummary(BaseModel):
    id: int
    title: str
    raised: float
    goal: float

    class Config:
        orm_mode = True


class ActivityResponse(BaseModel):
    id: int
    user: UserSummary
    type: str
    target_type: Optional[str]
    target_id: Optional[int]
    wish: Optional[WishSummary]
    created_at: datetime.datetime

    class Config:
        orm_mode = True


class WishWithStats(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    goal: float
    raised: Optional[float]
    owner_id: int
    owner_name: Optional[str]
    owner_avatar: Optional[str]
    likes_count: int
    comments_count: int
    is_public: bool

    class Config:
        orm_mode = True


class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True


class WishWithOwner(Wish):
    owner: Optional[UserResponse]
    supporters: int
    time_left: str
    category: Optional[str] = None

    class Config:
        orm_mode = True


class WishUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    image_url: Optional[HttpUrl]
    goal: Optional[float] = Field(None, gt=0)
    is_public: Optional[bool]

    class Config:
        orm_mode = True


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str
