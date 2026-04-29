#!/bin/bash
# Post-build smoke checks. Run after: npm run build
set -euo pipefail

FAIL=0

check() {
  local label="$1"
  local cmd="$2"
  if eval "$cmd" 2>/dev/null; then
    echo "✓ $label"
  else
    echo "✗ $label"
    FAIL=1
  fi
}

echo "Running build smoke checks..."
echo ""

check "out/index.html exists"       "[ -f out/index.html ]"
check "out/index.html non-empty"    "[ -s out/index.html ]"
check "out/404.html exists"         "[ -f out/404.html ]"
check "out/_next/static exists"     "[ -d out/_next/static ]"
check "No console.log in lib"           "! grep -r 'console\.log' app/lib/ --include='*.ts' -l"
check "No console.log in components"   "! grep -r 'console\.log' app/components/ --include='*.tsx' -l"
check "No console.log in features"     "! grep -r 'console\.log' app/features/ --include='*.tsx' -l"
check "No console.log in hooks"        "! grep -r 'console\.log' app/hooks/ --include='*.ts' -l"
check "No console.log in layouts"      "! grep -r 'console\.log' app/layouts/ --include='*.tsx' -l"
check "No hardcoded hex in component CSS" "! grep -rE '#[0-9a-fA-F]{3,6}' app/components/ --include='*.css' -l"
check "No hardcoded hex in feature CSS"   "! grep -rE '#[0-9a-fA-F]{3,6}' app/features/ --include='*.css' -l"

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "All smoke checks passed."
else
  echo "Smoke checks FAILED. See ✗ lines above."
  exit 1
fi
