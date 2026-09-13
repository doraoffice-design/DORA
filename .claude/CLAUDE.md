# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read this before touching anything. Path-scoped detail lives in `.claude/rules/` and loads when you open the files it applies to.

## What this is

**DRMP — the DORA Resource Management Portal**, for the Dean's Office of Resource Generation and Alumni Relations, IIT Mandi. Built by a four-student team under a signed working agreement.

**`docs/drmp_proposal.pdf` (source: `docs/drmp_proposal.tex`) is the source of truth.** This file is a summary. If the two disagree, the proposal wins — flag the mismatch, don't silently pick one. Section numbers below refer to it.

## We are building Phase I only

The proposal defines three phases; **only Phase I is commissioned.**

| # | Phase I module | Section | Built? |
|---|---|---|---|
| 1 | Donor & Partner Database (CRM) | 2.1 | demo mockup only |
| 2 | Fundraising Pipeline Tracking | 2.2 | demo mockup only |
| 3 | Proposal Repository | 2.3 | **not started** |
| 4 | Donor Email & Outreach (approval-gated) | 2.4 | **not started** |
| 5 | Follow-up Reminders | 2.5 | **not started** |
| 6 | Resource-Generation Dashboard | 2.6 | demo mockup only |

Phase II (endowment funds, CSR grants & milestones, scholarships, disbursement approval, audit log, governance reporting, alerts, document generation) and Phase III (Finance/ERP, SSO, document automation) are **not commissioned**. Section 2.14 and 4.1: bringing any of it forward — or any change materially affecting person-hours, cost, timeline, architecture, security, or functionality — needs DORA's *and* the Competent Authority's **prior written approval** before work starts. If a request seems to need Phase II/III, say so and ask.

**Phase I is done when** (Section 3): all six modules work end-to-end; the donor-email approval gate and Phase I role restrictions are demonstrably enforced; the Section 9.2 security baseline is met; deployment/admin/user/DB-API docs and the licensing inventory exist; code is merged into the IIT Mandi/DORA-controlled repo; deployed to a DORA-approved environment; backup/recovery tested at least once; DORA has run UAT and accepted in writing.

**Ceiling:** 500 person-hours across four people, target handover **1 December 2026** (Sections 7.1, 11). This is why we don't gold-plate — build what's scoped, demo it, move on.

## The one rule that overrides everything: the donor-email approval gate

Sections 2.4 and 2.21 make this a **hard constraint, not a configurable default**:

> External emails shall be sent only after review and approval by the authorised DORA user.

A drafted email sits in a pending state until a `DEAN_APPROVER` explicitly approves; only that action triggers the send. Enforced server-side, never only in the UI. Every email keeps a full trail — draft, approval status, sent status, replies, follow-up status, attachments — against the donor record. Any change touching this path gets the `approval-gate-guard` agent before merge.

## The existing UI is a demo, not a deliverable

The `/staff/*` and `/donor-portal` screens on this branch were built for a DORA walkthrough. Proposal, Section 1:

> An informally-built prototype was created earlier only to illustrate the intended look and feel of such a platform, and has not been used to track any actual data.

So: `/staff/endowment-funds` and `/staff/csr-grants` implement **Phase II** functionality (endowment funds, CSR milestones, maker-checker disbursement, audit trail). They are mock-data demo artifacts. **Do not extend them, do not wire a backend to them, do not treat them as a spec.** `/staff/donors`, `/staff/pipeline` and `/staff` map to Phase I modules (2.1, 2.2, 2.6) and are a reasonable visual starting point — but their fields are unconfirmed, so re-derive from the proposal, not from the mockup.

*Open decision:* whether the Phase II demo screens get deleted, moved behind a `/demo` prefix, or left as-is when real Phase I work starts. Recommendation: move them under `/demo` so nobody mistakes them for live scope. Ask before doing it.

## Architecture (decided — see rationale before proposing a change)

**One Next.js App Router application. No separate API service, no monorepo.**

- **Frontend + backend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, in `src/`.
- **Server layer:** every mutation and every privileged read goes through a service function in `src/server/services/<module>.ts`. Server Actions and route handlers are thin wrappers that call a service — they hold no business logic themselves. This is the enforcement point Section 9.2 requires ("role-based, least-privilege access control enforced at the server/API layer... not merely hidden in the user interface").
- **Database:** PostgreSQL, self-hosted. No Supabase, no Firebase, no managed BaaS — Sections 8.1/9.1 put data ownership and institutional control of infrastructure beyond negotiation.
- **ORM/migrations:** Prisma, `prisma/schema.prisma`, migrations committed.
- **Auth:** application-level email/password (Section 2.20); SSO is Phase III unless brought forward. Role on the `User` model.
- **File storage:** uploads on disk, path + metadata in Postgres. Never file bytes in a column.

