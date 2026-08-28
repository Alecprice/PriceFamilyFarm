# Production release checklist

Use this checklist before any S3/CloudFront production write. The farm site currently has a known source-parity risk, so a successful local build by itself is not enough evidence for deployment.

## 1. Use the intended production source

- Start from the current integration branch, not an older downloaded copy.
- Confirm all intentionally live production-era routes/assets have been reconciled into source control.
- Confirm `git status` contains only intentional release changes.

## 2. Load production build configuration

Set these in the shell that will run the preflight:

```bash
export NEXT_PUBLIC_SITE_URL="https://price-family-farm.alecjprice.com"
export NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY="<rotated-and-domain-restricted-key>"
export PFF_BUCKET="<production-bucket>"
export PFF_DISTRIBUTION_ID="<production-cloudfront-id>"
```

Do not commit the Web3Forms value or other credentials to the repository.

## 3. Run the read-only preflight

```bash
npm run release:preflight
```

The preflight intentionally stops on the first failed gate. It runs dependency install/audit, lint, Farm OS/security contracts, the static build, known-source parity, live S3 route comparison, and the read-only edge-security audit.

A failed parity check is a release blocker, not a warning to work around.

## 4. Review before any write

- Review the PR diff and generated `out/` route/assets inventory.
- Confirm no currently live page is scheduled to disappear unintentionally.
- Confirm forms use the rotated production Web3Forms key and its provider-side domain restrictions.
- Confirm CloudFront has the expected security response-headers policy attached.
- Confirm the target bucket/distribution IDs are production and not a similarly named resource.

## 5. Deployment remains a separate action

The preflight does **not** deploy. Do not turn preflight success into an automatic destructive sync.

If a later deployment process uses `aws s3 sync ... --delete`, require a fresh successful preflight from the exact commit being deployed and inspect the route comparison first.

After deployment, run the live security verification and a small production smoke test before considering the release complete.
