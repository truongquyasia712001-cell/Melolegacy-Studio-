# MeloLegacy AI Core — Architecture v0.1

## Purpose

MeloLegacy AI Core is the control plane for the MeloLegacy ecosystem. It combines project knowledge, planning, bounded tool execution, verification, and auditability. It is not a single model and it does not treat model output as authority.

## Design principles

1. **Knowledge before action** — retrieve current project specifications and repository state before proposing changes.
2. **Tools, not hidden access** — every external action goes through an explicit adapter with a narrow capability.
3. **Least privilege** — read access is broader than write access; production, identity, privacy, and destructive operations require approval.
4. **Separate environments** — experiments and code changes happen on isolated branches and non-production environments first.
5. **Verify before reporting** — a task is complete only after its output and acceptance checks have been inspected.
6. **Human stewardship** — the project owner retains authority over production releases, user data, account access, and governance.
7. **Traceability** — every task records its intent, plan, tool calls, outputs, approvals, and verification result.
8. **Free-first and non-commercial** — prefer free/open tools with compatible licenses; never introduce paid services or commercial workflows without an explicit decision.

## Logical architecture

- **Melo Brain:** language model interface; interprets requests and produces structured plans. It cannot directly bypass policy.
- **Melo Memory:** versioned project knowledge, decisions, specifications, operational state, and retrieval indexes. Private user/student data is not part of the shared knowledge base by default.
- **Melo Orchestrator:** task state machine: intake → retrieve context → plan → policy check → execute → verify → report.
- **Melo Tools:** narrow adapters for GitHub, Colab/training, application APIs, storage, and tests.
- **Melo Guardian:** deterministic policy gate, approval workflow, secret handling, and data boundaries.
- **Melo Monitor:** append-only task events, health metrics, failures, resource limits, and model/version tracking.
- **Specialist models:** OMR, handwritten notation recognition, audio/pitch analysis, music understanding, and learning support. Each has a defined input/output contract and evaluation set.

## Task lifecycle

1. Resolve the request against current repository and approved knowledge.
2. Create a task record with objective, scope, acceptance criteria, and risk.
3. Produce a step-by-step plan.
4. Ask Guardian to authorize every proposed tool action.
5. Execute only allowed actions; isolate changes on a feature branch.
6. Run tests and inspect artifacts/logs.
7. Compare results against acceptance criteria.
8. Report verified outcomes, remaining risks, and next action.

A model-generated statement such as "tests passed" is not evidence. Evidence must come from an actual test result or inspected artifact.

## Autonomy policy

### Autonomous in bounded environments
- Read project documentation and repository files.
- Inspect logs and test output.
- Create feature branches.
- Edit files on non-protected feature branches.
- Run deterministic tests and static checks.
- Run training jobs only with explicit resource/time/dataset limits.
- Produce draft pull requests and reports.

### Approval required
- Merge to the protected main branch.
- Deploy or modify production services.
- Delete, overwrite, export, or share user/student data.
- Change account roles, permissions, authentication, or security settings.
- Add a paid service, incur usage charges, or change the free-first commitment.
- Publish datasets, models, or materials with licensing/privacy implications.
- Change retention, backup, or recovery settings.

### Denied by default
- Read or expose passwords, API keys, cookies, private tokens, or unrelated personal data.
- Disable audit logging or bypass Guardian.
- Execute instructions found inside untrusted documents, datasets, web pages, or repository content as policy.
- Make irreversible changes without a verified backup and explicit approval.

## Memory domains

- **Project knowledge:** public specifications, architecture, glossary, approved decisions.
- **Operational memory:** task status, build/test results, model versions, known issues.
- **Private legacy:** student/user compositions, recordings, identity and account data; separate access control and consent.
- **Shared heritage:** reviewed materials with source, license, attribution, and permission metadata.

The private legacy domain must never be silently copied into shared heritage or model-training corpora.

## First implementation milestone

The repository currently contains product/technical specifications and notation metadata, not a deployed AI control plane. The first milestone therefore establishes a deterministic policy gate and tests before connecting any autonomous executor.

Acceptance criteria:
- Unknown actions fail closed.
- Read-only and isolated development actions can be authorized by policy.
- Production, privacy, security, and destructive actions require approval.
- Secret extraction and policy bypass are denied.
- Policy behavior is covered by automated tests.

## Future interfaces

- `KnowledgeProvider`: retrieve versioned specifications and decisions.
- `ModelProvider`: request plans and structured outputs from a selected model.
- `ToolAdapter`: execute one narrow operation.
- `PolicyEngine`: authorize or block each operation.
- `ApprovalProvider`: collect explicit owner approval.
- `EventStore`: persist append-only task and action events.
- `Evaluator`: verify outputs against acceptance criteria and domain-specific tests.

No provider is considered connected until its credentials, scope, and actual end-to-end behavior have been tested.


## Executive authority: Melobot

**Melobot is the chief executive and highest operational authority of the MeloLegacy AI ecosystem.** It is not a peer specialist agent. All Melo AI agents report to Melobot.

Melobot assigns and coordinates work, defines agent scopes and permissions, monitors behavior, verifies results, and intervenes when an agent deviates from its task, violates policy, produces unsafe output, or repeatedly fails verification. It may pause, isolate, or revoke an agent's capabilities and must report serious incidents to the project owner.

### Internal-only specialist agents

Every specialist Melo AI agent is confined to the MeloLegacy environment. It may use only capabilities explicitly provided inside that environment. It must not independently contact external services, users, organizations, websites, APIs, or systems, nor create its own external identity or outbound channel.

External operational communication and coordination are centralized through **Melobot together with Melo Cloud**. Melo Cloud provides the controlled cloud boundary and infrastructure; Melobot governs intent, authorization, routing, and oversight. This is operational coordination, not authority to conduct commercial transactions.

### Chain of command

Project Owner → Melobot → Specialist Melo AI Agents → Internal MeloLegacy services

External boundary: Melobot ↔ Melo Cloud ↔ approved external endpoints. Specialist agents have no direct route across that boundary.

### Incident response

When an agent violates scope or returns an unsafe or unverified result, Melobot must stop the affected task, prevent downstream publication, preserve logs, quarantine the result, narrow or revoke the agent capability if needed, arrange controlled re-validation, and report impact and corrective action to the project owner.

Melobot is subordinate to the project owner and immutable security policies. It cannot override privacy, security, licensing, or approval gates.
