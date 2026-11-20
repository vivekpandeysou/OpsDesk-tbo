"""Persistence logic. Routes call these; nothing here knows about HTTP."""

from __future__ import annotations

import json
import sqlite3
import time
from typing import Any

# --------------------------------------------------------------------------- meta


def meta_get(conn: sqlite3.Connection, key: str, default: Any = None) -> Any:
    row = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
    return json.loads(row["value"]) if row else default


def meta_set(conn: sqlite3.Connection, key: str, value: Any) -> None:
    conn.execute(
        "INSERT INTO meta (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, json.dumps(value)),
    )


def get_revision(conn: sqlite3.Connection) -> int:
    return int(meta_get(conn, "revision", 0))


def bump_revision(conn: sqlite3.Connection) -> int:
    """Call inside a write transaction. Clients poll this number to learn that
    somebody else changed something."""
    rev = get_revision(conn) + 1
    meta_set(conn, "revision", rev)
    return rev


# ------------------------------------------------------------------------- users


def list_users(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute("SELECT data FROM users ORDER BY rowid").fetchall()
    return [json.loads(r["data"]) for r in rows]


def get_user(conn: sqlite3.Connection, user_id: str) -> dict | None:
    row = conn.execute("SELECT data FROM users WHERE id = ?", (user_id,)).fetchone()
    return json.loads(row["data"]) if row else None


def upsert_user(conn: sqlite3.Connection, user: dict) -> None:
    # ON CONFLICT DO UPDATE (not REPLACE) keeps the row's position, so the
    # order of the team list never changes.
    conn.execute(
        "INSERT INTO users (id, name, role, data) VALUES (?, ?, ?, ?) "
        "ON CONFLICT(id) DO UPDATE SET name = excluded.name, role = excluded.role, data = excluded.data",
        (user["id"], user["name"], user["role"], json.dumps(user)),
    )


# ----------------------------------------------------------------------- tickets

_INSERT_TICKET = """
INSERT INTO tickets
    (id, title, description, priority, status, agency_id, tboh, intent, region,
     assignee_id, created, updated, archived, ord, data)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
    title = excluded.title, description = excluded.description,
    priority = excluded.priority, status = excluded.status,
    agency_id = excluded.agency_id, tboh = excluded.tboh, intent = excluded.intent,
    region = excluded.region, assignee_id = excluded.assignee_id,
    created = excluded.created, updated = excluded.updated,
    archived = excluded.archived, data = excluded.data
"""  # note: `ord` is deliberately not updated, a ticket keeps its place in the list


def _front_ord(conn: sqlite3.Connection) -> int:
    """New tickets go to the front of the list (the frontend does tickets.unshift)."""
    return conn.execute("SELECT COALESCE(MIN(ord), 0) - 1 FROM tickets").fetchone()[0]


def get_ticket(conn: sqlite3.Connection, ticket_id: str) -> dict | None:
    row = conn.execute("SELECT data FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
    return json.loads(row["data"]) if row else None


def ticket_exists(conn: sqlite3.Connection, ticket_id: str) -> bool:
    return conn.execute("SELECT 1 FROM tickets WHERE id = ?", (ticket_id,)).fetchone() is not None


def is_archived(conn: sqlite3.Connection, ticket_id: str) -> bool | None:
    row = conn.execute("SELECT archived FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
    return None if row is None else bool(row["archived"])


def upsert_ticket(
    conn: sqlite3.Connection, ticket: dict, archived: bool = False, ord_: int | None = None
) -> None:
    if ord_ is None:
        row = conn.execute("SELECT ord FROM tickets WHERE id = ?", (ticket["id"],)).fetchone()
        ord_ = row["ord"] if row else _front_ord(conn)
    conn.execute(
        _INSERT_TICKET,
        (
            ticket["id"],
            ticket["title"],
            ticket.get("description", ""),
            ticket["priority"],
            ticket["status"],
            ticket.get("agencyId"),
            ticket.get("tboh", ""),
            ticket.get("intent", "general"),
            ticket.get("region", ""),
            ticket.get("assigneeId"),
            ticket["created"],
            ticket["updated"],
            1 if archived else 0,
            ord_,
            json.dumps(ticket),
        ),
    )


PRO_PREFIX = "PRO-"


def next_pro_id(conn: sqlite3.Connection) -> str:
    """Id for a ticket raised through OpsDesk Pro. A separate prefix (not TKT-) so it
    can never collide with ids the frontend hands out from its own counter.
    Call inside a write transaction."""
    rows = conn.execute("SELECT id FROM tickets WHERE id LIKE ?", (PRO_PREFIX + "%",)).fetchall()
    nums = [int(r["id"][len(PRO_PREFIX):]) for r in rows if r["id"][len(PRO_PREFIX):].isdigit()]
    return f"{PRO_PREFIX}{max(nums, default=0) + 1}"


def complete_ticket(conn: sqlite3.Connection, data: dict, by: str = "OpsDesk Pro") -> dict:
    """Turn a slim ticket (OpsDesk Pro: title, description, priority) into the full
    document the TBO frontend expects. Anything already present is kept as is, so a
    full ticket passes through unchanged. Call inside a write transaction."""
    now = int(time.time() * 1000)
    ticket = dict(data)
    if not ticket.get("id"):
        ticket["id"] = next_pro_id(conn)
    ticket["created"] = ticket.get("created") or now
    ticket["updated"] = ticket.get("updated") or ticket["created"]
    for key, default in (
        ("prevAssigneeId", None), ("checkin", None), ("lcd", None), ("holiday", False),
        ("themes", []), ("product", ""), ("routing", None), ("side", []), ("escal", []),
    ):
        ticket.setdefault(key, default)
    ticket.setdefault(
        "comments",
        [{"id": f"c{ticket['created']}", "ts": ticket["created"], "by": by, "type": "external",
          "from": "agency", "text": ticket.get("description", "")}],
    )
    ticket.setdefault(
        "timeline",
        [{"ts": ticket["created"], "type": "created", "text": f"Ticket created via {by}", "by": by}],
    )
    return ticket


def delete_ticket(conn: sqlite3.Connection, ticket_id: str) -> bool:
    return conn.execute("DELETE FROM tickets WHERE id = ?", (ticket_id,)).rowcount > 0


def list_tickets(
    conn: sqlite3.Connection,
    *,
    archived: bool | None = False,
    status: str | None = None,
    priority: str | None = None,
    agency_id: str | None = None,
    assignee_id: str | None = None,
    limit: int | None = None,
    offset: int = 0,
) -> list[dict]:
    """archived: False = active only, True = archived only, None = both."""
    where, params = ["1 = 1"], []
    if archived is not None:
        where.append("archived = ?")
        params.append(1 if archived else 0)
    for column, value in (
        ("status", status),
        ("priority", priority),
        ("agency_id", agency_id),
        ("assignee_id", assignee_id),
    ):
        if value:
            where.append(f"{column} = ?")
            params.append(value)
    sql = f"SELECT data FROM tickets WHERE {' AND '.join(where)} ORDER BY ord ASC"
    if limit is not None:
        sql += " LIMIT ? OFFSET ?"
        params += [limit, offset]
    return [json.loads(r["data"]) for r in conn.execute(sql, params).fetchall()]


class StatusRuleError(ValueError):
    """The status change breaks a workflow rule."""


def change_status(conn: sqlite3.Connection, ticket_id: str, new_status: str, by: str) -> dict | None:
    """Status change with the same audit trail the frontend writes."""
    ticket = get_ticket(conn, ticket_id)
    if ticket is None:
        return None
    old = ticket["status"]
    if new_status == "Closed" and old not in ("Resolved", "Closed"):
        raise StatusRuleError("Resolve the ticket before closing it")
    now = int(time.time() * 1000)
    ticket["status"] = new_status
    ticket["updated"] = now
    ticket.setdefault("timeline", []).append(
        {"ts": now, "type": "status", "text": f"Status {old} → {new_status}", "by": by}
    )
    upsert_ticket(conn, ticket, archived=bool(is_archived(conn, ticket_id)))
    return ticket


# ------------------------------------------------------------------- whole state


def is_initialized(conn: sqlite3.Connection) -> bool:
    return conn.execute("SELECT 1 FROM users LIMIT 1").fetchone() is not None


def is_empty(conn: sqlite3.Connection) -> bool:
    return (
        conn.execute("SELECT 1 FROM users LIMIT 1").fetchone() is None
        and conn.execute("SELECT 1 FROM tickets LIMIT 1").fetchone() is None
    )


def read_state(conn: sqlite3.Connection) -> dict:
    """Exactly the object shape the frontend keeps in memory as `S`."""
    return {
        "v": 1,
        "initialized": is_initialized(conn),
        "revision": get_revision(conn),
        "users": list_users(conn),
        "tickets": list_tickets(conn, archived=False),
        "archive": list_tickets(conn, archived=True),
        "backlog": meta_get(conn, "backlog", []),
        "seq": meta_get(conn, "seq", 1000),
        "retentionDays": meta_get(conn, "retentionDays", 90),
    }


def seed_state(conn: sqlite3.Connection, seed: dict) -> None:
    for user in seed["users"]:
        upsert_user(conn, user)
    # keep the frontend's list order: tickets first, then archive
    for i, ticket in enumerate(seed["tickets"]):
        upsert_ticket(conn, ticket, archived=False, ord_=i)
    for i, ticket in enumerate(seed["archive"], start=len(seed["tickets"])):
        upsert_ticket(conn, ticket, archived=True, ord_=i)
    meta_set(conn, "backlog", seed["backlog"])
    meta_set(conn, "seq", seed["seq"])
    meta_set(conn, "retentionDays", seed["retentionDays"])


def apply_sync(conn: sqlite3.Connection, batch: dict) -> dict:
    deleted = 0
    for ticket_id in batch["tickets_delete"]:
        deleted += 1 if delete_ticket(conn, ticket_id) else 0
    for item in batch["tickets_upsert"]:
        upsert_ticket(conn, item["ticket"], archived=item["archived"])
    for user in batch["users_upsert"]:
        upsert_user(conn, user)
    if batch.get("backlog") is not None:
        meta_set(conn, "backlog", batch["backlog"])
    if batch.get("seq") is not None:
        meta_set(conn, "seq", batch["seq"])
    if batch.get("retentionDays") is not None:
        meta_set(conn, "retentionDays", batch["retentionDays"])
    return {"upserted": len(batch["tickets_upsert"]), "deleted": deleted}
