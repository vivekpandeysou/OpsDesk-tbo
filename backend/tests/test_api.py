from conftest import make_seed, make_ticket, make_user


def seeded(client):
    r = client.post("/api/state/seed", json=make_seed())
    assert r.status_code == 201, r.text
    return r.json()["revision"]


# ------------------------------------------------------------- state and seed


def test_empty_database_reports_not_initialized(client):
    state = client.get("/api/state").json()
    assert state["initialized"] is False
    assert state["users"] == [] and state["tickets"] == [] and state["archive"] == []
    assert state["v"] == 1
    assert client.get("/api/health").json() == {"status": "ok", "initialized": False}


def test_seed_then_state_has_the_shape_the_frontend_expects(client):
    seeded(client)
    s = client.get("/api/state").json()
    assert s["initialized"] is True
    assert [u["id"] for u in s["users"]] == ["u1", "u2", "l1"]
    assert [t["id"] for t in s["tickets"]] == ["TKT-1001", "TKT-1002"]  # order preserved
    assert [t["id"] for t in s["archive"]] == ["TKT-0999"]
    assert s["seq"] == 1002 and s["retentionDays"] == 90
    assert s["backlog"] == [{"id": "PB-101", "theme": "Refund delay"}]


def test_seed_is_refused_when_data_exists(client):
    seeded(client)
    r = client.post("/api/state/seed", json=make_seed(tickets=[]))
    assert r.status_code == 409
    assert len(client.get("/api/state").json()["tickets"]) == 2  # untouched


def test_nested_frontend_data_round_trips_untouched(client):
    seeded(client)
    t = client.get("/api/tickets/TKT-1001").json()
    original = make_ticket("TKT-1001")
    assert t == original


# ------------------------------------------------------------------- tickets


def test_create_ticket_goes_to_the_front_and_duplicate_is_rejected(client):
    seeded(client)
    r = client.post("/api/tickets", json=make_ticket("TKT-1003"))
    assert r.status_code == 201 and r.json()["status"] == "Ticket created"
    assert [t["id"] for t in client.get("/api/tickets").json()] == ["TKT-1003", "TKT-1001", "TKT-1002"]
    assert client.post("/api/tickets", json=make_ticket("TKT-1003")).status_code == 409


def test_validation_rejects_bad_input(client):
    assert client.post("/api/tickets", json=make_ticket(priority="Critical")).status_code == 422
    assert client.post("/api/tickets", json=make_ticket(status="Done")).status_code == 422
    assert client.post("/api/tickets", json=make_ticket(tid="bad id!")).status_code == 422
    assert client.post("/api/tickets", json=make_ticket(title="")).status_code == 422
    assert client.get("/api/tickets?status=Nope").status_code == 422


def test_filters_work_like_the_original_plus_more(client):
    seeded(client)
    assert [t["id"] for t in client.get("/api/tickets?status=Open").json()] == ["TKT-1002"]
    assert [t["id"] for t in client.get("/api/tickets?priority=High").json()] == ["TKT-1001"]
    assert [t["id"] for t in client.get("/api/tickets?assigneeId=u1").json()] == ["TKT-1002"]
    assert [t["id"] for t in client.get("/api/tickets?agencyId=a1").json()] == ["TKT-1001", "TKT-1002"]
    assert [t["id"] for t in client.get("/api/tickets?archived=true").json()] == ["TKT-0999"]
    assert len(client.get("/api/tickets?archived=all").json()) == 3
    assert len(client.get("/api/tickets?limit=1&offset=1").json()) == 1


def test_patch_status_writes_an_audit_entry(client):
    seeded(client)
    r = client.patch("/api/tickets/TKT-1001", json={"status": "Open", "by": "Riya Sharma"})
    assert r.status_code == 200
    t = r.json()["ticket"]
    assert t["status"] == "Open"
    assert t["timeline"][-1]["text"] == "Status New → Open" and t["timeline"][-1]["by"] == "Riya Sharma"
    assert client.get("/api/tickets/TKT-1001").json()["status"] == "Open"  # persisted


def test_cannot_close_a_ticket_that_is_not_resolved(client):
    seeded(client)
    assert client.patch("/api/tickets/TKT-1001", json={"status": "Closed"}).status_code == 409
    assert client.patch("/api/tickets/TKT-1001", json={"status": "Resolved"}).status_code == 200
    assert client.patch("/api/tickets/TKT-1001", json={"status": "Closed"}).status_code == 200


def test_patch_and_delete_unknown_ticket_are_404(client):
    assert client.patch("/api/tickets/NOPE", json={"status": "Open"}).status_code == 404
    assert client.delete("/api/tickets/NOPE").status_code == 404
    assert client.get("/api/tickets/NOPE").status_code == 404


def test_put_replaces_but_keeps_position_and_archive_flag(client):
    seeded(client)
    changed = make_ticket("TKT-1001", title="Updated title", status="Pending")
    r = client.put("/api/tickets/TKT-1001", json=changed)
    assert r.status_code == 200 and r.json()["status"] == "Ticket updated"
    assert [t["id"] for t in client.get("/api/tickets").json()] == ["TKT-1001", "TKT-1002"]
    assert client.get("/api/tickets/TKT-1001").json()["title"] == "Updated title"
    # archived ticket stays archived when `archived` is not passed
    client.put("/api/tickets/TKT-0999", json=make_ticket("TKT-0999", status="Closed", title="Still archived"))
    assert [t["id"] for t in client.get("/api/tickets?archived=true").json()] == ["TKT-0999"]


