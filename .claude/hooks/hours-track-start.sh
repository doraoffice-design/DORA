#!/bin/bash
# SessionStart hook — hours tracking (personal, see .claude/skills/log-hours).
# Dumb recorder only: no summarizing here, that's the log-hours skill's job.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_DIR="$REPO_ROOT/.claude/hours"
CURRENT="$STATE_DIR/current.json"
PENDING="$STATE_DIR/pending.jsonl"
mkdir -p "$STATE_DIR"

INPUT="$(cat)"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id // "unknown"')"
SOURCE="$(echo "$INPUT" | jq -r '.source // "unknown"')"
TRANSCRIPT="$(echo "$INPUT" | jq -r '.transcript_path // empty')"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

AUTHOR_EMAIL="$(git -C "$REPO_ROOT" config user.email 2>/dev/null || echo "unknown")"
BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")"

# Recover an orphaned entry left by a crash/kill that skipped SessionEnd.
if [[ -f "$CURRENT" ]]; then
  ORPHAN_TRANSCRIPT="$(jq -r '.transcript_path // empty' "$CURRENT" 2>/dev/null || true)"
  LAST_ACTIVITY="$NOW"
  if [[ -n "$ORPHAN_TRANSCRIPT" && -f "$ORPHAN_TRANSCRIPT" ]]; then
    LAST_ACTIVITY="$(tail -1 "$ORPHAN_TRANSCRIPT" 2>/dev/null | jq -r '.timestamp // empty' 2>/dev/null || true)"
    [[ -z "$LAST_ACTIVITY" ]] && LAST_ACTIVITY="$NOW"
  fi
  jq --arg ended_at "$LAST_ACTIVITY" --arg reason "orphaned_recovered_at_next_start" \
    '. + {"ended_at": $ended_at, "ended_reason": $reason}' "$CURRENT" >> "$PENDING" 2>/dev/null || true
  rm -f "$CURRENT"
fi

jq -n --arg session_id "$SESSION_ID" --arg started_at "$NOW" --arg source "$SOURCE" \
  --arg branch "$BRANCH" --arg author_email "$AUTHOR_EMAIL" --arg transcript_path "$TRANSCRIPT" \
  '{"session_id": $session_id, "started_at": $started_at, "source": $source, "branch": $branch, "author_email": $author_email, "transcript_path": $transcript_path}' \
  > "$CURRENT"

# If there are closed-but-undrafted entries, tell Claude so the log-hours skill can act.
UNDRAFTED=0
if [[ -f "$PENDING" ]]; then
  UNDRAFTED="$(grep -c '"ended_at"' "$PENDING" || true)"
  [[ -z "$UNDRAFTED" ]] && UNDRAFTED=0
fi
if [[ "$UNDRAFTED" -gt 0 ]]; then
  echo "hours-tracking: $UNDRAFTED unlogged work session(s) pending in .claude/hours/pending.jsonl — run the log-hours skill to draft entries into docs/hours-log/ before they're lost."
fi

exit 0
