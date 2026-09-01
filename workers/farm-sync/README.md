# Price Family Farm Cloud Sync

Private Cloudflare Worker bridge between trusted Farm OS browsers and the dedicated
`price-family-farm` Neon project.

This source is intentionally not deployed by the build script.

Before deployment:
1. `npm install`
2. `npm test`
3. `npx wrangler whoami`
4. `npx wrangler secret put DATABASE_URL`
5. `npx wrangler secret put PFF_SYNC_TOKEN`
6. review the Worker URL and CORS origin
7. deploy only after explicit production authorization

The Neon database connection string must never be placed in a `NEXT_PUBLIC_*`
variable or in the static site bundle.


## Database schema

The Neon cloud-sync schema is version-controlled in `migrations/001_initial_cloud_sync.sql`. It mirrors the initial schema already applied to the dedicated Price Family Farm Neon project.
