import tempfile
import unittest
from pathlib import Path

from memory import MemoryStore, MeloKnowledgeProvider


class MemoryStoreTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.store = MemoryStore(Path(self.tempdir.name) / "memory.sqlite3")

    def tearDown(self):
        self.tempdir.cleanup()

    def test_add_is_versioned_and_preserves_history(self):
        first = self.store.add(logical_key="architecture", title="Architecture", content="Central management")
        second = self.store.add(logical_key="architecture", title="Architecture", content="Central management, distributed data")
        self.assertEqual((first.version, second.version), (1, 2))
        self.assertEqual(second.supersedes_id, first.record_id)
        self.assertEqual([r.version for r in self.store.history("architecture")], [1, 2])
        self.assertEqual(self.store.get_current("architecture").record_id, second.record_id)

    def test_search_returns_latest_version_only(self):
        self.store.add(logical_key="omr", title="OMR", content="PDF to MusicXML pipeline")
        latest = self.store.add(logical_key="omr", title="OMR", content="PDF to MusicXML with human verification")
        found = self.store.search("human verification")
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0].record_id, latest.record_id)

    def test_private_legacy_is_rejected(self):
        with self.assertRaises(ValueError):
            self.store.add(logical_key="student-1", title="Private", content="recording", domain="private_legacy")
        with self.assertRaises(ValueError):
            self.store.search("recording", domains={"private_legacy"})

    def test_shared_heritage_requires_rights_and_review(self):
        base = dict(logical_key="score-1", title="Score", content="Music data", domain="shared_heritage", source_label="Library record")
        with self.assertRaises(ValueError):
            self.store.add(**base)
        saved = self.store.add(**base, license_id="CC0-1.0", rights_status="open", verification_status="verified")
        self.assertEqual(saved.domain, "shared_heritage")
        self.assertEqual(self.store.search("Music", domains={"shared_heritage"})[0].record_id, saved.record_id)

    def test_provider_is_read_only_retrieval_adapter(self):
        self.store.add(logical_key="policy", title="Policy", content="Melobot assigns specialist agents")
        results = MeloKnowledgeProvider(self.store).retrieve("Melobot")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["logical_key"], "policy")

    def test_logical_key_cannot_cross_memory_domains(self):
        self.store.add(logical_key="same-key", title="Project", content="Internal decision")
        with self.assertRaises(ValueError):
            self.store.add(logical_key="same-key", title="Heritage", content="Shared work", domain="shared_heritage", source_label="Library", license_id="CC0-1.0", rights_status="open", verification_status="verified")

    def test_in_memory_database_is_rejected(self):
        with self.assertRaises(ValueError):
            MemoryStore(":memory:")

    def test_invalid_limits_and_empty_content_fail(self):
        with self.assertRaises(ValueError):
            self.store.search("anything", limit=0)
        with self.assertRaises(ValueError):
            self.store.add(logical_key="", title="x", content="y")


if __name__ == "__main__":
    unittest.main()
