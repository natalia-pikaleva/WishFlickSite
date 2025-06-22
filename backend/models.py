from sqlalchemy import (Column, Integer, String, Text, Enum, ForeignKey, Float,
                        DateTime, UniqueConstraint, func, Boolean)
from sqlalchemy.orm import relationship
from database import Base
from enum import Enum as PyEnum
from datetime import datetime, timedelta, timezone
from sqlalchemy import Enum as SqlEnum

class PrivacyEnum(PyEnum):
    public = "public"
    friends = "friends"
    private = "private"
    anonymous = "anonymous"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    privacy = Column(SqlEnum(PrivacyEnum, name="privacyenum"),
                     default=PrivacyEnum.public, nullable=False)
    is_influencer = Column(Boolean, default=False)

    social_facebook = Column(String, nullable=True)
    social_twitter = Column(String, nullable=True)
    social_instagram = Column(String, nullable=True)

    wishes = relationship("Wish", back_populates="owner", lazy="selectin")


class WishSupporter(Base):
    __tablename__ = "wish_supporters"

    id = Column(Integer, primary_key=True)
    wish_id = Column(Integer, ForeignKey("wishes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    supported_at = Column(DateTime(timezone=True), server_default=func.now())


class Wish(Base):
    __tablename__ = "wishes"

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


class ActivityType(PyEnum):
    create_wish = "create_wish"
    comment = "comment"
    like = "like"
    follow = "follow"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ActivityType), nullable=False)
    target_type = Column(String, nullable=True)  # например, 'wish', 'comment'
    target_id = Column(Integer, nullable=True)  # id объекта действия
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь с пользователем
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

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wish_id = Column(Integer, ForeignKey("wishes.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="comments")
    wish = relationship("Wish", backref="comments")


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wish_id = Column(Integer, ForeignKey("wishes.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="likes")
    wish = relationship("Wish", backref="likes")

    __table_args__ = (
        UniqueConstraint('user_id', 'wish_id', name='uq_user_wish_like'),
    )


class ActivityLike(Base):
    __tablename__ = "activity_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="activity_likes")
    activity = relationship("Activity", backref="likes")

    __table_args__ = (
        UniqueConstraint('user_id', 'activity_id', name='uq_user_activity_like'),
    )
