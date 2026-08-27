#!/usr/bin/env bash
set -euo pipefail

: "${PFF_DISTRIBUTION_ID:?Set PFF_DISTRIBUTION_ID to the production CloudFront distribution ID}"

PFF_EXPECTED_ALIAS="${PFF_EXPECTED_ALIAS:-price-family-farm.alecjprice.com}"
POLICY_FILE="${PFF_POLICY_FILE:-deploy/cloudfront-security-headers-policy.json}"
APPLY="${APPLY:-0}"
WAIT_FOR_DEPLOYMENT="${WAIT_FOR_DEPLOYMENT:-1}"

export AWS_PAGER=""

for cmd in aws python3; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "ERROR: $cmd is required" >&2; exit 2; }
done

[[ -f "$POLICY_FILE" ]] || { echo "ERROR: policy file not found: $POLICY_FILE" >&2; exit 2; }

POLICY_NAME="$(python3 - "$POLICY_FILE" <<'PY'
import json, sys
print(json.load(open(sys.argv[1]))["Name"])
PY
)"

backup_dir=".security-backups"
mkdir -p "$backup_dir"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

printf '=== AWS IDENTITY ===\n'
aws sts get-caller-identity --query '{Account:Account,Arn:Arn}' --output table

printf '\n=== TARGET DISTRIBUTION ===\n'
aws cloudfront get-distribution-config --id "$PFF_DISTRIBUTION_ID" > "$workdir/distribution.json"
cp "$workdir/distribution.json" "$backup_dir/cloudfront-${PFF_DISTRIBUTION_ID}-${stamp}.json"

python3 - "$workdir/distribution.json" "$PFF_EXPECTED_ALIAS" <<'PY'
import json, sys
j = json.load(open(sys.argv[1]))
expected = sys.argv[2]
aliases = j["DistributionConfig"].get("Aliases", {}).get("Items", []) or []
print("Distribution aliases:", ", ".join(aliases) if aliases else "(none)")
if expected not in aliases:
    print(f"ERROR: expected alias {expected!r} is not attached to this distribution.", file=sys.stderr)
    raise SystemExit(1)
print(f"PASS: expected alias {expected} is attached to the target distribution")
PY

current_policy_id="$(python3 - "$workdir/distribution.json" <<'PY'
import json, sys
j = json.load(open(sys.argv[1]))
print(j["DistributionConfig"].get("DefaultCacheBehavior", {}).get("ResponseHeadersPolicyId", ""))
PY
)"
printf 'Current default-behavior response headers policy: %s\n' "${current_policy_id:-none}"

aws cloudfront list-response-headers-policies --type custom --output json > "$workdir/policies.json"
existing_policy_id="$(python3 - "$workdir/policies.json" "$POLICY_NAME" <<'PY'
import json, sys
source, name = sys.argv[1:]
data = json.load(open(source))
for item in data.get("ResponseHeadersPolicyList", {}).get("Items", []) or []:
    policy = item.get("ResponseHeadersPolicy", {})
    cfg = policy.get("ResponseHeadersPolicyConfig", {})
    if cfg.get("Name") == name:
        print(policy.get("Id", ""))
        break
PY
)"

printf '\n=== PLAN ===\n'
if [[ -n "$existing_policy_id" ]]; then
  echo "Policy '$POLICY_NAME' already exists as $existing_policy_id and will be updated to match $POLICY_FILE."
else
  echo "Policy '$POLICY_NAME' does not exist and will be created from $POLICY_FILE."
fi
if [[ -n "$current_policy_id" ]]; then
  echo "The default behavior currently has policy $current_policy_id attached."
else
  echo "The default behavior currently has no response headers policy attached."
fi

if [[ "$APPLY" != "1" ]]; then
  cat <<'EOF'

DRY RUN ONLY: no AWS settings were changed.
Review the AWS account and distribution above. To apply exactly this change, rerun with:

  APPLY=1 scripts/apply-cloudfront-security.sh

A timestamped copy of the current distribution configuration was written to .security-backups/.
EOF
  exit 0
fi

printf '\n=== APPLY RESPONSE HEADERS POLICY ===\n'
if [[ -n "$existing_policy_id" ]]; then
  aws cloudfront get-response-headers-policy-config --id "$existing_policy_id" > "$workdir/existing-policy.json"
  policy_etag="$(python3 - "$workdir/existing-policy.json" <<'PY'
import json, sys
print(json.load(open(sys.argv[1]))["ETag"])
PY
)"
  aws cloudfront update-response-headers-policy \
    --id "$existing_policy_id" \
    --if-match "$policy_etag" \
    --response-headers-policy-config "file://$POLICY_FILE" \
    >/dev/null
  policy_id="$existing_policy_id"
  echo "Updated response headers policy: $policy_id"
else
  policy_id="$(aws cloudfront create-response-headers-policy \
    --response-headers-policy-config "file://$POLICY_FILE" \
    --query 'ResponseHeadersPolicy.Id' \
    --output text)"
  echo "Created response headers policy: $policy_id"
fi

printf '\n=== ATTACH TO DEFAULT CACHE BEHAVIOR ===\n'
# Re-read immediately before mutation so the ETag reflects any concurrent changes.
aws cloudfront get-distribution-config --id "$PFF_DISTRIBUTION_ID" > "$workdir/distribution-latest.json"
etag="$(python3 - "$workdir/distribution-latest.json" <<'PY'
import json, sys
print(json.load(open(sys.argv[1]))["ETag"])
PY
)"

python3 - "$workdir/distribution-latest.json" "$workdir/distribution-config.json" "$policy_id" <<'PY'
import json, sys
source, dest, policy_id = sys.argv[1:]
j = json.load(open(source))
cfg = j["DistributionConfig"]
cfg.setdefault("DefaultCacheBehavior", {})["ResponseHeadersPolicyId"] = policy_id
with open(dest, "w") as fh:
    json.dump(cfg, fh, indent=2)
PY

aws cloudfront update-distribution \
  --id "$PFF_DISTRIBUTION_ID" \
  --if-match "$etag" \
  --distribution-config "file://$workdir/distribution-config.json" \
  --query 'Distribution.{Id:Id,Status:Status,DomainName:DomainName}' \
  --output table

echo "Attached response headers policy $policy_id to the default cache behavior."

if [[ "$WAIT_FOR_DEPLOYMENT" == "1" ]]; then
  printf '\nWaiting for CloudFront deployment to finish...\n'
  aws cloudfront wait distribution-deployed --id "$PFF_DISTRIBUTION_ID"
  echo "CloudFront reports the distribution is deployed."
fi

printf '\n=== POST-CHANGE AUDIT ===\n'
if [[ -n "${PFF_BUCKET:-}" ]]; then
  PFF_BUCKET="$PFF_BUCKET" PFF_DISTRIBUTION_ID="$PFF_DISTRIBUTION_ID" scripts/audit-edge-security.sh
else
  echo "PFF_BUCKET is not set, so the full S3 + CloudFront audit was not run."
  echo "Set PFF_BUCKET and run: scripts/audit-edge-security.sh"
fi

cat <<EOF

CloudFront response-header hardening is applied.
Backup of the pre-change distribution config:
  $backup_dir/cloudfront-${PFF_DISTRIBUTION_ID}-${stamp}.json

Next verify the viewer response:
  scripts/verify-live-security.sh https://$PFF_EXPECTED_ALIAS/
EOF
