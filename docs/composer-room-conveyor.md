# Composer Room — Melo Agent task conveyor

## Purpose

Connect Composer Room operations through one controlled task flow. Melobot is the only task issuer and dispatcher. Specialist Melo Agents are workers: they wait, receive one scoped task, return a structured result, and stop. No task means no work.

## Task lifecycle

`queued → running → completed | failed | blocked`

Each task carries an ID, capability name, input payload, issuing authority, assigned worker, and state. The conveyor records task creation, start, completion, and failure events. Failed work is not silently retried.

## Initial capability catalogue

These are capability identifiers for future registered workers, not claims that their recognition engines are already implemented:

- `document.import_pdf` — accept PDF/image input and retain source references.
- `omr.detect_staff` — detect page, system, staff geometry and confidence.
- `omr.recognize_symbols` — classify notation glyphs and relationships.
- `notation.resolve_music` — resolve pitch, rhythm, voices, key and accidental context.
- `notation.validate` — check measures, voices and notation consistency.
- `handwriting.recognize` — recognize Apple Pencil notation from captured strokes.
- `audio.analyze` — extract pitch/time/onset/rest evidence from audio.
- `voice.to_score` — convert sung or hummed input into candidate notation events.
- `notation.edit` — apply a user-approved edit to the shared notation document.
- `notation.playback` — render/play the current notation through the audio engine.
- `notation.export_musicxml` — export validated notation to MusicXML.

Melobot decides the plan and assigns each capability to an authorized internal worker. Workers cannot invoke one another or create follow-up work. Melobot reviews each result before issuing the next task.

## Shared data contract

Every stage must exchange structured data, not screenshots of notation as the canonical result:

- source asset ID and immutable source coordinates
- notation document ID and revision
- staff/system/measure/voice identifiers
- symbol type, position, duration, pitch spelling and relationships
- confidence and validation issues
- provenance: source, model/worker version, task ID and correction history

Low-confidence results remain candidates and must not be silently committed as verified notation. User edits and recognition corrections must update the same notation document revision.

## Safety and authority

- Only Melobot may issue and dispatch tasks.
- A worker can only receive a task matching its registered capability.
- Specialist workers are internal-only; external access is not part of their interface.
- User data and student recordings remain private by default.
- Export, sharing, deletion, production deployment, and any paid resource require the relevant approval.
- Every result must be validated before being passed to a downstream stage.

## Implementation status

The Python conveyor prototype in `ai/core/orchestrator.py` implements task issuance/dispatch authority, capability matching, task states, failure capture, and an append-only audit sink interface. Its unit tests cover these boundaries.

This is not yet connected to the PWA, a real model, PDF/image processing, Apple Pencil input, microphone/audio capture, MusicXML import/export, or a persistent production queue. The repository currently has specifications and notation glyph metadata rather than a Composer Room application source tree. Those adapters and the running application must be built and tested before any end-user function can be called operational.
