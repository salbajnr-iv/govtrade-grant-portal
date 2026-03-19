# Decision Log

Capture durable product, UX, legal, and technical decisions that affect delivery.

## Fields

- Date
- Decision
- Approver
- Impacted phase/tickets
- Expiry/review date

## Log

| Date | Decision | Approver | Impacted phase/tickets | Expiry/review date |
| --- | --- | --- | --- | --- |
| 2026-03-19 | Adopt single master board with epics P0, P2, P3, P4, P5, P6. | Program Lead | Program governance / all tickets | 2026-05-17 |
| 2026-03-19 | Require six custom fields on all tickets (owner, dependency, AC, legal impact, telemetry impact, rollback impact). | Product + Engineering Manager | Intake policy / all new tickets | 2026-05-17 |
| 2026-03-19 | Start launch readiness cadence in Phase 5 (weekly in Week 6; twice weekly in Weeks 7-8). | Product + Release Manager | P6 readiness tickets | 2026-05-17 |
| 2026-03-19 | Freeze API contract at `v0.9.0` for apply/support/auth/status with bounded instability notes and changelog controls. | Backend API Lead + Frontend Lead + QA Lead | P0 -> P2 gate artifacts | 2026-04-30 |
| 2026-03-19 | Approve CTA taxonomy (`Primary`, `Secondary`, `Legal`, `Support`) as canonical labeling for all sitemap CTAs. | Product Lead + UX Lead + Legal Reviewer | Phase 2.1 CTA normalization | 2026-05-01 |
| 2026-03-19 | Define form-field SSOT in `docs/data/form-field-spec.md`; no unresolved required/optional status allowed at P2 -> P3 gate. | Product + Eng + Compliance | Phase 2.2 data definition gate | 2026-05-01 |
