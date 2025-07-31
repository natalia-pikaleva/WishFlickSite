from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.exc import IntegrityError

from models import Community, CommunityMember, User, CommunityRole
from schemas.community_schemas import CommunityCreate, CommunityUpdate


# Создать сообщество
async def create_community(db: AsyncSession, community_create: CommunityCreate, owner: User):
    db_community = Community(
        name=community_create.name,
        description=community_create.description,
        image_url=community_create.image_url,
        category=community_create.category,
        is_active=True,
        rules=community_create.rules,
    )

    db.add(db_community)
    await db.commit()
    await db.refresh(db_community)

    # Добавить создателя как администратора
    db_member = CommunityMember(
        community_id=db_community.id,
        user_id=owner.id,
        role="admin"
    )
    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)

    return db_community


# Получить список всех сообществ
async def get_communities(db: AsyncSession, skip: int = 0, limit: int = 20):
    result = await db.execute(
        select(Community)
        .options(selectinload(Community.memberships))
        .options(selectinload(Community.wishes))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


# Получить список всех сообществ одного пользователя
async def get_communities_by_user_id(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Community)
        .join(Community.memberships)
        .options(selectinload(Community.wishes), selectinload(Community.memberships))
        .where(CommunityMember.user_id == user_id)
    )
    return result.scalars().all()


# Получить сообщество по id
async def get_community_by_id(db: AsyncSession, community_id: int):
    result = await db.execute(
        select(Community)
        .filter(Community.id == community_id)
        .options(selectinload(Community.memberships))
    )
    return result.scalars().first()


# Обновить сообщество
async def update_community(db: AsyncSession, db_community: Community, community_update: CommunityUpdate):
    update_data = community_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_community, key, value)
    db.add(db_community)
    await db.commit()
    await db.refresh(db_community)
    return db_community


# Удалить сообщество
async def delete_community(db: AsyncSession, db_community: Community):
    await db.delete(db_community)
    await db.commit()


# Проверить, является ли пользователь админом
async def is_user_admin_of_community(db, community_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(CommunityMember).where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == user_id
        )
    )
    membership = result.scalars().first()
    return bool(membership and getattr(membership, "role", None) == CommunityRole.admin)


# Получить список участников сообщества
async def get_community_members(db: AsyncSession, community_id: int):
    result = await db.execute(
        select(CommunityMember)
        .options(joinedload(CommunityMember.user))
        .where(CommunityMember.community_id == community_id)
    )
    members = result.scalars().all()

    return [
        {
            "id": str(member.user.id),
            "name": member.user.name,
            "avatar_url": getattr(member.user, "avatar_url", None),
            "role": member.role.value,
            "isOnline": member.is_online,
            "contributions": member.contributions,
        }
        for member in members
    ]


async def add_community_member(
        db: AsyncSession,
        community_id: int,
        user_id: int,
        role: str = "member"
):
    # Проверка, нет ли уже этого пользователя в этом сообществе
    result = await db.execute(
        select(CommunityMember)
        .options(selectinload(CommunityMember.user), selectinload(CommunityMember.community))
        .where(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == user_id
        )
    )
    exists = result.scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Пользователь уже является участником сообщества")

    # Добавление участника
    member = CommunityMember(
        community_id=community_id,
        user_id=user_id,
        role=role
    )
    db.add(member)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при добавлении участника")
    await db.refresh(member)
    return member


async def is_community_member(
        db: AsyncSession,
        community_id: int,
        user_id: int
) -> bool:
    query = select(CommunityMember).where(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == user_id
    )
    result = await db.execute(query)
    member = result.scalar_one_or_none()
    return member is not None
