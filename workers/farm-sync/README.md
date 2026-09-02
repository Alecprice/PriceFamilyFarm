# Price Family Farm Cloud Sync

Private Cloudflare Worker bridge between trusted Farm OS browsers and the dedicated
`price-family-farm` Neon project.

This source is intentionally **not deployed** by the static-site build or normal
repository verification. The dedicated Neon project is known to exist, but its
current Cloud Sync migration/schema state must be treated as **unverified** until a
read-only check proves which migrations are actually present.

## Non-mutating preflight

These checks are safe to run before any production authorization:

```bash
npm ci
npm test
npm run bundle:check
npx wrangler whoami
```

`npm run bundle:check` runs `wrangler deploy --dry-run` and writes only a local
ignored bundle under `.wrangler/`; it does not upload or activate the Worker.

## Production mutation boundary

Do **not** apply migrations, set production Worker secrets, or deploy the Worker
until production activation is explicitly authorized and the target resources have
been verified.

Current Wrangler behavior is important here: `npx wrangler secret put ...` is a
production-mutating command that creates a new Worker version and deploys it. It is
therefore not a harmless setup/preflight step. `npx wrangler deploy` is also a live
deployment command.

After explicit production authorization, use this order:

1. Confirm the selected Neon project is the dedicated `price-family-farm` project.
2. Read the current schema/migration state without writing anything.
3. Apply only migrations that are confirmed missing, in numeric order.
4. Review `PFF_ALLOWED_ORIGIN` in `wrangler.toml`; production must remain restricted
   to `https://price-family-farm.alecjprice.com` unless the public site origin itself
   intentionally changes.
5. Configure `DATABASE_URL` and `PFF_SYNC_TOKEN` as Worker secrets using an approved
   deployment/version workflow. Never place either value in source control.
6. Deploy the Worker and verify authenticated `/health` reports the expected schema.
7. Record the exact HTTPS Worker origin, set that origin as
   `NEXT_PUBLIC_FARM_SYNC_ENDPOINT` in the static-site build environment, rebuild the
   site, and rerun the site release gates before any static-site deployment.

The Neon database connection string must never be placed in a `NEXT_PUBLIC_*`
variable or in the static site bundle. The bearer token is entered by the operator
in Farm OS and remains session-only in the browser.

## Database schema

The Neon Cloud Sync schema is version-controlled under `migrations/`:

- `001_initial_cloud_sync.sql` creates the initial Farm OS sync tables, metadata, and
  revision-aware write function.
- `002_serialize_document_creates.sql` upgrades the document write function so
  concurrent first-time writes for the same Farm OS document serialize and return
  the normal revision conflict instead of racing into the unique index.

Do not assume either migration has been applied merely because the SQL file exists
in the repository. For a fresh verified database, apply migrations in numeric
order. For an existing database, inspect its current schema/version first and apply
only confirmed-missing migrations. Never run production schema changes as part of
the static-site deployment.
