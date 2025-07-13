from pydantic import BaseModel
from datetime import datetime

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
    created_at: datetime

    class Config:
        orm_mode = True
