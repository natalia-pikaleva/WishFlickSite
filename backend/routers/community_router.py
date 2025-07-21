from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import os
import shutil
import uuid
import logging

from database import get_db
import models
from schemas.community_schemas import (Community, CommunityCreate, CommunityUpdate,
                                       Member, CommunityMemberCreate)
import services.crud.community_crud as community_crud
import services.auth as auth
from backend_conf import API_URL

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "uploads"
UPLOAD_DIR_COMMUNITIES = os.path.join(UPLOAD_DIR, "community_images")
os.makedirs(UPLOAD_DIR_COMMUNITIES, exist_ok=True)


@router.post("/", response_model=Community, status_code=status.HTTP_201_CREATED)
async def create_community_endpoint(
        name: str = Form(...),
        description: Optional[str] = Form(None),
        image_url: Optional[str] = Form(None),
        image_file: Optional[UploadFile] = File(None),
        category: Optional[str] = Form(None),
        rules: Optional[str] = Form(None),
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        # Обработка файла, если он есть
        final_image_url = image_url
        if image_file:
            filename = f"{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
            file_path = os.path.join(UPLOAD_DIR_COMMUNITIES, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image_file.file, buffer)
            final_image_url = f"/uploads/community_images/{filename}"

        community_create = CommunityCreate(
            name=name,
            description=description,
            image_url=final_image_url,
            category=category,
            rules=rules,
        )
        community = await community_crud.create_community(db, community_create, owner=current_user)
        return community
    except Exception as e:
        logger.error("Failed to create community: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to create community: {e}")


@router.get("/", response_model=List[Community])
async def get_communities_endpoint(
        db: AsyncSession = Depends(get_db),
):
    try:
        communities = await community_crud.get_communities(db)
        response = []
        for community in communities:
            community_response = Community(
                id=community.id,
                name=community.name,
                description=community.description,
                category=community.category,
                rules=community.rules,
                created_at=community.created_at,
                members_count=len(community.memberships),
                wishes_count=len(community.wishes)
            )
            if community.image_url and not community.image_url.startswith('http'):
                community_response.image_url = f'{API_URL}{community.image_url}'
            else:
                community_response.image_url = community.image_url
            response.append(community_response)
        return response
    except Exception as e:
        logger.error("Failed to get communities: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get communities")


@router.get("/{community_id}", response_model=Community)
async def get_community_by_id_endpoint(
        community_id: int,
        db: AsyncSession = Depends(get_db)
):
    try:
        community = await community_crud.get_community_by_id(db, community_id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")

        community_response = Community(
            id=community.id,
            name=community.name,
            description=community.description,
            category=community.category,
            rules=community.rules,
            created_at=community.created_at
        )
        if community.image_url and not community.image_url.startswith('http'):
            community_response.image_url = f'{API_URL}{community.image_url}'
        else:
            community_response.image_url = community.image_url
        return community_response
    except Exception as e:
        logger.error("Failed to get community: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get community")


@router.patch("/{community_id}", response_model=Community)
async def update_community_endpoint(
        community_id: int,
        name: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        image_url: Optional[str] = Form(None),
        image_file: Optional[UploadFile] = File(None),
        category: Optional[str] = Form(None),
        rules: Optional[str] = Form(None),
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        community = await community_crud.get_community_by_id(db, community_id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")

        is_admin = await community_crud.is_user_admin_of_community(db, community_id, current_user.id)
        if not is_admin:
            raise HTTPException(
                status_code=403, detail="Только администратор может изменять данные сообщества"
            )

        final_image_url = image_url
        if image_file:
            filename = f"{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
            file_path = os.path.join(UPLOAD_DIR_COMMUNITIES, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image_file.file, buffer)
            final_image_url = f"/uploads/community_images/{filename}"

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if category is not None:
            update_data["category"] = category
        if rules is not None:
            update_data["rules"] = rules
        if final_image_url is not None:
            update_data["image_url"] = final_image_url

        update_obj = CommunityUpdate(**update_data)
        updated = await community_crud.update_community(db, community, update_obj)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update community: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update community")


@router.delete("/{community_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community_endpoint(
        community_id: int,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        community = await community_crud.get_community_by_id(db, community_id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")

        is_admin = await community_crud.is_user_admin_of_community(db, community_id, current_user.id)
        if not is_admin:
            raise HTTPException(
                status_code=403, detail="Только администратор может удалять сообщество"
            )

        await community_crud.delete_community(db, community)
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete community: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete community")


@router.get("/{community_id}/members", response_model=List[Member])
async def get_community_members_endpoint(
        community_id: int,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db),
):
    # Проверка на гостя
    if getattr(current_user, "is_guest", False):
        raise HTTPException(status_code=403, detail="Гостям запрещено просматривать участников сообщества")

    # Можно добавить проверку, существует ли сообщество
    community = await db.get(models.Community, community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Сообщество не найдено")

    members = await community_crud.get_community_members(db, community_id)

    response = []
    for member in members:
        avatar_url = member["avatar_url"]
        if avatar_url and not avatar_url.startswith("http"):
            avatar_url = f"{API_URL}{avatar_url}"
        member_response = Member(
            id=member["id"],
            name=member["name"],
            avatar_url=avatar_url,
            role=member["role"],
            isOnline=member["isOnline"],
            contributions=member["contributions"],
        )
        response.append(member_response)
    return response


@router.post("/{community_id}/members", response_model=Member, status_code=201)
async def add_community_member_endpoint(
        community_id: int,
        payload: CommunityMemberCreate,
        db: AsyncSession = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    try:
        member = await community_crud.add_community_member(
            db=db,
            community_id=community_id,
            user_id=payload.user_id,
            role=payload.role
        )
        return Member(
            id=str(member.user_id),
            name=getattr(member.user, "name", ""),  # если у вас связь с user
            avatar_url=getattr(member.user, "avatar_url", None),
            role=member.role.value if hasattr(member.role, 'value') else member.role,
            isOnline=getattr(member, "is_online", False),
            contributions=getattr(member, "contributions", 0)
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Failed to add community member: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to add community member: {e}")
