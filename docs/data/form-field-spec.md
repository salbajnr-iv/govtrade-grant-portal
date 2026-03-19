# Form Field Spec (Single Source of Truth)

## 1) Apply form field catalog

| key | label | required | type | constraints | regex | help text | PII class | compliance annotation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| firstName | First name | Required | string | 1-100 chars | `^[A-Za-z\-\s']+$` | Enter legal first name. | Direct PII | Identity field; retained per application retention policy. |
| lastName | Last name | Required | string | 1-100 chars | `^[A-Za-z\-\s']+$` | Enter legal last name. | Direct PII | Identity field; retained per application retention policy. |
| email | Email | Required | email | valid RFC-like email | - | We send updates to this address. | Direct PII | Contact consent required via terms acceptance. |
| phone | Phone | Required | tel | E.164-like, 8-15 digits | `^\+?[1-9]\d{7,14}$` | Include country code if outside US. | Direct PII | Contact method used for critical support follow-up. |
| ssnToken | SSN token | Required | tokenized string | token only, min 8 | `^tok_[A-Za-z0-9_\-]+$` | SSN is tokenized before submit. | Sensitive PII | Raw SSN prohibited in client payload/logs. |
| requestedAmountBracket | Requested amount | Required | enum | one of defined brackets | - | Select the closest bracket. | Non-PII | Used for review queue routing only. |
| plan | Business plan summary | Required | textarea | 20-5000 chars | - | Describe intended use of funds. | Business-sensitive | Subject to retention policy and reviewer access controls. |
| acceptedTerms | Accept terms checkbox | Required | boolean | must be true | - | Required to submit application. | Compliance metadata | Consent record required for legal defensibility. |

## 2) Support form field catalog

| key | label | required | type | constraints | regex | help text | PII class | compliance annotation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| name | Full name | Required | string | 1-120 chars | `^[A-Za-z\-\s']+$` | Name of requestor. | Direct PII | Required for case attribution. |
| email | Email | Required | email | valid RFC-like email | - | Where we should reply. | Direct PII | Consent implied by contact initiation. |
| subject | Subject | Required | enum | taxonomy value only | - | Choose best topic. | Non-PII | Drives SLA routing and queue assignment. |
| message | Message | Required | textarea | 10-4000 chars | - | Include relevant context and errors. | Potential PII | Free text scanned for sensitive disclosures. |
| applicationId | Application ID | Optional | string | min 8 chars | `^[A-Za-z0-9\-]+$` | Add if you already applied. | Operational identifier | Links support case to status workflow. |

## 3) Validation rules matrix

| Field | Rule | User-facing error text | Technical fallback code |
| --- | --- | --- | --- |
| email | Invalid email format | Enter a valid email address. | `VAL_EMAIL_INVALID` |
| phone | Invalid phone format | Enter a valid phone number including country/area code. | `VAL_PHONE_INVALID` |
| ssnToken | Missing or malformed token | We could not verify your identity token. Please retry. | `VAL_SSN_TOKEN_INVALID` |
| plan | Below minimum length | Add more detail before submitting your plan. | `VAL_PLAN_TOO_SHORT` |
| acceptedTerms | Not checked | You must accept the terms to continue. | `VAL_TERMS_REQUIRED` |
| message | Too short | Please provide more details so we can help. | `VAL_MESSAGE_TOO_SHORT` |
| subject | Invalid enum value | Select a support topic from the list. | `VAL_SUBJECT_INVALID` |

## 4) UI -> API mapping sheet

### Apply

| UI field | API key |
| --- | --- |
| First name | `firstName` |
| Last name | `lastName` |
| Email | `email` |
| Phone | `phone` |
| SSN (tokenized client-side) | `ssnToken` |
| Requested amount | `requestedAmountBracket` |
| Business plan | `plan` |
| Terms checkbox | `acceptedTerms` |

### Support

| UI field | API key |
| --- | --- |
| Full name | `name` |
| Email | `email` |
| Subject | `subject` |
| Message | `message` |
| Application ID (optional) | `applicationId` |

## Sign-off checklist (P2 -> P3 gate input)

- [ ] Product
- [ ] Engineering
- [ ] Compliance
- [ ] Support Ops
