import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import create_app  # noqa: E402


@pytest.fixture
def client(tmp_path):
    frontend = tmp_path / "frontend"
    frontend.mkdir()
    (frontend / "index.html").write_text("<h1>frontend</h1>")
    app = create_app(db_path=tmp_path / "test.db", frontend_dir=frontend)
    with TestClient(app) as c:  # the `with` runs startup, which creates the tables
        yield c


def make_ticket(tid="TKT-1", **over):
    t = {
        "id": tid,
        "title": "Refund not received",
        "description": "Please check the refund status.",
        "priority": "High",
        "status": "New",
        "agencyId": "a1",
        "tboh": "TBOH-882145",
        "intent": "refund",
        "region": "North India",
        "assigneeId": None,
        "created": 1_700_000_000_000,
        "updated": 1_700_000_000_000,
        # frontend-owned nested data the backend must keep untouched:
        "checkin": None,
        "themes": ["refund-delay"],
        "comments": [{"id": "c1", "ts": 1, "by": "Skyline Travels", "type": "external", "text": "hi"}],
        "timeline": [{"ts": 1, "type": "created", "text": "Ticket created", "by": "Skyline Travels"}],
        "side": [],
        "escal": [],
    }
    t.update(over)
    return t


def make_user(uid="u1", **over):
    u = {"id": uid, "name": "Riya Sharma", "role": "Agent", "available": True, "regions": ["North India"], "rank": 3}
    u.update(over)
    return u


def make_seed(**over):
    seed = {
        "users": [make_user("u1"), make_user("u2", name="Arjun Nair"), make_user("l1", name="Anita Desai", role="Lead")],
        "tickets": [make_ticket("TKT-1001"), make_ticket("TKT-1002", priority="Low", status="Open", assigneeId="u1")],
        "archive": [make_ticket("TKT-0999", status="Closed")],
        "backlog": [{"id": "PB-101", "theme": "Refund delay"}],
        "seq": 1002,
        "retentionDays": 90,
    }
    seed.update(over)
    return seed
