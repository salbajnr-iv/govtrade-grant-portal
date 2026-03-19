# Auth + Session Behavior Spec (Weeks 5–6)

## Canonical session states

The client-side account lifecycle uses five canonical states:

1. `active` — valid authenticated session.
2. `expired` — session exceeded freshness window and requires sign-in.
3. `revoked` — session invalidated due to unauthorized access or server revocation.
4. `restored` — user reauthenticated after `expired` or `revoked` and flow returned.
5. `unauthenticated` — no usable session exists.

## Deterministic redirect rules

| Event                | Deterministic target    | Query contract                            |
| -------------------- | ----------------------- | ----------------------------------------- |
| Post-login (normal)  | `/account`              | `?reason=post_login&returnTo=<safe_path>` |
| Post-login (reauth)  | `/account` or `/status` | `?reason=restored&returnTo=<safe_path>`   |
| Post-logout          | `/account`              | `?reason=logout&returnTo=/account`        |
| Session expiry       | `/account`              | `?reason=expiry&returnTo=/status`         |
| Unauthorized/revoked | `/account`              | `?reason=unauthorized&returnTo=/status`   |

`returnTo` is path-only (`/x`) and rejects external/protocol-relative values.

## Reauth UX rules

- Preserve return path in `returnTo` query param.
- Display explicit state messaging in account banner for `expired`/`revoked`/`restored`.
- After successful reauth from expiry/revocation, persist `restored` state and continue to original target.

## Rendering rules: anonymous vs authenticated

### Anonymous (`unauthenticated`, `expired`, `revoked`)

- Show sign-in form.
- Hide authenticated action panel.
- Display reason-specific guidance message.

### Authenticated (`active`, `restored`)

- Hide sign-in form.
- Show authenticated panel with “View Application Status” and “Sign Out”.

## P4 → P5/P6 quality gate

Proceed only when both are true:

1. **Security + UX signoff** confirms lifecycle and reauth transitions are deterministic.
2. **Consistency signoff** confirms account→status handoff remains predictable across refresh/login/logout.
