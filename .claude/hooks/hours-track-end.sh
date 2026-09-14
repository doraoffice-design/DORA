#!/bin/bash
# SessionEnd hook — hours tracking (personal, see .claude/skills/log-hours).
# Dumb recorder only: closes the current.json entry with an end time and the
# commits authored in that window. No summarizing here — SessionEnd cannot
# inject context back into a conversation anyway; the next SessionStart does
# that, and the log-hours skill writes the actual description.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_DIR="$REPO_ROOT/.claude/hours"
CURRENT="$STATE_DIR/current.json"
PENDING="$STATE_DIR/pending.jsonl"

[[ -f "$CURRENT" ]] || exit 0

INPUT="$(cat)"
REASON="$(echo "$INPUT" | jq -r '.reason // "other"')"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

STARTED_AT="$(jq -r '.started_at' "$CURRENT")"
AUTHOR_EMAIL="$(jq -r '.author_email' "$CURRENT")"

# Commits authored by this user in the session window, across all local refs
# (not just HEAD) so a rebase/checkout mid-session doesn't hide the commit.
# Delimited on a marker unlikely in a subject line (not raw JSON, since a
# subject can contain quotes/backslashes that would break naive JSON building).
SEP="@@HRS_FIELD_SEP@@"
COMMITS="$(git -C "$REPO_ROOT" log --all --author="$AUTHOR_EMAIL" \
  --since="$STARTED_AT" --until="$NOW" --pretty=format:"%h${SEP}%s" 2>/dev/null | \
  jq -Rsc --arg sep "$SEP" '
    split("\n") | map(select(length > 0))
    | map(split($sep)) | map(select(length == 2))
    | map({hash: .[0], subject: .[1]})
  ' 2>/dev/null || echo '[]')"
[[ -z "$COMMITS" ]] && COMMITS='[]'

jq --arg ended_at "$NOW" --arg reason "$REASON" --argjson commits "$COMMITS" \
  '. + {"ended_at": $ended_at, "ended_reason": $reason, "commits": $commits}' "$CURRENT" >> "$PENDING"

rm -f "$CURRENT"
exit 0