*Why not the monorepo + Express split the drafting notes suggested:* a second process buys a deploy target, a token boundary, CORS, and duplicated types — for 500 hours, four people, three months, six CRUD modules. The real robustness risks here are the approval gate and role enforcement, and those are solved by funnelling every mutation through one guarded service layer, not by a process boundary. Postgres plus a stateless Next app scales well past DORA's data volume. If the service layer stays clean, extracting an API later is mechanical. Revisit only with a concrete reason; it is a material change under Section 2.14.

## Roles (Section 2.19 — enforce server-side)

`ENDOWMENT_OFFICER`, `CSR_GRANTS_OFFICER`, `SCHOLARSHIP_OFFICER`, `FUNDRAISING_OFFICER`, `DEAN_APPROVER`, `FINANCE`, `AUDITOR`. Define all seven now so the enum doesn't need a breaking migration later, but **only `FUNDRAISING_OFFICER` and `DEAN_APPROVER` carry real permission logic in Phase I** — the rest are reserved. Don't gate Phase I UI or routes on the other five.

Phase I specifics: a Fundraising Officer manages CRM, pipeline and proposals, and may **draft but not send** donor emails. A Dean/Approver approves outgoing emails. `AUDITOR` is read-only everywhere, always. A maker is never the checker on the same record.

Note the existing demo contradicts this — it defaults to `ENDOWMENT_OFFICER` and gates on `FINANCE`. That's demo scaffolding, not a pattern to copy.

## Working process: UI first, backend after written sign-off

Per Section 4.1, for every module:
1. Build a clickable UI mockup with mock data.
2. Demo it to DORA; capture exactly which fields, statuses and actions they confirm.
3. **Only after that sign-off**, add the Prisma model as a migration and wire the real backend.

Sign-off means **official email** (Section 6.5). Telegram and verbal "looks good" do not count. Don't build backend for an unconfirmed module — ask first.

## Security baseline (Section 9.2 — non-negotiable)

- No credential (DB URL, JWT/session secret, email account password, any API key) ever committed. `.env` is gitignored; `.env.example` is the template.
- HTTPS/TLS for any non-local deployment; encryption at rest where the host supports it.
- Role checks in the server layer, for every module.
- Log login attempts and access to sensitive records (`Donor`, `DonorEmail`) — separate from normal request logs.
- Session expiry/timeout and CSRF protection from day one, not retrofitted.
- Documented backups, with the restore tested at least once per phase.
- Dependency vulnerability scan (`npm audit`) before each deployment; fix critical/high before go-live.
- Develop and test against dummy or masked data wherever practicable (Section 9.1).

## LLM / RAG — not currently in scope

The proposal scopes **no** AI feature. It mentions LLMs only twice: an AI coding tool as a reimbursable subscription (Section 7.3), and "LLM/API keys" in the credential-storage rule (Section 9.2). A RAG/LLM assist layer is intended by the team but is a **material change under Section 2.14 — it needs DORA's written approval before any work on it begins.** Don't add a provider key, a gateway, or a dependency for it in the meantime.

The constraint that holds no matter what gets approved: **an LLM must never approve, reject, send, or gate anything.** Drafting assistance returns a draft for a human to edit, on a code path nowhere near the approval or send decision.

## Third-party components (Section 8.2)

Keep `docs/THIRD_PARTY_LICENSES.md` current — every non-trivial dependency, its license, why it's needed. Before adding anything copyleft (GPL/AGPL) or non-commercial, ask: Section 8.2 requires the Competent Authority's written approval for any license that would restrict IIT Mandi's ownership or its ability to deploy, host, or modify the Platform freely.

## Commands

```bash
npm install          # deps are NOT installed in a fresh clone — nothing works until this runs
npm run dev          # dev server on http://localhost:3000
npm run build        # production build
npm start            # serve the production build
npm run lint         # bare `eslint` (flat config, eslint.config.mjs)
npx tsc --noEmit     # typecheck; there is no `typecheck` script, tsconfig is noEmit
```

**No test framework is configured** — no runner, no test files, none in git history. There is no single-test command. Phase I acceptance (Section 3) requires UAT, not a suite, but the 45h "testing" line in Section 7.1 budgets for it; raise it as a decision rather than adding one silently.

