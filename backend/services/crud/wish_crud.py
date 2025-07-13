from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import logging

from models import (User, Wish, Comment, Activity, ActivityType, Like,
                    ActivityLike, EmailVerification, friend_association)
from schemas.wish_schemas import WishCreate, WishUpdate

logger = logging.getLogger(__name__)




async def create_wish(db: AsyncSession, wish_create: WishCreate, owner: User):
    is_influencer_public = False
    if owner.is_influencer and wish_create.is_public:
        is_influencer_public = True

    db_wish = Wish(
        title=wish_create.title,
        description=wish_create.description,
        image_url=str(wish_create.image_url) if wish_create.image_url else None,
        goal=wish_create.goal,
        owner_id=owner.id,
        is_public=wish_create.is_public,
        is_influencer_public=is_influencer_public,
    )
    db.add(db_wish)
    await db.commit()
    await db.refresh(db_wish)
    return db_wish


async def get_wishes_by_owner(db: AsyncSession, owner_id: int):
    result = await db.execute(
        select(Wish)
        .filter(Wish.owner_id == owner_id)
        .options(selectinload(Wish.owner))  # если нужно
    )
    return result.scalars().all()


async def get_wish_by_id(db: AsyncSession, wish_id: int):
    result = await db.execute(select(Wish).filter(Wish.id == wish_id))
    return result.scalars().first()


async def delete_wish(db: AsyncSession, wish: Wish):
    await db.delete(wish)
    await db.commit()


async def get_influencer_wishes(db: AsyncSession, public=True, influencer=True):
    query = (
        select(Wish)
        .options(selectinload(Wish.owner), selectinload(Wish.supporters))
        .where(Wish.is_public == public, Wish.is_influencer_public == influencer)
    )
    result = await db.execute(query)
    wishes = result.scalars().all()

    enriched_wishes = []
    for wish in wishes:
        supporters_count = len(wish.supporters) if wish.supporters else 0

        enriched_wishes.append({
            **wish.__dict__,
            "supporters": supporters_count,
            "time_left": wish.time_left,
        })

    return enriched_wishes


async def update_wish(db: AsyncSession, db_wish: Wish, wish_update: WishUpdate):
    update_data = wish_update.dict(exclude_unset=True)

    # Если есть поле image_url и оно типа HttpUrl, преобразуем в строку
    if 'image_url' in update_data and update_data['image_url'] is not None:
        update_data['image_url'] = str(update_data['image_url'])

    for key, value in update_data.items():
        setattr(db_wish, key, value)

    db.add(db_wish)
    await db.commit()
    await db.refresh(db_wish)
    return db_wish
