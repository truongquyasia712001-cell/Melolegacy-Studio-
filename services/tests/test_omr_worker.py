"""Boundary tests for the internal OMR worker; the recognition CLI is mocked."""
from __future__ import annotations

import importlib.util
import os
import subprocess
import unittest
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
WORKER_PATH = ROOT / "services" / "omr-worker" / "app.py"
os.environ["MELOBOT_OMR_TOKEN"] = "unit-test-melobot-secret"
spec = importlib.util.spec_from_file_location("melo_omr_worker_test_app", WORKER_PATH)
worker = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(worker)

VALID_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><part-list/><part id="P1"><measure number="1">
<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
</measure></part></score-partwise>"""
EMPTY_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><part-list/><part id="P1"><measure number="1"/></part></score-partwise>"""


class OMRWorkerBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(worker.app)
        self.headers = {
            "X-Melobot-Token": "unit-test-melobot-secret",
            "X-Melobot-Task-Id": str(uuid4()),
        }

    def test_rejects_wrong_melobot_token(self):
        headers = dict(self.headers)
        headers["X-Melobot-Token"] = "wrong"
        response = self.client.post(
            "/v1/convert",
            files={"file": ("score.pdf", b"%PDF-1.7\\nsource", "application/pdf")},
            headers=headers,
        )
        self.assertEqual(response.status_code, 403)

    def test_rejects_invalid_pdf_signature(self):
        response = self.client.post(
            "/v1/convert",
            files={"file": ("score.pdf", b"not a PDF", "application/pdf")},
            headers=self.headers,
        )
        self.assertEqual(response.status_code, 400)

    def test_valid_pdf_returns_musicxml_marked_for_review(self):
        def fake_score_reader(command, **_kwargs):
            xml_path = Path(command[command.index("--musicxml") + 1])
            xml_path.write_bytes(VALID_XML)
            return subprocess.CompletedProcess(command, 0, "", "")

        with patch.object(worker.subprocess, "run", side_effect=fake_score_reader) as run:
            response = self.client.post(
                "/v1/convert",
                files={"file": ("score.pdf", b"%PDF-1.7\\nvalid-test-pdf", "application/pdf")},
                headers=self.headers,
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("X-OMR-Review-Required"), "true")
        self.assertIn(b"<score-partwise", response.content)
        self.assertEqual(run.call_count, 1)

    def test_rejects_empty_musicxml_result(self):
        def fake_score_reader(command, **_kwargs):
            xml_path = Path(command[command.index("--musicxml") + 1])
            xml_path.write_bytes(EMPTY_XML)
            return subprocess.CompletedProcess(command, 0, "", "")

        with patch.object(worker.subprocess, "run", side_effect=fake_score_reader):
            response = self.client.post(
                "/v1/convert",
                files={"file": ("score.pdf", b"%PDF-1.7\\nvalid-test-pdf", "application/pdf")},
                headers=self.headers,
            )

        self.assertEqual(response.status_code, 422)
        self.assertIn("empty score", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
