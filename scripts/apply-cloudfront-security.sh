#!/usr/bin/env bash
set -euo pipefail

: "${PFF_DISTRIBUTION_ID:?Set PFF_DISTRIBUTION_ID}"

PFF_EXPECTED_ALIAS="${PFF_EXPECTED_ALIAS:-price-family-farm.alecjprice.com}"
PFF_MANAGED_SECURITY_HEADERS_POLICY_ID="${PFF_MANAGED_SECURITY_HEADERS_POLICY_ID:-67f7725c-6f97-4210-82d7-5512b31e9d03}"
PFF_SECURITY_FUNCTION_NAME="${PFF_SECURITY_FUNCTION_NAME:-price-family-farm-security-headers}"
PFF_SECURITY_FUNCTION_FILE="${PFF_SECURITY_FUNCTION_FILE:-deploy/cloudfront-security-headers-function.js}"

APPLY="${APPLY:-0}"
WAIT_FOR_DEPLOYMENT="${WAIT_FOR_DEPLOYMENT:-1}"
ALLOW_REPLACE_VIEWER_RESPONSE="${ALLOW_REPLACE_VIEWER_RESPONSE:-0}"

export AWS_PAGER=""

for cmd in aws python3; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: $cmd is required" >&2
    exit 2
  }
done

[[ -f "$PFF_SECURITY_FUNCTION_FILE" ]] || {
  echo "ERROR: missing function source: $PFF_SECURITY_FUNCTION_FILE" >&2
  exit 2
}

backup_dir=".security-backups"
mkdir -p "$backup_dir"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

echo "=== AWS IDENTITY ==="
aws sts get-caller-identity \
  --query '{Account:Account,Arn:Arn}' \
  --output table

echo
echo "=== TARGET DISTRIBUTION ==="

aws cloudfront get-distribution-config \
  --id "$PFF_DISTRIBUTION_ID" \
  > "$workdir/distribution.json"

cp \
  "$workdir/distribution.json" \
  "$backup_dir/cloudfront-${PFF_DISTRIBUTION_ID}-${stamp}.json"

python3 - \
  "$workdir/distribution.json" \
  "$PFF_EXPECTED_ALIAS" \
  "$PFF_MANAGED_SECURITY_HEADERS_POLICY_ID" <<'PY_TARGET'
import json
import sys

source, expected_alias, expected_policy = sys.argv[1:]

data = json.load(open(source))
cfg = data["DistributionConfig"]

aliases = cfg.get("Aliases", {}).get("Items", []) or []

print("Aliases:", ", ".join(aliases) if aliases else "(none)")

if expected_alias not in aliases:
    print(
        f"ERROR: expected alias {expected_alias!r} is not attached.",
        file=sys.stderr,
    )
    raise SystemExit(1)

print("PASS: expected production alias is attached.")

behavior = cfg.get("DefaultCacheBehavior", {})

current_policy = behavior.get("ResponseHeadersPolicyId", "")
print("Current response policy:", current_policy or "(none)")
print("Expected managed policy:", expected_policy)

items = (
    behavior
    .get("FunctionAssociations", {})
    .get("Items", [])
    or []
)

viewer_response = [
    item for item in items
    if item.get("EventType") == "viewer-response"
]

if viewer_response:
    for item in viewer_response:
        print(
            "Viewer-response function:",
            item.get("FunctionARN", "(missing ARN)")
        )
else:
    print("Viewer-response function: (none)")
PY_TARGET

echo
echo "=== VERIFY MANAGED SECURITY POLICY ==="

policy_name="$(
  aws cloudfront get-response-headers-policy \
    --id "$PFF_MANAGED_SECURITY_HEADERS_POLICY_ID" \
    --query 'ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name' \
    --output text
)"

echo "Policy name: $policy_name"

case "$policy_name" in
  SecurityHeadersPolicy|Managed-SecurityHeadersPolicy)
    echo "PASS: AWS managed SecurityHeadersPolicy verified."
    ;;
  *)
    echo "ERROR: configured policy is not AWS SecurityHeadersPolicy: $policy_name" >&2
    exit 1
    ;;
esac

echo
echo "=== CLOUDFRONT FUNCTION ==="

function_exists=0

if aws cloudfront describe-function \
  --name "$PFF_SECURITY_FUNCTION_NAME" \
  --stage DEVELOPMENT \
  > "$workdir/function-development.json" 2>/dev/null
then
  function_exists=1

  python3 - "$workdir/function-development.json" <<'PY_FUNCTION'
import json
import sys

j = json.load(open(sys.argv[1]))
meta = j["FunctionSummary"]["FunctionMetadata"]

