"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isValidBackupCollection, isValidPlanShape } from "@/lib/planner/plannerStorage";

const SCHEMA_VERSION = 1;
const SCHEMA_META_KEY = "price-family-farm-schema-meta-v1";
const BACKUP_META_KEY = "price-family-farm-backup-meta-v1";
const PRE_RESTORE_KEY = "price-family-farm-pre-restore-snapshot-v1";
const PRE_REPAIR_KEY = "price-family-farm-pre-repair-snapshot-v1";
const MAX_SNAPSHOT_BYTES = 9_500_000;

const STORES = [
  { id: "records", key: "price-family-farm-records-v2", label: "Farm records", max: 2_000_000, kind: "records" },
  { id: "funding", key: "price-family-farm-funding-v1", label: "Funding & education", max: 500_000, kind: "array" },
  { id: "planner", key: "price-family-farm-planner-v1", label: "Farm planner", max: 1_000_000, kind: "array" },
  { id: "journey", key: "pff.growingJourney.v1", label: "My Growing Journey", max: 750_000, kind: "journey" },
  { id: "journey-backups", key: "pff.growingJourney.backups.v1", label: "Growing Journey recovery snapshots", max: 4_000_000, kind: "journey-backups" },
  { id: "calendar", key: "price-family-farm-calendar-v1", label: "Farm calendar", max: 1_000_000, kind: "array" },
  { id: "journal", key: "price-family-farm-journal-v1", label: "Farm journal", max: 1_000_000, kind: "array" },
  { id: "garden", key: "price-family-farm-garden-layout-v1", label: "Garden layout", max: 500_000, kind: "array" },
  { id: "map", key: "price-family-farm-map-v1", label: "Schematic farm map", max: 500_000, kind: "array" },
  { id: "inventory", key: "price-family-farm-inventory-v1", label: "Farm inventory", max: 500_000, kind: "array" },
  { id: "plantings", key: "price-family-farm-plantings-v1", label: "Plantings & successions", max: 1_000_000, kind: "array" },
  { id: "market", key: "price-family-farm-market-plan-v1", label: "Market planner", max: 750_000, kind: "array" },
];

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validJourneyPlan(value) {
  return isValidPlanShape(value);
}

function validJourneyBackups(value) {
  return isValidBackupCollection(value);
}

function parseMeta(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw.length > 100_000) return null;
    const parsed = JSON.parse(raw);
    return safeObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function analyzeIds(items) {
  const seen = new Set();
  let duplicates = 0;
  let missing = 0;
  items.forEach((item) => {
    if (!safeObject(item)) return;
    const id = String(item.id ?? "").trim();
    if (!id) {
      missing += 1;
      return;
    }
    if (seen.has(id)) duplicates += 1;
    else seen.add(id);
  });
  return { duplicates, missing };
}

function inspectStore(store) {
  const raw = localStorage.getItem(store.key);
  if (!raw) return { ...store, state: "empty", bytes: 0, count: 0, duplicates: 0, missing: 0, value: null };
  if (raw.length > store.max) return { ...store, state: "oversized", bytes: raw.length, count: 0, duplicates: 0, missing: 0, value: null };

  try {
    const parsed = JSON.parse(raw);

    if (store.kind === "journey") {
      if (!validJourneyPlan(parsed)) {
        return { ...store, state: "wrong-shape", bytes: raw.length, count: 0, duplicates: 0, missing: 0, value: null };
      }
      const count = parsed.crops.length + parsed.beds.length + parsed.customTasks.length;
      return { ...store, state: "valid", bytes: raw.length, count, duplicates: 0, missing: 0, value: parsed };
    }

    if (store.kind === "journey-backups") {
      if (!validJourneyBackups(parsed)) {
        return { ...store, state: "wrong-shape", bytes: raw.length, count: 0, duplicates: 0, missing: 0, value: null };
      }
      return { ...store, state: "valid", bytes: raw.length, count: parsed.length, duplicates: 0, missing: 0, value: parsed };
    }

    if (store.kind === "array") {
      if (!Array.isArray(parsed)) {
        return { ...store, state: "wrong-shape", bytes: raw.length, count: 0, duplicates: 0, missing: 0, value: null };
      }
      const ids = analyzeIds(parsed);
      return { ...store, state: "valid", bytes: raw.length, count: parsed.length, ...ids, value: parsed };
    }

    if (!safeObject(parsed) || !Array.isArray(parsed.harvests) || !Array.isArray(parsed.experiments) || !Array.isArray(parsed.expenses)) {
      return { ...store, state: "wrong-shape", bytes: raw.length, count: 0, duplicates: 0, missing: 0, value: null };
    }

    const collections = [parsed.harvests, parsed.experiments, parsed.expenses];
    const ids = collections.map(analyzeIds).reduce(
      (sum, item) => ({
        duplicates: sum.duplicates + item.duplicates,
        missing: sum.missing + item.missing,
      }),
      { duplicates: 0, missing: 0 }
    );

    return {
      ...store,
      state: "valid",
      bytes: raw.length,
      count: collections.reduce((sum, items) => sum + items.length, 0),
      ...ids,
      value: parsed,
    };
  } catch {
    return { ...store, state: "malformed", bytes: raw.length, count: 0, duplicates: 0, missing: 0, value: null };
  }
}

