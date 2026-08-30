#!/usr/bin/env bash
set -euo pipefail

# Known routes/components that existed in production-era source before GitHub
# became the source of truth. This guard is intentionally conservative: a
# destructive S3 sync must not proceed while these are still missing.
required_paths=(
  "app/farm-journal/page.js"
  "app/farm-map/page.js"
  "app/harvest/page.js"
  "app/experiments/page.js"
  "app/farm-calendar/page.js"
  "app/timeline/page.js"
  "app/search/page.js"
  "app/crops/[slug]/page.js"
  "app/learn/page.js"
  "app/learn/bugs/page.js"
  "app/learn/garden-planning/page.js"
  "app/learn/permaculture/page.js"
  "app/learn/plant-diseases/page.js"
  "app/learn/year-round/page.js"
  "app/my-growing-journey/page.js"
  "components/learn/LearnLibrary.module.css"
  "components/planner/GrowingJourney.jsx"
  "lib/farmData.js"
  "lib/learn/bugData.js"
  "lib/planner/journeyEngine.js"
)

missing=0
printf '=== PRODUCTION PARITY GUARD ===\n'
for path in "${required_paths[@]}"; do
  if [[ -e "$path" ]]; then
    printf 'PASS: %s\n' "$path"
  else
    printf 'MISSING: %s\n' "$path" >&2
    missing=$((missing + 1))
  fi
done

printf '\n=== RESULT ===\n'
if (( missing > 0 )); then
  cat >&2 <<EOF
Production parity is NOT confirmed: $missing known production-era source path(s) are missing.

Do not run a destructive deployment such as:
  aws s3 sync out/ s3://... --delete

Recover/reconcile the current production source first. See docs/PRODUCTION-PARITY.md.
EOF
  exit 1
fi

cat <<'EOF'
Known production-era paths are present in this checkout.

This is a necessary guard, not complete proof of parity. Before using --delete,
compare the built route/assets inventory with the current live site and confirm
that no intentionally live page or asset would be removed.
EOF
