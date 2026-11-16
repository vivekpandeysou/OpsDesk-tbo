import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles  # 1. Add this import
from pydantic import BaseModel

app = FastAPI()

# 2. Add this mount line right here
app.mount("/static", StaticFiles(directory="static"), name="static")

DB_NAME = "opsdesk.db"

# Create the tickets table automatically if it doesn't exist
def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)

init_db()

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"

class TicketUpdate(BaseModel):
    status: str

@app.get("/")
def read_root():
    return {"message": "OpsDesk API is live with SQLite"}

@app.post("/tickets")
def create_ticket(ticket: TicketCreate):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.execute(
            "INSERT INTO tickets (title, description, priority, status) VALUES (?, ?, ?, ?)",
            (ticket.title, ticket.description, ticket.priority, "open")
        )
        ticket_id = cursor.lastrowid
    return {
        "status": "Ticket created",
        "ticket": {
            "id": ticket_id,
            "title": ticket.title,
            "description": ticket.description,
            "priority": ticket.priority,
            "status": "open"
        }
    }

@app.get("/tickets")
def get_tickets(status: str | None = None, priority: str | None = None):
    query = "SELECT id, title, description, priority, status FROM tickets WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if priority:
        query += " AND priority = ?"
        params.append(priority)

    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(query, params).fetchall()
    return [dict(row) for row in rows]
@app.patch("/tickets/{ticket_id}")
def update_ticket_status(ticket_id: int, update: TicketUpdate):
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            "UPDATE tickets SET status = ? WHERE id = ?",
            (update.status, ticket_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        updated = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
    return {"status": "Ticket updated", "ticket": dict(updated)}

@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        ticket = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,)).fetchone()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        conn.execute("DELETE FROM tickets WHERE id = ?", (ticket_id,))
    return {"status": "Ticket deleted", "ticket": dict(ticket)} 