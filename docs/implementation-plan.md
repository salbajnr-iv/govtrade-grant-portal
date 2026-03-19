# Implementation Plan

## Status legend

- **Not started**: Work has not begun.
- **In progress**: Actively being implemented.
- **Blocked**: Cannot proceed due to dependency/risk.
- **Done**: Completed and merged.

## Phased execution checklist

| Phase | Workstream | Task | Status | Owner | Dependency notes |
| --- | --- | --- | --- | --- | --- |
| Phase 0 | Alignment | Confirm sitemap, page ownership, and success metrics. | Not started | Product + Eng | Depends on stakeholder sign-off for scope boundaries. |
| Phase 0 | Alignment | Approve journey definitions for visitor/applicant/signed-in/support/legal. | Not started | Product + Ops | Requires workshop outputs and legal review of policy touchpoints. |
| Phase 1 | Foundation | Establish documentation baseline in `docs/portal-flow-map.md` and this plan. | Done | Portal Eng | No upstream dependency; prerequisite for execution tracking. |
| Phase 1 | Foundation | Add README references and operating cadence for updates. | Done | Portal Eng | Depends on docs baseline completion. |
| Phase 2 | UX + Content | Validate CTA copy and routing consistency across all sitemap pages. | Not started | UX + Content | Depends on approved sitemap and legal wording constraints. |
| Phase 2 | UX + Content | Define required and optional fields for `apply.html` and support forms. | Not started | Applications + Support | Depends on API contract and compliance requirements. |
| Phase 3 | Application Flow | Harden client-side validation and error states for application submission. | Not started | Portal Eng | Depends on Phase 2 field definitions and API error schema. |
| Phase 3 | Application Flow | Implement confirmation, retry, and recoverability UX for failed submissions. | Not started | Portal Eng | Depends on back-end retry/idempotency behavior. |
| Phase 4 | Auth + Account | Finalize login/logout/session restoration behavior in `account.html`. | Not started | Auth + Portal Eng | Depends on auth API stability and security review. |
| Phase 4 | Auth + Account | Standardize status handoff from account to `status.html`. | Not started | Case Mgmt + Eng | Depends on account state model and status API capabilities. |
| Phase 5 | Support + Legal | Ensure legal pages are discoverable from every critical path. | Not started | Legal + UX | Depends on final nav/footer structure and policy versioning. |
| Phase 5 | Support + Legal | Tighten support escalation path from errors and blocked states. | Not started | Support Ops + Eng | Depends on support SLA definitions and contact intake schema. |
| Phase 6 | QA + Launch | Run integrated QA across visitor/applicant/signed-in/support/legal journeys. | Not started | QA + Eng | Depends on completion of Phases 2–5. |
| Phase 6 | QA + Launch | Launch readiness review and production release checklist. | Not started | Product + Eng + Legal | Depends on QA pass, legal approval, and rollback plan. |

## Dependency notes (cross-cutting)

1. **Legal/compliance dependency**: Policy wording changes can block apply and support touchpoints if disclosure text must be updated simultaneously.
2. **API dependency**: Form and auth UX completion depends on stable request/response contracts and consistent error codes.
3. **Content dependency**: CTA and help content updates should be coordinated with support scripts to avoid user confusion.
4. **Release dependency**: Final rollout should bundle docs, routing, and QA sign-off in the same release window to keep the flow map accurate.

## Ongoing execution updates

- Update each task status when work starts, pauses, or completes.
- Add a dated note beside blocked items describing blocker owner and expected unblock date.
- Keep dependencies current whenever API, legal, or operational assumptions change.