function inspectAll() {
  return STORES.map(inspectStore);
}

function recoveryId(storeId, group, index, used) {
  let counter = index;
  let candidate = `${storeId}-${group}-${Date.now()}-${counter}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${storeId}-${group}-${Date.now()}-${counter}`;
  }
  return candidate;
}

function normalizeIds(items, storeId, group) {
  const used = new Set();
  let repairs = 0;
  const next = items.map((item, index) => {
    if (!safeObject(item)) return item;
    const rawId = String(item.id ?? "").trim();
    let id = rawId;
    if (!id || used.has(id)) {
      id = recoveryId(storeId, group, index, used);
      repairs += 1;
    }
    used.add(id);
    return id === rawId ? item : { ...item, id };
  });
  return { next, repairs };
}

function prepareRepair(store) {
  if (store.state !== "valid") return { changed: false, repairs: 0, value: store.value };
  if (store.kind === "journey" || store.kind === "journey-backups") {
    return { changed: false, repairs: 0, value: store.value };
  }
  if (store.kind === "array") {
    const result = normalizeIds(store.value, store.id, "items");
    return { changed: result.repairs > 0, repairs: result.repairs, value: result.next };
  }
  const harvests = normalizeIds(store.value.harvests, store.id, "harvests");
  const experiments = normalizeIds(store.value.experiments, store.id, "experiments");
  const expenses = normalizeIds(store.value.expenses, store.id, "expenses");
  const repairs = harvests.repairs + experiments.repairs + expenses.repairs;
  return {
    changed: repairs > 0,
    repairs,
    value: { ...store.value, harvests: harvests.next, experiments: experiments.next, expenses: expenses.next },
  };
}

