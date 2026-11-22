"""Versioned, provenance-aware knowledge memory for MeloLegacy.

This first implementation stores project knowledge and operational records only.
Private user/student legacy is deliberately excluded. Shared heritage requires
explicit rights metadata and a verified review status before it can be stored.
The module uses only Python's standard library and does not execute tools.
"""
from __future__ import annotations

import hashlib
import json
import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


ALLOWED_DOMAINS = {"project_knowledge", "operational_memory", "shared_heritage"}
RIGHTS_ALLOWED = {"open", "permission_granted"}
VERIFICATION_ALLOWED = {"reviewed", "verified"}


@dataclass(frozen=True)
class MemoryRecord:
    record_id: str
    logical_key: str
    version: int
    domain: str
    title: str
    content: str
    source_uri: str | None
    source_label: str | None
    license_id: str | None
    rights_status: str
    verification_status: str
    created_at: str
    created_by: str
    content_sha256: str
    supersedes_id: str | None
    metadata: dict[str, Any]


class MemoryStore:
    """Append-only, versioned memory store with explicit domain boundaries."""

    def __init__(self, database: str | Path):
        self.database = str(database)
        if self.database == ":memory:":
            raise ValueError("Use a file-backed SQLite database so each operation shares the same durable store.")
        Path(self.database).parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database, timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def _initialize(self) -> None:
        with self._connect() as db:
            db.execute("PRAGMA journal_mode = WAL")
            db.executescript(
                """
                CREATE TABLE IF NOT EXISTS memory_records (
                    record_id TEXT PRIMARY KEY,
                    logical_key TEXT NOT NULL,
                    version INTEGER NOT NULL CHECK(version > 0),
                    domain TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    source_uri TEXT,
                    source_label TEXT,
                    license_id TEXT,
                    rights_status TEXT NOT NULL,
                    verification_status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    created_by TEXT NOT NULL,
                    content_sha256 TEXT NOT NULL,
                    supersedes_id TEXT REFERENCES memory_records(record_id),
                    metadata_json TEXT NOT NULL,
                    UNIQUE(logical_key, version)
                );
                CREATE INDEX IF NOT EXISTS idx_memory_domain_key
                    ON memory_records(domain, logical_key, version);
                CREATE INDEX IF NOT EXISTS idx_memory_created
                    ON memory_records(created_at);
                CREATE TABLE IF NOT EXISTS memory_schema (
                    singleton INTEGER PRIMARY KEY CHECK(singleton = 1),
                    schema_version INTEGER NOT NULL
                );
                INSERT OR IGNORE INTO memory_schema(singleton, schema_version)
                    VALUES(1, 1);
                """
            )

    @staticmethod
    def _row_to_record(row: sqlite3.Row) -> MemoryRecord:
        return MemoryRecord(
            record_id=row["record_id"], logical_key=row["logical_key"],
            version=row["version"], domain=row["domain"], title=row["title"],
            content=row["content"], source_uri=row["source_uri"],
            source_label=row["source_label"], license_id=row["license_id"],
            rights_status=row["rights_status"],
            verification_status=row["verification_status"],
            created_at=row["created_at"], created_by=row["created_by"],
            content_sha256=row["content_sha256"],
            supersedes_id=row["supersedes_id"],
            metadata=json.loads(row["metadata_json"]),
        )

    def add(
        self, *, logical_key: str, title: str, content: str,
        domain: str = "project_knowledge", source_uri: str | None = None,
        source_label: str | None = None, license_id: str | None = None,
        rights_status: str = "unknown",
        verification_status: str = "unverified",
        created_by: str = "system", metadata: dict[str, Any] | None = None,
    ) -> MemoryRecord:
        """Add a new immutable version; never overwrites an earlier record."""
        if domain not in ALLOWED_DOMAINS:
            raise ValueError("This store excludes private legacy and unknown domains.")
        if not logical_key.strip() or not title.strip() or not content.strip():
            raise ValueError("logical_key, title, and content are required.")
        if domain == "shared_heritage":
            if not (source_uri or source_label):
                raise ValueError("Shared heritage requires source provenance.")
            if not license_id or rights_status not in RIGHTS_ALLOWED:
                raise ValueError("Shared heritage requires an explicit license and permitted rights status.")
            if verification_status not in VERIFICATION_ALLOWED:
                raise ValueError("Shared heritage must be reviewed or verified before admission.")
        if not isinstance(metadata or {}, dict):
            raise ValueError("metadata must be a JSON object.")

        record_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        digest = hashlib.sha256(content.encode("utf-8")).hexdigest()
        metadata_json = json.dumps(metadata or {}, ensure_ascii=False, sort_keys=True)

        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            previous = db.execute(
                "SELECT record_id, version, domain FROM memory_records WHERE logical_key = ? ORDER BY version DESC LIMIT 1",
                (logical_key,),
            ).fetchone()
            if previous and previous["domain"] != domain:
                raise ValueError("A logical_key cannot change memory domains across versions.")
            version = (previous["version"] + 1) if previous else 1
            supersedes_id = previous["record_id"] if previous else None
            db.execute(
                """INSERT INTO memory_records (
                    record_id, logical_key, version, domain, title, content,
                    source_uri, source_label, license_id, rights_status,
                    verification_status, created_at, created_by, content_sha256,
                    supersedes_id, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (record_id, logical_key, version, domain, title, content,
                 source_uri, source_label, license_id, rights_status,
                 verification_status, created_at, created_by, digest,
                 supersedes_id, metadata_json),
            )
            row = db.execute(
                "SELECT * FROM memory_records WHERE record_id = ?", (record_id,)
            ).fetchone()
        return self._row_to_record(row)

    def get_current(self, logical_key: str) -> MemoryRecord | None:
        with self._connect() as db:
            row = db.execute(
                "SELECT * FROM memory_records WHERE logical_key = ? ORDER BY version DESC LIMIT 1",
                (logical_key,),
            ).fetchone()
        return self._row_to_record(row) if row else None

    def history(self, logical_key: str) -> list[MemoryRecord]:
        with self._connect() as db:
            rows = db.execute(
                "SELECT * FROM memory_records WHERE logical_key = ? ORDER BY version ASC",
                (logical_key,),
            ).fetchall()
        return [self._row_to_record(row) for row in rows]

    def search(
        self, query: str, *, domains: Iterable[str] | None = None,
        limit: int = 20,
    ) -> list[MemoryRecord]:
        """Search latest versions only; private legacy is never searchable here."""
        selected = set(domains or {"project_knowledge", "operational_memory"})
        if not selected or not selected.issubset(ALLOWED_DOMAINS):
            raise ValueError("Requested memory domain is unavailable in this store.")
        if limit < 1 or limit > 100:
            raise ValueError("limit must be between 1 and 100.")
        terms = [term for term in query.strip().split() if term]
        clauses = ["r.domain IN (" + ",".join("?" for _ in selected) + ")"]
        params: list[Any] = sorted(selected)
        for term in terms:
            clauses.append("(LOWER(r.title) LIKE ? OR LOWER(r.content) LIKE ?)")
            pattern = f"%{term.lower()}%"
            params.extend([pattern, pattern])
        if "shared_heritage" in selected:
            clauses.append("(r.domain != 'shared_heritage' OR (r.license_id IS NOT NULL AND r.rights_status IN ('open','permission_granted') AND r.verification_status IN ('reviewed','verified')))")
        where = " AND ".join(clauses)
        sql = f"""SELECT r.* FROM memory_records r
            JOIN (SELECT logical_key, MAX(version) AS latest_version
                  FROM memory_records GROUP BY logical_key) latest
              ON latest.logical_key = r.logical_key AND latest.latest_version = r.version
            WHERE {where}
            ORDER BY r.created_at DESC LIMIT ?"""
        params.append(limit)
        with self._connect() as db:
            rows = db.execute(sql, params).fetchall()
        return [self._row_to_record(row) for row in rows]


class MeloKnowledgeProvider:
    """Read-only retrieval adapter intended for the future Melobot orchestrator."""

    def __init__(self, store: MemoryStore):
        self._store = store

    def retrieve(self, query: str, *, limit: int = 10) -> list[dict[str, Any]]:
        records = self._store.search(query, limit=limit)
        return [asdict(record) for record in records]
