---
name: add-phase1-module
description: Use when starting work on one of the six Phase I modules (CRM, Fundraising Pipeline, Proposal Repository, Donor Email & Outreach, Follow-up Reminders, Resource-Generation Dashboard) from scratch, to follow the UI-first-then-backend workflow correctly end to end rather than skipping steps.
---

# Adding a Phase I module

DRMP's whole delivery model (`.claude/CLAUDE.md`, "Working process") hinges on never building backend for a module DORA hasn't seen and confirmed. This skill is the checklist for doing that correctly, once per module.

## Step 1 — Identify the module and its proposal section

Confirm which of the six Phase I modules this is and read its section in `docs/drmp_proposal.pdf` (2.1 CRM, 2.2 Pipeline, 2.3 Proposals, 2.4 Email/Outreach, 2.5 Follow-ups, 2.6 Dashboard). Note every field and status mentioned — this becomes your mockup's data shape, not something to invent independently.

## Step 2 — Build the UI mockup with mock data only

In the UI (`src/app/`), create the module's route and page(s) using static, hardcoded sample data (an array of a few realistic-looking records is enough). No Prisma, no API calls, no `prisma/` import. The `module-scaffolder` subagent can do this scaffolding for you if you want a fresh start following the standard layout.

The point of this step is that DORA reacts to something concrete and clickable, not a written spec.

## Step 3 — Demo and capture sign-off in writing

Show the mockup to DORA (screen share or deployed preview). Capture exactly which fields, statuses, and actions they confirm — and any they want changed or removed. Per Section 6.5, this confirmation must happen over official email, not just Telegram/verbally. If it isn't in an email, it isn't signed off yet — don't proceed to Step 4 on a verbal "looks good."

## Step 4 — Lock the schema

Only now, add the Prisma model(s) for this module to `prisma/schema.prisma`, matching exactly what was signed off (not what you originally guessed in Step 2, if DORA changed anything). Run `npx prisma migrate dev --name add_<module>` against your own local dev database. Consider routing this through the `schema-reviewer` subagent before merging.

## Step 5 — Wire up the real backend

Add the Express routes/services in the server layer (`src/server/`) and connect the UI (`src/app/`) to them, replacing the mock data. If this module is Donor Email & Outreach, this is also the point where the `approval-gate-guard` subagent should review the PR before merge — that module's approval logic is the one hard constraint in this whole project.

## Step 6 — PR and review

Open the PR referencing the proposal section (e.g. "Section 2.2 — fundraising pipeline backend"). Run `pr-reviewer`, plus `schema-reviewer` and/or `security-reviewer` if the diff touches those areas, before asking a teammate for human review.