## Routes (current tree)

| Route | Phase | What it is |
|---|---|---|
| `/` | — | Public landing page. Four aggregate stats only — **no donor names, no per-fund or per-grant detail**. Real data-sensitivity boundary (Section 9.1); keep it. |
| `/staff` | I (2.6) | Portal overview: KPI cards, review queue, recent donor activity, pipeline snapshot |
| `/staff/donors` (+ `/[id]`) | I (2.1) | Donor CRM list/detail, interaction logging |
| `/staff/pipeline` | I (2.2) | Fundraising pipeline kanban by stage |
| `/staff/endowment-funds` (+ `/[id]`) | **II — demo only** | Fund list/detail, yield recording |
| `/staff/csr-grants` (+ `/[id]`) | **II — demo only** | Grant/milestone maker-checker demo + audit trail |
| `/donor-portal` | not in proposal | Donor-facing giving overview and generated documents. Built for the demo; no Phase I section covers it. |

`src/app/layout.tsx` wraps everything in `StoreProvider`; `src/app/staff/layout.tsx` adds the sidebar. Pages use `PageShell` and `StatusBadge`. Alias `@/*` → `./src/*`. Layouts type props with Next 16's generated `LayoutProps<"/route">` global — match that rather than hand-writing a `children` type.

## Current state of the code

- Mock data only. React Context in `src/lib/store.tsx`, seeded from `src/lib/mock-data.ts`. **Resets on refresh.**
- No `prisma/`, no database, no migrations, no route handlers, no `.env`, no auth. `store.tsx` hardcodes `DEFAULT_USER`; the topbar role switcher just swaps it.
- Module logic sits in flat `src/lib/<module>-actions.ts` files with `src/lib/audit.ts` shared — deliberate for a mockup, and fine to keep for mockups. Real backend work introduces `src/server/` per the architecture section.
- Role checks in those files are display-only guards.

## PR process

- **Never commit or push directly to `main`** — always branch and open a PR, however small. Small and frequent beats one large batch. All work is tracked via PRs (Section 4.2); they are the record of individual contribution and the basis for payment (Section 7.6).
- Every PR gets a Claude Code review pass (`pr-reviewer`) before human review.
- Touching the Prisma schema → `schema-reviewer`. Touching auth, roles, or donor/financial data → `security-reviewer`. Touching email/outreach → `approval-gate-guard`.
- Say which proposal section a commit or PR implements, e.g. "Section 2.4 — donor email approval workflow".
- Weekly progress reports (Section 6.1) are built from merged PRs — see the `weekly-report` skill. Work that never lands in a PR can't be claimed (Section 7.6).

## Team

Four students (Section 5): **Sachit Bansal** (Team Lead, point of contact), Harshit Anand, Jayjit Singh, Jashnoor Singh.

| Module | Owner | Status |
|---|---|---|
| Auth, roles, shared infra | Sachit Bansal | in progress |
| Donor & Partner CRM (2.1) | TBD | demo mockup only |
| Fundraising Pipeline (2.2) | TBD | demo mockup only |
| Proposal Repository (2.3) | TBD | not started |
| Donor Email & Outreach (2.4) | TBD | not started |
| Follow-up Reminders (2.5) | TBD | not started |
| Resource-Generation Dashboard (2.6) | TBD | demo mockup only |

## Never

- Build Phase II/III functionality without written go-ahead from DORA and the Competent Authority.
- Send a donor email without a recorded Dean/Approver approval action.
- Let an LLM approve, reject, send, or gate anything.
- Scrape, purchase, or import third-party donor/contact data (Section 2.21) — only what DORA provides or DORA staff enter.
- Run `prisma db push`, or any migration, against a shared, staging, or production database.
- Commit a secret, or real donor/student data, to the repo.
- Reach for a managed BaaS as a shortcut, even temporarily.

## Background reading

`docs/session-notes-2026-08-22-frontend-ui.md` — context dump from the session that scaffolded the demo frontend. A dated record: don't edit it to match the code. Its routes say `/dashboard` (renamed `/staff` in e707efc) and it predates the donor portal.

## If a root `CLAUDE.md` reappears

`next dev` writes the block below to a `CLAUDE.md` at the **project root**. This project file lives at `.claude/CLAUDE.md`, so a root `CLAUDE.md` containing only that block may reappear on its own. That stub is not the project doc — this file is. Don't move project instructions into it and don't treat it as authoritative.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
