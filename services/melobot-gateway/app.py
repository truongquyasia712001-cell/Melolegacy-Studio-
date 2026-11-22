"""Melobot's same-origin PDF→MusicXML gateway.

The PWA calls this endpoint. Melobot creates and dispatches one scoped task;
the specialist only calls the private OMR worker and returns the result.
Deploy behind the authenticated MeloLegacy application ingress.
"""
from __future__ import annotations
import os, shutil, tempfile
from pathlib import Path
from typing import Annotated
from uuid import uuid4
import httpx
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from orchestrator import AgentRegistration, MelobotConveyor, Task, TaskState

WORKER_URL = os.environ.get("MELO_OMR_WORKER_URL", "").rstrip("/")
WORKER_TOKEN = os.environ.get("MELOBOT_OMR_TOKEN", "")
MAX_PDF_BYTES = 25 * 1024 * 1024

class OMRWorkerAgent:
    """Internal specialist adapter. No public internet or arbitrary URL input."""
    def execute(self, task: Task) -> dict:
        if not WORKER_URL or not WORKER_TOKEN:
            raise RuntimeError("Private OMR worker is not configured")
        source = Path(task.payload["pdf_path"])
        output = Path(task.payload["output_path"])
        with source.open("rb") as stream:
            response = httpx.post(
                WORKER_URL + "/v1/convert",
                files={"file": (source.name, stream, "application/pdf")},
                headers={"X-Melobot-Token": WORKER_TOKEN,
                         "X-Melobot-Task-Id": task.task_id},
                timeout=620.0,
            )
        response.raise_for_status()
        if response.headers.get("X-OMR-Review-Required") != "true":
            raise RuntimeError("OMR worker did not mark output for review")
        output.write_bytes(response.content)
        return {"musicxml_path": str(output), "review_required": True}

app = FastAPI(title="Melobot Composer Gateway", docs_url=None, redoc_url=None)
conveyor = MelobotConveyor()
conveyor.register_agent(AgentRegistration(
    "composer-omr-worker", frozenset({"document.pdf_to_musicxml"}),
    OMRWorkerAgent(), internal_only=True,
))

@app.get("/health")
def health():
    return {"status": "ok", "role": "melobot-composer-gateway"}

@app.post("/api/melobot/composer/omr")
async def pdf_to_musicxml(
    file: Annotated[UploadFile, File(...)],
    x_melo_user_id: Annotated[str, Header()],
):
    # This header must be injected by the trusted, authenticated MeloLegacy
    # ingress; direct public access to this service is prohibited.
    if not x_melo_user_id.strip():
        raise HTTPException(status_code=401, detail="MeloLegacy sign-in required.")
    if not WORKER_URL or not WORKER_TOKEN:
        raise HTTPException(status_code=503, detail="Melobot OMR worker is not configured.")
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Only PDF files are accepted.")
    workdir = Path(tempfile.mkdtemp(prefix="melobot-task-"))
    source, output = workdir / "source.pdf", workdir / "recognized.musicxml"
    try:
        size = 0
        with source.open("wb") as target:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_PDF_BYTES:
                    raise HTTPException(status_code=413, detail="PDF exceeds 25 MB.")
                target.write(chunk)
        if size < 8 or source.read_bytes()[:5] != b"%PDF-":
            raise HTTPException(status_code=400, detail="Invalid PDF file.")

        # The executive authority creates and dispatches the task. The worker
        # cannot self-start, reassign, or create another task.
        task = conveyor.issue_task(
            issued_by="melobot",
            capability="document.pdf_to_musicxml",
            payload={"pdf_path": str(source), "output_path": str(output)},
        )
        result = conveyor.dispatch(
            dispatched_by="melobot", task_id=task.task_id,
            agent_id="composer-omr-worker",
        )
        if result.state is not TaskState.COMPLETED or not output.is_file():
            raise HTTPException(status_code=422, detail="Melobot could not produce MusicXML. Review the source PDF.")
        return FileResponse(
            output, media_type="application/vnd.recordare.musicxml+xml",
            filename="melolegacy-recognized.musicxml",
            headers={"X-OMR-Review-Required": "true", "X-Melobot-Task-Id": task.task_id},
            background=BackgroundTask(shutil.rmtree, workdir, True),
        )
    except Exception:
        if workdir.exists():
            shutil.rmtree(workdir, ignore_errors=True)
        raise
    finally:
        await file.close()
