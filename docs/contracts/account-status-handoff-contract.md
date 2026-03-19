# Account → Status Handoff Contract

## Scope

Defines browser-side handoff state transferred from `account.html` to `status.html`.

## Transport

- Store object in `sessionStorage['govtrade.accountStatusHandoff']`.
- Navigate to `/status?handoff=<handoffId>&issuedAt=<epoch_ms>`.

## Contract

```json
{
  "payload": {
    "accountHint": "user@example.com",
    "sessionState": "active|restored",
    "source": "/account"
  },
  "identifiers": {
    "handoffId": "handoff_xxxxxxxx",
    "correlationId": "corr_<epoch_ms>"
  },
  "freshness": {
    "issuedAt": 0,
    "expiresAt": 0,
    "ttlMs": 600000
  },
  "fallback": {
    "onMissingState": "/account?reason=unauthorized&returnTo=%2Fstatus",
    "onExpiredState": "/account?reason=expiry&returnTo=%2Fstatus"
  }
}
```

## Validation on status page

1. Session must be authenticated (`active` or `restored`).
2. `handoff` query parameter must exist.
3. Stored contract must exist and parse.
4. `identifiers.handoffId` must equal query `handoff`.
5. `freshness.expiresAt` must be >= current time.

## Deep-link resilience

- **Refresh:** reads sessionStorage contract and re-validates.
- **Stale token:** show stale-state recovery and reauth action.
- **Missing state:** show recovery UX and direct user to account sign-in.

## Recovery UX

When invalid:

- Preserve access to public service status content.
- Show account-specific status panel in recovery mode.
- Offer “Sign in to continue” and “Contact support” actions.
