# Session notes — 2026-08-22 — Frontend UI kickoff

Context dump for whoever picks this up next (including future-Claude). Written at the end of a session that scaffolded the whole frontend from an empty repo, ahead of a DORA demo the next morning.

## Starting point

The repo had only `CLAUDE.md`, `README.md`, and a stub `package-lock.json` — no Next.js app existed yet. `CLAUDE.md` (read that file first, it's the source of truth for process/rules) already specified the plan: build a clickable UI mockup with mock data, demo it, get sign-off, only then build the backend.

## Scope decided for this session

Demo is tomorrow, "upar upar se" (quick, high-level pass) — not enough time to build all 8 planned modules to a polished state. Scope was narrowed to:

- **Endowment Funds** (Part A)
- **CSR Grants & Milestones** (Part A) — chosen as the centerpiece since it best demonstrates the maker-checker approval flow from `CLAUDE.md`
- **Donor CRM** (Part B)
- **Fundraising Pipeline** (Part B)
- Plus a **Dashboard Overview** landing page inside the portal, and (added mid-session) a **public-facing overview page** at `/`

Explicitly out of scope for this round: Scholarship Disbursement, Proposal repository, Donor email/outreach, Alerts. Login screen was also explicitly deferred — the portal auto-signs-in as a hardcoded default user (Anita Rao / Endowment Officer) via `src/lib/store.tsx`.

## What got built

**Stack:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, scaffolded fresh. Note: this shadcn install uses **base-ui** (`@base-ui/react`) as its primitive layer, not Radix — see "Gotchas" below, this caused most of the session's bugs.

**Pages** (all under `src/app/`):
- `/` — public landing page (mission statement, 4 aggregate stats computed live from the mock store, "Staff Portal" link into the app, contact CTA)
- `/dashboard` — internal portal overview (KPI cards, "awaiting your review" queue, recent donor activity, pipeline snapshot)
- `/dashboard/endowment-funds` (+ `[id]`) — fund list/detail, "Record Yield" flow
- `/dashboard/csr-grants` (+ `[id]`) — grant list/detail, full maker-checker flow: create → approve/reject grant → submit/approve/reject/disburse milestones → audit trail
- `/dashboard/donors` (+ `[id]`) — donor CRM list/detail, interaction logging
- `/dashboard/pipeline` — fundraising pipeline as a kanban board by stage

**Data/state:** all mock, in-memory only, in `src/lib/store.tsx` (React Context, resets on page refresh — don't refresh mid-demo). Seed data in `src/lib/mock-data.ts`.

**Code organization** (this took two rounds to get right — see "Decisions" below): business logic (approve/reject/disburse/create/etc.) lives in flat `src/lib/<module>-actions.ts` files, one per module, kept separate from the single shared `src/lib/store.tsx`. Role-check predicates and audit-entry creation live alongside the relevant module's actions file (`src/lib/audit.ts` is the one genuinely shared piece — the "AuditLog writer" analog).

## Decisions made mid-session (worth knowing the *why*)

1. **Business logic placement.** `CLAUDE.md` says no business logic in components — it belongs in a `lib/` service function. First attempt over-corrected into a full per-module vertical-slice (`lib/core/`, `lib/csr-grants/{types,mock-data,store,actions}.ts`, etc. — 16+ files). User pushed back: too much architecture for a UI-only demo night. Settled on the middle ground: **one shared store, flat per-module action files.** This is the pattern used throughout; don't re-litigate it without asking first.
2. **Public page scope.** Explicitly agreed: aggregate stats only (total corpus, active CSR partnership count, total disbursed, active donor count) — no donor names, no per-fund/per-grant financial detail. This is a genuine data-sensitivity boundary, not just a style choice.
3. **Commit cadence.** User wants periodic commits as "proof of work," not one giant commit at the end. Four commits so far on `frontend-ui-scaffold` (see below). Never push without being asked.

## Gotchas discovered (base-ui vs. the Radix APIs you're used to)

This shadcn install is **not** the Radix-backed one most training data assumes. Concretely, three bug classes hit this session, all silent (no TypeScript error) or non-obvious:

1. **`asChild` doesn't exist.** Use `render={<Element .../>}` instead — e.g. `<DialogTrigger render={<Button>Open</Button>} />`. Affected: `DialogTrigger`, `SidebarMenuButton`, `DropdownMenuTrigger` in the first pass.
2. **`DropdownMenuItem` has no `onSelect`.** It renders a `<div>` and only listens for `onClick`. `onSelect` is a real-but-irrelevant React DOM prop for a div, so it type-checks fine and then just silently never fires. This is why the role switcher and logout button did nothing on first pass — cost real debugging time because there was no compiler error to point at it. **Always use `onClick` on `DropdownMenuItem`.**
3. **`DropdownMenuLabel` requires a `DropdownMenuGroup` ancestor.** Throws `Base UI: MenuGroupContext is missing` at runtime if you put a `DropdownMenuLabel` directly inside `DropdownMenuContent` without wrapping it (and the items after it) in `<DropdownMenuGroup>`.
4. **`Button` asserts native-button semantics by default.** `nativeButton` defaults to `true`, which asserts the `render` target is an actual `<button>`. Rendering `Button` as a `Link` or `<a>` via `render` throws a runtime console error ("A component that acts as a button expected a native `<button>`...") unless you also pass `nativeButton={false}`. Bit us on the public page's two CTAs.

**Practical upshot:** when adding new interactive components, don't assume Radix prop names from memory/training data — grep the actual component source in `src/components/ui/` first, or check `node_modules/@base-ui/react/**/*.d.ts` for the real prop shape. TypeScript will NOT catch #2 or #4 (both type-check fine), so a compile-clean build is not proof the UI actually works — click-test it.

**Also:** `Select`'s `onValueChange` is typed `(value: string | null, ...) => void`, not a bare setter — every usage needs to guard the `null` case, e.g. `onValueChange={(v) => setX(v ?? "all")}`.

## Debugging technique that worked

This Next.js version (16.3.1, with the "agent files" feature — see the `nextjs-agent-rules` block appended to the bottom of `CLAUDE.md` by `next dev`) forwards **browser console errors into the dev server's own log**, written to `.next/dev/logs/next-development.log` as JSON lines with `"source":"Browser"`. That's how both the `onSelect` bug and the `nativeButton` bug got diagnosed without needing a real browser session — `tail`/`grep` that file for `"level":"ERROR"` after reproducing the issue. Much faster than trying to stand up headless Chromium in this sandbox (which has no sudo, so `playwright install --with-deps` fails).

## Git state

Branch: `frontend-ui-scaffold`, based off `main`, **not yet pushed** (this sandbox has no git push credentials — push from a normal authenticated terminal). Commits so far:

```
a12c670  clickable UI mockups for Endowment Funds, CSR Grants & Milestones, Donor CRM, and Fundraising Pipeline
468b265  Fix role switcher and logout: base-ui menu items use onClick, not onSelect
1249a8c  Add public-facing overview page at /
cf6d63b  Fix base-ui Button console errors on the public page
```

To open the PR once pushed: `https://github.com/Sachitbansal/DORA/compare/main...frontend-ui-scaffold?expand=1`

## How to run it

```bash
cd DORA
npm install   # first time only
npm run dev
```

Opens on `http://localhost:3000`. `/` is the public page; `/dashboard` is the internal portal (no real login yet).

## Suggested demo script (tomorrow)

1. Start on the public page (`/`) — mission + stats, then click "Staff Portal."
2. Endowment Funds — open a fund, show yield records, optionally add a live yield record (role: Endowment Officer).
3. **CSR Grants — spend the most time here.** Open the HUL grant (`Pending Approval`). Point out the maker (CSR Grants Officer) can't approve their own grant. Switch role to **Dean (Approver)**, approve it live. Then walk a milestone through Submitted (as CSR Grants Officer) → Approved (as Dean) → Disbursed (as Finance), and show the audit trail at the bottom.
4. Donor CRM — open a donor, show interaction history and the linked pipeline opportunity.
5. Fundraising Pipeline — kanban board, click a card, move its stage live.

Caveat to say out loud: everything is mock data — no backend yet, resets on refresh, this is exactly the "clickable UI mockup" stage `CLAUDE.md` calls for before schema/backend work starts.

## Open items / not done

- No login screen (deferred, not urgent per user)
- Branch not pushed / PR not opened yet (needs a terminal with git credentials)
- User hadn't yet click-tested the milestone approve/reject/disburse chain, donor interaction logging, or pipeline stage-move as of this writing — worth confirming those work before the demo
- Scholarship Disbursement, Proposal repository, Donor email/outreach, Alerts modules: not started, intentionally out of scope this round
