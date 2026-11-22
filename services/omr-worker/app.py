"""Internal OMR worker adapter. Only Melobot's private service gateway may call it."""
from __future__ import annotations
import hmac, os, shutil, subprocess, tempfile
from pathlib import Path
from typing import Annotated
from uuid import UUID
import xml.etree.ElementTree as ET
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

app = FastAPI(title="MeloLegacy internal OMR worker", docs_url=None, redoc_url=None)
MAX_PDF_BYTES = 25 * 1024 * 1024
TIMEOUT_SECONDS = 600
TOKEN = os.environ.get("MELOBOT_OMR_TOKEN", "")

def require_melobot(token: str, task_id: str) -> None:
    if not TOKEN:
        raise HTTPException(status_code=503, detail="OMR worker is not configured.")
    if not hmac.compare_digest(token, TOKEN):
        raise HTTPException(status_code=403, detail="Melobot authorization required.")
    try:
        UUID(task_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="A valid Melobot task ID is required.") from exc

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "role": "internal-omr-worker"}

@app.post("/v1/convert")
async def convert_pdf(
    file: Annotated[UploadFile, File(...)],
    x_melobot_token: Annotated[str, Header()],
    x_melobot_task_id: Annotated[str, Header()],
):
    require_melobot(x_melobot_token, x_melobot_task_id)
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Only PDF files are accepted.")
    workdir = Path(tempfile.mkdtemp(prefix="melo-omr-"))
    input_pdf, output_json, output_xml = workdir / "source.pdf", workdir / "reading.json", workdir / "recognized.musicxml"
    size = 0
    try:
        with input_pdf.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_PDF_BYTES:
                    raise HTTPException(status_code=413, detail="PDF exceeds 25 MB.")
                destination.write(chunk)
        if size < 8 or input_pdf.read_bytes()[:5] != b"%PDF-":
            raise HTTPException(status_code=400, detail="Invalid PDF file.")
        command = ["score-reader", str(input_pdf), "-o", str(output_json), "--musicxml", str(output_xml)]
        try:
            completed = subprocess.run(command, cwd=workdir, capture_output=True, text=True, timeout=TIMEOUT_SECONDS, check=False)
        except subprocess.TimeoutExpired as exc:
            raise HTTPException(status_code=504, detail="OMR processing timed out.") from exc
        if completed.returncode != 0 or not output_xml.is_file():
            raise HTTPException(status_code=422, detail="OMR could not produce MusicXML for this PDF.")
        try:
            root = ET.parse(output_xml).getroot()
        except ET.ParseError as exc:
            raise HTTPException(status_code=502, detail="OMR produced invalid MusicXML.") from exc
        if root.tag.split("}")[-1] not in {"score-partwise", "score-timewise"}:
            raise HTTPException(status_code=502, detail="OMR output is not a MusicXML score.")
        return FileResponse(output_xml, media_type="application/vnd.recordare.musicxml+xml",
            filename="melolegacy-recognized.musicxml",
            headers={"X-OMR-Review-Required":"true","X-Melobot-Task-Id":x_melobot_task_id},
            background=BackgroundTask(shutil.rmtree, workdir, True))
    except Exception:
        if workdir.exists():
            shutil.rmtree(workdir, ignore_errors=True)
        raise
    finally:
        await file.close()
