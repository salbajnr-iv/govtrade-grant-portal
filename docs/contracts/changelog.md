# API Contract Changelog

## v0.9.0 — 2026-03-19

### Added

- Frozen `POST /api/applications` request/response shape.
- Frozen `POST /api/contact` support intake payload.
- Auth/session endpoints: `POST /api/auth/login`, `POST /api/auth/logout`.
- Status endpoint: `GET /api/status/{applicationId}` with account-state model.
- Standardized error envelope with `code`, `message`, `category`, and optional `fieldErrors`.

### Stability notes (bounded)

- `applicationId` generation format is implementation-defined but minimum length is frozen.
- No pagination contracts are in scope for v0.9.
- Session expiration semantics are frozen by enum (`active`, `grace_period`, `expired`) but timeout durations are runtime-configurable.

### Breaking-change policy pre-v1.0

- Any breaking change requires:
  1. changelog entry,
  2. dual-version support window (minimum 1 sprint),
  3. explicit approval in governance decision log.
