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
