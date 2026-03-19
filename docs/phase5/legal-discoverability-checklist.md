# Legal Discoverability Checklist / Report (P5)

Date: 2026-03-19  
Owner: Legal + UX + Portal Engineering

## Critical-path coverage

| Path                              | Nav legal entry   | Footer legal entry | Contextual legal entry                              | Contextual support entry                              | Result |
| --------------------------------- | ----------------- | ------------------ | --------------------------------------------------- | ----------------------------------------------------- | ------ |
| Visitor (`/`, `/program`)         | Yes               | Yes                | Home includes legal/support CTAs                    | Yes                                                   | Pass   |
| Applicant (`/apply`)              | Yes               | Yes                | Inline pre-submit links to legal + privacy          | Escalation CTA rendered on blocked/retry/fatal states | Pass   |
| Signed-in (`/account`, `/status`) | Yes               | Yes                | Terms link in sign-in and legal hub link in status  | Prefilled support links by context                    | Pass   |
| Error (`/404`)                    | N/A (error shell) | N/A (error shell)  | Direct legal policy CTA button                      | Direct support CTA button with error context          | Pass   |
| Support (`/support`)              | Yes               | Yes                | Policy version and legal hub reference in form copy | Intake path native                                    | Pass   |

## Policy version + traceability

- Canonical legal hub displays policy version `GT-POL-2026.03`, effective date, and traceability reference `LEG-CHG-2026-03-19-01`.
- Policy leaf pages (`/terms`, `/privacy`, `/cookies`, `/accessibility`) display version and link back to legal traceability source.
- Support intake page repeats policy set version to prevent stale disclosure language during triage.

## Gate check (P5 -> P6)

- [x] No critical path lacks legal/support access.
- [x] Policy version is visible and traceable from legal + support + policy leaf pages.
- [x] Blocked/error experiences expose contextual support escalation entry points.
