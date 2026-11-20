"""Ticket endpoints.

Kept compatible with the original opsdesk-pro API (same verbs, `status` /
`priority` filters, PATCH takes {"status": ...}, same response envelopes) and
extended: string ids, the full TBO ticket document, archive flag, more filters.
"""

import sqlite3
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_conn, transaction
from ..models.schemas import Priority, Status, StatusPatch, TicketCreate, TicketIn
from ..services import store

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("")
def list_tickets(
    status: Status | None = None,
    priority: Priority | None = None,
    agencyId: str | None = None,
    assigneeId: str | None = None,
    archived: Literal["false", "true", "all"] = "false",
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    conn: sqlite3.Connection = Depends(get_conn),
):
    flag = {"false": False, "true": True, "all": None}[archived]
    return store.list_tickets(
        conn,
        archived=flag,
        status=status,
        priority=priority,
        agency_id=agencyId,
        assignee_id=assigneeId,
        limit=limit,
        offset=offset,
    )


@router.get("/{ticket_id}")
def get_ticket(ticket_id: str, conn: sqlite3.Connection = Depends(get_conn)):
    ticket = store.get_ticket(conn, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.post("", status_code=201)
def create_ticket(body: TicketCreate, conn: sqlite3.Connection = Depends(get_conn)):
    """Full ticket, or the slim OpsDesk Pro shape (no id: the server assigns PRO-<n>)."""
    with transaction(conn):
        ticket = store.complete_ticket(conn, body.model_dump())
        if store.ticket_exists(conn, ticket["id"]):
            raise HTTPException(status_code=409, detail="Ticket id already exists")
        store.upsert_ticket(conn, ticket)
        store.bump_revision(conn)
    return {"status": "Ticket created", "ticket": ticket}


@router.put("/{ticket_id}")
def replace_ticket(
    ticket_id: str,
    body: TicketIn,
    archived: bool | None = None,
    conn: sqlite3.Connection = Depends(get_conn),
):
    """Create or fully replace a ticket. `archived` is kept as is unless given."""
    if body.id != ticket_id:
        raise HTTPException(status_code=400, detail="Id in the URL and body must match")
    ticket = body.model_dump()
    with transaction(conn):
        current = store.is_archived(conn, ticket_id)
        keep = bool(current) if archived is None else archived
        store.upsert_ticket(conn, ticket, archived=keep)
        store.bump_revision(conn)
    return {"status": "Ticket updated" if current is not None else "Ticket created", "ticket": ticket}


@router.patch("/{ticket_id}")
def update_ticket_status(
    ticket_id: str, body: StatusPatch, conn: sqlite3.Connection = Depends(get_conn)
):
    with transaction(conn):
        try:
            ticket = store.change_status(conn, ticket_id, body.status, body.by)
        except store.StatusRuleError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found")
        store.bump_revision(conn)
    return {"status": "Ticket updated", "ticket": ticket}


@router.delete("/{ticket_id}")
def delete_ticket(ticket_id: str, conn: sqlite3.Connection = Depends(get_conn)):
    with transaction(conn):
        ticket = store.get_ticket(conn, ticket_id)
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found")
        store.delete_ticket(conn, ticket_id)
        store.bump_revision(conn)
    return {"status": "Ticket deleted", "ticket": ticket}
