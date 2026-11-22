# MeloLegacy unified repository

**Decision:** `Melolegacy-Studio-` is the canonical integration repository for the 01/12/2026 delivery target. The standalone `Melolegacy-` repository remains a preserved source repository; its PWA Composer Room is brought into this repository under `apps/web`.

## Repository responsibilities

- `apps/web`: React/Vite PWA and Composer Room browser application migrated from `Melolegacy-`.
- `ai/core`: MeloBot orchestration, Melo Memory and node registry.
- `services/omr-worker`: isolated PDF-to-MusicXML worker.
- `data/notation`: SMuFL glyph registry and provenance.
- `docs`: architecture, interfaces, verification notes and operational decisions.

## Integration rules

1. Keep both source repositories intact; do not delete or rename either repository as part of this migration.
2. Integrate through reviewed branches and pull requests. Do not bypass review or merge approval gates.
3. Preserve source provenance for migrated code. The PWA was copied from `truongquyasia712001-cell/Melolegacy-` branch `main` into `apps/web`.
4. Keep the web app independently buildable while backend services remain separate deployable components.
5. Do not claim production readiness until end-to-end tests cover the browser app, authenticated gateway, real PDF samples, MusicXML output and deployment environment.
6. No private student data or personal legacy is included in this migration.

## Current delivery boundary

This first integration stage migrates the existing PWA source and adds a CI build gate. It does not yet wire the PWA to MeloBot or the OMR gateway. That integration follows after API contracts, authentication boundaries and real-file tests are verified.
