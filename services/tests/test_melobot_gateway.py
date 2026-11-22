"""Tests for Melobot's same-origin gateway and scoped task dispatch."""
from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ai" / "core"))
GATEWAY_PATH = ROOT / "services" / "melobot-gateway" / "app.py"
spec = importlib.util.spec_from_file_location("melo_gateway_test_app", GATEWAY_PATH)
gateway = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(gateway)

from orchestrator import TaskResult, TaskState  # noqa: E402

VALID_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><part-list/><part id="P1"/></score-partwise>"""
VALID_PDF = b"%PDF-1.7\nvalid-test-pdf"


class MelobotGatewayTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(gateway.app)
        self.headers = {"X-Melo-User-Id": "verified-test-user"}
        self.file = {"file": ("score.pdf", VALID_PDF, "application/pdf")}

    def test_rejects_missing_trusted_user_identity(self):
        response = self.client.post(
            "/api/melobot/composer/omr",
            files=self.file,
            headers={"X-Melo-User-Id": "   "},
        )
        self.assertEqual(response.status_code, 401)

    def test_fails_closed_when_worker_is_not_configured(self):
        with patch.object(gateway, "WORKER_URL", ""), patch.object(
            gateway, "WORKER_TOKEN", ""
        ):
            response = self.client.post(
                "/api/melobot/composer/omr", files=self.file, headers=self.headers
            )
        self.assertEqual(response.status_code, 503)

    def test_issues_scoped_task_and_returns_review_required_musicxml(self):
        dispatched = []

        def fake_dispatch(*, dispatched_by, task_id, agent_id):
            task = gateway.conveyor._tasks[task_id]
            Path(task.payload["output_path"]).write_bytes(VALID_XML)
            dispatched.append((dispatched_by, task.capability, agent_id))
            return TaskResult(
                task_id=task_id,
                state=TaskState.COMPLETED,
                output={"musicxml_path": task.payload["output_path"]},
            )

        with patch.object(gateway, "WORKER_URL", "http://omr-worker.internal"), patch.object(
            gateway, "WORKER_TOKEN", "test-worker-secret"
        ), patch.object(gateway.conveyor, "dispatch", side_effect=fake_dispatch):
            response = self.client.post(
                "/api/melobot/composer/omr", files=self.file, headers=self.headers
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("X-OMR-Review-Required"), "true")
        self.assertIn(b"<score-partwise", response.content)
        self.assertEqual(
            dispatched,
            [("melobot", "document.pdf_to_musicxml", "composer-omr-worker")],
        )


if __name__ == "__main__":
    unittest.main()
