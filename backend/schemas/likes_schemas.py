from pydantic import BaseModel

class LikeRequest(BaseModel):
    wish_id: int