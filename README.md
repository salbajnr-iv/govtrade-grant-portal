---
title: GovTrade Grant Portal 🏛️
colorFrom: pink
colorTo: pink
sdk: static
emoji: 📚
tags:
  - deepsite-v4
---

# GovTrade Grant Portal 🏛️

This project has been created with [DeepSite](https://deepsite.hf.co) AI Vibe Coding.


## Canonical URL policy

This project uses **clean routes** as canonical URLs (no `.html` in public links):

- Canonical examples: `/`, `/apply`, `/support`, `/legal`, `/privacy`.
- Static files remain `.html` on disk and are mapped by hosting rewrites (`_redirects` and `vercel.json`).
- Legacy `.html` paths are redirected to clean canonical routes.
- `sitemap.xml` lists only canonical clean-route URLs, once per page.

## API configuration

The front-end supports two runtime modes:

1. **Live API mode** (default when `GOVTRADE_API_BASE_URL` is set)
2. **Mock mode** (automatic fallback for static previews)

### Set API base URL

Configure the API base URL before loading `script.js`:

```html
<script>
  window.GOVTRADE_API_BASE_URL = 'https://api.example.govtrade';
</script>
<script src="script.js"></script>
```

You can also enable mock mode explicitly:

```html
<script>
  window.GOVTRADE_USE_MOCK_API = true;
</script>
```

Or with query param while previewing statically:

```text
index.html?mockApi=1
```

## API contract

### `POST /api/applications`

Submit a grant application.

**Request JSON**

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "+15551234567",
  "ssnToken": "tok_ssn_xxxxx",
  "requestedAmountBracket": "5001-15000",
  "plan": "Trading and digital marketing rollout plan...",
  "acceptedTerms": true
}
```

**Success response**

```json
{ "received": true }
```

### `POST /api/contact`

Send a public contact request.

**Request JSON**

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "subject": "eligibility",
  "message": "Can I apply with an existing business?"
}
```

**Success response**

```json
{ "received": true }
```

### `POST /api/auth/login`

Authenticate user.

**Request JSON**

```json
{
  "email": "ada@example.com",
  "password": "********"
}
```

**Success response**

```json
{
  "user": {
    "name": "Ada Lovelace",
    "email": "ada@example.com"
  }
}
```

### `POST /api/auth/logout` (optional)

Terminate the active user session.

**Request JSON**

```json
{}
```

**Success response**

```json
{ "ok": true }
```

## Security/storage notes

- SSN input is masked in the UI and converted to a token before submission.
- Sensitive form payloads (SSN, passwords, plans) are never written to `localStorage`.
- Only session-safe display metadata is stored (`name`, `email`) to restore auth UI state on refresh.


## Portal documentation

- Flow map: [`docs/portal-flow-map.md`](docs/portal-flow-map.md)
- Execution plan: [`docs/implementation-plan.md`](docs/implementation-plan.md)

### Update cadence

Update both documents after each merged PR (or at minimum once per sprint) so status and journey mapping stay in sync with production behavior.

## Quality checks

Install tooling dependencies:

```bash
npm install
```

Run JavaScript linting:

```bash
npm run lint
```

Run formatting validation:

```bash
npm run format:check
```

Run all quality gates together:

```bash
npm run validate
```
