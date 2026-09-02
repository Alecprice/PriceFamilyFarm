# Price Family Farm

Public farm website and growing digital farm record for **Price Family Farm in Greeneville, Tennessee**.

Built with **Next.js 16.3.3** and **React 19.2.4** and configured for a fully static export suitable for S3 + CloudFront. Live weather is fetched in the visitor browser from the National Weather Service; the site does not require an application server for weather.

## Farm OS V2

The operational layer keeps private farm notes separate from public website content:

- `/farm-records` — browser-local harvest, sales, experiment, and direct-expense records
- JSON backup/restore and CSV export for farm records
- `/funding` — browser-local funding, cost-share, certification, education, deadline, and next-action tracker
- `/available` — conservative seasonal availability page plus interest-list capture; it never treats future production as confirmed inventory
- `/weather` — NWS area forecast with cached/explicit unavailable fallback; it never invents current weather values
- `/privacy-tools` — explicit browser-local data controls
- `/farm-os/cloud-sync` — optional private Cloud Sync bridge; inactive unless a trusted production endpoint is deliberately configured and deployed
- task-oriented primary navigation: **Home · Farm · Plan · Learn · Contact**
- private operating pages are `noindex` and excluded from the sitemap
- contact and availability forms share one Web3Forms configuration and include validation, throttling, timeout handling, fail-closed behavior, and honeypot fields

Private Farm OS records remain **local-first** in `localStorage`. Without Cloud Sync activation they are device/browser specific unless exported and restored. The optional Cloud Sync path uses a private bearer token held in `sessionStorage`, only permits a build-configured production API origin (or loopback during development), and is not activated by the normal static-site build.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Release gates

```bash
npm audit --audit-level=high
npm run lint
node scripts/verify-farm-os.mjs
node scripts/verify-security.mjs
node scripts/verify-cloud-sync.mjs
npm run build

cd workers/farm-sync
npm ci
npm test
npm run bundle:check
npm audit --audit-level=high
```

`npm run bundle:check` compiles the Worker with Wrangler `--dry-run`; it does not deploy the Worker. Pull requests and `main` run the corresponding GitHub Actions quality gates plus CodeQL security analysis.

## Static hosting

`next.config.mjs` uses:

- `output: "export"`
- `trailingSlash: true`
- unoptimized Next images for static hosting

Build output is written to `out/` and can be synchronized to the existing S3/CloudFront hosting layer after the release gates and production-parity checks are green.

Set `NEXT_PUBLIC_SITE_URL=https://price-family-farm.alecjprice.com` in the build environment.

### Contact form

Web3Forms uses a browser-visible access key supplied through `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`; the production key does not belong in source control. Web3Forms documents Restrict to Domain as a paid/Pro feature. If available, whitelist only `price-family-farm.alecjprice.com`. The free-plan baseline is provider spam filtering plus the site's botcheck, validation, throttling, and timeout controls.

### Optional Farm OS Cloud Sync

Cloud Sync is a separate private operating path, not a requirement for the public site. Production activation requires all of the following to be deliberately completed and verified:

1. verify the dedicated `price-family-farm` Neon target and its current migration/schema state;
2. apply only confirmed-missing migrations from `workers/farm-sync/migrations/` in numeric order;
3. configure the Worker secrets and restricted `PFF_ALLOWED_ORIGIN`;
4. deploy and verify the Worker only after explicit production authorization;
5. set `NEXT_PUBLIC_FARM_SYNC_ENDPOINT` to the exact deployed HTTPS Worker origin and rebuild the static site.

Until those steps are complete, leave `NEXT_PUBLIC_FARM_SYNC_ENDPOINT` blank in production builds. Never put the Neon connection string or private sync token in a `NEXT_PUBLIC_*` variable.

See `workers/farm-sync/README.md` for the Worker-specific runbook.

## AWS production security

The repository contains three operator helpers:

```bash
bash scripts/discover-production-aws.sh
bash scripts/audit-edge-security.sh
bash scripts/apply-cloudfront-security.sh
```

`apply-cloudfront-security.sh` is **dry-run by default**. It verifies the expected production alias and backs up the current CloudFront configuration before offering the mutating command:

```bash
APPLY=1 bash scripts/apply-cloudfront-security.sh
```

After CloudFront deploys, verify the viewer headers with:

```bash
bash scripts/verify-live-security.sh https://price-family-farm.alecjprice.com/
```

See `docs/PRODUCTION-SECURITY-RUNBOOK.md` for the guided production procedure.

## Source-of-truth guard

The live production site has historically moved ahead of GitHub. Do not use a destructive S3 sync such as `aws s3 sync ... --delete` until all intended production routes/assets have been reconciled into the deployable repository source. A green compile is not proof of production parity.
