"use client";

import { useMemo, useRef, useState } from "react";

const MAX_BACKUP_BYTES = 6_500_000;
const STORES = [
  { id: "records", key: "price-family-farm-records-v2", label: "Farm records", max: 2_000_000, kind: "object" },
  { id: "funding", key: "price-family-farm-funding-v1", label: "Funding & education", max: 500_000, kind: "array" },
  { id: "planner", key: "price-family-farm-planner-v1", label: "Farm planner", max: 1_000_000, kind: "array" },
  { id: "calendar", key: "price-family-farm-calendar-v1", label: "Farm calendar", max: 1_000_000, kind: "array" },
  { id: "journal", key: "price-family-farm-journal-v1", label: "Farm journal", max: 1_000_000, kind: "array" },
  { id: "garden", key: "price-family-farm-garden-layout-v1", label: "Garden layout", max: 500_000, kind: "array" },
  { id: "map", key: "price-family-farm-map-v1", label: "Schematic farm map", max: 500_000, kind: "array" },
];

function validStoreValue(store, value) {
  if (store.kind === "array" && !Array.isArray(value)) return false;
  if (store.kind === "object" && (!value || typeof value !== "object" || Array.isArray(value))) return false;
  try {
    return JSON.stringify(value).length <= store.max;
  } catch {
    return false;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBackup(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `price-family-farm-local-backup-${today()}.json`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function FarmLocalBackup() {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");

  const available = useMemo(() => preview?.stores || [], [preview]);

  function exportAll() {
    const stores = {};
    let count = 0;

    try {
      for (const store of STORES) {
        const raw = localStorage.getItem(store.key);
        if (!raw || raw.length > store.max) continue;
        const parsed = JSON.parse(raw);
        if (!validStoreValue(store, parsed)) continue;
        stores[store.id] = parsed;
        count += 1;
      }
    } catch {
      setStatus("This browser could not read one or more Farm OS stores, so no backup was created.");
      return;
    }

    if (!count) {
      setStatus("No valid Farm OS working data was found in this browser to export.");
      return;
    }

    downloadBackup({ version: 1, exportedAt: new Date().toISOString(), stores });
    setStatus(`Prepared a local backup containing ${count} Farm OS data ${count === 1 ? "area" : "areas"}.`);
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
      for (const store of STORES) {
        if (!Object.prototype.hasOwnProperty.call(parsed.stores, store.id)) continue;
        const value = parsed.stores[store.id];
        if (!validStoreValue(store, value)) continue;
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
      let restored = 0;
      for (const item of available) {
        if (!selected.has(item.id)) continue;
        const store = STORES.find((candidate) => candidate.id === item.id);
        if (!store || !validStoreValue(store, item.value)) continue;
        localStorage.setItem(store.key, JSON.stringify(item.value));
        restored += 1;
      }
      setConfirmation("");
      setStatus(`Restored ${restored} selected Farm OS data ${restored === 1 ? "area" : "areas"} to this browser.`);
    } catch {
      setStatus("This browser could not restore the selected data. Existing stores were left as-is where possible.");
    }
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Device-local backup only.</strong> Export and restore happen inside this browser. Files are not uploaded to Price Family Farm, a cloud service, or a third party.
      </div>

      <section className="farm-panel" aria-labelledby="farm-backup-export-heading">
        <span className="eyebrow">Export</span>
        <h2 id="farm-backup-export-heading">Back up the Farm OS working set.</h2>
        <p>Create one JSON file containing valid browser-local records, planner data, calendar tasks, journal entries, garden layout, schematic map, and funding tracker data that exist on this device. The temporary weather cache is intentionally excluded.</p>
        <div className="farm-actions">
          <button className="farm-action" type="button" onClick={exportAll}>Download local Farm OS backup</button>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="farm-backup-restore-heading">
        <span className="eyebrow">Restore</span>
        <h2 id="farm-backup-restore-heading">Inspect before replacing local data.</h2>
        <p>A backup is validated against a fixed allowlist and per-store size limits before any restore controls are enabled. Unknown keys are ignored.</p>
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

      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}
    </div>
  );
}
