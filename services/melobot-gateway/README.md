# Melobot Composer Gateway

The same-origin PWA endpoint for PDF→MusicXML. The gateway is the only task issuer and dispatcher. It issues a `document.pdf_to_musicxml` task and dispatches the internal `composer-omr-worker` specialist. The specialist can call only the configured private OMR worker URL; no arbitrary endpoint is accepted from a task or browser.

## Required environment
- `MELO_OMR_WORKER_URL`: private service URL for the OMR worker (not a public URL)
- `MELOBOT_OMR_TOKEN`: shared secret also configured on the OMR worker

## Security requirements before deployment
- Keep this service on a private network behind the authenticated MeloLegacy ingress.
- The ingress must strip any client-supplied `X-Melo-User-Id` and inject the verified account ID. Do not expose this service directly to the internet.
- Keep `MELOBOT_OMR_TOKEN` only in server-side secret storage.
- Do not add external networking to specialist agents.
- Do not log PDF bytes, user recordings, or private score content.
- Apply user-level quotas and request concurrency limits at the ingress before public launch.

## Route
`POST /api/melobot/composer/omr`, multipart field `file`, trusted header `X-Melo-User-Id`. Returns the original MusicXML output; it is marked as requiring human review. The browser never receives the worker token.

## Status
Source prototype only. It has not been deployed, connected to an authenticated MeloLegacy session, or tested end-to-end with a real PDF. The worker adapter and the exact CLI invocation must be smoke-tested on the chosen host before enabling the route for users.
