# Module Plan — Auth, Roles & User Management (shared infra)

Status: **planning, pre-UI**. Owner: Sachit Bansal ("Auth, roles, shared infra" — in progress per CLAUDE.md team table).

## Source of truth

`docs/drmp_proposal.tex`, Section 2.19 (`\label{sec:roles}`, lines 241–252) — role → permission mapping is **fixed by the proposal**, not admin-configurable:

- **Endowment Officer:** add/edit funds incl. reconciling interest received; read-only on all other modules.
- **CSR/Grants Officer:** add/edit grants and milestones; upload UCs; cannot approve own milestone payouts.
- **Scholarship Officer:** log applicants; initiate approval requests; cannot approve/disburse own requests.
- **Resource Generation/Fundraising Officer:** manage donor/partner DB, fundraising pipeline, proposal repository; draft (not send) donor emails.
- **Dean/Approver:** approve/reject disbursements; approve outgoing donor emails; view all dashboards; cannot directly edit historical fund/grant records.
- **Finance:** view all financial data; execute/record disbursements after approval; export reports; reconcile receipts; cannot approve applications.
- **Auditor:** read-only everywhere — the only role with zero create/edit/approve permission anywhere.

Section 2.20 (login): DORA staff use application-level email/password login unless institutional SSO is brought forward (Phase III).

## Decision (this session)

Considered and **rejected**: a Dean-configurable per-action permission matrix (Dean toggles add/edit/delete per module per user, independent of role). Rejected because:

1. **Conformance** — Section 2.19 already fixes permissions per role in the signed proposal text; making them freely admin-configurable changes system functionality/architecture relative to what's signed, which is a material change under Section 2.14/the Out-of-Scope clause (line 273) and would need DORA + Competent Authority written approval before any work on it starts.
2. **Merits, independent of conformance** — team is ≤6 people including the Dean; the fixed 7-role enum has slack (3 of 7 roles are Phase II, unused in Phase I). A full ACL engine adds a permissions table, turns every server-layer check into a runtime lookup instead of the single static `requireRole(...)` guard decided in `.claude/rules/server-layer.md`, and raises the risk of silently breaking the maker-checker rule (a maker must never be the checker on their own record) via a misconfigured toggle.

**Adopted instead:** fixed role enum (all 7 defined per CLAUDE.md, only `FUNDRAISING_OFFICER` + `DEAN_APPROVER` carrying real Phase I logic). Flexibility for team changes comes from **user-account management**, not permission configuration: Dean/Approver can create a new login and assign it one of the 7 existing roles, edit a user's assigned role, or deactivate a login when someone leaves. No new architecture, no per-action ACL, no proposal conflict.

## `User` model shape (mock stage — no Prisma yet, same UI-first process as every module)

- `id`
- `name`
- `email`
- `passwordHash` (mock stage: not real auth yet, placeholder only)
- `role`: one of the 7 enum values (`ENDOWMENT_OFFICER`, `CSR_GRANTS_OFFICER`, `SCHOLARSHIP_OFFICER`, `FUNDRAISING_OFFICER`, `DEAN_APPROVER`, `FINANCE`, `AUDITOR`)
- `active`: boolean (deactivate instead of hard-delete, so history/attribution on past records survives)
- `createdAt`, `updatedAt`

## Screens

1. **Team/User Management** (Dean/Approver only) — list of users with role + active status; create user (name, email, role picker restricted to the 7 fixed values); edit user's role; deactivate/reactivate user. No delete — deactivate preserves referential integrity (a deactivated Fundraising Officer's donor records/interactions/emails must still show who did what).
2. No self-service signup — accounts are always admin-created, matching a ≤6-person closed team.

## Role gating (display-only at mock stage, same pattern as every other module until backend sign-off)

- `DEAN_APPROVER`: only role that can reach the Team/User Management screen.
- Everyone else: no access to this screen, not even read-only (it's account/credential management, not a data module).

## Guardrails

- Don't build a permissions-matrix / per-action ACL UI — rejected above.
- Don't wire real password hashing/session/auth yet — this is still the UI-mockup stage per the project's UI-first process; real auth arrives with the backend, after sign-off, and must meet the Section 9.2 baseline (session expiry, CSRF, login-attempt logging) at that point.
- Keep the 7-role enum exactly as named in Section 2.19 — don't rename or add roles without flagging a proposal mismatch first.

## Open question for DORA (capture at demo / in sign-off email)

- Who holds the very first Dean/Approver account before there's an admin screen to create one? (Likely answer: seeded directly by the dev team at deployment — worth confirming DORA is fine with that rather than expecting self-registration.)

## Definition of done (mockup stage)

- Team/User Management screen demoed with mock users covering all 7 roles.
- Dean/Approver can create/edit-role/deactivate a mock user in the UI.
- Demoed to DORA, sign-off captured as an official email (Section 6.5).
- Only after sign-off: real `User` Prisma model + auth (password hashing, sessions, CSRF, login-attempt logging per Section 9.2) + `src/server/services/auth.ts`.
