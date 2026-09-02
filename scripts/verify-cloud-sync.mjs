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
const sitemap = read("app/sitemap.js");

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
const revisionAssignment = client.indexOf("revisions[store.id] = Number(body.revision)");
const revisionCheckpoint = client.indexOf("writeRevisionMap(revisions)", revisionAssignment);
const uploadIncrement = client.indexOf("result.uploaded += 1", revisionAssignment);
expect(revisionAssignment >= 0 && revisionCheckpoint > revisionAssignment && revisionCheckpoint < uploadIncrement, "successful cloud pushes checkpoint each server revision before continuing");
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
expect(!worker.includes("NEXT_PUBLIC_DATABASE_URL"), "Worker does not expose a public database variable");

if (failures) {
  console.error(`Cloud Sync verification failed: ${failures}/${checks} checks failed.`);
  process.exit(1);
}

console.log(`Cloud Sync verification passed: ${checks} checks.`);
