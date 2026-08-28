"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const STORES = {
  inventory: { key: "price-family-farm-inventory-v1", max: 500_000, items: 500 },
  plantings: { key: "price-family-farm-plantings-v1", max: 1_000_000, items: 1_000 },
  market: { key: "price-family-farm-market-plan-v1", max: 750_000, items: 500 },
};
const BACKUP_META_KEY = "price-family-farm-backup-meta-v1";

function readArray(store) {
  try {
    const raw = localStorage.getItem(store.key);
    if (!raw || raw.length > store.max) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, store.items) : [];
  } catch {
    return [];
  }
}

function readMeta() {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    if (!raw || raw.length > 100_000) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function number(value) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function daysSince(value) {
  const timestamp = Date.parse(String(value || ""));
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

export default function FarmOsExpansionPanel() {
  const [inventory, setInventory] = useState([]);
  const [plantings, setPlantings] = useState([]);
  const [market, setMarket] = useState([]);
  const [backupMeta, setBackupMeta] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInventory(readArray(STORES.inventory));
    setPlantings(readArray(STORES.plantings));
    setMarket(readArray(STORES.market));
    setBackupMeta(readMeta());
    setReady(true);
  }, []);

  const summary = useMemo(() => {
    const today = localDay();
    const successionEnd = localDayPlus(14);
    const lowStock = inventory.filter((item) => number(item?.quantity) <= number(item?.reorderAt)).length;
    const activePlantings = plantings.filter((item) => item?.status !== "Finished").length;
    const successionDue = plantings.filter((item) => item?.status !== "Finished" && item?.nextSuccessionDate >= today && item.nextSuccessionDate <= successionEnd).length;
    const activeMarket = market.filter((item) => !["Complete", "Cancelled"].includes(item?.status)).length;
    const interest = market.filter((item) => !["Complete", "Cancelled"].includes(item?.status)).reduce((sum, item) => sum + number(item?.interestCount), 0);
    return { lowStock, activePlantings, successionDue, activeMarket, interest, backupAge: daysSince(backupMeta?.lastExportedAt) };
  }, [backupMeta, inventory, market, plantings]);

  return (
    <section className="farm-panel" aria-labelledby="farm-os-expanded-operations-heading">
      <span className="eyebrow">Expanded operating system</span>
      <h2 id="farm-os-expanded-operations-heading">Production, supplies, markets, and recovery now connect here.</h2>
      <p>Use the focused tools when you need detail; use Farm OS to see the operating signals that deserve attention first.</p>

      <div className="farm-summary-grid" aria-label="Expanded Farm OS summary">
        <div className="farm-summary-card"><span>Low-stock supplies</span><b>{ready ? summary.lowStock : "—"}</b></div>
        <div className="farm-summary-card"><span>Active plantings</span><b>{ready ? summary.activePlantings : "—"}</b></div>
        <div className="farm-summary-card"><span>Successions due in 14 days</span><b>{ready ? summary.successionDue : "—"}</b></div>
        <div className="farm-summary-card"><span>Active market items</span><b>{ready ? summary.activeMarket : "—"}</b></div>
      </div>

      <div className="grid-3">
        <article className="packet"><span className="eyebrow">Supplies</span><h3>{ready && summary.lowStock ? `${summary.lowStock} item${summary.lowStock === 1 ? " is" : "s are"} at or below reorder level` : "Inventory is ready for review"}</h3><p>Keep seeds, media, fertility, irrigation, trays, packaging, and equipment from becoming the next bottleneck.</p><Link className="stat-link" href="/farm-inventory">Open Farm Inventory →</Link></article>
        <article className="packet"><span className="eyebrow">Production</span><h3>{ready ? `${summary.activePlantings} active planting${summary.activePlantings === 1 ? "" : "s"} · ${summary.successionDue} succession${summary.successionDue === 1 ? "" : "s"} due soon` : "Loading production state"}</h3><p>Connect crop, variety, bed, spacing, harvest windows, and actual matching Farm Records.</p><Link className="stat-link" href="/plantings">Open Plantings & Successions →</Link></article>
        <article className="packet"><span className="eyebrow">Sales planning</span><h3>{ready ? `${summary.activeMarket} active market item${summary.activeMarket === 1 ? "" : "s"} · ${summary.interest} aggregate interest signal${summary.interest === 1 ? "" : "s"}` : "Loading market plan"}</h3><p>Plan intentional availability, harvest targets, packing quantities, aggregate demand, and pricing without storing customer contact details.</p><Link className="stat-link" href="/market-planner">Open Market Planner →</Link></article>
      </div>

      <div className="farm-record-list" style={{ marginTop: 20 }}>
        <article className="farm-record"><div><div className="farm-record-meta">Crop economics</div><h3>Compare what earns its space.</h3><p>Use recorded crop sales, direct crop expenses, mapped growing area, harvest quantities, and season comparison without treating incomplete records as full accounting profit.</p></div><div className="farm-actions"><Link className="farm-action secondary" href="/crop-profitability">Crop Profitability</Link></div></article>
        <article className="farm-record"><div><div className="farm-record-meta">Weekly execution</div><h3>Print the next seven days.</h3><p>Combine overdue tasks, upcoming work, successions, harvest windows, low-stock supplies, and market prep on one private work sheet.</p></div><div className="farm-actions"><Link className="farm-action secondary" href="/weekly-work-sheet">Weekly Work Sheet</Link></div></article>
        <article className="farm-record"><div><div className="farm-record-meta">Recovery readiness</div><h3>{summary.backupAge == null ? "No backup history recorded in this browser" : summary.backupAge === 0 ? "Farm OS backup prepared today" : `Last Farm OS backup: ${summary.backupAge} day${summary.backupAge === 1 ? "" : "s"} ago`}</h3><p>Check store integrity, duplicate IDs, backup age, pre-restore snapshots, and controlled maintenance before data problems become emergencies.</p></div><div className="farm-actions"><Link className="farm-action secondary" href="/farm-data-health">Data Health</Link><Link className="farm-action secondary" href="/farm-backup">Backup</Link></div></article>
      </div>
    </section>
  );
}
