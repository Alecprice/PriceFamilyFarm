#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

step() {
  printf '\n=== %s ===\n' "$1"
}

command -v node >/dev/null 2>&1 || fail "Node.js is required."
command -v npm >/dev/null 2>&1 || fail "npm is required."
command -v aws >/dev/null 2>&1 || fail "AWS CLI is required for production parity/security checks."

[[ "${NEXT_PUBLIC_SITE_URL:-}" =~ ^https:// ]] || fail "Set NEXT_PUBLIC_SITE_URL to the production HTTPS origin."
[[ "${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" =~ ^[0-9a-fA-F-]{36}$ ]] || fail "Set the production NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY before building."
[[ -n "${PFF_BUCKET:-}" ]] || fail "Set PFF_BUCKET to the production S3 bucket."
[[ -n "${PFF_DISTRIBUTION_ID:-}" ]] || fail "Set PFF_DISTRIBUTION_ID to the production CloudFront distribution."

step "Dependency install"
npm ci

step "High-severity dependency audit"
npm audit --audit-level=high

step "Lint"
npm run lint

step "Farm OS contracts"
node scripts/verify-farm-os.mjs

step "Security contracts"
node scripts/verify-security.mjs

step "Production static build"
npm run build
[[ -d out ]] || fail "Static export directory out/ was not produced."

step "Known production-source parity"
bash scripts/check-production-parity.sh

step "Live route inventory parity"
bash scripts/compare-live-route-inventory.sh

step "Read-only edge security audit"
bash scripts/audit-edge-security.sh

printf '\n=== Live security headers ===\n'
bash scripts/verify-live-security.sh "$NEXT_PUBLIC_SITE_URL/"

cat <<'EOF'

=== PREFLIGHT PASSED ===
The code, static export, known source paths, live S3 route inventory, and current edge configuration passed the read-only release gates.

This script does NOT deploy, sync, invalidate CloudFront, rotate credentials, attach policies, or modify production data.
Review the generated out/ diff and release checklist before any write operation.
EOF
