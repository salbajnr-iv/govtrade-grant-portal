# Support Escalation Matrix (P5)

Date: 2026-03-19  
Owner: Support Ops + Engineering

## Severity + trigger rules

| Severity | Trigger class                            | Examples                                                                           | Required prefill payload                                                      | Routing target                     | SLA                                |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| Low      | Client validation                        | Missing/invalid fields (`CLIENT_VALIDATION_ERROR`)                                 | `source`, `severity=low`, `errorCode`, optional `requestId`                   | Tier 1 applicant help queue        | First response <= 1 business day   |
| Medium   | Recoverable transient                    | Network timeouts, 5xx/transient failures                                           | `source`, `severity=medium`, `failureModel`, `errorCode`, `requestId`         | Tier 1 + incident monitor          | First response <= 8 business hours |
| High     | Auth/session or unknown repeated failure | Session expiry, unknown hard errors, locked sign-in flow                           | `source`, `severity=high`, `errorCode`, `requestId`, optional `applicationId` | Tier 2 case management             | First response <= 4 business hours |
| Critical | Security/legal/accessibility risk        | Sensitive disclosure, legal objection, accessibility blocker preventing completion | `source`, `severity=critical`, full context fields + user message             | On-call escalation + legal liaison | First response <= 1 hour           |

## Implemented behavior

- Apply flow now generates contextual escalation links for blocked/retry/fatal states.
- 404/status/account/legal pages include support links with safe query-param prefill.
- Support form captures triage completeness fields: `subject`, `applicationId`, `path/source`, `errorCode`, `requestId`, `severity`.
