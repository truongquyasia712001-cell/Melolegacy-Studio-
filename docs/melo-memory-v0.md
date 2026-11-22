# Melo Memory v0 — implementation note

## Purpose

Provide a small, durable, versioned knowledge store that Melobot can query through its task-conveyor interface. This is a bounded prototype, not a deployed memory service.

## Included in v0

- SQLite storage using only the Python standard library.
- Immutable application-level versions: each revision receives a new record ID, version number, timestamp, content SHA-256, and a link to the record it supersedes.
- Retrieval of the latest version and full revision history by logical key.
- Keyword retrieval over the latest version of each record.
- Provenance fields: source URI/label, license identifier, rights status, verification status, creator, and JSON metadata.
- A read-only `MeloKnowledgeProvider` adapter connected to `MelobotConveyor.retrieve_knowledge`.
- Retrieval events record the result count and a hash of the query, not the raw query text.

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
- No authenticated caller identity, per-user ACL, encryption-at-rest, backup automation, retention controls, or tamper-evident external audit.
- The current `requested_by="melobot"` check is an in-process logical guard, not cryptographic authentication. It must not be exposed as a network authorization boundary.
- Append-only behavior is enforced by the module API, not by a cryptographically immutable database.
- The adapter is connected to the Python conveyor interface, but no live deployed Melobot service consumes it yet.
- Production use requires Guardian enforcement, authenticated callers, storage/backup design, migration policy, and security review.

## Next gated step

Implement authenticated, least-privilege access and Guardian enforcement around the retrieval interface; persist task and retrieval events; then run integration tests. Keep private legacy excluded. Production deployment, external integrations, paid infrastructure, and changes to user/student data remain approval-gated.
