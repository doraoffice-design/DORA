# DRMP — DORA Resource Management Portal

Project instructions for Claude Code. Read this before touching any file in this repo.

## What this is

A web platform for the Dean of Resources & Alumni Affairs (DORA), IIT Mandi, covering two areas:
- **Part A — Governance & Compliance:** endowment funds, CSR grants/milestones, scholarship disbursement, maker-checker approvals, audit log.
- **Part B — Resource Generation & Donor Relationships:** donor/partner CRM, fundraising pipeline, proposal repository, approval-gated donor email, dashboards, alerts.

Full requirements live in `docs/drmp_proposal.pdf` (source: `docs/drmp_proposal.tex`) and `docs/er_diagram.html`. Business rules in this file are a summary — the proposal doc is the source of truth if they ever disagree; flag the mismatch instead of silently picking one.

## Tech stack (locked — do not introduce alternatives without asking)

- **Frontend + backend:** Next.js (App Router), TypeScript.
- **Database:** PostgreSQL, self-hosted. No Supabase, no Firebase, no other managed BaaS. This is a deliberate institutional decision (data ownership, no vendor lock-in) — do not suggest these even as a shortcut.
- **ORM / migrations:** Prisma. Every schema change is a migration file, committed to the repo. Never hand-edit the production database. Never run `prisma db push` against anything but a local dev database.
- **Auth:** custom email/password to start, with role stored on the `User` model. Institutional SSO may be integrated later — don't hard-code assumptions that block that.
- **File storage:** UCs, MoUs, sanction letters, income certificates. Store the file on disk (or a self-hosted MinIO bucket if/when we set one up) and keep only the path + metadata in Postgres. Never store file bytes as a DB column.
- **LLM usage:** an API key (provider TBD) is used only for (a) donor email drafting assistance and (b) later, CSR-interest-to-proposal matching. Both are additive features on top of a working CRUD system, not a dependency for the core system to function. Do not wire LLM calls into any approval or disbursement logic — those must be deterministic and human-approved.

## Working process: UI first, backend after sign-off

For every module, the sequence is:
1. Build a clickable UI mockup (can use static/mock data) for the module's core screens.
2. Demo it to DORA; capture exactly which fields, statuses, and actions they confirm.
3. Only after that sign-off, lock the schema for that module (as a migration) and wire up the real backend.

Do not build backend logic for a module ahead of its UI sign-off, and do not treat a UI mockup's fields as final until DORA has actually seen and approved them. If asked to build backend for an unconfirmed module, ask first.

## Schema discipline

- The load-bearing tables (`User`, `EndowmentFund`, `FundYieldRecord`, `CSRGrant`, `GrantMilestone`, `ScholarshipScheme`, `Applicant`, `Disbursement`, `AuditLog`) are the backbone of Part A and are considered stable — changes here need a second person's review, not just a passing PR.
- Part B tables (`Donor`, `PipelineOpportunity`, `Proposal`, `DonorEmail`) are explicitly draft and expected to change as each module goes through UI sign-off. Don't over-engineer them.
- Every table that represents money movement or a status change (`Disbursement`, `GrantMilestone`, `Applicant`, `DonorEmail`) needs `created_at`/`updated_at`, and any state transition must also write an `AuditLog` row in the same transaction. Never update a status without an accompanying audit entry.
- Approval and disbursement are separate states with separate actor columns (`approved_by` vs `disbursed_by`). Never collapse them into a single "approved" boolean.

## Roles (enforce server-side, not just in the UI)

`ENDOWMENT_OFFICER`, `CSR_GRANTS_OFFICER`, `SCHOLARSHIP_OFFICER`, `FUNDRAISING_OFFICER`, `DEAN_APPROVER`, `FINANCE`, `AUDITOR`. See the proposal doc, Section 2.14, for exactly what each role can and cannot do. A maker (the person who created/edited a record) can never also be the checker (approver) or the disburser on the same record — this must be enforced in the API layer, not assumed from the UI.

## Code organization

- One module = one vertical slice: its Prisma models, its API routes, its UI pages/components live together conceptually even if split across `app/`, `lib/`, `prisma/`. When working on a module, don't reach into another module's internals — go through its exported functions/types.
- Shared cross-cutting code (auth, audit logging helper, role-check middleware, the `AuditLog` writer) lives in `lib/core/` and is owned jointly — changes here need review from the team lead.
- No business logic in React components beyond form state and display formatting. Anything that decides "is this allowed", "what happens next" belongs in an API route or a `lib/` service function, so it's testable without a browser.

## PR process

- Never commit or push directly to `main`, no matter how small the change — always branch and open a PR. Commit and open PRs frequently, in small increments, rather than batching unrelated work into one large PR.
- Every PR gets a Claude Code review pass before requesting human review.
- PRs touching a load-bearing table (see Schema discipline above) or `lib/core/` need review from the team lead, not just any teammate.
- Commit messages and PR descriptions should say which module/section of the proposal doc the change implements (e.g., "Section 2.4 — disbursement approval workflow").

## Team ownership (fill in as modules are assigned)

| Module | Owner | Status |
|---|---|---|
| Auth, roles, audit log core | Sachit Bansal | in progress |
| Endowment funds | TBD | not started |
| CSR grants & milestones | TBD | not started |
| Scholarships & disbursement | TBD | not started |
| Donor CRM | TBD | not started |
| Fundraising pipeline & proposals | TBD | not started |
| Donor email & outreach | TBD | not started |
| Dashboards & alerts | TBD | not started |

## Things to never do

- Never call an external SaaS (Supabase/Firebase/etc.) as a shortcut, even temporarily.
- Never let an LLM call approve, reject, or disburse anything.
- Never skip the audit log write on a state change.
- Never store secrets (DB credentials, LLM API keys, email account credentials) in committed files — use environment variables and confirm `.env` is gitignored.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
