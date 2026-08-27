# Production security runbook

Use this checklist for the live Price Family Farm site. It is deliberately ordered so read-only verification happens before any AWS mutation.

## 0. Update the local repository

```bash
cd ~/Downloads/PriceFamilyFarm   # use your actual local repo path
git switch main
git pull --ff-only origin main
npm ci
```

Do not deploy yet.

## 1. Confirm the code gates locally

```bash
npm audit --audit-level=high
npm run lint
node scripts/verify-farm-os.mjs
node scripts/verify-security.mjs
npm run build
```

All commands must pass before a production build is trusted.

## 2. Discover the production AWS resources (read only)

Make sure the AWS CLI is signed into the account that owns the farm site's CloudFront distribution:

```bash
aws sts get-caller-identity
```

Then run:

```bash
bash scripts/discover-production-aws.sh
```

The helper searches CloudFront for the exact alias `price-family-farm.alecjprice.com`. If exactly one matching distribution is found, it prints copy/paste exports similar to:

```bash
export PFF_DISTRIBUTION_ID=E123EXAMPLE
export PFF_BUCKET=example-bucket
export PFF_EXPECTED_ALIAS=price-family-farm.alecjprice.com
```

If the bucket cannot be inferred safely, find the bucket name in **CloudFront → Distribution → Origins** and set `PFF_BUCKET` manually.

## 3. Audit the existing AWS edge security (read only)

```bash
bash scripts/audit-edge-security.sh
```

This requires `PFF_BUCKET` and `PFF_DISTRIBUTION_ID` to be exported from step 2.

Save the output. A failure is useful—it tells you exactly what still needs hardening.

## 4. Preview the CloudFront response-header change (read only)

```bash
bash scripts/apply-cloudfront-security.sh
```

Default behavior is dry run. It:

- prints the AWS identity;
- verifies the distribution contains the expected farm-site alias;
- reports the currently attached response-headers policy;
- finds whether `price-family-farm-security-v1` already exists;
- writes a local backup of the distribution configuration to `.security-backups/`;
- makes **no AWS changes**.

Stop if the AWS account, alias, distribution, or current configuration is unexpected.

## 5. Apply the CloudFront response-headers policy

Only after step 4 looks correct:

```bash
APPLY=1 bash scripts/apply-cloudfront-security.sh
```

The helper updates/creates the custom response-headers policy and attaches it to the default cache behavior using CloudFront's current ETag. It then waits for CloudFront to finish deploying and runs the full edge audit when `PFF_BUCKET` is set.

AWS documents that a response-headers policy must be attached to a cache behavior before CloudFront adds/removes those headers in viewer responses.

## 6. Verify the live viewer response

```bash
bash scripts/verify-live-security.sh https://price-family-farm.alecjprice.com/
```

Expected checks include:

- HTTPS success
- HSTS
- CSP
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- strict referrer policy
- restricted Permissions Policy
- COOP/CORP
- disabled cross-domain policies

## 7. Replace the Web3Forms access key

The access key is browser-visible by design, but keeping the old identifier after it has lived in source history is unnecessary.

1. Go to Web3Forms and create a new access key for the inbox used by the farm website.
2. Do **not** commit the key to GitHub.
3. In the terminal used to build production:

```bash
export NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY='PASTE_NEW_KEY_HERE'
export NEXT_PUBLIC_SITE_URL='https://price-family-farm.alecjprice.com'
```

4. Rebuild:

```bash
npm run build
```

5. Test both the Contact and Availability forms from the production domain after deployment.

### Domain restriction note

Web3Forms currently documents **Restrict to Domain as a paid/Pro feature**. If your account includes it:

- open the form settings;
- enable Restrict to Domain;
- add `price-family-farm.alecjprice.com` (do not include `https://`);
- test from production after enabling it.

If the account is free, leave that step out. The site already uses Web3Forms' recommended hidden `botcheck`, local throttling, strict validation, and request timeouts. If spam becomes a problem, rotate the access key or consider upgrading for domain restriction/CAPTCHA.

## 8. Do not use a destructive S3 sync yet unless production parity is resolved

The repository has a documented history of the live site being ahead of GitHub. A command such as:

```bash
aws s3 sync out/ s3://YOUR_BUCKET/ --delete
```

can erase live pages that are not present in the current checkout.

Before any `--delete` deploy, confirm the intended production route inventory has been reconciled into GitHub. Until then, prefer a non-destructive upload or keep the existing production deployment untouched.

## 9. Final post-deploy checks

After any production deployment:

```bash
bash scripts/verify-live-security.sh https://price-family-farm.alecjprice.com/
bash scripts/audit-edge-security.sh
```

Then manually test:

- Home
- Availability form
- Contact form
- Growing Conditions / weather fallback
- Farm Records local persistence
- Funding tracker external links
- Privacy Tools destructive confirmation
- phone/tablet navigation

Do not put passwords, tax IDs, banking data, USDA credentials, or other secrets into Farm OS browser-local notes.
