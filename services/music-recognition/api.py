"""Local Melo Legacy music-recognition sidecar.

Run with:
  python -m pip install -r requirements.txt
  uvicorn api:app --host 0.0.0.0 --port 8000

The service processes uploads locally and deletes temporary files after each request.
"""
from __future__ import annotations

import base64
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="MELO Music Recognition API", version="0.1.0")

allowed_origins = [
    item.strip()
    for item in os.getenv("MELO_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
OMR_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}
AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".ogg", ".flac"}


def require_command(name: str, install_hint: str) -> str:
    path = shutil.which(name)
    if not path:
        raise HTTPException(status_code=503, detail=f"Chưa cài {name}. {install_hint}")
    return path


async def save_upload(upload: UploadFile, folder: Path, allowed: set[str]) -> Path:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in allowed:
        raise HTTPException(status_code=415, detail=f"Định dạng không được hỗ trợ: {suffix or 'không rõ'}")
    destination = folder / ("input" + suffix)
    size = 0
    with destination.open("wb") as output:
        while chunk := await upload.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="Tệp vượt quá giới hạn 50 MB.")
            output.write(chunk)
    if size == 0:
        raise HTTPException(status_code=400, detail="Tệp tải lên rỗng.")
    return destination


def run_engine(command: list[str], timeout: int = 600) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="Bộ nhận dạng quá thời gian xử lý. Hãy thử tệp ngắn hơn hoặc ít trang hơn.") from exc


@app.get("/api/health")
def health() -> dict[str, str | bool]:
    return {
        "ok": True,
        "omr_installed": shutil.which("score-reader") is not None,
        "audio_installed": shutil.which("basic-pitch") is not None,
    }


@app.post("/api/recognize/omr")
async def recognize_score(file: UploadFile = File(...)) -> JSONResponse:
    with tempfile.TemporaryDirectory(prefix="melo-omr-") as temp:
        folder = Path(temp)
        source = await save_upload(file, folder, OMR_EXTENSIONS)
        executable = require_command(
            "score-reader",
            "Cài score-reader[pdf], Python 3.10/3.11 và Java 17+ theo hướng dẫn trong services/music-recognition/README.md.",
        )
        json_output = folder / "recognized.json"
        xml_output = folder / "recognized.musicxml"
        midi_output = folder / "recognized.mid"
        result = run_engine([
            executable, str(source), "--output", str(json_output),
            "--musicxml", str(xml_output), "--midi", str(midi_output),
        ])
        if result.returncode != 0 or not xml_output.exists():
            detail = (result.stderr or result.stdout or "Engine không tạo được MusicXML.")[-3000:]
            raise HTTPException(status_code=422, detail=detail)
        xml = xml_output.read_text(encoding="utf-8")
        midi = base64.b64encode(midi_output.read_bytes()).decode("ascii") if midi_output.exists() else None
        return JSONResponse({
            "engine": "Score-OMR",
            "musicxml": xml,
            "midi_base64": midi,
            "warnings": [line for line in (result.stderr or "").splitlines() if line.strip()][-12:],
        })


@app.post("/api/recognize/audio")
async def recognize_audio(file: UploadFile = File(...)) -> JSONResponse:
    with tempfile.TemporaryDirectory(prefix="melo-audio-") as temp:
        folder = Path(temp)
        source = await save_upload(file, folder, AUDIO_EXTENSIONS)
        executable = require_command(
            "basic-pitch",
            "Cài basic-pitch theo hướng dẫn trong services/music-recognition/README.md.",
        )
        output = folder / "midi"
        output.mkdir()
        result = run_engine([executable, str(output), str(source)], timeout=900)
        midi_files = sorted(output.glob("*.mid"))
        if result.returncode != 0 or not midi_files:
            detail = (result.stderr or result.stdout or "Basic Pitch không tạo được MIDI.")[-3000:]
            raise HTTPException(status_code=422, detail=detail)
        midi = base64.b64encode(midi_files[0].read_bytes()).decode("ascii")
        return JSONResponse({
            "engine": "Spotify Basic Pitch",
            "midi_base64": midi,
            "warnings": [
                "Kết quả là bản nháp MIDI tự động; cần nghe lại và chỉnh sửa nốt, trường độ, bè.",
                "Basic Pitch phù hợp nhất với bản thu một nhạc cụ/nguồn âm thanh nổi trội.",
            ],
        })
