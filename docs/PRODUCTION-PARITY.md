# Production source parity

## Why this is a release blocker

The live S3/CloudFront site is newer than GitHub `main`. Replacing production from the old repository snapshot would remove working Farm OS routes and content even if the new branch itself builds successfully.

Known production-era source from the local farm project included routes/components such as:

- `/farm-journal`
- `/farm-map`
- `/harvest` (2026 Season Tracker)
- `/experiments`
- `/farm-calendar`
- `/timeline`
- `/search`
- `/weather`
- `/available`
- crop detail routes
- `FarmMapExplorer`
- `JournalFilters`
- `SeasonNow`
- `SiteSearch`
- `WeatherPanel`
- `lib/farmData.js`
- `lib/crops.js`
- static S3/CloudFront deployment documentation/scripts

Later production work also added more planning/learning routes, including the garden layout/planning experience.

## Safe sync procedure

Run from the **current local production source directory**, not from an old downloaded repository copy:

```bash
cd ~/Downloads/price-family-farm-footer-map-refresh

git status --short
git remote -v
npm ci
npm run build
```

Before copying or committing anything, compare the current local project against this PR branch and preserve the production-only routes/assets/data.

Recommended integration pattern:

1. create a backup of the current local production project
2. fetch GitHub
3. create an integration branch from this PR branch
4. copy/merge the current production-only routes, components, `lib/` data, images, CloudFront rewrite/deploy files, and docs into the integration branch
5. resolve the V2 navigation/homepage against the richer live route set rather than deleting those routes
6. run `node scripts/verify-farm-os.mjs`
7. run `npm run build`
8. run the responsive Playwright suite
9. compare the generated `out/` route inventory against the live-site route inventory
10. only then mark the PR ready to merge/deploy

## Do not

- do not run `aws s3 sync out/ ... --delete` from this draft branch
- do not merge while the richer production source is absent
- do not treat a green compile as proof of production parity
- do not publish browser-local finance/funding records into static source files

This document exists so the release guard remains explicit even after the code itself changes.
