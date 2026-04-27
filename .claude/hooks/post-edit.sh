#!/usr/bin/env bash
# PostToolUse: Write|Edit
# Reads JSON from stdin, extracts file_path, guards .jsx and .css files.

FILE=$(node -e "
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(Buffer.concat(chunks).toString());
    process.stdout.write((d.tool_input || {}).file_path || '');
  } catch { process.stdout.write(''); }
});
" 2>/dev/null)

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(jsx?|css)$ ]] && exit 0

# ── console.log check ─────────────────────────────────────────────────────────
if grep -qn "console\.log" "$FILE" 2>/dev/null; then
  echo "⚠  console.log in $FILE — remove before committing" >&2
fi

# ── Hardcoded brand colors in CSS (must use --color-* custom properties) ──────
if [[ "$FILE" =~ \.css$ ]]; then
  BRAND_HEX="#0281AC|#0A2543|#FFBC08|#FAC775|#6A7381|#EFF2F5|#F6EFDC|#E6F1F4|#F4F7FA"
  if grep -qiE "$BRAND_HEX" "$FILE" 2>/dev/null; then
    echo "⚠  Hardcoded brand color in $FILE" >&2
    echo "   Use CSS custom property instead: --color-teal, --color-dark, --color-amber …" >&2
  fi
fi

# ── ADR-001: no .tsx in implementation layer ───────────────────────────────────
if [[ "$FILE" =~ (app|src)/.*\.tsx$ ]]; then
  echo "⚠  .tsx file written to implementation layer: $FILE" >&2
  echo "   ADR-001 mandates .jsx for v1 — rename to .jsx" >&2
fi

exit 0
