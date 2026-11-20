"""Whole-state endpoints used by the frontend: load, first-time seed, batch sync."""

import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_conn, transaction
from ..models.schemas import SeedIn, SyncIn
from ..services import store

router = APIRouter(tags=["state"])


@router.get("/health")
def health(conn: sqlite3.Connection = Depends(get_conn)):
    return {"status": "ok", "initialized": store.is_initialized(conn)}


@router.get("/revision")
def revision(conn: sqlite3.Connection = Depends(get_conn)):
    """Cheap to call. The frontend polls this to notice changes made elsewhere."""
    return {"revision": store.get_revision(conn)}


@router.get("/state")
def get_state(conn: sqlite3.Connection = Depends(get_conn)):
    return store.read_state(conn)


@router.post("/state/seed", status_code=201)
def seed(body: SeedIn, conn: sqlite3.Connection = Depends(get_conn)):
    """First start only: the frontend uploads its demo data once. Refused once the
    team exists, so it can never overwrite real tickets. Tickets raised through
    OpsDesk Pro before the frontend's first visit (PRO-<n>) do not block it."""
    with transaction(conn):
        if store.is_initialized(conn):
            raise HTTPException(status_code=409, detail="Database already has data")
        store.seed_state(conn, body.model_dump())
        rev = store.bump_revision(conn)
    return {"status": "Seeded", "revision": rev}


@router.post("/sync")
def sync(body: SyncIn, conn: sqlite3.Connection = Depends(get_conn)):
    """Apply a batch of frontend changes atomically (idempotent: safe to retry)."""
    with transaction(conn):
        applied = store.apply_sync(conn, body.model_dump())
        rev = store.bump_revision(conn)
    return {"status": "Synced", "revision": rev, **applied}
