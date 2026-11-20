# OpsDesk-tbo

OpsDesk · TBO Operations: a ticket desk for travel-agency support, with SLA timers,
automatic routing, escalations and insights.

```
frontend/     the web app (plain HTML/CSS/JS, no build step)
backend/      FastAPI + SQLite API that stores the data and also serves the frontend
opsdesk-pro/  the original ticket API and dashboard this backend was extended from
              (by debipriya-queen, MIT licensed). Its dashboard now runs on this backend,
              see "OpsDesk Pro" below
```

## Run it

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open <http://127.0.0.1:8000>. The sidebar chip should say **Synced with server**.
The database is created on first start at `backend/data/opsdesk.db` (set `OPSDESK_DB`
to put it elsewhere). On the very first start the app uploads its demo data once.
After that the server is the source of truth, and every open browser picks up
other people's changes within about 5 seconds.

Without the backend the frontend still works exactly as before on browser
localStorage (`python -m http.server 5500` inside `frontend/`).
If the server drops mid-session, the app keeps working and sends the changes when
it comes back.

## OpsDesk Pro

The OpsDesk Pro dashboard is served by the same backend at <http://127.0.0.1:8000/pro/>
and uses the same API and database as the TBO frontend, so a ticket raised there shows
up in the TBO frontend (in Triage, within ~5 seconds) and the other way round.

- A ticket sent without an id (`{title, description, priority}`, what the dashboard
  sends) gets the id `PRO-<n>`, the timestamps and the comments/timeline parts the TBO
  frontend needs. Priority and status are matched case-insensitively (`open` -> `Open`).
  Pro tickets have no agency, so Requesters do not see them; staff do.
- To bring over the tickets already in `opsdesk-pro/opsdesk.db` (id 11 becomes `PRO-11`):

  ```bash
  cd backend
  python scripts/import_opsdesk_pro.py      # safe to run again, it skips what is there
  ```

- The original `opsdesk-pro/Opsdesknew.py` still runs on its own database as before;
  the dashboard picks the right API from the address it is opened at.

## API

Interactive docs at <http://127.0.0.1:8000/docs>. Everything is under `/api`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/tickets` | List tickets. Filters: `status`, `priority`, `agencyId`, `assigneeId`, `archived=false\|true\|all`, `limit`, `offset` |
| POST | `/tickets` | Create a ticket (409 if the id exists). Without an id the server assigns `PRO-<n>` |
| GET | `/tickets/{id}` | One ticket with comments, timeline, side threads, escalations |
| PUT | `/tickets/{id}` | Create or replace a ticket |
| PATCH | `/tickets/{id}` | Change status `{"status": "Resolved", "by": "name"}`; writes a timeline entry. A ticket must be Resolved before it can be Closed |
| DELETE | `/tickets/{id}` | Delete a ticket |
| GET | `/users`, `/users/{id}` | Team members |
| PUT | `/users/{id}` | Create or update a user (e.g. availability) |
| GET | `/state` | The whole app state in one call |
| POST | `/state/seed` | First-time upload of demo data (409 once the team exists) |
| POST | `/sync` | Apply a batch of changes atomically (used by the frontend) |
| GET | `/revision` | Counter that increases on every write (used for polling) |
| GET | `/health` | Liveness |

The `/tickets` routes keep the same verbs, filters and response shapes as the
original `opsdesk-pro` API, extended with string ids and the full ticket document.

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Known limits

- No login or permissions on the API: the demo's "sign in" is a persona picker in
  the browser. Put it behind your own auth before exposing it beyond a trusted network.
- If two people edit the same ticket within the same few seconds, the later save wins
  for that ticket (the whole ticket is replaced, not merged field by field).
- SQLite, one server process. PostgreSQL is not connected.
