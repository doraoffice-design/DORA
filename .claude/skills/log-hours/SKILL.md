---
name: log-hours
description: Use when a SessionStart hook reports unlogged work session(s) pending in .claude/hours/pending.jsonl, or when the user asks to log/draft their hours. Turns raw session-tracking data (start/end time, commits) into draft rows in the individual's hours log, per the coordinator's instruction and proposal Section 7.6.
---

# Drafting hours-log entries from tracked sessions

`.claude/hooks/hours-track-start.sh` and `hours-track-end.sh` (wired via `.claude/settings.local.json`) record raw facts about each Claude Code session — start time, end time, branch, commits authored in that window — to `.claude/hours/pending.jsonl`. They are dumb recorders; they never write a description, because that requires understanding what the work actually was. That's this skill's job.

This is a **personal, per-machine** setup — each team member who wants it runs their own copy of the hooks (gitignored state) and gets their own log file. It doesn't track anyone else.

## Steps

1. **Read `.claude/hours/pending.jsonl`.** Each line is one closed session: `session_id`, `started_at`, `ended_at`, `ended_reason`, `branch`, `author_email`, and usually `commits` (array of `{hash, subject}`). An orphan-recovered entry (`ended_reason: "orphaned_recovered_at_next_start"`) has no `commits` field — backfill it yourself:
   ```
   git log --all --author="<author_email>" --since="<started_at>" --until="<ended_at>" --pretty=format:"%h %s"
   ```

2. **Figure out the target log file.** Run `git config user.name`, slugify it (lowercase, spaces to hyphens) to get `docs/hours-log/<slug>.md`. If it doesn't exist yet, create it with the same header/table format as `docs/hours-log/sachit-bansal.md` — don't invent a different format.

3. **For each pending session, draft one row** (or skip and flag — see below):
   - **Date** — date portion of `started_at`.
   - **Task** — a short phrase from the commit subjects (e.g. "Section 2.1 — donor list view"). If there are no commits in the window, don't guess a task from nothing — write `(no commits in this window — describe manually)` and flag it to the user rather than inventing work.
   - **Description** — one or two sentences synthesizing what the commit(s) did. Use the actual commit subjects/diffs (`git show <hash> --stat` if you need more than the subject), not a generic restatement of the task.
   - **Hours** — `ended_at - started_at` in hours, rounded to the nearest 0.25. If the gap exceeds ~3 hours with fewer than one commit per hour in that window, don't silently log the full duration — cap the note at something like "3.0 (session open Xh — verify, may include idle time)" so the honesty requirement in Section 7.6 isn't undermined by wall-clock time that wasn't real work.
   - **Ref** — comma-separated short commit hashes (link them if you know the GitHub remote), or the branch name if no commits landed.
   - **Status** — `[DRAFT]`.

4. **Append the rows** to the person's log file table (don't touch existing rows). Multiple sessions on the same date can be separate rows or merged into one — merge only when they're clearly the same task (same branch, contiguous, no big gap).

5. **Consume the pending file.** Remove the lines you just drafted from `.claude/hours/pending.jsonl` (leave any line without an `ended_at` — that shouldn't happen but don't delete an in-progress entry if you ever see one). If the file is now empty, that's fine, leave it as an empty file.

6. **Tell the user what you drafted and stop.** Don't commit the log file — per the project's PR process, that's a normal commit like any other, on a branch, reviewed by the user first. Explicitly remind them: these are drafts from wall-clock + commits, not verified hours — they should edit the description/hours and drop the `[DRAFT]` tag before this feeds into a weekly report (`weekly-report` skill) or a payment claim.

## Don't

- Don't invent a task/description when there are no commits to ground it in.
- Don't auto-commit or auto-push the log file.
- Don't mark a row as reviewed/final yourself — only the human removes `[DRAFT]`.
- Don't build this into a shared `.claude/settings.json` — it stays in each person's own gitignored `settings.local.json`, since not every teammate has opted in.
