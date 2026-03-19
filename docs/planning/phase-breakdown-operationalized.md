# Phase-by-Phase Implementation Breakdown (Operationalized)

This document converts the launch plan into executable work packages, concrete deliverables, and gated exit criteria.

## Scope and timing

- **Phase 1 (Week 1):** Work packages A, B, and C.
- **Phase 2 (Weeks 2-3):** CTA/routing standardization and data-definition closure.
- **Gate logic:** P0 -> P2 -> P3; each gate requires signed artifacts listed below.

---

## Work package A: Sitemap + legal copy freeze

### Inputs

- Final sitemap candidates from current build and canonical route policy.
- Legal wording constraints from Legal + Compliance.

### Steps (operational)

1. **Collect all route candidates**
   - Sources: `sitemap.xml`, `_redirects`, `vercel.json`, static `.html` pages.
   - Normalize to canonical clean routes + legacy redirects.
2. **Mark legal-sensitive copy blocks**
   - Flag CTAs and inline copy that touch consent, disclosures, retention, and support promises.
   - Tag each block with owner (`Legal`, `Product`, `Support`, `Eng`).
3. **Resolve open wording decisions in triage**
   - Run daily 20-minute wording triage until all `High` legal sensitivity items close.
   - Any unresolved item after 2 business days is escalated to Legal DRI.

### Deliverables

- **Approved Routes + Copy Constraints Sheet** (signed by Product + Legal + Eng).
- Included sections:
  - canonical route inventory,
  - redirect decisions,
  - legal-sensitive copy catalog,
  - unresolved wording log (must be empty at sign-off).

### Completion criteria

- No route ambiguity between sitemap and runtime redirects.
- All legal-sensitive copy has owner + final wording decision.
- Sign-off captured in governance decision log.

---

## Work package B: API contract freeze

### Freeze scope

1. **Apply/support payload schemas**
2. **Auth/session endpoints**
3. **Status endpoint + account state model**
4. **Submission error schema taxonomy**

### Deliverables

- **Versioned OpenAPI + JSON schemas** in `docs/contracts/openapi-v0.9.yaml`.
- **Contract changelog** in `docs/contracts/changelog.md`.
- `v0.9` is allowed provided every unstable area has an explicit boundary note.

### Completion criteria

- API consumer mappings for `apply`, `support`, `account`, and `status` are complete.
- Error taxonomy includes user-safe messaging key + technical fallback code.
- Contract review sign-off from Backend + Frontend + QA.

---

## Work package C: Compliance + support model

### Compliance matrix (by form)

- **Application form:** consent, disclosures, data retention baseline, PII classification.
- **Support form:** consent, disclosure text, retention policy, escalation path.

### Support operating model

- **SLA tiers:** P0/P1/P2 severity definitions with response targets.
- **Escalation triggers:** hard rules for legal risk, repeat failures, and blocked applicants.
- **Intake schema fields:** minimum required routing fields.
- **Ownership matrix:** Support Ops / Legal / Eng on-call handoff ownership.

### Deliverables

- Compliance matrix artifact.
- Support model playbook.
- Signed dependency document references updated.

### Gate to proceed (P0 -> P2)

All must be true:

- Signed dependency doc.
- Workstream owners assigned.
- Risks logged + mitigation owners set.

---

## Phase 2 (Weeks 2-3): UX + Content + Data definition

### 2.1 CTA copy/routing consistency

#### Capture

Crawl all sitemap pages and capture per CTA:

- text,
- type,
- destination,
- context,
- audience,
- legal sensitivity.

#### Taxonomy dictionary

- **Primary**: core conversion/action step.
- **Secondary**: supporting navigation action.
- **Legal**: policy/compliance disclosure or agreement action.
- **Support**: help/escalation action.

#### Validation checks

- Destination resolves to intended journey state.
- Redirect behavior is expected and documented.
- 404 exceptions list is explicit and approved.
- Legal-sensitive CTAs pass legal review.

#### Artifacts

- CTA matrix (current vs approved): `docs/ux/cta-matrix.md`.
- Routing map + redirect matrix: `docs/ux/routing-map.md`.
- Approved CTA copy catalog: section in `docs/ux/cta-matrix.md`.

### 2.2 Form field definition (apply + support)

#### Field catalog schema

Each field requires:

- `key`
- `label`
- `required|optional`
- `type`
- `constraints`
- `regex`
- `help text`
- `PII class`

#### Mapping and compliance

- Map UI fields to API payload keys.
- Add compliance annotations per field.
- Define error text standard:
  - user-friendly message,
  - technical fallback code map.

#### Artifacts

- Form field spec (single source of truth): `docs/data/form-field-spec.md`.
- Validation rules matrix: section in `docs/data/form-field-spec.md`.
- API mapping sheet: section in `docs/data/form-field-spec.md`.

### Gate to proceed (P2 -> P3)

All must be true:

- CTA/routing sign-off complete.
- Field/validation spec signed by Product + Engineering + Compliance.
- Zero unresolved required/optional field decisions.

---

## RACI and ownership

| Work package | Accountable | Responsible | Consulted | Informed |
| --- | --- | --- | --- | --- |
| A: Sitemap + copy freeze | Product Lead | UX Writer, Portal Eng | Legal, Support Ops | QA, Program |
| B: API contract freeze | Backend API Lead | Backend + Frontend | QA, Security | Product, Support |
| C: Compliance + support model | Compliance Lead | Legal + Support Ops | Product, Eng | Program |
| 2.1 CTA/routing | UX Lead | Content + Portal Eng | Legal, Support | QA |
| 2.2 Field definitions | Product Manager | Frontend + Backend | Compliance, Support | QA |

## Review cadence

- Daily triage during Week 1 for wording + contract blockers.
- Twice-weekly gate readiness review in Weeks 2-3.
- Gate decision logs recorded in `docs/governance/decision-log.md`.
