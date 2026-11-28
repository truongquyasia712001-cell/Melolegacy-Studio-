import json
import tempfile
import unittest
from pathlib import Path
from orchestrator import (AgentRegistration, JsonlAudit, MemoryAudit,
                           MelobotConveyor, TaskState)
from memory import MemoryStore, MeloKnowledgeProvider


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

    def test_only_melobot_can_retrieve_knowledge(self):
        with tempfile.TemporaryDirectory() as directory:
            store = MemoryStore(Path(directory) / "memory.sqlite3")
            store.add(logical_key="music-core", title="Music Core",
                      content="PDF to MusicXML with teacher verification")
            bus = MelobotConveyor(self.audit, MeloKnowledgeProvider(store))
            with self.assertRaises(PermissionError):
                bus.retrieve_knowledge(requested_by="notation-agent",
                                       query="MusicXML")

    def test_melobot_retrieves_knowledge_and_audits_without_raw_query(self):
        with tempfile.TemporaryDirectory() as directory:
            store = MemoryStore(Path(directory) / "memory.sqlite3")
            store.add(logical_key="music-core", title="Music Core",
                      content="PDF to MusicXML with teacher verification")
            bus = MelobotConveyor(self.audit, MeloKnowledgeProvider(store))
            results = bus.retrieve_knowledge(requested_by="melobot",
                                             query="MusicXML")
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["logical_key"], "music-core")
            event = self.audit.events[-1]
            self.assertEqual(event["event"], "knowledge_retrieved")
            self.assertEqual(event["result_count"], 1)
            self.assertNotIn("query", event)

    def test_missing_knowledge_provider_fails_closed(self):
        with self.assertRaises(RuntimeError):
            self.bus.retrieve_knowledge(requested_by="melobot",
                                        query="architecture")

    def test_invalid_knowledge_request_is_rejected(self):
        with self.assertRaises(ValueError):
            self.bus.retrieve_knowledge(requested_by="melobot", query=" ")
        with self.assertRaises(ValueError):
            self.bus.retrieve_knowledge(requested_by="melobot",
                                        query="test", limit=0)


if __name__ == "__main__":
    unittest.main()
