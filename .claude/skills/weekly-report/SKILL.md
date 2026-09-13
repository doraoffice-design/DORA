---
name: weekly-report
description: Use at the end of each week to draft the team's weekly progress report required by proposal Section 6.1, built from actual GitHub PR activity rather than written from memory.
---

# Drafting the weekly progress report

Proposal Section 6.1 requires one written progress report per week, summarizing work completed, work in progress, and blockers, attributed by individual member and referencing GitHub PRs — and Section 7.6 ties payment to this report plus verifiable GitHub activity. So the report should be built from git/PR history, not typed up from memory.

## Steps

1. Determine the date range for the week being reported (usually the last 7 days).
2. Pull the merged and open PRs in that window:
   ```
   git log --since="7 days ago" --pretty=format:"%h %an %s" --all
   ```
   or, if the GitHub CLI (`gh`) is available and authenticated:
   ```
   gh pr list --state all --search "updated:>=<date>"
   ```
3. Group the resulting commits/PRs by team member (by author) and, where the PR description names a proposal section (per the "Commit messages and PR descriptions" convention in `.claude/CLAUDE.md`), group by module too.
4. For each member, draft three short lines: work completed this week (with PR references, e.g. "#14 — Section 2.1 CRM list view"), work in progress, and any blocker they've flagged (check for `WIP`/draft PRs or ask directly if unclear).
5. Note any hours or work that doesn't trace back to a PR at all — per Section 7.6 that's exactly the gap that shouldn't be claimed for compensation, so flag it rather than smoothing it over.
6. Assemble into a short report (module — status — PR links — blockers, per person) and hand it to the team lead to send over official email per Section 6.5. Don't send it yourself; this is a draft for the team lead to review first.
