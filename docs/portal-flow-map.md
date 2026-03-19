# Portal Flow Map

## Full sitemap

| Page | Purpose | Primary CTA in | Primary CTA out | Owner / Status |
| --- | --- | --- | --- | --- |
| `index.html` | Public landing page with program overview and route selection. | Direct visit, search, external referrals. | **Apply now** → `apply.html`; **Sign in** → `account.html`; **Program details** → `program.html`; **Support** → `support.html`. | Product / Active |
| `program.html` | Explains grant scope, eligibility, and process details. | `index.html` program details CTA. | **Start application** → `apply.html`; **Back to home** → `index.html`. | Program Ops / Active |
| `apply.html` | Primary applicant intake form and submission flow. | `index.html` or `program.html` apply CTA. | **Submit application** (API); confirmation + next-step guidance to `account.html`; legal links to `terms.html`, `privacy.html`, `cookies.html`. | Applications Team / Active |
| `account.html` | Signed-in user account entry, authentication, and dashboard state. | Sign-in CTA, post-apply handoff, forgot-password route. | **Sign in / Continue** to user state; **Forgot password** → `forgot-password.html`; **Support** → `support.html`; **Status** → `status.html`. | Auth + Portal Eng / Active |
| `forgot-password.html` | Password reset initiation page for returning users. | `account.html` forgot password CTA. | **Send reset link** then return path to `account.html`. | Auth + Portal Eng / Active |
| `status.html` | Application status lookup/summary page. | Authenticated account route or direct bookmarked access. | **View account** → `account.html`; **Need help** → `support.html`. | Case Management / Active |
| `support.html` | Public and signed-in support intake and contact paths. | Global nav/footer links and error/fallback states. | **Submit support request** (API); **Legal resources** → `legal.html`; **Back home** → `index.html`. | Support Operations / Active |
| `legal.html` | Legal policy hub for all policy documents. | Footer legal links from all pages. | Links to `terms.html`, `privacy.html`, `cookies.html`, `accessibility.html`; return route to `index.html`. | Legal / Active |
| `terms.html` | Terms and conditions reference. | `legal.html` and form disclosure links. | Return route to `legal.html` or `apply.html`. | Legal / Active |
| `privacy.html` | Privacy notice and data-use disclosure. | `legal.html` and form disclosure links. | Return route to `legal.html` or `apply.html`. | Legal / Active |
| `cookies.html` | Cookie usage policy and preferences context. | `legal.html`, cookie/footer references. | Return route to `legal.html` or `index.html`. | Legal / Active |
| `accessibility.html` | Accessibility statement and accommodation guidance. | `legal.html` accessibility link. | **Request accommodation** → `support.html`; return route to `legal.html`. | Accessibility + Legal / Active |
| `404.html` | Not found/error recovery for invalid routes. | Invalid URL or stale deep link. | **Go to home** → `index.html`; **Get support** → `support.html`. | Platform / Active |

## End-to-end journey diagrams

### 1) Visitor journey

```mermaid
flowchart LR
    V0[Visitor lands on index.html] --> V1{Intent}
    V1 -->|Learn first| V2[program.html]
    V1 -->|Apply now| V3[apply.html]
    V1 -->|Need help| V4[support.html]
    V2 --> V3
    V3 -->|Needs policy context| V5[terms/privacy/cookies]
    V3 -->|Not ready| V0
```

### 2) Applicant journey

```mermaid
flowchart LR
    A0[Start application on apply.html] --> A1[Complete required fields]
    A1 --> A2[Submit POST /api/applications]
    A2 -->|Success| A3[Confirmation + next steps]
    A2 -->|Validation/API issue| A4[Inline error + retry]
    A3 --> A5[Prompt to sign in on account.html]
    A4 --> A1
```

### 3) Signed-in user journey

```mermaid
flowchart LR
    S0[account.html sign in] --> S1[POST /api/auth/login]
    S1 -->|Success| S2[Signed-in dashboard state]
    S1 -->|Failure| S3[Auth error]
    S3 --> S0
    S2 --> S4[status.html for application status]
    S2 --> S5[support.html for assistance]
    S2 --> S6[POST /api/auth/logout]
    S6 --> S0
```

### 4) Support / Legal journey

```mermaid
flowchart LR
    L0[User enters support.html or legal.html] --> L1{Need type}
    L1 -->|Support request| L2[Submit POST /api/contact]
    L1 -->|Policy review| L3[legal.html policy hub]
    L3 --> L4[terms/privacy/cookies/accessibility]
    L4 -->|Still blocked| L2
    L2 --> L5[Support follow-up and resolution]
```
