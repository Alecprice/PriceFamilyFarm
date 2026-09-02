import fs from "node:fs";

let failures = 0;
let checks = 0;

function expect(condition, label) {
  checks += 1;
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${label}`);
  }
}

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const page = read("app/farm-os/cloud-sync/page.js");
const component = read("components/FarmCloudSync.jsx");
const client = read("lib/farmCloudSync.js");
const registry = read("lib/farmStoreRegistry.js");
const backup = read("components/FarmLocalBackup.jsx");
const worker = read("workers/farm-sync/src/index.js");
const workerConfig = read("workers/farm-sync/wrangler.toml");
const workerReadme = read("workers/farm-sync/README.md");
const workerPackage = JSON.parse(read("workers/farm-sync/package.json"));
const rootReadme = read("README.md");
const sitemap = read("app/sitemap.js");
const envExample = read(".env.example");

const migration = read("workers/farm-sync/migrations/001_initial_cloud_sync.sql");
const migration002 = read("workers/farm-sync/migrations/002_serialize_document_creates.sql");
expect(migration.includes("CREATE TABLE IF NOT EXISTS public.farm_documents"), "versioned migration creates Farm OS cloud documents");
expect(migration.includes("CREATE TABLE IF NOT EXISTS public.farm_document_versions"), "versioned migration preserves document history");
expect(migration.includes("CREATE TABLE IF NOT EXISTS public.farm_sync_events"), "versioned migration creates sync audit events");
expect(migration.includes("CREATE OR REPLACE FUNCTION public.pff_put_document"), "versioned migration defines revision-aware document writes");
expect(migration.includes("small-water-25690282"), "versioned migration records the dedicated Price Family Farm Neon project identity");
expect(!migration.includes("postgresql://") && !migration.includes("postgres://"), "versioned migration contains no database credential URI");
expect(migration002.includes("CREATE OR REPLACE FUNCTION public.pff_put_document"), "follow-up migration replaces the document write function safely");
expect(migration002.includes("pg_advisory_xact_lock"), "follow-up migration serializes first-write races before document lookup");
const advisoryLockIndex = migration002.indexOf("PERFORM pg_advisory_xact_lock(");
const rowLookupIndex = migration002.indexOf("SELECT *", advisoryLockIndex);
const rowLockIndex = migration002.indexOf("FOR UPDATE", rowLookupIndex);
expect(advisoryLockIndex >= 0 && rowLookupIndex > advisoryLockIndex && rowLockIndex > rowLookupIndex, "advisory lock is acquired before the actual document row lookup and row lock");
expect(migration002.includes("'version', 2"), "follow-up migration advances the cloud-sync schema version");
expect(!migration002.includes("postgresql://") && !migration002.includes("postgres://"), "follow-up migration contains no database credential URI");

expect(page.includes("index: false"), "Cloud Sync page is noindex");
expect(!sitemap.includes('"/farm-os/cloud-sync"'), "Cloud Sync page is excluded from the public sitemap");
expect(component.includes('type="password"'), "Cloud Sync token control is password-masked");
expect(client.includes("sessionStorage"), "sync token uses session storage");
expect(!client.includes("localStorage.setItem(TOKEN_KEY"), "sync token is never persisted in local storage");
expect(envExample.includes("NEXT_PUBLIC_FARM_SYNC_ENDPOINT="), "example environment declares the public Farm OS sync endpoint");
expect(client.includes("process.env.NEXT_PUBLIC_FARM_SYNC_ENDPOINT"), "client reads a build-configured production sync endpoint");
expect(client.includes("resolveAllowedSyncEndpoint"), "client resolves an allowlisted sync destination before requests");
expect(client.includes("url.username || url.password || url.search || url.hash"), "sync endpoint rejects embedded credentials, query strings, and fragments");
expect(client.includes('url.pathname && url.pathname !== "/"'), "sync endpoint rejects non-origin URL paths");
const allowedEndpointCheck = client.indexOf("const allowedEndpoint = resolveAllowedSyncEndpoint(endpoint)");
const allowedEndpointFetch = client.indexOf("await fetch(`${allowedEndpoint}${path}`", allowedEndpointCheck);
expect(allowedEndpointCheck >= 0 && allowedEndpointFetch > allowedEndpointCheck, "bearer-token requests resolve the trusted endpoint before fetch");
expect(client.includes("REQUEST_TIMEOUT_MS = 30_000"), "Cloud Sync requests have a bounded 30-second client timeout");
expect(client.includes("new AbortController()"), "Cloud Sync request timeout uses AbortController");
expect(client.includes('throw new Error("request_timeout")'), "Cloud Sync maps aborted requests to a stable timeout error");
expect(component.includes("timed out after 30 seconds"), "Cloud Sync UI explains request timeouts and in-flight uncertainty");
expect(client.includes("partial_upload:"), "Cloud Sync preserves structured partial-upload progress when later requests fail");
expect(client.includes("alreadyCurrent: result.alreadyCurrent"), "partial-upload progress includes already-matching reconciled copies");
expect(component.includes("Completed revision checkpoints were preserved"), "Cloud Sync UI explains that completed partial-upload checkpoints remain durable");
expect(component.includes("already-matching cloud"), "Cloud Sync UI explains verified idempotent retry reconciliation");
expect(client.includes("serverChecksum === requestBody.checksum"), "retry reconciliation requires the cloud checksum to match the browser request checksum");
expect(client.includes("serverChecksum === serverPayloadChecksum"), "retry reconciliation independently verifies the returned cloud payload checksum");
const conflictRevisionAdoption = client.indexOf("revisions[store.id] = serverRevision");
const conflictRevisionCheckpoint = client.indexOf("writeRevisionMap(revisions)", conflictRevisionAdoption);
const alreadyCurrentIncrement = client.indexOf("result.alreadyCurrent += 1", conflictRevisionCheckpoint);
expect(conflictRevisionAdoption >= 0 && conflictRevisionCheckpoint > conflictRevisionAdoption && alreadyCurrentIncrement > conflictRevisionCheckpoint, "identical retry conflicts checkpoint the verified server revision before reporting reconciliation");
expect(component.includes("Production builds only send that token to the configured Farm OS sync origin"), "Cloud Sync UI explains the production token destination lock");
expect(component.includes("This development field accepts loopback origins only"), "unconfigured builds explain their loopback-only development boundary");
expect(component.includes("cloud schema is not ready at the required version"), "Cloud Sync UI explains a blocked stale or incomplete database schema");
expect(component.includes("integrity checksum did not match"), "Cloud Sync UI explains integrity failures without implying data was replaced");
expect(client.includes("PRE_PULL_KEY"), "cloud pull preserves a pre-pull local recovery snapshot");
expect(client.includes('throw new Error("pre_pull_snapshot_too_large")'), "cloud pull aborts when a safe recovery snapshot exceeds its size limit");
expect(client.includes('throw new Error("pre_pull_snapshot_failed")'), "cloud pull aborts when browser storage cannot save the recovery snapshot");
const prePullSnapshotWrite = client.indexOf("localStorage.setItem(PRE_PULL_KEY, snapshotRaw)");
const cloudRestoreBatch = client.indexOf('applyLocalStoreBatch(changes, nextRevisions, "cloud_restore")');
expect(prePullSnapshotWrite >= 0 && cloudRestoreBatch > prePullSnapshotWrite, "cloud pull writes the recovery snapshot before replacing Farm OS stores");
expect(client.includes("version: 2"), "pre-pull recovery snapshot records the recoverable v2 format");
expect(client.includes("absent,"), "pre-pull recovery snapshot records stores that were absent before the pull");
expect(client.includes("applyLocalStoreBatch"), "cloud restores use rollback-aware browser storage batches");
expect(client.includes("restorePrePullFarmStores"), "cloud sync exposes an in-app pre-pull recovery operation");
expect(component.includes("Restore pre-pull browser state"), "Cloud Sync UI exposes the pre-pull recovery action");
expect(component.includes("Cloud restore stopped before replacing anything"), "Cloud Sync UI explains safe restore aborts without implying data was replaced");
expect(component.includes("automatic rollback"), "Cloud Sync UI explains automatic rollback failures");
expect(client.includes("new TextEncoder().encode(snapshotRaw).byteLength"), "pre-pull snapshot limit is measured in encoded bytes");
expect(client.includes("expectedRevision"), "client sends optimistic revision guards");
expect(client.includes("Object.keys(value).sort()"), "client canonicalizes JSON object keys before hashing");
expect(client.includes('crypto.subtle.digest("SHA-256"'), "client computes SHA-256 integrity hashes");
expect(client.includes("invalid_cloud_checksum_"), "client refuses cloud payloads whose canonical checksum does not match");
expect(client.includes("invalid_cloud_schema_"), "client refuses unsupported cloud schema versions");
expect(client.includes("invalid_cloud_revision_"), "client refuses invalid cloud revisions");
const nextRevisionCheck = client.indexOf("const nextRevision = Number(body.revision)");
const revisionAssignment = client.indexOf("revisions[store.id] = nextRevision", nextRevisionCheck);
const revisionCheckpoint = client.indexOf("writeRevisionMap(revisions)", revisionAssignment);
const uploadIncrement = client.indexOf("result.uploaded += 1", revisionAssignment);
expect(nextRevisionCheck >= 0 && revisionAssignment > nextRevisionCheck, "successful cloud pushes validate the returned server revision before recording it");
expect(revisionCheckpoint > revisionAssignment && revisionCheckpoint < uploadIncrement, "successful cloud pushes checkpoint each validated server revision before continuing");
const partialFailureIndex = client.indexOf("throw partialUploadFailure(result, store, error)", uploadIncrement);
expect(partialFailureIndex > uploadIncrement, "later upload failures preserve already-checkpointed progress instead of erasing it from the result path");
expect(client.includes("validFarmStoreValue"), "cloud restores validate store payloads");
expect(registry.includes("pff.growingJourney.v1"), "shared allowlist includes Growing Journey");
expect(registry.includes("new TextEncoder().encode(value).byteLength"), "shared Farm OS store limits are measured in encoded bytes");
expect(backup.includes("FARM_STORES"), "local backup uses the shared store allowlist");
expect(backup.includes("utf8Bytes(snapshotRaw)"), "local restore recovery snapshots are measured in encoded bytes");
expect(backup.includes('throw new Error("pre_restore_snapshot_too_large")'), "local file restore aborts when its recovery snapshot is too large");
expect(backup.includes('throw new Error("pre_restore_snapshot_failed")'), "local file restore aborts when its recovery snapshot cannot be saved");
expect(backup.includes('applyLocalBatch(changes, "local_restore")'), "local file restore uses rollback-aware browser storage batches");
expect(backup.includes("version: 2"), "local file restore snapshots preserve prior absence state");
expect(backup.includes("Restore pre-file-restore browser state"), "local backup UI exposes a pre-restore recovery action");
expect(worker.includes("env.DATABASE_URL"), "Worker keeps Neon connection in server environment");
expect(worker.includes("PFF_SYNC_TOKEN"), "Worker requires a private sync token");
expect(worker.includes("pff_put_document"), "Worker uses revision-aware Neon write function");
expect(worker.includes("ALLOWED_DOCUMENT_KEYS"), "Worker enforces the Farm OS server-side document allowlist");
expect(worker.includes("request.body.getReader()"), "Worker enforces request size while streaming the body");
expect(worker.includes("value.byteLength"), "Worker measures streamed request size in bytes");
expect(workerConfig.includes("PFF_ALLOWED_ORIGIN"), "Worker declares restricted production origin");
expect(worker.includes("!configuredOrigin || !env.DATABASE_URL || !env.PFF_SYNC_TOKEN"), "Worker fails closed when the restricted origin or secrets are missing");
expect(worker.includes('return json(env, { error: "invalid_document_key" }, 400);'), "Worker maps malformed document keys to a client error instead of an internal error");
expect(worker.includes("Object.keys(value).sort()"), "Worker canonicalizes JSON object keys before verifying checksums");
expect(worker.includes("CHECKSUM_PATTERN"), "Worker requires a SHA-256 shaped checksum");
expect(worker.includes('return json(env, { error: "invalid_checksum" }, 400);'), "Worker rejects payload/checksum mismatches before database writes");
expect(worker.includes('return json(env, { error: "invalid_source_device_key" }, 400);'), "Worker requires source-device metadata before database writes");
expect(worker.includes("schemaVersion !== 1"), "Worker rejects unsupported Cloud Sync document schema versions");
expect(worker.includes('EXPECTED_SCHEMA_NAME = "price-family-farm-cloud-sync"'), "Worker requires the Price Family Farm Cloud Sync schema identity");
expect(worker.includes("EXPECTED_SCHEMA_VERSION = 2"), "Worker requires migration schema version 2 before data access");
expect(worker.includes('EXPECTED_PROJECT_ID = "small-water-25690282"'), "Worker pins readiness to the dedicated Price Family Farm Neon project identity");
expect(worker.includes('error: "schema_not_ready"'), "Worker reports stale or incomplete Cloud Sync schema as unavailable");
const schemaGuardCount = worker.split("if (!schemaReady(schema)) return schemaNotReady(env, schema);").length - 1;
expect(schemaGuardCount >= 4, "Worker enforces schema readiness for health, list, document reads, and document writes");
const bodyParseIndex = worker.indexOf("body = JSON.parse(raw)");
const putSchemaIndex = worker.lastIndexOf("const schema = await readSchema(sql)");
const putFunctionIndex = worker.indexOf("SELECT pff_put_document(", putSchemaIndex);
expect(bodyParseIndex >= 0 && putSchemaIndex > bodyParseIndex && putFunctionIndex > putSchemaIndex, "Worker validates PUT bodies before the schema query and still checks readiness before the database write");
expect(!worker.includes("NEXT_PUBLIC_DATABASE_URL"), "Worker does not expose a public database variable");

expect(rootReadme.includes("Private Farm OS records remain **local-first**"), "root documentation describes Farm OS as local-first instead of falsely backend-free");
expect(rootReadme.includes("NEXT_PUBLIC_FARM_SYNC_ENDPOINT"), "root documentation explains explicit Cloud Sync activation");
expect(rootReadme.includes("node scripts/verify-cloud-sync.mjs"), "root release gates include the Cloud Sync contract verifier");
expect(rootReadme.includes("npm run bundle:check"), "root release gates include the non-mutating Worker bundle check");
expect(workerReadme.includes("must be treated as **unverified**"), "Worker runbook marks database migration state as unverified until checked");
expect(!workerReadme.includes("already applied"), "Worker runbook does not claim an unverified migration was already applied");
expect(workerReadme.includes("production-mutating command"), "Worker runbook labels secret/deploy operations as production mutations");
expect(workerReadme.includes("wrangler deploy --dry-run"), "Worker runbook documents a non-mutating Wrangler preflight");
expect(workerPackage.scripts?.["bundle:check"]?.includes("wrangler deploy --dry-run"), "Worker package exposes a non-mutating bundle check");
expect(workerPackage.scripts?.["bundle:check"]?.includes(".wrangler/"), "Worker dry-run output stays inside the ignored Wrangler directory");

if (failures) {
  console.error(`Cloud Sync verification failed: ${failures}/${checks} checks failed.`);
  process.exit(1);
}

console.log(`Cloud Sync verification passed: ${checks} checks.`);
