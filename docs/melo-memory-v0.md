# Melo Memory v0 — implementation note

## Purpose

Provide a small, durable, versioned knowledge store that a future Melobot orchestrator can query. This is the first bounded implementation step; it is not a deployed memory service and is not yet wired into a running orchestrator.

## Included in v0

- SQLite storage using only the Python standard library.
- Immutable application-level versions: each revision receives a new record ID, version number, timestamp, content SHA-256, and a link to the record it supersedes.
- Retrieval of the latest version and full revision history by logical key.
- Keyword retrieval over the latest version of each record.
- Provenance fields: source URI/label, license identifier, rights status, verification status, creator, and JSON metadata.
- A read-only `MeloKnowledgeProvider` adapter intended as the retrieval seam for Melobot.

## Data boundaries

| Domain | v0 behavior |
|---|---|
| `project_knowledge` | Supported |
| `operational_memory` | Supported |
| `shared_heritage` | Supported only with source provenance, explicit license, permitted rights status, and reviewed/verified status |
| `private_legacy` | Explicitly excluded from this shared store |

Private student/user compositions, recordings, identity, and learning records must remain in a separate access-controlled system. This module does not implement personal account authorization or private-legacy storage.

A logical key cannot change domains between versions. This prevents a project record from being silently reclassified as shared heritage.

## Run tests

From the repository root:

```bash
python -m unittest discover -s ai/core -p 'test_*.py' -v
```

The module has no third-party package dependency.

## Known limitations — not production ready

- Keyword search only; no embeddings or semantic retrieval.
- SQLite is a local persistence prototype, not distributed storage or multi-node synchronization.
- No authentication, per-user ACL, encryption-at-rest, backup automation, retention controls, or tamper-evident external audit.
- Append-only behavior is enforced by the module API, not by a cryptographically immutable database.
- The adapter is a read-only interface seam; no live Melobot task engine currently consumes it.
- Production use requires Guardian authorization, authenticated callers, storage/backup design, migration policy, and security review.

## Next gated step

Connect the read-only provider to the Melobot orchestrator on an isolated branch, with retrieval limited to approved project and operational domains. Keep private legacy excluded. Run integration tests and inspect retrieval traces. Production deployment, external integrations, paid infrastructure, and changes to user/student data remain approval-gated.
