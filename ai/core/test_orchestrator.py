import json
import tempfile
import unittest
from pathlib import Path
from orchestrator import (AgentRegistration, JsonlAudit, MemoryAudit,
                           MelobotConveyor, TaskState)


class EchoAgent:
    def execute(self, task):
        return {"received": task.payload["text"]}


class BrokenAgent:
    def execute(self, task):
        raise ValueError("test failure")


class ConveyorTests(unittest.TestCase):
    def setUp(self):
        self.audit = MemoryAudit()
        self.bus = MelobotConveyor(self.audit)
        self.bus.register_agent(AgentRegistration("notation-agent",
            frozenset({"notation.recognize"}), EchoAgent()))

    def test_only_melobot_can_issue(self):
        with self.assertRaises(PermissionError):
            self.bus.issue_task(issued_by="specialist-agent",
                capability="notation.recognize", payload={})

    def test_only_melobot_can_dispatch(self):
        task = self.bus.issue_task(issued_by="melobot",
            capability="notation.recognize", payload={"text": "C4"})
        with self.assertRaises(PermissionError):
            self.bus.dispatch(dispatched_by="notation-agent",
                task_id=task.task_id, agent_id="notation-agent")

    def test_agent_runs_only_after_dispatch(self):
        task = self.bus.issue_task(issued_by="melobot",
            capability="notation.recognize", payload={"text": "C4"})
        self.assertEqual(self.bus.get_task(task.task_id).state, TaskState.QUEUED)
        result = self.bus.dispatch(dispatched_by="melobot",
            task_id=task.task_id, agent_id="notation-agent")
        self.assertEqual(result.state, TaskState.COMPLETED)
        self.assertEqual(result.output, {"received": "C4"})

    def test_capability_is_enforced(self):
        task = self.bus.issue_task(issued_by="melobot",
            capability="audio.transcribe", payload={})
        with self.assertRaises(PermissionError):
            self.bus.dispatch(dispatched_by="melobot",
                task_id=task.task_id, agent_id="notation-agent")

    def test_specialists_must_be_internal_only(self):
        with self.assertRaises(PermissionError):
            self.bus.register_agent(AgentRegistration("external-agent",
                frozenset({"notation.recognize"}), EchoAgent(), internal_only=False))

    def test_failed_agent_is_recorded_and_not_retried(self):
        self.bus.register_agent(AgentRegistration("broken-agent",
            frozenset({"audio.transcribe"}), BrokenAgent()))
        task = self.bus.issue_task(issued_by="melobot",
            capability="audio.transcribe", payload={})
        result = self.bus.dispatch(dispatched_by="melobot",
            task_id=task.task_id, agent_id="broken-agent")
        self.assertEqual(result.state, TaskState.FAILED)
        self.assertEqual(self.bus.get_task(task.task_id).state, TaskState.FAILED)
        with self.assertRaises(RuntimeError):
            self.bus.dispatch(dispatched_by="melobot",
                task_id=task.task_id, agent_id="broken-agent")
        self.assertEqual(self.audit.events[-1]["event"], "task_failed")


    def test_jsonl_audit_appends_parseable_event_per_line(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "events.jsonl"
            audit = JsonlAudit(path)
            audit.append({"event": "queued", "task_id": "t1"})
            audit.append({"event": "started", "task_id": "t1"})
            lines = path.read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(lines), 2)
            self.assertEqual([json.loads(line)["event"] for line in lines],
                             ["queued", "started"])


if __name__ == "__main__":
    unittest.main()
