# CTA Matrix (Current vs Approved)

## Taxonomy dictionary

- **Primary**: Main progression action in a journey.
- **Secondary**: Auxiliary navigation action.
- **Legal**: Consent/disclosure/policy action.
- **Support**: Help/escalation action.

## CTA inventory

| Page | CTA text | Type | Destination | Context | Audience | Legal sensitivity | Current | Approved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Apply now | Primary | `/apply` | Hero and key conversion path | Visitor | Medium | Yes | Yes |
| `/` | Sign in | Primary | `/account` | Returning applicant | Returning user | Low | Yes | Yes |
| `/` | Program details | Secondary | `/program` | Learn-before-apply | Visitor | Low | Yes | Yes |
| `/` | Support | Support | `/support` | Help or blocked state | All | Medium | Yes | Yes |
| `/program` | Start application | Primary | `/apply` | Post-eligibility read | Visitor | Medium | Yes | Yes |
| `/apply` | Submit application | Primary | `POST /api/applications` | Completion action | Applicant | High | Yes | Yes |
| `/apply` | Terms | Legal | `/terms` | Consent context | Applicant | High | Yes | Yes |
| `/apply` | Privacy | Legal | `/privacy` | Data-use disclosure | Applicant | High | Yes | Yes |
| `/apply` | Cookies | Legal | `/cookies` | Tracking disclosure | Applicant | Medium | Yes | Yes |
| `/account` | Sign in / Continue | Primary | `POST /api/auth/login` | Auth entry | Returning user | Medium | Yes | Yes |
| `/account` | Forgot password | Secondary | `/forgot-password` | Credential recovery | Returning user | Low | Yes | Yes |
| `/account` | Status | Primary | `/status` | Progress check | Signed-in applicant | Low | Yes | Yes |
| `/status` | Need help | Support | `/support` | Escalation from blocked status | Applicant | Medium | Yes | Yes |
| `/support` | Submit support request | Support | `POST /api/contact` | Intake action | All | High | Yes | Yes |
| `/support` | Legal resources | Legal | `/legal` | Policy guidance | All | Medium | Yes | Yes |
| `/404` | Go to home | Secondary | `/` | Recovery from invalid URL | All | Low | Yes | Yes |
| `/404` | Get support | Support | `/support` | Recovery when blocked | All | Medium | Yes | Yes |

## Approved CTA copy catalog

### Primary

- Apply now
- Start application
- Submit application
- Sign in / Continue
- View status

### Secondary

- Program details
- Back to home
- Forgot password
- Go to home

### Legal

- Terms
- Privacy
- Cookies
- Legal resources

### Support

- Support
- Need help
- Submit support request
- Get support

## Sign-off checklist (P2 -> P3 gate input)

- [ ] Product sign-off
- [ ] UX/content sign-off
- [ ] Legal review sign-off for High-sensitivity rows
- [ ] Engineering routing verification complete
