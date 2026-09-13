# DRMP — DORA Resource Management Portal

A web platform for the Dean's Office of Resource Generation and Alumni Relations (DORA), IIT Mandi, replacing the spreadsheets and paper records currently used to track donor relationships, endowments, CSR grants and scholarship disbursement.

Development is phased, and **only Phase I is commissioned**:

- **Phase I (MVP) — Resource Generation:** donor/partner CRM, fundraising pipeline tracking, proposal repository, approval-gated donor email and outreach, follow-up reminders, resource-generation dashboard.
- **Phase II — Governance & Compliance:** endowment funds, CSR grants and milestones, scholarships and disbursement, maker-checker controls, audit log, governance reporting. Not commissioned.
- **Phase III — Institutional Integrations:** Finance/ERP, SSO, document automation. Not commissioned.

`docs/drmp_proposal.pdf` is the source of truth for scope, deliverables and the working agreement. `.claude/CLAUDE.md` covers project conventions and how Claude Code should work in this repo.

The screens currently in `src/app/` are a demo prototype built to illustrate look and feel — not a Phase I deliverable, and not backed by a database.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
```