print("Function ARN:", meta["FunctionARN"])
print("Stage:", meta.get("Stage", "DEVELOPMENT"))
PY_FUNCTION
else
  echo "Function does not currently exist in DEVELOPMENT."
fi

echo
echo "=== PLAN ==="
echo "Distribution: $PFF_DISTRIBUTION_ID"
echo "Alias: $PFF_EXPECTED_ALIAS"
echo "Managed policy: $PFF_MANAGED_SECURITY_HEADERS_POLICY_ID"
echo "Function: $PFF_SECURITY_FUNCTION_NAME"
echo "Source: $PFF_SECURITY_FUNCTION_FILE"

if [[ "$APPLY" != "1" ]]; then
  cat <<'DRY_RUN_TEXT'

DRY RUN ONLY — no AWS configuration was changed.

An APPLY=1 run would:
  1. create/update the viewer-response CloudFront Function,
  2. test it before publishing,
  3. publish it to LIVE,
  4. attach AWS managed SecurityHeadersPolicy,
  5. preserve existing viewer-request function associations,
  6. attach the security function at viewer-response,
  7. run edge-security and live-header verification.

Production writes require an explicit:

  APPLY=1 bash scripts/apply-cloudfront-security.sh

Do not use APPLY=1 during a normal static-site content deployment.
DRY_RUN_TEXT

  exit 0
fi

cat > "$workdir/function-config.json" <<'FUNCTION_CONFIG'
{
  "Comment": "Price Family Farm viewer-response security headers",
  "Runtime": "cloudfront-js-2.0"
}
FUNCTION_CONFIG

cat > "$workdir/test-event.json" <<'TEST_EVENT'
{
  "version": "1.0",
  "context": {
    "eventType": "viewer-response"
  },
  "viewer": {
    "ip": "198.51.100.10"
  },
  "request": {
    "method": "GET",
    "uri": "/",
    "querystring": {},
    "headers": {},
    "cookies": {}
  },
  "response": {
    "statusCode": 200,
    "statusDescription": "OK",
    "headers": {},
    "cookies": {}
  }
}
TEST_EVENT

echo
echo "=== APPLY FUNCTION SOURCE ==="

if [[ "$function_exists" == "1" ]]; then
  function_etag="$(
    python3 - "$workdir/function-development.json" <<'PY_ETAG'
import json
import sys
print(json.load(open(sys.argv[1]))["ETag"])
PY_ETAG
  )"

  aws cloudfront update-function \
    --name "$PFF_SECURITY_FUNCTION_NAME" \
    --if-match "$function_etag" \
    --function-config "file://$workdir/function-config.json" \
    --function-code "fileb://$PFF_SECURITY_FUNCTION_FILE" \
    > "$workdir/function-write.json"

  echo "Updated DEVELOPMENT function."
else
  aws cloudfront create-function \
    --name "$PFF_SECURITY_FUNCTION_NAME" \
    --function-config "file://$workdir/function-config.json" \
    --function-code "fileb://$PFF_SECURITY_FUNCTION_FILE" \
    > "$workdir/function-write.json"

  echo "Created DEVELOPMENT function."
fi

function_etag="$(
  python3 - "$workdir/function-write.json" <<'PY_WRITE_ETAG'
import json
import sys
print(json.load(open(sys.argv[1]))["ETag"])
PY_WRITE_ETAG
)"

echo
echo "=== TEST FUNCTION ==="

aws cloudfront test-function \
  --name "$PFF_SECURITY_FUNCTION_NAME" \
  --if-match "$function_etag" \
  --stage DEVELOPMENT \
  --event-object "fileb://$workdir/test-event.json" \
  > "$workdir/function-test.json"

python3 - "$workdir/function-test.json" <<'PY_TEST'
import json
import sys

result = json.load(open(sys.argv[1]))
test = result.get("TestResult", {})

error = test.get("FunctionErrorMessage")
if error:
    print("ERROR: function test failed:", error, file=sys.stderr)
    raise SystemExit(1)

raw = test.get("FunctionOutput")
if not raw:
    print("ERROR: function returned no output.", file=sys.stderr)
    raise SystemExit(1)

output = json.loads(raw)
headers = output.get("headers", {})

required = {
    "strict-transport-security",
    "content-security-policy",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "cross-origin-opener-policy",
    "cross-origin-resource-policy",
    "x-permitted-cross-domain-policies",
}

missing = sorted(required - set(headers))

if missing:
    print(
        "ERROR: missing headers: " + ", ".join(missing),
        file=sys.stderr,
    )
    raise SystemExit(1)

print("PASS: function test returned all 9 required headers.")
print("Compute utilization:", test.get("ComputeUtilization", "unknown"))
PY_TEST