function daysSince(iso) {
  const timestamp = Date.parse(String(iso || ""));
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

function stateLabel(state) {
  if (state === "valid") return "Valid";
  if (state === "empty") return "No data";
  if (state === "oversized") return "Over local size limit";
  if (state === "wrong-shape") return "Unexpected data shape";
  return "Malformed JSON";
}

export default function FarmDataHealth() {
  const [stores, setStores] = useState([]);
  const [backupMeta, setBackupMeta] = useState(null);
  const [schemaMeta, setSchemaMeta] = useState(null);
  const [preRestore, setPreRestore] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  function refresh() {
    setStores(inspectAll());
    setBackupMeta(parseMeta(BACKUP_META_KEY));
    setSchemaMeta(parseMeta(SCHEMA_META_KEY));
    setPreRestore(parseMeta(PRE_RESTORE_KEY));
  }

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const summary = useMemo(() => ({
    present: stores.filter((store) => store.state !== "empty").length,
    healthy: stores.filter((store) => store.state === "valid" && !store.duplicates && !store.missing).length,
    needsRepair: stores.filter((store) => store.state === "valid" && (store.duplicates || store.missing)).length,
    broken: stores.filter((store) => !["empty", "valid"].includes(store.state)).length,
  }), [stores]);

  const backupAge = daysSince(backupMeta?.lastExportedAt);
  const repairCount = stores.reduce((sum, store) => sum + store.duplicates + store.missing, 0);

  function repairKnownStores() {
    if (confirmation !== "REPAIR") return;
    try {
      const current = inspectAll();
      const snapshotStores = {};
      current.forEach((store) => {
        if (store.state === "valid") snapshotStores[store.id] = store.value;
      });
      const snapshot = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), reason: "before-data-health-repair", stores: snapshotStores });
      if (snapshot.length > MAX_SNAPSHOT_BYTES) throw new Error("snapshot-too-large");
      localStorage.setItem(PRE_REPAIR_KEY, snapshot);

      let repairedStores = 0;
      let repairedIds = 0;
      current.forEach((store) => {
        const result = prepareRepair(store);
        if (!result.changed) return;
        const raw = JSON.stringify(result.value);
        if (raw.length > store.max) throw new Error("store-too-large");
        localStorage.setItem(store.key, raw);
        repairedStores += 1;
        repairedIds += result.repairs;
      });
      const maintenanceAt = new Date().toISOString();
      localStorage.setItem(SCHEMA_META_KEY, JSON.stringify({ version: SCHEMA_VERSION, lastMaintenanceAt: maintenanceAt, repairedStores, repairedIds }));
      setConfirmation("");
      setStatus(repairedIds ? `Repaired ${repairedIds} missing or duplicate record IDs across ${repairedStores} Farm OS data ${repairedStores === 1 ? "area" : "areas"}. A pre-repair snapshot was saved locally.` : "Data-health maintenance completed. No missing or duplicate IDs needed repair; a pre-repair snapshot was saved locally.");
      refresh();
    } catch {
      setStatus("Farm OS repair stopped before it could safely complete. No malformed or oversized store was overwritten; use a known-good backup for those areas.");
    }
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Browser-local integrity check.</strong> This page scans only known Farm OS storage keys on this device. It does not upload records, inspect unrelated browser storage, or automatically overwrite malformed data.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="farm-summary-grid" aria-label="Farm OS data health summary">
        <div className="farm-summary-card"><span>Working stores present</span><b>{ready ? summary.present : "—"}</b></div>
        <div className="farm-summary-card"><span>Healthy stores</span><b>{ready ? summary.healthy : "—"}</b></div>
        <div className="farm-summary-card"><span>ID repair candidates</span><b>{ready ? summary.needsRepair : "—"}</b></div>
        <div className="farm-summary-card"><span>Malformed / oversized</span><b>{ready ? summary.broken : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="backup-health-heading">
        <span className="eyebrow">Recovery readiness</span>
        <h2 id="backup-health-heading">Know whether there is a recent way back.</h2>
        <div className="farm-record-list">
          <article className="farm-record"><div><div className="farm-record-meta">Last backup prepared in this browser</div><h3>{backupAge == null ? "No backup history recorded" : backupAge === 0 ? "Today" : `${backupAge} day${backupAge === 1 ? "" : "s"} ago`}</h3><p>{backupMeta?.lastExportedAt ? `Recorded ${backupMeta.lastExportedAt}. ${backupMeta.storeCount || 0} data areas were included.` : "Download a Farm OS backup to establish recovery history on this device."}</p>{backupAge != null && backupAge >= 7 ? <p><strong>Backup reminder:</strong> this browser has not prepared a Farm OS backup in at least seven days.</p> : null}</div></article>
          <article className="farm-record"><div><div className="farm-record-meta">Pre-restore safety snapshot</div><h3>{preRestore?.createdAt ? "Available in this browser" : "None recorded"}</h3><p>{preRestore?.createdAt ? `Captured ${preRestore.createdAt} immediately before a validated restore.` : "Farm OS will capture selected valid current stores before the next restore when possible."}</p></div></article>
          <article className="farm-record"><div><div className="farm-record-meta">Maintenance/schema profile</div><h3>Version {schemaMeta?.version || SCHEMA_VERSION}</h3><p>{schemaMeta?.lastMaintenanceAt ? `Last maintenance: ${schemaMeta.lastMaintenanceAt}.` : "No local maintenance run is recorded yet. The current repair profile only normalizes missing or duplicate IDs in valid known stores."}</p></div></article>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="store-health-heading">
        <span className="eyebrow">Store-by-store check</span>
        <h2 id="store-health-heading">Find trouble before a restore is needed.</h2>
        <div className="farm-record-list">{stores.map((store) => <article className="farm-record" key={store.id}>
          <div>
            <div className="farm-record-meta">{stateLabel(store.state)} · {store.bytes.toLocaleString()} bytes</div>
            <h3>{store.label}</h3>
            <p>{store.state === "valid" ? `${store.count} saved item${store.count === 1 ? "" : "s"}. ${store.duplicates} duplicate ID${store.duplicates === 1 ? "" : "s"}; ${store.missing} missing ID${store.missing === 1 ? "" : "s"}.` : store.state === "empty" ? "No data is saved for this tool in this browser." : "Farm OS will not auto-repair this store. Preserve it and restore from a known-good backup if needed."}</p>
          </div>
        </article>)}</div>
      </section>

      <section className="farm-panel" aria-labelledby="repair-heading">
        <span className="eyebrow">Controlled maintenance</span>
        <h2 id="repair-heading">Normalize IDs without rewriting malformed stores.</h2>
        <p>The current versioned maintenance step repairs only missing or duplicate IDs inside otherwise valid known stores. Before changes, Farm OS saves a browser-local pre-repair snapshot. Malformed, oversized, and unexpected-shape stores are left untouched.</p>
        <p>{repairCount ? `${repairCount} ID issue${repairCount === 1 ? " is" : "s are"} currently eligible for repair.` : "No missing or duplicate IDs are currently detected."}</p>
        <div className="farm-field" style={{ maxWidth: 420 }}><label htmlFor="repair-confirmation">Type REPAIR to run maintenance</label><input id="repair-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase().slice(0, 6))} autoComplete="off" spellCheck={false} /></div>
        <div className="farm-actions"><button className="farm-action danger" type="button" disabled={confirmation !== "REPAIR"} onClick={repairKnownStores}>Run safe ID maintenance</button><Link className="farm-action secondary" href="/farm-backup">Back up before maintenance</Link></div>
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/privacy-tools">Privacy controls</Link><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link></div>
    </div>
  );
}
