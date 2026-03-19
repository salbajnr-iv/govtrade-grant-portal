# Implementation Plan

## Status legend

- **Not started**: Work has not begun.
- **In progress**: Actively being implemented.
- **Blocked**: Cannot proceed due to dependency/risk.
- **Done**: Completed and merged.

## Phased execution checklist

| Phase   | Workstream       | Task                                                                              | Status      | Owner                    | Dependency notes                                                                        |
| ------- | ---------------- | --------------------------------------------------------------------------------- | ----------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Phase 0 | Alignment        | Confirm sitemap, page ownership, and success metrics.                             | In progress | Product + Eng            | Depends on stakeholder sign-off for scope boundaries.                                   |
| Phase 0 | Alignment        | Approve journey definitions for visitor/applicant/signed-in/support/legal.        | In progress | Product + Ops            | Requires workshop outputs and legal review of policy touchpoints.                       |
| Phase 1 | Foundation       | Establish documentation baseline in `docs/portal-flow-map.md` and this plan.      | Done        | Portal Eng               | No upstream dependency; prerequisite for execution tracking.                            |
| Phase 1 | Foundation       | Add README references and operating cadence for updates.                          | Done        | Portal Eng               | Depends on docs baseline completion.                                                    |
| Phase 1 | Work package A   | Sitemap + legal copy freeze with signed Approved Routes + Copy Constraints sheet. | In progress | Product + Legal + Eng    | Requires closure of high-sensitivity wording decisions in triage.                       |
| Phase 1 | Work package B   | API contract freeze (`v0.9`) for apply/support/auth/status + error taxonomy.      | In progress | Backend API + Frontend   | Requires contract validation and changelog discipline for pre-v1.0 updates.             |
| Phase 1 | Work package C   | Compliance matrix + support model (SLA/escalation/intake/ownership).              | In progress | Compliance + Support Ops | Requires signed dependency doc and mitigation owner assignment.                         |
| Phase 2 | UX + Content     | Validate CTA copy and routing consistency across all sitemap pages.               | In progress | UX + Content             | Depends on approved sitemap and legal wording constraints.                              |
| Phase 2 | UX + Content     | Define required and optional fields for `apply.html` and support forms.           | In progress | Applications + Support   | Depends on API contract and compliance requirements.                                    |
| Phase 3 | Application Flow | Harden client-side validation and error states for application submission.        | Not started | Portal Eng               | Depends on Phase 2 field definitions and API error schema.                              |
| Phase 3 | Application Flow | Implement confirmation, retry, and recoverability UX for failed submissions.      | Not started | Portal Eng               | Depends on back-end retry/idempotency behavior.                                         |
| Phase 4 | Auth + Account   | Finalize login/logout/session restoration behavior in `account.html`.             | Not started | Auth + Portal Eng        | Depends on auth API stability and security review.                                      |
| Phase 4 | Auth + Account   | Standardize status handoff from account to `status.html`.                         | Not started | Case Mgmt + Eng          | Depends on account state model and status API capabilities.                             |
| Phase 5 | Support + Legal  | Ensure legal pages are discoverable from every critical path.                     | Done        | Legal + UX               | Completed with discoverability checklist + policy version traceability artifacts.       |
| Phase 5 | Support + Legal  | Tighten support escalation path from errors and blocked states.                   | Done        | Support Ops + Eng        | Completed with escalation matrix, contextual support links, and enriched intake schema. |
| Phase 6 | QA + Launch      | Run integrated QA across visitor/applicant/signed-in/support/legal journeys.      | Done        | QA + Eng                 | Completed with integrated matrix and defect disposition report.                         |
| Phase 6 | QA + Launch      | Launch readiness review and production release checklist.                         | Done        | Product + Eng + Legal    | Completed with signed checklist and rollback/communications plan.                       |

## Phase artifacts (new)

- Operationalized plan: `docs/planning/phase-breakdown-operationalized.md`
- API freeze contract: `docs/contracts/openapi-v0.9.yaml`
- API changelog: `docs/contracts/changelog.md`
- CTA matrix + copy catalog: `docs/ux/cta-matrix.md`
- Routing + redirect matrix: `docs/ux/routing-map.md`
- Field/validation/API mapping spec: `docs/data/form-field-spec.md`

## Dependency notes (cross-cutting)

1. **Legal/compliance dependency**: Policy wording changes can block apply and support touchpoints if disclosure text must be updated simultaneously.
2. **API dependency**: Form and auth UX completion depends on stable request/response contracts and consistent error codes.
3. **Content dependency**: CTA and help content updates should be coordinated with support scripts to avoid user confusion.
4. **Release dependency**: Final rollout should bundle docs, routing, and QA sign-off in the same release window to keep the flow map accurate.

## Ongoing execution updates

- Update each task status when work starts, pauses, or completes.
- Add a dated note beside blocked items describing blocker owner and expected unblock date.
- Keep dependencies current whenever API, legal, or operational assumptions change.

## Governance artifacts

- Master board definition: `docs/execution/master-board.md`
- Standard ticket schema: `docs/execution/ticket-schema.md`
- 8-week ceremony plan: `docs/execution/ceremonies-calendar.md`
- Dependency register: `docs/governance/dependency-doc-v1.md`
- Decision log: `docs/governance/decision-log.md`
- Risk register: `docs/governance/risk-register.md`
- Definition of Done template: `docs/governance/dod-template.md`
- Phase 5 legal discoverability report: `docs/phase5/legal-discoverability-checklist.md`
- Phase 5 support escalation matrix: `docs/phase5/support-escalation-matrix.md`
- Phase 5 contact routing map: `docs/phase5/contact-routing-map.md`
- Phase 6 QA report: `docs/release/qa-report-defect-disposition.md`
- Phase 6 launch checklist: `docs/release/signed-launch-checklist.md`
- Phase 6 rollback + communications plan: `docs/release/rollback-communications-plan.md`
