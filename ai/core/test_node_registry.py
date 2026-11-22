import tempfile
import unittest
from pathlib import Path

from node_registry import NodeRegistry, NodeStatus


class NodeRegistryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.registry = NodeRegistry(Path(self.tmp.name) / "nodes.sqlite3")

    def tearDown(self):
        self.tmp.cleanup()

    def register(self, **overrides):
        values = dict(
            requested_by="melobot",
            owner_org="Open Music Research Group",
            display_name="OMR Research Node",
            base_url="https://omr.example.org/api",
            region="Europe",
            capabilities=["omr", "musicxml"],
            protocols=["https-json", "musicxml"],
            data_residency="EU",
        )
        values.update(overrides)
        return self.registry.register(**values)

    def test_registration_is_pending_by_default(self):
        node = self.register()
        self.assertEqual(node.status, NodeStatus.PENDING)
        self.assertIsNone(node.verified_at)
        self.assertEqual(node.ownership_model, "independent")

    def test_only_melobot_can_submit_registration(self):
        with self.assertRaises(PermissionError):
            self.register(requested_by="specialist-agent")

    def test_non_https_endpoint_is_rejected(self):
        with self.assertRaises(ValueError):
            self.register(base_url="http://omr.example.org/api")

    def test_endpoint_with_credentials_is_rejected(self):
        with self.assertRaises(ValueError):
            self.register(base_url="https://user:pass@omr.example.org/api")

    def test_independent_ownership_is_required(self):
        with self.assertRaises(ValueError):
            self.register(ownership_model="centralized_by_melo")

    def test_pending_node_is_not_discoverable(self):
        self.register()
        self.assertEqual(self.registry.discover(capability="omr"), ())

    def test_only_guardian_can_activate_node(self):
        node = self.register()
        with self.assertRaises(PermissionError):
            self.registry.set_status(requested_by="melobot",
                                     node_id=node.node_id,
                                     status=NodeStatus.ACTIVE)

    def test_guardian_activation_enables_filtered_discovery(self):
        node = self.register()
        active = self.registry.set_status(requested_by="guardian",
            node_id=node.node_id, status=NodeStatus.ACTIVE)
        self.assertEqual(active.status, NodeStatus.ACTIVE)
        self.assertIsNotNone(active.verified_at)
        found = self.registry.discover(capability="omr",
            protocol="musicxml", region="europe")
        self.assertEqual([item.node_id for item in found], [node.node_id])

    def test_suspended_node_disappears_from_discovery(self):
        node = self.register()
        self.registry.set_status(requested_by="guardian",
            node_id=node.node_id, status=NodeStatus.ACTIVE)
        self.registry.set_status(requested_by="guardian",
            node_id=node.node_id, status=NodeStatus.SUSPENDED)
        self.assertEqual(self.registry.discover(), ())

    def test_unknown_node_and_invalid_limit_fail(self):
        with self.assertRaises(KeyError):
            self.registry.get("not-a-node")
        with self.assertRaises(ValueError):
            self.registry.discover(limit=0)


if __name__ == "__main__":
    unittest.main()
