#!/usr/bin/env bash
# Stop hook — final console.log audit across all files modified since last commit.
# Exits 0 (never blocks); warnings go to stderr so Claude surfaces them.

MODIFIED=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(jsx?|css)$')
[[ -z "$MODIFIED" ]] && exit 0

FOUND=$(echo "$MODIFIED" | xargs grep -l "console\.log" 2>/dev/null)
if [[ -n "$FOUND" ]]; then
  echo "" >&2
  echo "🚨 console.log detected in modified files — clean up before committing:" >&2
  echo "$FOUND" | sed 's/^/   /' >&2
  echo "" >&2
fi

exit 0
