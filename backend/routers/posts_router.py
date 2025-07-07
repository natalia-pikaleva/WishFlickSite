from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import Post
from schemas import PostCreate, PostUpdate, PostOut
from database import get_db
from services.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(post_in: PostCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    post = Post(content=post_in.content, owner_id=current_user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.get("/", response_model=List[PostOut])
def list_posts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Post).filter(Post.owner_id == current_user.id).all()

@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.owner_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/{post_id}", response_model=PostOut)
def update_post(post_id: int, post_in: PostUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.owner_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.content = post_in.content
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.owner_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return None
