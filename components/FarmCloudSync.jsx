"use client";

import { useEffect, useState } from "react";
import {
  getConfiguredSyncEndpoint,
  getPrePullRecoveryInfo,
  getSavedSyncEndpoint,
  getSessionSyncToken,
  listCloudFarmStores,
  localSyncInventory,
  pullCloudFarmStores,
  pushLocalFarmStores,
  resolveAllowedSyncEndpoint,
  restorePrePullFarmStores,
  saveSyncEndpoint,
  setSessionSyncToken,
  testCloudConnection,
} from "@/lib/farmCloudSync";

function friendlyCloudSyncError(message) {
  if (message === "endpoint_not_allowed") {
    return "The sync request was blocked before sending the private token because the destination is not the configured Farm OS sync service";
  }
  if (message === "endpoint_not_configured") {
    return "Production cloud sync is not configured in this build. Only a loopback endpoint can be used for local development";
  }
  if (message === "token_required") {
    return "Enter the private sync token before connecting";
  }
  if (message === "request_timeout") {
    return "The cloud sync request timed out after 30 seconds. The in-flight data area may have reached the server. On retry, an identical verified cloud copy is safely revision-checkpointed; a genuinely different newer copy remains a conflict and is never overwritten silently";
  }
  if (message.startsWith("partial_upload:")) {
    try {
      const detail = JSON.parse(message.slice("partial_upload:".length));
      const uploaded = Number(detail.uploaded || 0);
      const alreadyCurrent = Number(detail.alreadyCurrent || 0);
      const conflicts = Number(detail.conflicts || 0);
      const label = typeof detail.storeLabel === "string" ? detail.storeLabel : "the next data area";
      const cause = typeof detail.cause === "string" ? friendlyCloudSyncError(detail.cause) : "The next request failed";
      const uploadSummary = uploaded === 1
        ? "1 data area was uploaded"
        : `${uploaded} data areas were uploaded`;
      const alreadyCurrentSummary = alreadyCurrent
        ? ` ${alreadyCurrent} already-matching cloud ${alreadyCurrent === 1 ? "copy was" : "copies were"} verified and revision-checkpointed.`
        : "";
      const conflictSummary = conflicts
        ? ` ${conflicts} conflict${conflicts === 1 ? "" : "s"} had already been left untouched.`
        : "";
      return `${uploadSummary} before the next request stopped while syncing ${label}.${alreadyCurrentSummary}${conflictSummary} Completed revision checkpoints were preserved. The in-flight area may have reached the server; an identical verified retry can reconcile automatically, while a different cloud copy remains protected as a conflict. ${cause}`;
    } catch {
      return "Cloud upload stopped after partial progress. Completed revision checkpoints were preserved, so retrying remains conflict-safe";
    }
  }
  if (message === "schema_not_ready") {
    return "The dedicated Price Family Farm cloud schema is not ready at the required version. Verify the database target and apply only confirmed-missing migrations before syncing";
  }
  if (message.startsWith("invalid_cloud_checksum_")) {
    return "Cloud restore found data whose integrity checksum did not match, so browser data was not replaced";
  }
  if (message.startsWith("invalid_cloud_schema_")) {
    return "Cloud restore found data from an unsupported schema version, so browser data was not replaced";
  }
  if (message.startsWith("invalid_cloud_revision_")) {
    return "Cloud restore found invalid revision metadata, so browser data was not replaced";
  }
  if (message.startsWith("invalid_push_revision_")) {
    return "The cloud service returned invalid revision metadata after an upload, so the browser did not checkpoint that response";
  }
  if (message === "invalid_checksum") {
    return "The cloud service rejected the upload because its integrity checksum did not match the payload";
  }
  if (message === "pre_pull_snapshot_too_large") {
    return "Cloud restore stopped before replacing anything because this browser has too much Farm OS data to capture a safe pre-pull recovery snapshot. Export a local backup first, then try again";
  }
  if (message === "pre_pull_snapshot_failed") {
    return "Cloud restore stopped before replacing anything because the browser could not save the pre-pull recovery snapshot. Free browser storage or export a local backup, then try again";
  }
  if (message === "cloud_restore_write_failed") {
    return "Cloud restore could not write the complete validated set to browser storage, so the stores already changed during this attempt were rolled back to their pre-pull values";
  }
  if (message === "cloud_restore_rollback_failed") {
    return "Cloud restore hit a browser-storage failure and automatic rollback could not fully restore every value. The pre-pull recovery snapshot is still available below";
  }
  if (message === "pre_pull_recovery_missing") {
    return "No valid pre-pull recovery snapshot is available in this browser";
  }
  if (message === "pre_pull_recovery_write_failed") {
    return "The saved pre-pull snapshot could not be fully restored, so any values changed during this recovery attempt were rolled back";
  }
  if (message === "pre_pull_recovery_rollback_failed") {
    return "The saved pre-pull snapshot hit a browser-storage failure and automatic rollback could not fully restore every value";
  }
  return message;
}

