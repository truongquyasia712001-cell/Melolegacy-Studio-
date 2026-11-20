"""Melobot-controlled task conveyor for MeloLegacy specialist agents.

This is an execution boundary, not an AI model or a production service.
Specialists can only run when Melobot explicitly dispatches a task.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
import json
from pathlib import Path
from typing import Any, Protocol
from uuid import uuid4


class TaskState(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass(frozen=True)
class Task:
    task_id: str
    capability: str
    payload: dict[str, Any]
    issued_by: str
    assigned_agent: str | None = None
    state: TaskState = TaskState.QUEUED
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class TaskResult:
    task_id: str
    state: TaskState
    output: dict[str, Any] | None = None
    error: str | None = None


class Specialist(Protocol):
    def execute(self, task: Task) -> dict[str, Any]: ...


class AuditSink(Protocol):
    def append(self, event: dict[str, Any]) -> None: ...


class MemoryAudit:
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    def append(self, event: dict[str, Any]) -> None:
        self.events.append(dict(event))


class JsonlAudit:
    """Append-only local audit log. The parent directory must be pre-created."""
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)

    def append(self, event: dict[str, Any]) -> None:
        with self.path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(event, ensure_ascii=False, sort_keys=True) + "\\n")


@dataclass(frozen=True)
class AgentRegistration:
    agent_id: str
    capabilities: frozenset[str]
    specialist: Specialist
    internal_only: bool = True


class MelobotConveyor:
    """The sole task issuer and dispatcher for specialist Melo Agents."""
    AUTHORITY = "melobot"

    def __init__(self, audit: AuditSink | None = None) -> None:
        self._agents: dict[str, AgentRegistration] = {}
        self._tasks: dict[str, Task] = {}
        self.audit = audit or MemoryAudit()

    def register_agent(self, registration: AgentRegistration) -> None:
        if not registration.internal_only:
            raise PermissionError("Specialist agents must be internal-only.")
        if not registration.agent_id or not registration.capabilities:
            raise ValueError("Agent id and at least one capability are required.")
        if registration.agent_id in self._agents:
            raise ValueError("Agent is already registered.")
        self._agents[registration.agent_id] = registration
        self._record("agent_registered", agent_id=registration.agent_id,
                     capabilities=sorted(registration.capabilities))

    def issue_task(self, *, issued_by: str, capability: str,
                   payload: dict[str, Any]) -> Task:
        if issued_by != self.AUTHORITY:
            raise PermissionError("Only Melobot may issue specialist tasks.")
        if not capability.strip() or not isinstance(payload, dict):
            raise ValueError("A capability and object payload are required.")
        task = Task(task_id=str(uuid4()), capability=capability,
                    payload=dict(payload), issued_by=issued_by)
        self._tasks[task.task_id] = task
        self._record("task_queued", task_id=task.task_id, capability=capability)
        return task

    def dispatch(self, *, dispatched_by: str, task_id: str,
                 agent_id: str) -> TaskResult:
        if dispatched_by != self.AUTHORITY:
            raise PermissionError("Only Melobot may dispatch specialist agents.")
        if task_id not in self._tasks:
            raise KeyError("Unknown task.")
        task = self._tasks[task_id]
        if task.state is not TaskState.QUEUED:
            raise RuntimeError("Only queued tasks may be dispatched.")
        agent = self._agents.get(agent_id)
        if agent is None:
            raise KeyError("Agent is not registered.")
        if task.capability not in agent.capabilities:
            raise PermissionError("Agent is not authorized for this capability.")

        running = Task(**{**asdict(task), "state": TaskState.RUNNING,
                          "assigned_agent": agent_id})
        self._tasks[task_id] = running
        self._record("task_started", task_id=task_id, agent_id=agent_id)
        try:
            output = agent.specialist.execute(running)
            if not isinstance(output, dict):
                raise TypeError("Specialist output must be a JSON-like object.")
            completed = Task(**{**asdict(running), "state": TaskState.COMPLETED})
            self._tasks[task_id] = completed
            self._record("task_completed", task_id=task_id, agent_id=agent_id)
            return TaskResult(task_id, TaskState.COMPLETED, output=output)
        except Exception as exc:
            failed = Task(**{**asdict(running), "state": TaskState.FAILED})
            self._tasks[task_id] = failed
            self._record("task_failed", task_id=task_id, agent_id=agent_id,
                         error_type=type(exc).__name__)
            return TaskResult(task_id, TaskState.FAILED, error=type(exc).__name__)

    def get_task(self, task_id: str) -> Task:
        return self._tasks[task_id]

    def pending_tasks(self) -> tuple[Task, ...]:
        return tuple(task for task in self._tasks.values()
                     if task.state is TaskState.QUEUED)

    def _record(self, event_type: str, **fields: Any) -> None:
        self.audit.append({"event": event_type,
                           "timestamp": datetime.now(timezone.utc).isoformat(),
                           **fields})
