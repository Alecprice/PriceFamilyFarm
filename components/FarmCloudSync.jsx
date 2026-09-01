"use client";

import { useState } from "react";
import {
  getSavedSyncEndpoint,
  getSessionSyncToken,
  listCloudFarmStores,
  localSyncInventory,
  normalizeSyncEndpoint,
  pullCloudFarmStores,
  pushLocalFarmStores,
  saveSyncEndpoint,
  setSessionSyncToken,
  testCloudConnection,
} from "@/lib/farmCloudSync";

export default function FarmCloudSync() {
  const [endpoint, setEndpoint] = useState(() => getSavedSyncEndpoint());
  const [token, setToken] = useState(() => getSessionSyncToken());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [cloudCount, setCloudCount] = useState(null);

  const inventory = localSyncInventory();
  const presentCount = inventory.filter((item) => item.present).length;
  const readyEndpoint = normalizeSyncEndpoint(endpoint);

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
      setStatus(`${label} stopped safely: ${message}.`);
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
      if (result.conflicts.length) {
        return `Uploaded ${result.uploaded} data areas. ${result.conflicts.length} conflict${result.conflicts.length === 1 ? "" : "s"} were left untouched; pull the cloud copy before deciding what to keep.`;
      }
      return `Uploaded ${result.uploaded} valid browser data areas. ${result.skipped} empty or invalid areas were skipped.`;
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
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Private sync bridge.</strong> The Neon database password never enters this page. The sync token is kept in session storage only, so closing the browser session removes it. The API endpoint may be remembered locally.
      </div>

      <section className="farm-panel" aria-labelledby="cloud-sync-connect-heading">
        <span className="eyebrow">Connection</span>
        <h2 id="cloud-sync-connect-heading">Connect this trusted device.</h2>
        <div className="farm-field">
          <label htmlFor="farm-cloud-endpoint">Cloud sync endpoint</label>
          <input
            id="farm-cloud-endpoint"
            type="url"
            inputMode="url"
            placeholder="https://price-family-farm-cloud-sync.example.workers.dev"
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
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
        <p>{presentCount} of {inventory.length} allowed data areas currently contain valid browser-local data. Uploads use revision checks, so a newer cloud copy is not silently overwritten.</p>
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
        <p>Cloud payloads are checked against the same fixed Farm OS allowlist and size rules used by local backup. Before replacement, the local working set is captured in a pre-pull recovery snapshot.</p>
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

      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}
    </div>
  );
}