export default function FarmCloudSync() {
  const [endpoint, setEndpoint] = useState(() => getSavedSyncEndpoint());
  const [token, setToken] = useState(() => getSessionSyncToken());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [recoveryConfirmation, setRecoveryConfirmation] = useState("");
  const [recovery, setRecovery] = useState(null);
  const [cloudCount, setCloudCount] = useState(null);

  useEffect(() => {
    setRecovery(getPrePullRecoveryInfo());
  }, []);

  const inventory = localSyncInventory();
  const presentCount = inventory.filter((item) => item.present).length;
  const configuredEndpoint = getConfiguredSyncEndpoint();
  const readyEndpoint = resolveAllowedSyncEndpoint(endpoint);

  function persistConnection() {
    const saved = saveSyncEndpoint(endpoint);
    setEndpoint(saved);
    setSessionSyncToken(token);
    return { endpoint: saved, token: token.trim() };
  }

  async function run(label, fn) {
    setBusy(true);
    setStatus("");
    try {
      const result = await fn();
      setStatus(result || `${label} completed.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${label} stopped safely: ${friendlyCloudSyncError(message)}.`);
    } finally {
      setBusy(false);
    }
  }

  async function testConnection() {
    await run("Connection test", async () => {
      const config = persistConnection();
      const health = await testCloudConnection(config.endpoint, config.token);
      const docs = await listCloudFarmStores(config.endpoint, config.token);
      setCloudCount(docs.length);
      return `Connected to Farm OS cloud sync schema v${health?.schema?.version ?? "?"}. ${docs.length} cloud data areas are currently stored.`;
    });
  }

  async function push() {
    await run("Cloud upload", async () => {
      const config = persistConnection();
      const result = await pushLocalFarmStores(config.endpoint, config.token);
      const alreadyCurrent = result.alreadyCurrent || 0;
      const alreadyCurrentSummary = alreadyCurrent
        ? ` ${alreadyCurrent} already-matching cloud ${alreadyCurrent === 1 ? "copy was" : "copies were"} verified and revision-checkpointed.`
        : "";
      if (result.conflicts.length) {
        const conflictCount = result.conflicts.length;
        const conflictVerb = conflictCount === 1 ? "was" : "were";
        return `Uploaded ${result.uploaded} data areas.${alreadyCurrentSummary} ${conflictCount} conflict${conflictCount === 1 ? "" : "s"} ${conflictVerb} left untouched; pull the cloud copy before deciding what to keep.`;
      }
      return `Uploaded ${result.uploaded} valid browser data areas.${alreadyCurrentSummary} ${result.skipped} empty or invalid areas were skipped.`;
    });
  }

  async function pull() {
    if (confirmation !== "PULL") return;
    await run("Cloud restore", async () => {
      const config = persistConnection();
      const result = await pullCloudFarmStores(config.endpoint, config.token);
      setConfirmation("");
      return result.restored
        ? `Restored ${result.restored} validated cloud data areas to this browser. A local pre-pull recovery snapshot was saved first.`
        : "No cloud Farm OS data was available to restore.";
    });
    setRecovery(getPrePullRecoveryInfo());
  }

  async function recoverPrePull() {
    if (recoveryConfirmation !== "RECOVER") return;
    await run("Pre-pull recovery", async () => {
      const result = restorePrePullFarmStores();
      setRecoveryConfirmation("");
      return `Recovered ${result.restored} prior Farm OS data ${result.restored === 1 ? "area" : "areas"}${result.removed ? ` and removed ${result.removed} ${result.removed === 1 ? "area" : "areas"} that did not exist before the cloud pull` : ""}.`;
    });
    setRecovery(getPrePullRecoveryInfo());
  }

  const recoveryTimestamp = recovery?.createdAt
    ? new Date(recovery.createdAt).toLocaleString()
    : "the most recent cloud pull";

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Private sync bridge.</strong> The Neon database password never enters this page. The sync token is kept in session storage only, so closing the browser session removes it. Production builds only send that token to the configured Farm OS sync origin.
      </div>

      <section className="farm-panel" aria-labelledby="cloud-sync-connect-heading">
        <span className="eyebrow">Connection</span>
        <h2 id="cloud-sync-connect-heading">Connect this trusted device.</h2>
        {configuredEndpoint ? (
          <div className="farm-field">
            <span>Cloud sync endpoint</span>
            <code>{configuredEndpoint}</code>
            <small>The production destination is locked at build time so the private token cannot be sent to an arbitrary host.</small>
          </div>
        ) : (
          <div className="farm-field">
            <label htmlFor="farm-cloud-endpoint">Local development endpoint</label>
            <input
              id="farm-cloud-endpoint"
              type="url"
              inputMode="url"
              placeholder="http://localhost:8787"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <small>Production sync is disabled until NEXT_PUBLIC_FARM_SYNC_ENDPOINT is configured. This development field accepts loopback origins only.</small>
          </div>
        )}
        <div className="farm-field">
          <label htmlFor="farm-cloud-token">Private sync token</label>
          <input
            id="farm-cloud-token"
            type="password"
            value={token}
            onChange={(event) => {
              const value = event.target.value;
              setToken(value);
              setSessionSyncToken(value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <small>Stored for this browser session only. It is not written to local storage.</small>
        </div>
        <div className="farm-actions">
          <button
            className="farm-action"
            type="button"
            disabled={busy || !readyEndpoint || !token.trim()}
            onClick={testConnection}
          >
            Test private connection
          </button>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="cloud-sync-upload-heading">
        <span className="eyebrow">Browser → cloud</span>
        <h2 id="cloud-sync-upload-heading">Back up validated Farm OS data.</h2>
        <p>{presentCount} of {inventory.length} allowed data areas currently contain valid browser-local data. Uploads use canonical integrity checksums and revision guards, so corrupted payloads and newer cloud copies are not silently accepted or overwritten. If a multi-area upload is interrupted, completed revision checkpoints are preserved and partial progress is reported explicitly. A retry can safely adopt an already-matching verified cloud revision without requiring a destructive pull.</p>
        <div className="farm-actions">
          <button
            className="farm-action"
            type="button"
            disabled={busy || !readyEndpoint || !token.trim() || presentCount === 0}
            onClick={push}
          >
            Sync browser data to cloud
          </button>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="cloud-sync-pull-heading">
        <span className="eyebrow">Cloud → browser</span>
        <h2 id="cloud-sync-pull-heading">Restore a trusted cloud copy to this device.</h2>
        <p>Cloud payloads must match the expected Farm OS schema, revision metadata, canonical integrity checksum, fixed allowlist, and size rules before they can replace browser data. Before replacement, the local working set is captured in a pre-pull recovery snapshot.</p>
        {cloudCount != null ? <p><strong>{cloudCount}</strong> cloud data areas were visible during the last connection check.</p> : null}
        <div className="farm-field" style={{ maxWidth: 420 }}>
          <label htmlFor="cloud-pull-confirmation">Type PULL to replace matching browser data</label>
          <input
            id="cloud-pull-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value.toUpperCase().slice(0, 4))}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="farm-actions">
          <button
            className="farm-action danger"
            type="button"
            disabled={busy || !readyEndpoint || !token.trim() || confirmation !== "PULL"}
            onClick={pull}
          >
            Pull validated cloud data to this browser
          </button>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="cloud-sync-recovery-heading">
        <span className="eyebrow">Recovery</span>
        <h2 id="cloud-sync-recovery-heading">Return to the browser state from before the last cloud pull.</h2>
        {recovery ? (
          <>
            <p>
              A validated recovery snapshot from <strong>{recoveryTimestamp}</strong> covers {recovery.affectedCount} Farm OS data {recovery.affectedCount === 1 ? "area" : "areas"}. It can restore {recovery.storeCount} prior {recovery.storeCount === 1 ? "value" : "values"}{recovery.absentCount ? ` and remove ${recovery.absentCount} ${recovery.absentCount === 1 ? "area" : "areas"} that were absent before that pull` : ""}.
            </p>
            <div className="farm-field" style={{ maxWidth: 420 }}>
              <label htmlFor="cloud-recovery-confirmation">Type RECOVER to restore the pre-pull browser state</label>
              <input
                id="cloud-recovery-confirmation"
                value={recoveryConfirmation}
                onChange={(event) => setRecoveryConfirmation(event.target.value.toUpperCase().slice(0, 7))}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="farm-actions">
              <button
                className="farm-action danger"
                type="button"
                disabled={busy || recoveryConfirmation !== "RECOVER"}
                onClick={recoverPrePull}
              >
                Restore pre-pull browser state
              </button>
            </div>
          </>
        ) : (
          <p>No valid pre-pull recovery snapshot is stored in this browser yet. One is created before the next cloud pull that has validated cloud data to restore.</p>
        )}
      </section>

      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}
    </div>
  );
}
