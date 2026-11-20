"""Copy the tickets of the original OpsDesk Pro database into the TBO backend.

    cd backend
    python scripts/import_opsdesk_pro.py                  # ../opsdesk-pro/opsdesk.db -> backend/data/opsdesk.db
    python scripts/import_opsdesk_pro.py --source X.db --db Y.db

A legacy ticket with id 11 becomes PRO-11. The old file is only read, and running
the script again skips tickets that were already imported.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path
from typing import get_args

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import connect, init_db, resolve_db_path, transaction  # noqa: E402
from app.models.schemas import Priority, Status, match_choice  # noqa: E402
from app.services import store  # noqa: E402

DEFAULT_SOURCE = Path(__file__).resolve().parents[2] / "opsdesk-pro" / "opsdesk.db"


def import_tickets(source: str, target: str) -> tuple[int, int]:
    """Returns (imported, skipped)."""
    init_db(target)
    old = sqlite3.connect(f"file:{source}?mode=ro", uri=True)
    old.row_factory = sqlite3.Row
    try:
        rows = old.execute("SELECT id, title, description, priority, status FROM tickets ORDER BY id").fetchall()
    finally:
        old.close()

    imported = skipped = 0
    conn = connect(target)
    try:
        with transaction(conn):
            for row in rows:
                ticket_id = f"{store.PRO_PREFIX}{row['id']}"
                if store.ticket_exists(conn, ticket_id):
                    skipped += 1
                    continue
                ticket = store.complete_ticket(
                    conn,
                    {
                        "id": ticket_id,
                        "title": (row["title"] or "(no title)")[:200],
                        "description": (row["description"] or "")[:5000],
                        "priority": match_choice(row["priority"], get_args(Priority)) or "Medium",
                        "status": match_choice(row["status"], get_args(Status)) or "New",
                        "agencyId": None,
                        "tboh": "",
                        "intent": "general",
                        "region": "",
                        "assigneeId": None,
                    },
                    by="OpsDesk Pro (import)",
                )
                store.upsert_ticket(conn, ticket)
                imported += 1
            if imported:
                store.bump_revision(conn)
    finally:
        conn.close()
    return imported, skipped


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", default=str(DEFAULT_SOURCE), help="OpsDesk Pro sqlite file")
    parser.add_argument("--db", default=None, help="TBO backend database (default: OPSDESK_DB or backend/data/opsdesk.db)")
    args = parser.parse_args()
    if not Path(args.source).is_file():
        sys.exit(f"Source database not found: {args.source}")
    done, skipped = import_tickets(args.source, resolve_db_path(args.db))
    print(f"Imported {done} ticket(s), skipped {skipped} already present.")