def test_put_with_mismatching_ids_is_rejected(client):
    assert client.put("/api/tickets/TKT-1", json=make_ticket("TKT-2")).status_code == 400


def test_delete_returns_the_ticket_and_removes_it(client):
    seeded(client)
    r = client.delete("/api/tickets/TKT-1002")
    assert r.status_code == 200 and r.json()["ticket"]["id"] == "TKT-1002"
    assert client.get("/api/tickets/TKT-1002").status_code == 404


# --------------------------------------------------------------------- users


def test_user_update_keeps_team_order(client):
    seeded(client)
    r = client.put("/api/users/u1", json=make_user("u1", available=False))
    assert r.status_code == 200
    users = client.get("/api/users").json()
    assert [u["id"] for u in users] == ["u1", "u2", "l1"]
    assert users[0]["available"] is False
    assert client.get("/api/users/zzz").status_code == 404
    assert client.put("/api/users/u1", json=make_user("u2")).status_code == 400
    assert client.put("/api/users/u1", json={**make_user("u1"), "role": "Boss"}).status_code == 422


# ---------------------------------------------------------------------- sync


def test_sync_applies_everything_in_one_batch(client):
    seeded(client)
    new = make_ticket("TKT-1003", title="Brand new ticket")
    changed = make_ticket("TKT-1002", status="Resolved", priority="Low", assigneeId="u1")
    batch = {
        "tickets_upsert": [{"ticket": new, "archived": False}, {"ticket": changed, "archived": False}],
        "tickets_delete": ["TKT-1001"],
        "users_upsert": [make_user("u2", name="Arjun Nair", available=False)],
        "backlog": [],
        "seq": 1003,
        "retentionDays": 30,
    }
    r = client.post("/api/sync", json=batch)
    assert r.status_code == 200
    assert r.json()["upserted"] == 2 and r.json()["deleted"] == 1
    s = client.get("/api/state").json()
    assert {t["id"] for t in s["tickets"]} == {"TKT-1002", "TKT-1003"}
    assert next(t for t in s["tickets"] if t["id"] == "TKT-1002")["status"] == "Resolved"
    assert next(u for u in s["users"] if u["id"] == "u2")["available"] is False
    assert s["seq"] == 1003 and s["retentionDays"] == 30 and s["backlog"] == []


def test_sync_is_idempotent_so_a_retry_is_safe(client):
    seeded(client)
    batch = {"tickets_upsert": [{"ticket": make_ticket("TKT-1003"), "archived": False}], "tickets_delete": ["TKT-1001"]}
    client.post("/api/sync", json=batch)
    client.post("/api/sync", json=batch)
    ids = [t["id"] for t in client.get("/api/state").json()["tickets"]]
    assert sorted(ids) == ["TKT-1002", "TKT-1003"]


def test_sync_can_archive_and_restore(client):
    seeded(client)
    t = make_ticket("TKT-1001")
    client.post("/api/sync", json={"tickets_upsert": [{"ticket": t, "archived": True}]})
    s = client.get("/api/state").json()
    assert "TKT-1001" in [x["id"] for x in s["archive"]]
    assert "TKT-1001" not in [x["id"] for x in s["tickets"]]
    client.post("/api/sync", json={"tickets_upsert": [{"ticket": t, "archived": False}]})
    assert "TKT-1001" in [x["id"] for x in client.get("/api/state").json()["tickets"]]


def test_invalid_item_in_a_batch_applies_nothing(client):
    seeded(client)
    good = make_ticket("TKT-1003")
    bad = make_ticket("TKT-1004", priority="Critical")
    r = client.post(
        "/api/sync",
        json={"tickets_upsert": [{"ticket": good, "archived": False}, {"ticket": bad, "archived": False}], "tickets_delete": ["TKT-1001"]},
    )
    assert r.status_code == 422
    ids = [t["id"] for t in client.get("/api/state").json()["tickets"]]
    assert ids == ["TKT-1001", "TKT-1002"]


# ------------------------------------------------------------------ revision


def test_revision_moves_on_writes_and_not_on_reads(client):
    r0 = seeded(client)
    assert client.get("/api/revision").json()["revision"] == r0
    client.get("/api/state")
    client.get("/api/tickets")
    assert client.get("/api/revision").json()["revision"] == r0
    client.patch("/api/tickets/TKT-1001", json={"status": "Open"})
    r1 = client.get("/api/revision").json()["revision"]
    assert r1 == r0 + 1
    client.post("/api/sync", json={})
    assert client.get("/api/revision").json()["revision"] == r1 + 1
    client.patch("/api/tickets/NOPE", json={"status": "Open"})  # failed write does not count
    assert client.get("/api/revision").json()["revision"] == r1 + 1


# ------------------------------------------------------------ serving / limits


def test_api_serves_the_frontend_and_api_routes_win(client):
    page = client.get("/")
    assert page.status_code == 200 and "frontend" in page.text
    assert client.get("/api/health").json()["status"] == "ok"
    assert client.get("/api/nothing-here").status_code == 404


def test_oversized_payload_is_refused(client):
    r = client.post("/api/sync", content=b"{}", headers={"content-length": "9000000", "content-type": "application/json"})
    assert r.status_code == 413
