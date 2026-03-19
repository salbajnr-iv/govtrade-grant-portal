# Dependency Doc v1

Track all cross-team or external dependencies that can affect phase gates.

## Fields

- Dependency ID
- Description
- Owner
- Due date
- Status
- Unblock criteria
- Downstream impact

## Register

| Dependency ID | Description                                                             | Owner            | Due date   | Status | Unblock criteria                                              | Downstream impact                                          |
| ------------- | ----------------------------------------------------------------------- | ---------------- | ---------- | ------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| DEP-001       | Legal-approved disclosure copy for application and support touchpoints. | Legal DRI        | 2026-03-31 | Open   | Legal reviewer approves final copy package in decision log.   | Blocks P2 UX/content finalization and P3 error-state copy. |
| DEP-002       | Stable application API error schema for client-side handling.           | Backend API Lead | 2026-04-03 | Open   | Error code contract published and validated in staging.       | Blocks P3 validation and retry/recovery implementation.    |
| DEP-003       | Auth session lifecycle contract for account and status pages.           | Auth Lead        | 2026-04-10 | Open   | Session refresh/timeout behavior confirmed with QA scenarios. | Blocks P4 auth/account handoff and session recovery UX.    |
| DEP-004       | Support escalation SLA and intake routing ownership.                    | Support Ops Lead | 2026-04-17 | Open   | SLA document signed off and contact routing verified.         | Blocks P5 support path completion and launch runbook.      |
