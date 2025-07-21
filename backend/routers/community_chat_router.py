from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

import models
from schemas.community_chat_schemas import CommunityChatMessage, CommunityChatMessageCreate
import services.crud.community_chat_crud as chat_crud
import services.auth as auth
from database import get_db

router = APIRouter()

@router.post("/", response_model=CommunityChatMessage, status_code=status.HTTP_201_CREATED)
async def send_chat_message_endpoint(
        chat_message: CommunityChatMessageCreate,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        # Можно проверить, состоит ли пользователь в сообществе
        message = await chat_crud.create_chat_message(db, chat_message, user=current_user)
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send chat message: {e}")

@router.get("/{community_id}", response_model=List[CommunityChatMessage])
async def get_chat_messages_endpoint(
        community_id: int,
        db: AsyncSession = Depends(get_db)
):
    try:
        messages = await chat_crud.get_chat_messages(db, community_id=community_id)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat messages: {e}")

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_message_endpoint(
        message_id: int,
        current_user: models.User = Depends(auth.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        message = await chat_crud.get_chat_message_by_id(db, message_id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        # Возможно, стоит проверить — автор или админ ли пользователь
        await chat_crud.delete_chat_message(db, message)
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete chat message: {e}")
