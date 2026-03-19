# Contact Routing Map (P5)

Date: 2026-03-19

| Subject         | Typical source routes              | Primary queue          | Secondary escalation | Notes                                                       |
| --------------- | ---------------------------------- | ---------------------- | -------------------- | ----------------------------------------------------------- |
| `eligibility`   | `/program`, `/apply`               | Program support queue  | Product triage       | Eligibility clarifications, prep questions.                 |
| `application`   | `/apply`                           | Application operations | Case management      | Validate errors, submission references, stuck applications. |
| `account`       | `/account`                         | Account support queue  | Security liaison     | Sign-in/session issues and lockouts.                        |
| `status`        | `/status`                          | Status support queue   | Case management      | Missing updates, stale statuses.                            |
| `accessibility` | `/accessibility`, any blocked flow | Accessibility support  | Engineering on-call  | Assistive tech issues and accommodation requests.           |
| `legal`         | `/legal`, policy pages             | Legal liaison queue    | Compliance lead      | Policy interpretation and consent/disclosure questions.     |
| `other/general` | `/support`, `/404`                 | Intake triage queue    | Duty manager         | Catch-all; reclassify within first response.                |

## First-contact triage completeness minimums

Required on intake before assignment:

1. Contact identity (`name`, `email`).
2. Issue taxonomy (`subject`).
3. Problem narrative (`message`).
4. Context envelope (`source`, `severity`).
5. If available from blocker: `errorCode`, `requestId`, `applicationId`.
