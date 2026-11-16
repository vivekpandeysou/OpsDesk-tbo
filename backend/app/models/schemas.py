"""Request/response models.

Tickets and users use `extra="allow"`: the frontend owns the shape of the nested
parts (comments, timeline, side conversations, escalations, routing...) and the
backend stores them untouched. Only the fields the backend filters or enforces
rules on are validated here.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

ID_PATTERN = r"^[A-Za-z0-9._-]{1,40}$"

Priority = Literal["Urgent", "High", "Medium", "Low"]
Status = Literal["New", "Open", "Pending", "Escalated", "Resolved", "Closed"]
Role = Literal["Agent", "Escalation Manager", "Lead", "Requester"]


class TicketIn(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(pattern=ID_PATTERN)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    priority: Priority
    status: Status
    agencyId: str | None = None
    tboh: str = Field(default="", max_length=40)
    intent: str = Field(default="general", max_length=40)
    region: str = Field(default="", max_length=60)
    assigneeId: str | None = None
    created: int = Field(ge=0)
    updated: int = Field(ge=0)


class UserIn(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(pattern=ID_PATTERN)
    name: str = Field(min_length=1, max_length=100)
    role: Role


class StatusPatch(BaseModel):
    """Same body as the original opsdesk-pro PATCH /tickets/{id}, plus an optional actor."""

    status: Status
    by: str = Field(default="API", max_length=100)


class TicketUpsert(BaseModel):
    ticket: TicketIn
    archived: bool = False


class SyncIn(BaseModel):
    """One batch of changes from the frontend, applied in a single transaction."""

    tickets_upsert: list[TicketUpsert] = Field(default_factory=list, max_length=2000)
    tickets_delete: list[str] = Field(default_factory=list, max_length=2000)
    users_upsert: list[UserIn] = Field(default_factory=list, max_length=500)
    backlog: list[dict[str, Any]] | None = None
    seq: int | None = Field(default=None, ge=0)
    retentionDays: int | None = Field(default=None, ge=0, le=3650)


class SeedIn(BaseModel):
    """Full initial state, accepted only while the database is empty."""

    users: list[UserIn] = Field(max_length=500)
    tickets: list[TicketIn] = Field(default_factory=list, max_length=2000)
    archive: list[TicketIn] = Field(default_factory=list, max_length=2000)
    backlog: list[dict[str, Any]] = Field(default_factory=list)
    seq: int = Field(default=1000, ge=0)
    retentionDays: int = Field(default=90, ge=0, le=3650)
