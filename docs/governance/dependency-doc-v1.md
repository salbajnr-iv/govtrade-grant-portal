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

| Dependency ID | Description | Owner | Due date | Status | Unblock criteria | Downstream impact |
| --- | --- | --- | --- | --- | --- | --- |
| DEP-001 | Legal-approved disclosure copy for application and support touchpoints. | Legal DRI | 2026-03-31 | In progress | Legal reviewer approves final copy package in decision log. | Blocks P2 UX/content finalization and P3 error-state copy. |
| DEP-002 | Stable application API error schema for client-side handling. | Backend API Lead | 2026-04-03 | In progress | Error code contract published and validated in staging. | Blocks P3 validation and retry/recovery implementation. |
| DEP-003 | Auth session lifecycle contract for account and status pages. | Auth Lead | 2026-04-10 | In progress | Session refresh/timeout behavior confirmed with QA scenarios. | Blocks P4 auth/account handoff and session recovery UX. |
| DEP-004 | Support escalation SLA and intake routing ownership. | Support Ops Lead | 2026-04-17 | In progress | SLA document signed off and contact routing verified. | Blocks P5 support path completion and launch runbook. |
| DEP-005 | Approved routes + copy constraints sheet sign-off across Product/Legal/Eng. | Product Lead | 2026-03-28 | In progress | Signed artifact attached to phase breakdown and decision log. | Blocks P0 -> P2 gate closure. |
| DEP-006 | Compliance matrix (apply/support) and retention policy annotation complete. | Compliance Lead | 2026-04-01 | Open | Compliance checklist reviewed and accepted by Legal + Product. | Blocks P2 -> P3 field validation sign-off. |

## Gate checkpoint status

- **P0 -> P2:** Not yet signed (dependencies DEP-001, DEP-002, DEP-005 still open/in progress).
- **P2 -> P3:** Not yet signed (dependencies DEP-001, DEP-002, DEP-006 still open/in progress).
