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

In the Web3Forms dashboard, restrict the key to the production farm domain and keep its anti-spam/domain protections enabled.

## CloudFront response security headers

`deploy/cloudfront-security-headers-policy.json` is the intended response-headers policy. It adds:

- HSTS
- Content Security Policy
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- strict-origin referrer handling

Before attaching the policy, review the CSP whenever a new external service is added. The current allowlist expects only the National Weather Service and Web3Forms network calls.

Example creation command:

```bash
aws cloudfront create-response-headers-policy \
  --response-headers-policy-config file://deploy/cloudfront-security-headers-policy.json
```

Then attach the returned policy ID to the CloudFront distribution's default cache behavior. Do not guess or replace an existing managed response-headers policy without first reading the current distribution config and preserving its ETag.

After deployment, verify the live headers with:

```bash
curl -sSI https://price-family-farm.alecjprice.com/ | \
  grep -Ei 'strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy'
```

## Release gates

Pull requests and `main` run:

1. `npm ci`
2. `npm audit --audit-level=high`
3. Farm OS contract checks
4. static security contract checks
5. production static build
6. responsive Playwright smoke tests
7. CodeQL `security-extended` analysis

Do not deploy when any required gate is red.

## Reporting a security issue

The site publishes `/.well-known/security.txt`. Use the farm contact form for security reports and avoid including live credentials or highly sensitive data in the first message.
