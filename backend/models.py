from sqlalchemy import (Column, Integer, String, Text, Enum, ForeignKey, Float,
                        DateTime, UniqueConstraint, func, Boolean, BigInteger,
                        Table)
from sqlalchemy.orm import relationship
from database import Base
from enum import Enum as PyEnum
from datetime import datetime, timedelta, timezone
from sqlalchemy import Enum as SqlEnum


# --- users ---

class PrivacyEnum(PyEnum):
    public = "public"
    friends = "friends"
    private = "private"
    anonymous = "anonymous"


friend_association = Table(
    "friend_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("friend_id", Integer, ForeignKey("users.id"), primary_key=True),
    UniqueConstraint("user_id", "friend_id", name="uq_user_friend")
)


class User(Base):
    __tablename__ = "users"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    privacy = Column(SqlEnum(PrivacyEnum, name="privacyenum"),
                     default=PrivacyEnum.public, nullable=False)
    is_influencer = Column(Boolean, default=False)
    vk_id = Column(BigInteger, unique=True, nullable=True, index=True)

    social_facebook = Column(String, nullable=True)
    social_twitter = Column(String, nullable=True)
    social_instagram = Column(String, nullable=True)

    # relationships
    wishes = relationship("Wish", back_populates="owner", lazy="selectin")
    email_verifications = relationship(
        "EmailVerification",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    friends = relationship(
        "User",
        secondary=friend_association,
        primaryjoin=id == friend_association.c.user_id,
        secondaryjoin=id == friend_association.c.friend_id,
        backref="friend_of",
        lazy="selectin"
    )
    posts = relationship("Post", back_populates="owner", lazy="selectin")


class EmailVerification(Base):
    __tablename__ = "email_verification"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code = Column(String(6), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="email_verifications")


# --- wishes ---

class WishSupporter(Base):
    __tablename__ = "wish_supporters"

    id = Column(Integer, primary_key=True)
    wish_id = Column(Integer, ForeignKey("wishes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    supported_at = Column(DateTime(timezone=True), server_default=func.now())


class Wish(Base):
    __tablename__ = "wishes"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    goal = Column(Float, nullable=False)
    raised = Column(Float, default=0.0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_public = Column(Boolean, default=False)
    is_influencer_public = Column(Boolean, default=False)
    duration_days = Column(Integer, default=30)
    category = Column(String, nullable=True)

    # relationships
    owner = relationship("User", back_populates="wishes")
    supporters = relationship("WishSupporter", backref="wish", lazy="selectin")

    @property
    def time_left(self) -> str:
        if not hasattr(self, "duration_days") or not self.created_at:
            return "N/A"
        end_date = self.created_at + timedelta(days=self.duration_days)
        remaining = end_date - datetime.now(timezone.utc)
        if remaining.total_seconds() <= 0:
            return "Ended"
        days = remaining.days
        return f"{days} day{'s' if days != 1 else ''} left"


# --- activities ---

class ActivityType(PyEnum):
    create_wish = "create_wish"
    comment = "comment"
    like = "like"
    follow = "follow"


class Activity(Base):
    __tablename__ = "activities"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ActivityType), nullable=False)
    target_type = Column(String, nullable=True)  # например, 'wish', 'comment'
    target_id = Column(Integer, nullable=True)  # id объекта действия
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user = relationship("User", backref="activities")
    wish = relationship(
        "Wish",
        primaryjoin="and_(Activity.target_id == foreign(Wish.id), Activity.target_type == 'wish')",
        viewonly=True,
        uselist=False,
    )

    # Вспомогательное свойство для удобства (не колонка)
    @property
    def is_wish_activity(self):
        return self.target_type == 'wish'


class Comment(Base):
    __tablename__ = "comments"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wish_id = Column(Integer, ForeignKey("wishes.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user = relationship("User", backref="comments")
    wish = relationship("Wish", backref="comments")


class Like(Base):
    __tablename__ = "likes"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wish_id = Column(Integer, ForeignKey("wishes.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user = relationship("User", backref="likes")
    wish = relationship("Wish", backref="likes")

    __table_args__ = (
        UniqueConstraint('user_id', 'wish_id', name='uq_user_wish_like'),
    )


class ActivityLike(Base):
    __tablename__ = "activity_likes"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user = relationship("User", backref="activity_likes")
    activity = relationship("Activity", backref="likes")

    __table_args__ = (
        UniqueConstraint('user_id', 'activity_id', name='uq_user_activity_like'),
    )

class Post(Base):
    __tablename__ = "posts"

    # columns
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # relationships
    owner = relationship("User", back_populates="posts")