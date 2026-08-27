#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://price-family-farm.alecjprice.com/}"

command -v curl >/dev/null 2>&1 || { echo "ERROR: curl is required" >&2; exit 2; }

headers="$(mktemp)"
trap 'rm -f "$headers"' EXIT

curl -fsSIL --max-time 20 --connect-timeout 8 "$URL" > "$headers"

# Keep only the final response header block after redirects.
final_headers="$(awk 'BEGIN{RS="\r?\n\r?\n"} {block=$0} END{print block}' "$headers")"

failures=0
pass() { printf 'PASS: %s\n' "$1"; }
fail() { printf 'FAIL: %s\n' "$1" >&2; failures=$((failures + 1)); }

header_value() {
  local name="$1"
  printf '%s\n' "$final_headers" | awk -v IGNORECASE=1 -v h="$name" 'BEGIN{FS=":"} tolower($1)==tolower(h){sub(/^[^:]+:[[:space:]]*/, ""); print; exit}'
}

printf '=== LIVE SECURITY HEADERS ===\n'
printf 'URL: %s\n\n' "$URL"

status_line="$(printf '%s\n' "$final_headers" | head -n 1 | tr -d '\r')"
if [[ "$status_line" =~ ^HTTP/.*\ 2[0-9][0-9] ]]; then
  pass "final response is successful ($status_line)"
else
  fail "unexpected final response status ($status_line)"
fi

hsts="$(header_value strict-transport-security)"
[[ "$hsts" == *"max-age="* ]] && pass "HSTS is present" || fail "Strict-Transport-Security is missing"

csp="$(header_value content-security-policy)"
[[ "$csp" == *"default-src 'self'"* && "$csp" == *"frame-ancestors 'none'"* && "$csp" == *"object-src 'none'"* ]] \
  && pass "CSP contains core deny-by-default directives" \
  || fail "Content-Security-Policy is missing or incomplete"

xfo="$(header_value x-frame-options)"
[[ "${xfo^^}" == "DENY" ]] && pass "X-Frame-Options is DENY" || fail "X-Frame-Options is not DENY"

xcto="$(header_value x-content-type-options)"
[[ "${xcto,,}" == "nosniff" ]] && pass "X-Content-Type-Options is nosniff" || fail "X-Content-Type-Options is not nosniff"

referrer="$(header_value referrer-policy)"
[[ "$referrer" == "strict-origin-when-cross-origin" ]] && pass "Referrer-Policy is strict-origin-when-cross-origin" || fail "Referrer-Policy is missing or unexpected"

permissions="$(header_value permissions-policy)"
[[ "$permissions" == *"camera=()"* && "$permissions" == *"microphone=()"* && "$permissions" == *"geolocation=()"* ]] \
  && pass "Permissions-Policy disables sensitive browser features" \
  || fail "Permissions-Policy is missing or incomplete"

coop="$(header_value cross-origin-opener-policy)"
[[ "$coop" == "same-origin" ]] && pass "Cross-Origin-Opener-Policy is same-origin" || fail "Cross-Origin-Opener-Policy is missing or unexpected"

corp="$(header_value cross-origin-resource-policy)"
[[ "$corp" == "same-origin" ]] && pass "Cross-Origin-Resource-Policy is same-origin" || fail "Cross-Origin-Resource-Policy is missing or unexpected"

xpcdp="$(header_value x-permitted-cross-domain-policies)"
[[ "$xpcdp" == "none" ]] && pass "X-Permitted-Cross-Domain-Policies is none" || fail "X-Permitted-Cross-Domain-Policies is missing or unexpected"

printf '\n=== RESULT ===\n'
if (( failures > 0 )); then
  printf 'Live header verification found %d failing control(s).\n' "$failures" >&2
  exit 1
fi

printf 'All expected live security headers are present.\n'
