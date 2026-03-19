# Risk Register

Maintain prioritized launch risks and explicit contingency planning.

## Fields

- Risk ID
- Probability
- Impact
- Score
- Mitigation
- Mitigation owner
- Trigger signal
- Contingency

## Register

| Risk ID | Probability | Impact | Score | Mitigation | Mitigation owner | Trigger signal | Contingency |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Medium | High | 12 | Lock legal copy review slots in Week 1 and Week 2; track unresolved items in triage. | Legal DRI | Legal comments unresolved > 5 business days. | Freeze dependent copy and ship approved fallback language. |
| R-002 | Medium | High | 12 | Define API contract tests and require staging verification before P3 starts. | Backend API Lead | New/changed error codes after P3 kickoff. | Implement defensive mapping and defer non-critical UX variants. |
| R-003 | Low | High | 8 | Perform auth timeout/session tests in Week 4 with QA scenarios. | Auth Lead | Unexpected session expiry or redirect loops in staging. | Disable risky session optimization and fall back to stable flow. |
| R-004 | Medium | Medium | 9 | Require telemetry checklist in DoD and verify event naming in PR review. | Analytics DRI | Missing or malformed launch-critical event payloads. | Patch telemetry hotfix and annotate analytics gaps in launch report. |
| R-005 | Medium | High | 12 | Execute CTA destination crawl before P2 sign-off and enforce redirect matrix checks in CI lint script. | UX Lead + Portal Eng | CTA points to stale/incorrect route or unexpected redirect. | Hotfix redirect rules and temporarily hide affected CTA until verified. |
| R-006 | Medium | High | 12 | Maintain SSOT field catalog and lock required/optional flags at gate review. | Product Manager | Required field status changes after P3 planning starts. | Introduce compatibility layer and defer non-critical required-field changes. |
