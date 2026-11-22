# MeloLegacy AI Core — policy and memory prototypes

This directory contains the first bounded components of the MeloLegacy AI control plane.

## Current scope

- `policy.py` classifies proposed operations as:
  - `ALLOW`: bounded autonomous work.
  - `REQUIRE_APPROVAL`: sensitive, production, or irreversible work.
  - `DENY`: secret exposure, policy bypass, or unknown operations.
- `memory.py` provides a versioned SQLite knowledge store and a read-only retrieval adapter for future Melobot integration.
- `test_policy.py` and `test_memory.py` verify policy and memory behavior using Python's standard library.

The memory adapter is not yet connected to a running orchestrator. This directory does not yet provide a deployed agent, scheduler, production controller, account authentication, or cloud memory service.

## Memory boundaries

- Project knowledge and operational memory are supported.
- Shared heritage requires provenance, explicit licensing/rights metadata, and reviewed/verified status.
- Private user/student legacy is excluded from this shared store and must remain separately access-controlled.
- Each revision is a new version; previous records remain retrievable.

See [Melo Memory v0 implementation note](../../docs/melo-memory-v0.md).

## Run tests

From the repository root:

```bash
python -m unittest discover -s ai/core -p 'test_*.py' -v
```

No third-party Python dependency is required for these prototypes.

## Next implementation stages

1. Connect read-only memory retrieval to the Melobot orchestrator on an isolated branch.
2. Add versioned task/event records and an append-only audit trail.
3. Add a planner that emits structured task plans.
4. Route every tool call through the policy gate and Guardian approval flow.
5. Add authenticated, least-privilege knowledge retrieval.
6. Add Colab/training adapter with dataset, runtime, and cost limits.
7. Add evaluation and monitoring before any production integration.

Do not put API keys, passwords, cookies, or student data in this directory or in Git. Production deployment, private data operations, and external integrations remain approval-gated.
