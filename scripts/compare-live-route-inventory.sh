#!/usr/bin/env bash
set -euo pipefail

: "${PFF_BUCKET:?Set PFF_BUCKET to the production S3 bucket name first.}"

OUT_DIR="${PFF_OUT_DIR:-out}"

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: aws CLI is required." >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required." >&2
  exit 2
fi

if [[ ! -d "$OUT_DIR" ]]; then
  cat >&2 <<EOF
ERROR: local static export directory '$OUT_DIR' does not exist.
Run a production build first, then rerun this comparison.
EOF
  exit 2
fi

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

printf '=== LIVE ROUTE INVENTORY (READ ONLY) ===\n'
printf 'Bucket: %s\n' "$PFF_BUCKET"
printf 'Local export: %s\n\n' "$OUT_DIR"

# `aws s3 ls --recursive` is read-only. We only compare HTML entry points,
# not hashed assets, because the purpose is to catch accidental page removal.
aws s3 ls "s3://$PFF_BUCKET/" --recursive \
  | awk '{$1=$2=$3=""; sub(/^ +/, ""); print}' \
  | python3 -c '
import sys
for raw in sys.stdin:
    key = raw.strip()
    if not key:
        continue
    if key == "index.html":
        print("/")
    elif key.endswith("/index.html"):
        print("/" + key[:-10].strip("/") + "/")
' \
  | LC_ALL=C sort -u > "$workdir/live-routes.txt"

find "$OUT_DIR" -type f -name index.html -print \
  | python3 -c '
import os, sys
root = os.environ.get("PFF_OUT_DIR", "out").rstrip("/") + "/"
for raw in sys.stdin:
    path = raw.strip()
    if path.startswith(root):
        path = path[len(root):]
    if path == "index.html":
        print("/")
    elif path.endswith("/index.html"):
        print("/" + path[:-10].strip("/") + "/")
' \
  | LC_ALL=C sort -u > "$workdir/local-routes.txt"

comm -23 "$workdir/live-routes.txt" "$workdir/local-routes.txt" > "$workdir/live-only.txt"
comm -13 "$workdir/live-routes.txt" "$workdir/local-routes.txt" > "$workdir/local-only.txt"

live_count="$(wc -l < "$workdir/live-routes.txt" | tr -d ' ')"
local_count="$(wc -l < "$workdir/local-routes.txt" | tr -d ' ')"
live_only_count="$(wc -l < "$workdir/live-only.txt" | tr -d ' ')"
local_only_count="$(wc -l < "$workdir/local-only.txt" | tr -d ' ')"

printf 'Live HTML routes:  %s\n' "$live_count"
printf 'Local HTML routes: %s\n' "$local_count"
printf 'Live-only routes:  %s\n' "$live_only_count"
printf 'Local-only routes: %s\n\n' "$local_only_count"

if (( live_only_count > 0 )); then
  printf '=== BLOCKING: LIVE ROUTES MISSING FROM LOCAL BUILD ===\n' >&2
  cat "$workdir/live-only.txt" >&2
  cat >&2 <<'EOF'

A destructive S3 sync could remove the routes above.
Do NOT run `aws s3 sync ... --delete` until every live-only route is intentionally
recovered, replaced, or explicitly approved for removal.
EOF
else
  printf 'PASS: every current live HTML route also exists in the local export.\n'
fi

if (( local_only_count > 0 )); then
  printf '\n=== NEW LOCAL ROUTES NOT CURRENTLY LIVE ===\n'
  cat "$workdir/local-only.txt"
fi

printf '\n=== RESULT ===\n'
if (( live_only_count > 0 )); then
  echo "Production route parity is NOT safe for destructive deployment." >&2
  exit 1
fi

echo "Route inventory passes this read-only comparison."
echo "Still run scripts/check-production-parity.sh and review assets/config before any --delete deployment."
