"""Metadata-only registry for independent MeloLegacy network nodes.

The registry never contacts registered endpoints and never stores credentials.
New nodes remain pending until an authorized human/Guardian verification step.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import Enum
import json
import re
import sqlite3
from pathlib import Path
from typing import Iterable
from uuid import uuid4


class NodeStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REJECTED = "rejected"


@dataclass(frozen=True)
class NodeRecord:
    node_id: str
    owner_org: str
    display_name: str
    base_url: str
    region: str
    capabilities: tuple[str, ...]
    protocols: tuple[str, ...]
    data_residency: str
    ownership_model: str
    status: NodeStatus
    created_at: str
    verified_at: str | None


class NodeRegistry:
    """Central metadata catalogue; node data remains under independent ownership."""

    def __init__(self, database: str | Path):
        self.database = str(database)
        if self.database == ":memory:":
            raise ValueError("Use a file-backed database for durable registry metadata.")
        Path(self.database).parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self):
        db = sqlite3.connect(self.database, timeout=10)
        db.row_factory = sqlite3.Row
        return db

    def _initialize(self):
        with self._connect() as db:
            db.execute("PRAGMA journal_mode = WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS network_nodes (
                    node_id TEXT PRIMARY KEY,
                    owner_org TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    base_url TEXT NOT NULL,
                    region TEXT NOT NULL,
                    capabilities_json TEXT NOT NULL,
                    protocols_json TEXT NOT NULL,
                    data_residency TEXT NOT NULL,
                    ownership_model TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    verified_at TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_nodes_status_region
                    ON network_nodes(status, region);
            """)

    @staticmethod
    def _validate_https_url(value: str) -> None:
        if not isinstance(value, str) or not re.fullmatch(
            r"https://[A-Za-z0-9.-]+(?::[0-9]{1,5})?(?:/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]*)?",
            value,
        ):
            raise ValueError("Node endpoint must be an HTTPS URL; local/private endpoints are not accepted in this registry prototype.")

    @staticmethod
    def _row(row: sqlite3.Row) -> NodeRecord:
        return NodeRecord(
            node_id=row["node_id"], owner_org=row["owner_org"],
            display_name=row["display_name"], base_url=row["base_url"],
            region=row["region"],
            capabilities=tuple(json.loads(row["capabilities_json"])),
            protocols=tuple(json.loads(row["protocols_json"])),
            data_residency=row["data_residency"],
            ownership_model=row["ownership_model"],
            status=NodeStatus(row["status"]), created_at=row["created_at"],
            verified_at=row["verified_at"],
        )

    def register(self, *, requested_by: str, owner_org: str,
                 display_name: str, base_url: str, region: str,
                 capabilities: Iterable[str], protocols: Iterable[str],
                 data_residency: str,
                 ownership_model: str = "independent") -> NodeRecord:
        if requested_by != "melobot":
            raise PermissionError("Only Melobot may submit a node registration.")
        self._validate_https_url(base_url)
        fields = (owner_org, display_name, region, data_residency)
        if any(not isinstance(x, str) or not x.strip() for x in fields):
            raise ValueError("Owner, display name, region, and data residency are required.")
        caps = sorted(set(capabilities))
        protos = sorted(set(protocols))
        if not caps or not protos or any(not x.strip() for x in caps + protos):
            raise ValueError("At least one capability and protocol are required.")
        if ownership_model != "independent":
            raise ValueError("Network nodes must retain independent ownership.")
        node = NodeRecord(
            node_id=str(uuid4()), owner_org=owner_org.strip(),
            display_name=display_name.strip(), base_url=base_url,
            region=region.strip(), capabilities=tuple(caps),
            protocols=tuple(protos), data_residency=data_residency.strip(),
            ownership_model=ownership_model, status=NodeStatus.PENDING,
            created_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            verified_at=None,
        )
        with self._connect() as db:
            db.execute("""INSERT INTO network_nodes VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )""", (
                node.node_id, node.owner_org, node.display_name, node.base_url,
                node.region, json.dumps(node.capabilities),
                json.dumps(node.protocols), node.data_residency,
                node.ownership_model, node.status.value, node.created_at, None,
            ))
        return node

    def set_status(self, *, requested_by: str, node_id: str,
                   status: NodeStatus) -> NodeRecord:
        if requested_by != "guardian":
            raise PermissionError("Only the Guardian verification process may approve or suspend a node.")
        if status not in {NodeStatus.ACTIVE, NodeStatus.SUSPENDED, NodeStatus.REJECTED}:
            raise ValueError("Unsupported node status transition.")
        verified_at = (datetime.now(timezone.utc).isoformat(timespec="seconds")
                       if status is NodeStatus.ACTIVE else None)
        with self._connect() as db:
            cur = db.execute(
                "UPDATE network_nodes SET status = ?, verified_at = ? WHERE node_id = ?",
                (status.value, verified_at, node_id),
            )
            if cur.rowcount != 1:
                raise KeyError("Unknown network node.")
            row = db.execute("SELECT * FROM network_nodes WHERE node_id = ?",
                             (node_id,)).fetchone()
        return self._row(row)

    def discover(self, *, capability: str | None = None,
                 protocol: str | None = None,
                 region: str | None = None,
                 limit: int = 50) -> tuple[NodeRecord, ...]:
        if limit < 1 or limit > 200:
            raise ValueError("limit must be between 1 and 200.")
        clauses = ["status = 'active'"]
        params: list[object] = []
        if region:
            clauses.append("LOWER(region) = LOWER(?)")
            params.append(region)
        with self._connect() as db:
            rows = db.execute(
                "SELECT * FROM network_nodes WHERE " + " AND ".join(clauses) +
                " ORDER BY owner_org, display_name LIMIT ?", (*params, limit)
            ).fetchall()
        found = [self._row(row) for row in rows]
        if capability:
            found = [n for n in found if capability in n.capabilities]
        if protocol:
            found = [n for n in found if protocol in n.protocols]
        return tuple(found[:limit])

    def get(self, node_id: str) -> NodeRecord:
        with self._connect() as db:
            row = db.execute("SELECT * FROM network_nodes WHERE node_id = ?",
                             (node_id,)).fetchone()
        if row is None:
            raise KeyError("Unknown network node.")
        return self._row(row)
