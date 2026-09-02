"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { localDay } from "@/lib/localDate";
import { FARM_STORES, validFarmStoreValue } from "@/lib/farmStoreRegistry";

const MAX_BACKUP_BYTES = 9_500_000;
const BACKUP_META_KEY = "price-family-farm-backup-meta-v1";
const PRE_RESTORE_KEY = "price-family-farm-pre-restore-snapshot-v1";

function utf8Bytes(value) {
  return new TextEncoder().encode(value).byteLength;
}

function serializeBackup(payload) {
  const raw = JSON.stringify(payload, null, 2);
  if (utf8Bytes(raw) > MAX_BACKUP_BYTES) throw new Error("backup-too-large");
  return raw;
}

function downloadBackup(raw) {
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `price-family-farm-local-backup-${localDay()}.json`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildCurrentSnapshot(selectedIds) {
  const stores = {};
  const absent = [];

  for (const store of FARM_STORES) {
    if (!selectedIds.has(store.id)) continue;
    try {
      const raw = localStorage.getItem(store.key);
      if (!raw) {
        absent.push(store.id);
        continue;
      }
      const parsed = JSON.parse(raw);
      if (!validFarmStoreValue(store, parsed)) {
        absent.push(store.id);
        continue;
      }
      stores[store.id] = parsed;
    } catch {
      absent.push(store.id);
    }
  }

  return {
    version: 2,
    createdAt: new Date().toISOString(),
    reason: "before-restore",
    stores,
    absent,
  };
}

function parseRestoreSnapshot() {
  try {
    const snapshot = JSON.parse(localStorage.getItem(PRE_RESTORE_KEY) || "null");
    if (
      !snapshot ||
      typeof snapshot !== "object" ||
      Array.isArray(snapshot) ||
      ![1, 2].includes(snapshot.version) ||
      !snapshot.stores ||
      typeof snapshot.stores !== "object" ||
      Array.isArray(snapshot.stores)
    ) return null;

    const stores = {};
    for (const store of FARM_STORES) {
      if (!Object.prototype.hasOwnProperty.call(snapshot.stores, store.id)) continue;
      const value = snapshot.stores[store.id];
      if (validFarmStoreValue(store, value)) stores[store.id] = value;
    }

    const storedIds = new Set(Object.keys(stores));
    const absent = snapshot.version >= 2 && Array.isArray(snapshot.absent)
      ? snapshot.absent.filter(
          (id) =>
            typeof id === "string" &&
            FARM_STORES.some((store) => store.id === id) &&
            !storedIds.has(id),
        )
      : [];

    if (!Object.keys(stores).length && !absent.length) return null;

    return {
      version: snapshot.version,
      createdAt: typeof snapshot.createdAt === "string" ? snapshot.createdAt : null,
      stores,
      absent,
    };
  } catch {
    return null;
  }
}

function getRestoreRecoveryInfo() {
  const snapshot = parseRestoreSnapshot();
  if (!snapshot) return null;
  return {
    createdAt: snapshot.createdAt,
    storeCount: Object.keys(snapshot.stores).length,
    absentCount: snapshot.absent.length,
    affectedCount: Object.keys(snapshot.stores).length + snapshot.absent.length,
  };
}

function restoreRawValue(key, raw) {
  if (raw == null) localStorage.removeItem(key);
  else localStorage.setItem(key, raw);
}

function applyLocalBatch(changes, errorPrefix) {
  const previous = new Map(
    changes.map(({ store }) => [store.id, localStorage.getItem(store.key)]),
  );
  const applied = [];

  try {
    for (const change of changes) {
      restoreRawValue(change.store.key, change.raw);
      applied.push(change.store);
    }
  } catch {
    let rollbackFailed = false;
    for (const store of applied.reverse()) {
      try {
        restoreRawValue(store.key, previous.get(store.id));
      } catch {
        rollbackFailed = true;
      }
    }
    throw new Error(
      rollbackFailed ? `${errorPrefix}_rollback_failed` : `${errorPrefix}_write_failed`,
    );
  }
}

function friendlyRestoreError(message) {
  if (message === "pre_restore_snapshot_too_large") {
    return "Restore stopped before replacing anything because this browser has too much selected Farm OS data to capture a safe pre-restore snapshot";
  }
  if (message === "pre_restore_snapshot_failed") {
    return "Restore stopped before replacing anything because the browser could not save the pre-restore recovery snapshot";
  }
  if (message === "local_restore_write_failed") {
    return "Restore could not write the complete selected set, so values already changed during this attempt were rolled back";
  }
  if (message === "local_restore_rollback_failed") {
    return "Restore hit a browser-storage failure and automatic rollback could not fully restore every selected value. The pre-restore snapshot is still available below";
  }
  if (message === "local_recovery_missing") {
    return "No valid pre-restore recovery snapshot is available in this browser";
  }
  if (message === "local_recovery_write_failed") {
    return "The saved pre-restore snapshot could not be fully applied, so values changed during this recovery attempt were rolled back";
  }
  if (message === "local_recovery_rollback_failed") {
    return "The saved pre-restore snapshot hit a browser-storage failure and automatic rollback could not fully restore every value";
  }
  return "This browser could not restore the selected data safely";
}

export default function FarmLocalBackup() {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [confirmation, setConfirmation] = useState("");
  const [recoveryConfirmation, setRecoveryConfirmation] = useState("");
  const [recovery, setRecovery] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setRecovery(getRestoreRecoveryInfo());
  }, []);

  const available = useMemo(() => preview?.stores || [], [preview]);

  function exportAll() {
    const stores = {};
    let count = 0;

    try {
      for (const store of FARM_STORES) {
        const raw = localStorage.getItem(store.key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (!validFarmStoreValue(store, parsed)) continue;
        stores[store.id] = parsed;
        count += 1;
      }

      if (!count) {
        setStatus("No valid Farm OS working data was found in this browser to export.");
        return;
      }

      const exportedAt = new Date().toISOString();
      const rawBackup = serializeBackup({ version: 1, exportedAt, stores });
      downloadBackup(rawBackup);
      localStorage.setItem(BACKUP_META_KEY, JSON.stringify({ lastExportedAt: exportedAt, storeCount: count }));
      setStatus(`Prepared a local backup containing ${count} Farm OS data ${count === 1 ? "area" : "areas"}.`);
    } catch {
      setStatus("This browser could not create a complete backup safely. Check Farm OS Data Health before trying again.");
    }
  }

  async function inspectFile(event) {
    const file = event.target.files?.[0];
    setPreview(null);
    setSelected(new Set());
    setConfirmation("");
    setStatus("");
    if (!file) return;

    if (file.size > MAX_BACKUP_BYTES) {
      setStatus("That backup is too large to inspect safely in this browser.");
      event.target.value = "";
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.version !== 1 || !parsed.stores || typeof parsed.stores !== "object" || Array.isArray(parsed.stores)) {
        throw new Error("invalid-backup");
      }

      const valid = [];
      for (const store of FARM_STORES) {
        if (!Object.prototype.hasOwnProperty.call(parsed.stores, store.id)) continue;
        const value = parsed.stores[store.id];
        if (!validFarmStoreValue(store, value)) continue;
        valid.push({ id: store.id, label: store.label, value });
      }

      if (!valid.length) throw new Error("no-valid-stores");
      setPreview({ stores: valid });
      setSelected(new Set(valid.map((store) => store.id)));
      setStatus(`Backup inspected. ${valid.length} valid Farm OS data ${valid.length === 1 ? "area is" : "areas are"} ready to restore.`);
    } catch {
      setStatus("That file is not a valid Price Family Farm local backup, so nothing was changed.");
    } finally {
      event.target.value = "";
    }
  }

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirmation("");
  }

  function restoreSelected() {
    if (!preview || confirmation !== "RESTORE" || selected.size === 0) return;

    try {
      const snapshot = buildCurrentSnapshot(selected);
      const snapshotRaw = JSON.stringify(snapshot);
      if (utf8Bytes(snapshotRaw) > MAX_BACKUP_BYTES) {
        throw new Error("pre_restore_snapshot_too_large");
      }
      try {
        localStorage.setItem(PRE_RESTORE_KEY, snapshotRaw);
      } catch {
        throw new Error("pre_restore_snapshot_failed");
      }

      const changes = [];
      for (const item of available) {
        if (!selected.has(item.id)) continue;
        const store = FARM_STORES.find((candidate) => candidate.id === item.id);
        if (!store || !validFarmStoreValue(store, item.value)) continue;
        changes.push({ store, raw: JSON.stringify(item.value) });
      }

      applyLocalBatch(changes, "local_restore");
      setConfirmation("");
      setRecovery(getRestoreRecoveryInfo());
      const restored = changes.length;
      setStatus(`Restored ${restored} selected Farm OS data ${restored === 1 ? "area" : "areas"} to this browser. A complete pre-restore recovery snapshot was saved first.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${friendlyRestoreError(message)}.`);
      setRecovery(getRestoreRecoveryInfo());
    }
  }

  function recoverLastRestore() {
    if (recoveryConfirmation !== "RECOVER") return;

    try {
      const snapshot = parseRestoreSnapshot();
      if (!snapshot) throw new Error("local_recovery_missing");

      const changes = [];
      for (const store of FARM_STORES) {
        if (Object.prototype.hasOwnProperty.call(snapshot.stores, store.id)) {
          changes.push({ store, raw: JSON.stringify(snapshot.stores[store.id]) });
        } else if (snapshot.absent.includes(store.id)) {
          changes.push({ store, raw: null });
        }
      }

      applyLocalBatch(changes, "local_recovery");
      setRecoveryConfirmation("");
      setRecovery(getRestoreRecoveryInfo());
      const restored = Object.keys(snapshot.stores).length;
      const removed = snapshot.absent.length;
      setStatus(`Recovered ${restored} prior Farm OS data ${restored === 1 ? "area" : "areas"}${removed ? ` and removed ${removed} ${removed === 1 ? "area" : "areas"} that did not exist before the file restore` : ""}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${friendlyRestoreError(message)}.`);
    }
  }

  const recoveryTimestamp = recovery?.createdAt
    ? new Date(recovery.createdAt).toLocaleString()
    : "the most recent file restore";

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Device-local backup only.</strong> Export and restore happen inside this browser. Files are not uploaded to Price Family Farm, a cloud service, or a third party.
      </div>

      <section className="farm-panel" aria-labelledby="farm-backup-export-heading">
        <span className="eyebrow">Export</span>
        <h2 id="farm-backup-export-heading">Back up the Farm OS working set.</h2>
        <p>Create one JSON file containing valid browser-local records, inventory, plantings, market plans, planner data, calendar tasks, journal entries, garden layout, schematic map, and funding tracker data that exist on this device. The temporary weather cache is intentionally excluded.</p>
        <div className="farm-actions">
          <button className="farm-action" type="button" onClick={exportAll}>Download local Farm OS backup</button>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="farm-backup-restore-heading">
        <span className="eyebrow">Restore</span>
        <h2 id="farm-backup-restore-heading">Inspect before replacing local data.</h2>
        <p>A backup is validated against a fixed allowlist and per-store byte limits before any restore controls are enabled. Unknown keys are ignored. Before selected valid stores are replaced, Farm OS must save a complete browser-local snapshot that also records which selected stores were absent.</p>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={inspectFile} aria-label="Choose Farm OS backup file" />

        {available.length ? (
          <>
            <div className="farm-record-list" role="group" aria-label="Backup data areas to restore" style={{ marginTop: 20 }}>
              {available.map((item) => (
                <label className="farm-record" key={item.id} style={{ cursor: "pointer" }}>
                  <div><h3>{item.label}</h3><p>Validated local data area from the selected backup.</p></div>
                  <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} aria-label={`Restore ${item.label}`} style={{ width: 22, height: 22, alignSelf: "start" }} />
                </label>
              ))}
            </div>
            <div className="farm-field" style={{ marginTop: 22, maxWidth: 420 }}>
              <label htmlFor="restore-confirmation">Type RESTORE to confirm</label>
              <input id="restore-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase().slice(0, 7))} autoComplete="off" spellCheck={false} />
            </div>
            <div className="farm-actions">
              <button className="farm-action danger" type="button" onClick={restoreSelected} disabled={confirmation !== "RESTORE" || selected.size === 0}>Restore selected local data</button>
            </div>
          </>
        ) : null}
      </section>

      <section className="farm-panel" aria-labelledby="farm-backup-recovery-heading">
        <span className="eyebrow">Recovery</span>
        <h2 id="farm-backup-recovery-heading">Undo the most recent file restore.</h2>
        {recovery ? (
          <>
            <p>A validated pre-restore snapshot from <strong>{recoveryTimestamp}</strong> covers {recovery.affectedCount} Farm OS data {recovery.affectedCount === 1 ? "area" : "areas"}. It can restore {recovery.storeCount} prior {recovery.storeCount === 1 ? "value" : "values"}{recovery.absentCount ? ` and remove ${recovery.absentCount} ${recovery.absentCount === 1 ? "area" : "areas"} that were absent before that restore` : ""}.</p>
            <div className="farm-field" style={{ maxWidth: 420 }}>
              <label htmlFor="local-recovery-confirmation">Type RECOVER to restore the pre-file-restore browser state</label>
              <input id="local-recovery-confirmation" value={recoveryConfirmation} onChange={(event) => setRecoveryConfirmation(event.target.value.toUpperCase().slice(0, 7))} autoComplete="off" spellCheck={false} />
            </div>
            <div className="farm-actions">
              <button className="farm-action danger" type="button" onClick={recoverLastRestore} disabled={recoveryConfirmation !== "RECOVER"}>Restore pre-file-restore browser state</button>
            </div>
          </>
        ) : (
          <p>No valid pre-restore recovery snapshot is stored in this browser yet. One is created before the next validated file restore.</p>
        )}
      </section>

      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}
    </div>
  );
}
