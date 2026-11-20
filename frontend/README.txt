OpsDesk · TBO Operations — Premium Frontend Demo

Run with the backend (data is stored on the server, shared by everyone):
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload
Open:
  http://127.0.0.1:8000
The backend serves this folder too, so the page and the API share one address.
The sidebar chip shows "Synced with server" when the connection works.

Run frontend-only (no server, data stays in this browser):
  python -m http.server 5500
Open:
  http://localhost:5500
The sidebar chip then shows "Local demo data · server not connected".

Includes:
- White-first dashboard with subtle colour accents and refined typography.
- Premium 3D Journey cards with a four-colour gradient (no Microsoft logo/branding).
- Personalized greeting based on the signed-in demo persona.
- Prakash and Vivek listed as Escalation Managers, not Requesters.
- Original bundled Halloween-inspired ambient loop; click Play once to start.
  Browser autoplay is blocked until a user gesture. Volume defaults to 12%.
- With the backend: tickets, notes, assignments and team availability are saved to
  the server (SQLite) and other open browsers pick up changes within ~5 seconds.
- Without the backend: demo data persists in browser localStorage, as before.
- If the server goes away mid-session the app keeps working and sends the
  changes when the server is back. If the server is down when the page loads,
  the page runs on local data until you reload it.

PostgreSQL is not connected (the backend uses SQLite).
