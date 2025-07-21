from pydantic import BaseModel
from datetime import datetime


class CommunityChatMessageCreate(BaseModel):
    community_id: int
    message: str


class CommunityChatMessage(BaseModel):
    id: int
    community_id: int
    user_id: int
    message: str
    sent_at: datetime

    class Config:
        orm_mode = True
