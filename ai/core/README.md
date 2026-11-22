# MeloLegacy AI Core — policy, memory, and orchestration prototypes

This directory contains the first bounded components of the MeloLegacy AI control plane.

## Current scope

- `policy.py` classifies proposed operations as:
  - `ALLOW`: bounded autonomous work.
  - `REQUIRE_APPROVAL`: sensitive, production, or irreversible work.
  - `DENY`: secret exposure, policy bypass, or unknown operations.
- `memory.py` provides a versioned SQLite knowledge store and a read-only retrieval adapter.
- `orchestrator.py` exposes that adapter through a Melobot-controlled retrieval method and records retrieval events.
- `test_policy.py`, `test_memory.py`, and `test_orchestrator.py` cover the policy, memory, and retrieval boundary.

The memory provider is now connected to the Python task-conveyor interface in source and covered by integration tests. This is not yet a deployed agent, scheduler, authenticated network service, production controller, or cloud memory service.

## Memory boundaries

- Project knowledge and operational memory are supported.
- Shared heritage requires provenance, explicit licensing/rights metadata, and reviewed/verified status.
- Private user/student legacy is excluded from this shared store and must remain separately access-controlled.
- Each revision is a new version; previous records remain retrievable.
- Melobot retrieves knowledge through the conveyor; specialist agents do not receive a direct retrieval interface.

The current `requested_by="melobot"` check is an in-process logical guard, not cryptographic authentication. Do not expose this interface directly over a network until trusted caller authentication and Guardian enforcement are implemented.

See [Melo Memory v0 implementation note](../../docs/melo-memory-v0.md).

## Run tests

From the repository root:

```bash
python -m unittest discover -s ai/core -p 'test_*.py' -v
```

No third-party Python dependency is required for these prototypes.

## Next implementation stages

1. Add authenticated, least-privilege knowledge retrieval and Guardian enforcement.
2. Persist versioned task/event records in a durable audit store.
3. Add a planner that emits structured task plans.
4. Route every tool call through the policy gate and approval flow.
5. Add Colab/training adapter with dataset, runtime, and cost limits.
6. Add evaluation and monitoring before any production integration.

Do not put API keys, passwords, cookies, or student data in this directory or in Git. Production deployment, private data operations, and external integrations remain approval-gated.
