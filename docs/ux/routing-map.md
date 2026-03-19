# Routing Map + Redirect Matrix

## Canonical route map

| Canonical route | Backing file | Notes |
| --- | --- | --- |
| `/` | `index.html` | Landing page |
| `/program` | `program.html` | Program details |
| `/apply` | `apply.html` | Application form |
| `/account` | `account.html` | Authenticated entry state |
| `/forgot-password` | `forgot-password.html` | Password recovery |
| `/status` | `status.html` | Application status |
| `/support` | `support.html` | Support intake |
| `/legal` | `legal.html` | Policy hub |
| `/terms` | `terms.html` | Terms and conditions |
| `/privacy` | `privacy.html` | Privacy notice |
| `/cookies` | `cookies.html` | Cookie policy |
| `/accessibility` | `accessibility.html` | Accessibility statement |

## Redirect matrix

| Source path | Redirect target | Type | Exception handling |
| --- | --- | --- | --- |
| `/index.html` | `/` | 301 | None |
| `/program.html` | `/program` | 301 | None |
| `/apply.html` | `/apply` | 301 | None |
| `/account.html` | `/account` | 301 | None |
| `/forgot-password.html` | `/forgot-password` | 301 | None |
| `/status.html` | `/status` | 301 | None |
| `/support.html` | `/support` | 301 | None |
| `/legal.html` | `/legal` | 301 | None |
| `/terms.html` | `/terms` | 301 | None |
| `/privacy.html` | `/privacy` | 301 | None |
| `/cookies.html` | `/cookies` | 301 | None |
| `/accessibility.html` | `/accessibility` | 301 | None |

## 404 exceptions list

Expected 404 behavior remains for:

- unknown deep links not present in sitemap,
- malformed status identifiers in route-like paths,
- stale external links to removed resources.

In these cases, route to `404.html` with recovery CTAs to `/` and `/support`.
