# Price Family Farm Cloud Sync

Private Cloudflare Worker bridge between trusted Farm OS browsers and the dedicated
`price-family-farm` Neon project.

This source is intentionally not deployed by the build script.

Before deployment:
1. `npm install`
2. `npm test`
3. `npx wrangler whoami`
4. apply any unapplied database migrations in numeric order
5. `npx wrangler secret put DATABASE_URL`
6. `npx wrangler secret put PFF_SYNC_TOKEN`
7. review the Worker URL and CORS origin
8. deploy only after explicit production authorization

The Neon database connection string must never be placed in a `NEXT_PUBLIC_*`
variable or in the static site bundle.

## Database schema

The Neon cloud-sync schema is version-controlled under `migrations/`.

- `001_initial_cloud_sync.sql` is the initial schema already applied to the dedicated Price Family Farm Neon project.
- `002_serialize_document_creates.sql` upgrades the document write function so concurrent first-time writes for the same Farm OS document serialize and return the normal revision conflict instead of racing into the unique index.

For an existing v1 database, apply migration 002. For a fresh database, apply migrations in numeric order. Do not edit or re-run production schema changes as part of the static-site deployment.
