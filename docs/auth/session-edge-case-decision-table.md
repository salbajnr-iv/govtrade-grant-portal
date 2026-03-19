# Session + Handoff Edge-Case Decision Table

| Case                                     | Detected condition                                | Decision                                                | UX copy/theme                                            |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| Direct visit to `/status` without auth   | No session                                        | Treat as `unauthenticated`; do not show account details | “Sign in to recover account-specific status.”            |
| Refresh `/status` with valid handoff     | Auth + handoff present + not expired              | Render account-specific handoff details                 | “Handoff verified.”                                      |
| Refresh `/status` missing handoff state  | Auth but no sessionStorage handoff                | Recovery mode; prompt restart from Account              | “Could not find transfer state after refresh/deep-link.” |
| Query handoff mismatch                   | Auth + mismatched IDs                             | Recovery mode; deny account detail rendering            | “Handoff token does not match current browser state.”    |
| Stale handoff token                      | Auth + `expiresAt < now`                          | Recovery mode + reauth link with `reason=expiry`        | “Handoff token is stale.”                                |
| Session expired before status access     | Stored session expired                            | Redirect user to account reauth flow                    | `?reason=expiry&returnTo=/status`                        |
| Session revoked/unauthorized             | Stored session revoked or unauthorized reason     | Redirect to account reauth flow                         | `?reason=unauthorized&returnTo=/status`                  |
| Logout from account                      | Explicit sign-out action                          | Clear live session; deterministic redirect              | `?reason=logout&returnTo=/account`                       |
| Reauth completion from expiry/revocation | Login succeeds with `reason=expiry\|unauthorized` | Mark session `restored`; continue to return path        | “Session restored.”                                      |
