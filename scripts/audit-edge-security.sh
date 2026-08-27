#!/usr/bin/env bash
set -euo pipefail

: "${PFF_BUCKET:?Set PFF_BUCKET to the production S3 bucket name}"
: "${PFF_DISTRIBUTION_ID:?Set PFF_DISTRIBUTION_ID to the production CloudFront distribution ID}"

export AWS_PAGER=""

for cmd in aws python3; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "ERROR: $cmd is required" >&2; exit 2; }
done

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

failures=0
pass() { printf 'PASS: %s\n' "$1"; }
fail() { printf 'FAIL: %s\n' "$1" >&2; failures=$((failures + 1)); }

printf '=== S3 PUBLIC ACCESS ===\n'
if aws s3api get-public-access-block --bucket "$PFF_BUCKET" > "$workdir/public-access.json"; then
  python3 - "$workdir/public-access.json" <<'PY' || failures=$((failures + 1))
import json, sys
p = json.load(open(sys.argv[1]))["PublicAccessBlockConfiguration"]
keys = ["BlockPublicAcls", "IgnorePublicAcls", "BlockPublicPolicy", "RestrictPublicBuckets"]
bad = [k for k in keys if p.get(k) is not True]
if bad:
    print("FAIL: S3 Block Public Access is not fully enabled: " + ", ".join(bad), file=sys.stderr)
    raise SystemExit(1)
print("PASS: all four S3 Block Public Access controls are enabled")
PY
else
  fail "could not read S3 Block Public Access"
fi

if policy_status="$(aws s3api get-bucket-policy-status --bucket "$PFF_BUCKET" --query 'PolicyStatus.IsPublic' --output text 2>/dev/null)"; then
  [[ "$policy_status" == "False" ]] && pass "S3 bucket policy is not public" || fail "S3 bucket policy is public"
else
  fail "could not determine whether the S3 bucket policy is public"
fi

if encryption="$(aws s3api get-bucket-encryption --bucket "$PFF_BUCKET" --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' --output text 2>/dev/null)"; then
  [[ -n "$encryption" && "$encryption" != "None" ]] && pass "S3 default encryption is enabled ($encryption)" || fail "S3 default encryption is not enabled"
else
  fail "could not read S3 default encryption"
fi

printf '\n=== CLOUDFRONT ===\n'
if aws cloudfront get-distribution-config --id "$PFF_DISTRIBUTION_ID" > "$workdir/distribution.json"; then
  python3 - "$workdir/distribution.json" <<'PY' || failures=$((failures + 1))
import json, sys
j = json.load(open(sys.argv[1]))
c = j["DistributionConfig"]
errors = []

behavior = c.get("DefaultCacheBehavior", {})
if behavior.get("ViewerProtocolPolicy") not in {"redirect-to-https", "https-only"}:
    errors.append("default behavior does not force HTTPS")

viewer = c.get("ViewerCertificate", {})
minimum = viewer.get("MinimumProtocolVersion", "")
unsafe_tls = {"SSLv3", "TLSv1", "TLSv1_2016", "TLSv1.1_2016"}
if minimum in unsafe_tls or not minimum:
    errors.append(f"minimum TLS policy is too old or missing ({minimum or 'missing'})")

if not behavior.get("ResponseHeadersPolicyId"):
    errors.append("no CloudFront response headers policy is attached to the default behavior")

for origin in c.get("Origins", {}).get("Items", []):
    domain = origin.get("DomainName", "")
    if ".s3." in domain or domain.endswith(".s3.amazonaws.com"):
        oac = origin.get("OriginAccessControlId", "")
        oai = origin.get("S3OriginConfig", {}).get("OriginAccessIdentity", "")
        if not oac and not oai:
            errors.append(f"S3 origin {domain} has neither OAC nor legacy OAI")

if errors:
    for error in errors:
        print("FAIL: " + error, file=sys.stderr)
    raise SystemExit(1)

print("PASS: CloudFront forces HTTPS")
print(f"PASS: CloudFront minimum TLS policy is {minimum}")
print("PASS: default behavior has a response headers policy")
print("PASS: S3 origins use CloudFront origin access protection")
PY
else
  fail "could not read CloudFront distribution configuration"
fi

printf '\n=== RESULT ===\n'
if (( failures > 0 )); then
  printf 'Security audit found %d failing control(s).\n' "$failures" >&2
  exit 1
fi
printf 'All audited edge controls passed.\n'
