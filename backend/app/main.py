"""OpsDesk API.

Run (from the backend/ folder):
    uvicorn app.main:app --reload
then open http://127.0.0.1:8000, the API serves the frontend too, so the page
and the API share one origin and no CORS setup is needed.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .db import init_db, resolve_db_path
from .routes import state, tickets, users

DEFAULT_FRONTEND = Path(__file__).resolve().parents[2] / "frontend"
MAX_BODY_BYTES = 5_000_000


def create_app(db_path: str | os.PathLike | None = None, frontend_dir: str | os.PathLike | None = None) -> FastAPI:
    path = resolve_db_path(db_path)
    frontend = Path(frontend_dir or os.environ.get("OPSDESK_FRONTEND_DIR") or DEFAULT_FRONTEND)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        init_db(path)  # creates the file and tables on first start
        yield

    app = FastAPI(title="OpsDesk API", version="0.1.0", lifespan=lifespan)
    app.state.db_path = path

    @app.middleware("http")
    async def limit_body(request, call_next):
        length = request.headers.get("content-length", "")
        if length.isdigit() and int(length) > MAX_BODY_BYTES:
            return JSONResponse({"detail": "Payload too large"}, status_code=413)
        return await call_next(request)

    for router in (state.router, tickets.router, users.router):
        app.include_router(router, prefix="/api")

    # Registered last so /api/* always wins over the static files.
    if frontend.is_dir():
        app.mount("/", StaticFiles(directory=frontend, html=True), name="frontend")

    return app


app = create_app()
