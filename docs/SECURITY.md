# Price Family Farm security baseline

This site is a static Next.js export hosted behind S3 + CloudFront. The public pages do not need a database or application server. Browser-local Farm OS records deliberately stay on the user's device.

## Security model

### Public website

- Static HTML/CSS/JavaScript only.
- No AWS credentials belong in the browser bundle or repository.
- The only expected browser network destinations are:
  - `https://api.weather.gov` for Greeneville-area forecast data.
  - `https://api.web3forms.com` for contact/availability messages.
- External funding links are restricted to HTTPS before rendering.
- New-window links must use `rel="noopener noreferrer"`.

### Farm OS records

`/farm-records` and `/funding` are noindex operating tools. Their records are stored in `localStorage`; no server receives those records.

That means:

- another visitor does not receive the current browser's farm records;
- another browser/device will not automatically have the records;
- anyone with access to the same browser profile/device can potentially read them;
- browser clearing/reset can erase them;
- JSON backups should be treated like private farm business records and stored accordingly.

Do not enter passwords, SSNs, tax IDs, bank information, card numbers, USDA login credentials, or other secrets into browser-local notes.

## Web3Forms

The Web3Forms access key is a browser-visible identifier and cannot be treated as a server secret. The repository intentionally does not contain the production value.

Production builds must provide:

```bash
export NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY='YOUR_PUBLIC_WEB3FORMS_KEY'
export NEXT_PUBLIC_SITE_URL='https://price-family-farm.alecjprice.com'
npm ci
npm run build
```

The application adds its own validation, a hidden `botcheck` honeypot, client-side submission throttling, timeouts, and fail-closed behavior when the key is missing.

Web3Forms currently documents **Restrict to Domain as a paid/Pro feature**. If the account has that feature, whitelist only `price-family-farm.alecjprice.com` (without `https://`) after testing. If the account is on the free plan, rely on Web3Forms' built-in filtering plus the site's honeypot/throttling controls, and rotate the access key if abuse appears.

## CloudFront response security headers

`deploy/cloudfront-security-headers-policy.json` is the intended response-headers policy. It adds:

- HSTS
- Content Security Policy
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- strict-origin referrer handling
- Permissions Policy restrictions
- COOP/CORP isolation headers

Before attaching the policy, review the CSP whenever a new external service is added. The current allowlist expects only the National Weather Service and Web3Forms network calls.

### Safe automation

The repository includes a dry-run-first CloudFront helper:

```bash
scripts/discover-production-aws.sh
```

It locates the CloudFront distribution by the expected production alias and prints the environment exports you need.

Then preview the change:

```bash
export PFF_DISTRIBUTION_ID='...'
export PFF_BUCKET='...'
scripts/apply-cloudfront-security.sh
```

The script verifies that the distribution actually contains the expected `price-family-farm.alecjprice.com` alias and writes a timestamped backup of the current distribution configuration to `.security-backups/`. **No AWS setting is changed in the default dry-run mode.**

After reviewing the AWS account and distribution, apply the response-headers policy with:

```bash
APPLY=1 scripts/apply-cloudfront-security.sh
```

The script creates or updates `price-family-farm-security-v1`, attaches it to the default CloudFront cache behavior using the current distribution ETag, waits for deployment, and runs the existing S3/CloudFront audit when `PFF_BUCKET` is set.

Then verify the headers seen by a real browser/client:

```bash
scripts/verify-live-security.sh https://price-family-farm.alecjprice.com/
```

## S3 + CloudFront read-only audit

Run:

```bash
PFF_BUCKET='...' PFF_DISTRIBUTION_ID='...' scripts/audit-edge-security.sh
```

It checks:

- all four S3 Block Public Access controls;
- bucket-policy public status;
- default bucket encryption;
- CloudFront HTTPS enforcement;
- minimum TLS policy;
- a response-headers policy attached to the default behavior;
- CloudFront origin access protection (OAC or legacy OAI) for S3 REST origins.

The audit does not mutate AWS resources.

## Release gates

Pull requests and `main` run:

1. `npm ci`
2. `npm audit --audit-level=high`
3. ESLint
4. Farm OS contract checks
5. static security contract checks
6. production static build
7. responsive/security Playwright tests
8. CodeQL `security-extended` analysis

Do not deploy when any required gate is red.

## Production parity

A secure deployment must also preserve production functionality. The live farm site historically contained routes that were ahead of GitHub. Do not use `aws s3 sync ... --delete` until the route/content parity check has been completed and all intended production-only functionality is represented in the deployable source.

## Reporting a security issue

The site publishes `/.well-known/security.txt`. Use the farm contact form for security reports and avoid including live credentials or highly sensitive data in the first message.
