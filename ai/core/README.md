# MeloLegacy AI Core — policy prototype

This directory starts the deterministic safety and autonomy layer for MeloLegacy AI.

## Current scope

- `policy.py` classifies proposed operations as:
  - `ALLOW`: bounded autonomous work.
  - `REQUIRE_APPROVAL`: sensitive, production, or irreversible work.
  - `DENY`: secret exposure, policy bypass, or unknown operations.
- `test_policy.py` verifies the policy behavior using Python's standard library.

This is a policy prototype, not yet a connected agent, scheduler, memory service, or production controller. It does not execute tools or access credentials.

## Run tests

From the repository root:

```bash
python -m unittest discover -s ai/core -p 'test_*.py' -v
```

## Next implementation stages

1. Add a versioned task/event schema and append-only audit store.
2. Add read-only GitHub knowledge retrieval.
3. Add a planner that emits structured task plans.
4. Route every tool call through this policy gate.
5. Add approval handling and a sandboxed GitHub branch writer.
6. Add Colab/training adapter with dataset, runtime, and cost limits.
7. Add evaluation and monitoring before any production integration.

Do not put API keys, passwords, cookies, or student data in this directory or in Git.
