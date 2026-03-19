# Rollback + Communications Plan (Phase 6)

Date: 2026-03-19

## Rollback strategy

1. Revert portal static bundle to previous tagged deployment.
2. Restore prior support form payload schema compatibility mode (`name/email/subject/message`).
3. Verify legal/support navigation links after rollback smoke test.
4. Announce rollback status to internal launch channel and support desk.

## Rollback validation evidence

- Smoke routes: `/`, `/apply`, `/account`, `/status`, `/support`, `/legal`, `/404`.
- Validate policy pages reachable and support submission functional.
- Confirm no broken links in nav/footer and contextual legal/support CTAs.

## Communications templates

### Internal incident update

- Incident opened: `<timestamp>`
- Impact: Support/legal completion release regression
- User-facing scope: `<routes>`
- Mitigation action: rollback initiated
- Next update ETA: 30 minutes

### External status note

"We identified an issue affecting support/legal workflow updates and have reverted to the previous stable experience while we apply a fix. Support remains available through the standard support channel."