echo
echo "=== PUBLISH FUNCTION ==="

aws cloudfront publish-function \
  --name "$PFF_SECURITY_FUNCTION_NAME" \
  --if-match "$function_etag" \
  > "$workdir/function-publish.json"

aws cloudfront describe-function \
  --name "$PFF_SECURITY_FUNCTION_NAME" \
  --stage LIVE \
  > "$workdir/function-live.json"

function_arn="$(
  python3 - "$workdir/function-live.json" <<'PY_LIVE'
import json
import sys

j = json.load(open(sys.argv[1]))

print(
    j["FunctionSummary"]
     ["FunctionMetadata"]
     ["FunctionARN"]
)
PY_LIVE
)"

echo "LIVE function: $function_arn"

echo
echo "=== ATTACH FREE-PLAN SECURITY CONTROLS ==="

aws cloudfront get-distribution-config \
  --id "$PFF_DISTRIBUTION_ID" \
  > "$workdir/distribution-latest.json"

etag="$(
  python3 - "$workdir/distribution-latest.json" <<'PY_DIST_ETAG'
import json
import sys
print(json.load(open(sys.argv[1]))["ETag"])
PY_DIST_ETAG
)"

python3 - \
  "$workdir/distribution-latest.json" \
  "$workdir/distribution-config.json" \
  "$PFF_MANAGED_SECURITY_HEADERS_POLICY_ID" \
  "$function_arn" \
  "$ALLOW_REPLACE_VIEWER_RESPONSE" <<'PY_ATTACH'
import json
import sys

source, dest, policy_id, function_arn, allow_replace = sys.argv[1:]

data = json.load(open(source))
cfg = data["DistributionConfig"]
behavior = cfg.setdefault("DefaultCacheBehavior", {})

lambda_items = (
    behavior
    .get("LambdaFunctionAssociations", {})
    .get("Items", [])
    or []
)

if any(
    item.get("EventType") == "viewer-response"
    for item in lambda_items
):
    print(
        "ERROR: viewer-response Lambda@Edge exists; refusing automatic replacement.",
        file=sys.stderr,
    )
    raise SystemExit(1)

associations = behavior.setdefault(
    "FunctionAssociations",
    {"Quantity": 0}
)

items = associations.get("Items", []) or []

for item in items:
    if item.get("EventType") != "viewer-response":
        continue

    existing_arn = item.get("FunctionARN", "")

    if (
        existing_arn
        and existing_arn != function_arn
        and allow_replace != "1"
    ):
        print(
            "ERROR: another viewer-response function is attached: "
            + existing_arn,
            file=sys.stderr,
        )
        print(
            "Set ALLOW_REPLACE_VIEWER_RESPONSE=1 only after review.",
            file=sys.stderr,
        )
        raise SystemExit(1)

items = [
    item
    for item in items
    if item.get("EventType") != "viewer-response"
]

items.append({
    "FunctionARN": function_arn,
    "EventType": "viewer-response",
})

associations["Items"] = items
associations["Quantity"] = len(items)

behavior["ResponseHeadersPolicyId"] = policy_id

with open(dest, "w") as fh:
    json.dump(cfg, fh, indent=2)
PY_ATTACH

aws cloudfront update-distribution \
  --id "$PFF_DISTRIBUTION_ID" \
  --if-match "$etag" \
  --distribution-config "file://$workdir/distribution-config.json" \
  --query 'Distribution.{Id:Id,Status:Status,DomainName:DomainName}' \
  --output table

echo "PASS: managed policy attached."
echo "PASS: viewer-response security function attached."

if [[ "$WAIT_FOR_DEPLOYMENT" == "1" ]]; then
  echo
  echo "Waiting for CloudFront deployment..."

  aws cloudfront wait distribution-deployed \
    --id "$PFF_DISTRIBUTION_ID"

  echo "CloudFront reports deployment complete."
fi

echo
echo "=== POST-CHANGE AUDIT ==="

if [[ -n "${PFF_BUCKET:-}" ]]; then
  PFF_BUCKET="$PFF_BUCKET" \
  PFF_DISTRIBUTION_ID="$PFF_DISTRIBUTION_ID" \
    bash scripts/audit-edge-security.sh
else
  echo "PFF_BUCKET not set; skipping S3 portion of audit."
fi

bash scripts/verify-live-security.sh \
  "https://$PFF_EXPECTED_ALIAS/"

echo
echo "CloudFront Free-plan security hardening is applied."
echo "Pre-change config backup:"
echo "  $backup_dir/cloudfront-${PFF_DISTRIBUTION_ID}-${stamp}.json"
