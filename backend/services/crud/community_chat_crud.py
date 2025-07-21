from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models import CommunityChatMessage, User
from schemas.community_chat_schemas import CommunityChatMessageCreate

# Отправить сообщение в чат
async def create_chat_message(db: AsyncSession, chat_message_create: CommunityChatMessageCreate, user: User):
    db_message = CommunityChatMessage(
        community_id=chat_message_create.community_id,
        user_id=user.id,
        message=chat_message_create.message
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message

# Получить все сообщения чата сообщества (по community_id)
async def get_chat_messages(db: AsyncSession, community_id: int, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(CommunityChatMessage)
        .filter(CommunityChatMessage.community_id == community_id)
        .order_by(CommunityChatMessage.sent_at.asc())
        .offset(skip)
        .limit(limit)
        .options(selectinload(CommunityChatMessage.user))
    )
    return result.scalars().all()

# Удалить сообщение чата (например, по id)
async def delete_chat_message(db: AsyncSession, message: CommunityChatMessage):
    await db.delete(message)
    await db.commit()
