# Price Family Farm

Public farm website and growing digital farm record for **Price Family Farm in Greeneville, Tennessee**.

Built with **Next.js 15.5** and **React 19** and configured for a fully static export suitable for S3 + CloudFront. Live weather is fetched in the visitor browser from the National Weather Service; the site does not require an application server for weather.

## Farm OS V2

This branch adds an operational layer without turning private farm notes into public website content:

- `/farm-records` — browser-local harvest, sales, experiment, and direct-expense records
- JSON backup/restore and CSV export for farm records
- `/funding` — browser-local funding, cost-share, certification, education, deadline, and next-action tracker
- `/available` — conservative seasonal availability page plus interest-list capture; it never treats future production as confirmed inventory
- `/weather` — NWS area forecast with a cached/explicit unavailable fallback; it never invents current weather values
- task-oriented primary navigation: **Home · Farm · Plan · Learn · Contact**
- private operating pages are `noindex` and excluded from the sitemap
- contact and availability forms share one Web3Forms configuration and include validation + honeypot fields

Private Farm OS records use `localStorage`. They are device/browser specific unless exported and restored. They are intentionally not synchronized to a public backend in this pass.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Release gate

```bash
node scripts/verify-farm-os.mjs
npm run build
```

Pull requests also run a GitHub Actions quality gate that:

1. installs from the lockfile
2. verifies Farm OS contracts
3. builds the static export
4. serves `out/`
5. runs Playwright smoke tests at small-phone, tablet, and desktop viewports
6. checks persistence, availability honesty, weather fallback, navigation, and horizontal overflow

## Static hosting

`next.config.mjs` uses:

- `output: "export"`
- `trailingSlash: true`
- unoptimized Next images for static hosting

Build output is written to `out/` and can be synchronized to the existing S3/CloudFront hosting layer after the release gate is green.

Set `NEXT_PUBLIC_SITE_URL=https://price-family-farm.alecjprice.com` in the build environment.

### Contact form

Web3Forms uses a client-facing access key. The application supports overriding the legacy key with `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`. Because the key is necessarily present in a static browser bundle, the production domain should be restricted in the Web3Forms dashboard and Web3Forms abuse/spam controls should remain enabled.

## Source-of-truth guard

At the start of the 2026-08-27 five-agent pass, the public production site contained newer Farm OS routes and content that were not present on GitHub `main`. This branch therefore stays **draft / non-deployable until production-source parity is verified**. Do not replace the live S3/CloudFront site with an older repository snapshot simply because this branch builds successfully.

The production-source sync is tracked in GitHub issue #3 and the draft pull request for this pass.
