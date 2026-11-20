import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_conn, transaction
from ..models.schemas import UserIn
from ..services import store

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_users(conn: sqlite3.Connection = Depends(get_conn)):
    return store.list_users(conn)


@router.get("/{user_id}")
def get_user(user_id: str, conn: sqlite3.Connection = Depends(get_conn)):
    user = store.get_user(conn, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}")
def put_user(user_id: str, body: UserIn, conn: sqlite3.Connection = Depends(get_conn)):
    """Create or replace a user, e.g. to flip `available` for routing."""
    if body.id != user_id:
        raise HTTPException(status_code=400, detail="Id in the URL and body must match")
    with transaction(conn):
        store.upsert_user(conn, body.model_dump())
        store.bump_revision(conn)
    return body.model_dump()
