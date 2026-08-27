#!/usr/bin/env bash
set -euo pipefail

EXPECTED_ALIAS="${PFF_EXPECTED_ALIAS:-price-family-farm.alecjprice.com}"
export AWS_PAGER=""

for cmd in aws python3; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "ERROR: $cmd is required" >&2; exit 2; }
done

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

printf '=== AWS IDENTITY ===\n'
aws sts get-caller-identity --query '{Account:Account,Arn:Arn}' --output table

aws cloudfront list-distributions --output json > "$workdir/distributions.json"

python3 - "$workdir/distributions.json" "$EXPECTED_ALIAS" <<'PY'
import json, re, sys
source, expected = sys.argv[1:]
data = json.load(open(source))
items = data.get("DistributionList", {}).get("Items", []) or []
matches = []
for dist in items:
    aliases = dist.get("Aliases", {}).get("Items", []) or []
    if expected in aliases:
        matches.append(dist)

if not matches:
    print(f"ERROR: no CloudFront distribution has alias {expected}", file=sys.stderr)
    raise SystemExit(1)
if len(matches) > 1:
    print(f"ERROR: more than one CloudFront distribution has alias {expected}; inspect manually.", file=sys.stderr)
    raise SystemExit(1)

d = matches[0]
print(f"Found distribution for {expected}")
print(f"  ID:         {d.get('Id')}")
print(f"  Status:     {d.get('Status')}")
print(f"  CloudFront: {d.get('DomainName')}")

bucket = ""
origins = d.get("Origins", {}).get("Items", []) or []
for origin in origins:
    domain = origin.get("DomainName", "")
    print(f"  Origin:     {domain}")
    m = re.match(r"^([a-zA-Z0-9._-]+)\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com$", domain)
    if m:
        bucket = m.group(1)

print("\nCopy/paste exports:")
print(f"export PFF_DISTRIBUTION_ID={d.get('Id')}")
if bucket:
    print(f"export PFF_BUCKET={bucket}")
else:
    print("# PFF_BUCKET could not be safely inferred from the CloudFront origin.")
    print("# Find the S3 bucket name in the CloudFront Origins tab before running the full S3 audit.")
print(f"export PFF_EXPECTED_ALIAS={expected}")
PY
