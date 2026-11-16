"""SQLite connection handling and schema.

Same storage idea as the original opsdesk-pro backend (plain sqlite3, no ORM),
extended so a ticket can hold everything the TBO frontend needs: the full ticket
document lives in `data` (JSON) and the columns next to it are copies used for
filtering and ordering. The columns are always derived from `data` on write, so
they cannot drift from it.
"""

from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from fastapi import Request

DEFAULT_DB = Path(__file__).resolve().parents[1] / "data" / "opsdesk.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    priority    TEXT NOT NULL,
    status      TEXT NOT NULL,
    agency_id   TEXT,
    tboh        TEXT,
    intent      TEXT,
    region      TEXT,
    assignee_id TEXT,
    created     INTEGER NOT NULL,
    updated     INTEGER NOT NULL,
    archived    INTEGER NOT NULL DEFAULT 0,
    ord         INTEGER NOT NULL,
    data        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_agency   ON tickets(agency_id);
CREATE INDEX IF NOT EXISTS idx_tickets_archived ON tickets(archived, ord);

CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


def resolve_db_path(explicit: str | os.PathLike | None = None) -> str:
    return str(explicit or os.environ.get("OPSDESK_DB") or DEFAULT_DB)


def connect(path: str) -> sqlite3.Connection:
    # isolation_level=None -> we control transactions explicitly (see `transaction`).
    # check_same_thread=False: FastAPI opens the per-request connection (dependency)
    # and runs the endpoint in different worker threads. The connection is never
    # shared between requests and is only used one step at a time, so this is safe.
    conn = sqlite3.connect(path, timeout=10, isolation_level=None, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=10000")
    return conn


def init_db(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = connect(path)
    try:
        conn.executescript(SCHEMA)
    finally:
        conn.close()


@contextmanager
def transaction(conn: sqlite3.Connection) -> Iterator[sqlite3.Connection]:
    """All-or-nothing write. BEGIN IMMEDIATE takes the write lock up front so
    concurrent writers queue instead of failing half-way through."""
    conn.execute("BEGIN IMMEDIATE")
    try:
        yield conn
    except BaseException:
        conn.execute("ROLLBACK")
        raise
    else:
        conn.execute("COMMIT")


def get_conn(request: Request) -> Iterator[sqlite3.Connection]:
    """FastAPI dependency: one connection per request."""
    conn = connect(request.app.state.db_path)
    try:
        yield conn
    finally:
        conn.close()
