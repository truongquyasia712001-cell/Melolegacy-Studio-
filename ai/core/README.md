# MeloLegacy AI Core — policy, memory, orchestration, and network registry prototypes

This directory contains bounded components for the MeloLegacy control plane.

## Current scope

- `policy.py` classifies proposed operations as allow, require approval, or deny.
- `memory.py` provides versioned SQLite knowledge storage with provenance and rights metadata.
- `orchestrator.py` exposes knowledge retrieval through the Melobot-controlled task conveyor and records events.
- `node_registry.py` catalogs independently owned network nodes without contacting their endpoints or storing credentials.
- Tests cover policy, memory, orchestration, and node-registry boundaries.

New network nodes remain pending until Guardian verification. Only active nodes are discoverable. The registry is metadata-only: it does not connect, authenticate, synchronize, or transfer data to partner nodes.

## Data and authority boundaries

- Project knowledge and operational memory are supported.
- Shared heritage requires provenance, explicit licensing/rights metadata, and reviewed/verified status.
- Private user/student legacy is excluded from the shared store.
- Melobot is the sole task issuer and dispatcher; specialist agents cannot independently select tasks or call external systems.
- Node owners retain independent data ownership. Melobot stores only approved connection metadata.
- The current actor-name checks are in-process logical guards, not cryptographic authentication. Do not expose these prototypes as network authorization boundaries.

See [Melo Memory v0 implementation note](../../docs/melo-memory-v0.md).

## Run tests

From the repository root:

```bash
python -m compileall -q ai/core
python -m unittest discover -s ai/core -p 'test_*.py' -v
```

No third-party Python dependency is required for these prototypes. A GitHub Actions workflow runs compilation and tests for pull requests targeting the integration or main branches.

## Not production ready

No authenticated network API, per-node mTLS, per-user ACL, encryption-at-rest, backup automation, distributed synchronization, external endpoint verification, semantic search, or deployed Melobot service is included. The node registry does not contact external organizations or endpoints.

## Fast-track next steps

1. Add authenticated identity and Guardian approval before exposing any API.
2. Define a versioned node handshake contract (capabilities, protocol versions, data rights, retention, and audit fields).
3. Add a read-only node discovery API after the authentication boundary is reviewed.
4. Persist task/audit events and implement backup/restore tests.
5. Connect the PDF-to-MusicXML pipeline to the same task interface behind capability-specific permissions.
6. Run CI and resolve failures before requesting review or merge.

Do not put API keys, passwords, cookies, private student data, or partner datasets in Git. Production deployment, private data operations, external integrations, and merges remain approval-gated.
