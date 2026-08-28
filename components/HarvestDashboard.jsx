"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-records-v2";
const MAX_RECORDS = 5_000;

function safeText(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function readHarvests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 2_000_000) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.harvests)) return [];
    return parsed.harvests.slice(0, MAX_RECORDS).map((item) => ({
      id: safeText(item?.id, 120),
      date: safeText(item?.date, 10),
      crop: safeText(item?.crop, 80),
      variety: safeText(item?.variety, 100),
      location: safeText(item?.location, 100),
      quantity: safeNumber(item?.quantity),
      unit: safeText(item?.unit, 20),
      destination: safeText(item?.destination, 30),
      saleAmount: safeNumber(item?.saleAmount),
      notes: safeText(item?.notes, 500),
    })).filter((item) => item.crop && /^\d{4}-\d{2}-\d{2}$/.test(item.date));
  } catch {
    return [];
  }
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function HarvestDashboard() {
  const [harvests, setHarvests] = useState([]);
  const [ready, setReady] = useState(false);
  const [crop, setCrop] = useState("all");

  useEffect(() => {
    setHarvests(readHarvests());
    setReady(true);
  }, []);

  const crops = useMemo(() => [...new Set(harvests.map((item) => item.crop))].sort((a, b) => a.localeCompare(b)), [harvests]);
  const visible = useMemo(() => crop === "all" ? harvests : harvests.filter((item) => item.crop === crop), [crop, harvests]);
  const summary = useMemo(() => {
    const sales = visible.reduce((sum, item) => sum + item.saleAmount, 0);
    const sold = visible.filter((item) => item.destination === "sold").length;
    const latest = [...visible].sort((a, b) => b.date.localeCompare(a.date))[0]?.date || "—";
    return { entries: visible.length, sales, sold, latest };
  }, [visible]);

  const groupedUnits = useMemo(() => {
    const totals = new Map();
    visible.forEach((item) => {
      const unit = item.unit || "unit";
      totals.set(unit, (totals.get(unit) || 0) + item.quantity);
    });
    return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  const recent = useMemo(() => [...visible].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12), [visible]);

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private harvest view.</strong> This dashboard only reads harvest records already saved in this browser. It does not upload, publish, or change them.</div>

      <div className="farm-panel">
        <div className="farm-field" style={{ maxWidth: 360 }}>
          <label htmlFor="harvest-dashboard-crop">Crop filter</label>
          <select id="harvest-dashboard-crop" value={crop} onChange={(event) => setCrop(event.target.value)}>
            <option value="all">All crops</option>
            {crops.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      <div className="farm-summary-grid" aria-label="Harvest dashboard summary">
        <div className="farm-summary-card"><span>Harvest entries</span><b>{ready ? summary.entries : "—"}</b></div>
        <div className="farm-summary-card"><span>Recorded sales</span><b>{ready ? money(summary.sales) : "—"}</b></div>
        <div className="farm-summary-card"><span>Sold harvests</span><b>{ready ? summary.sold : "—"}</b></div>
        <div className="farm-summary-card"><span>Latest harvest</span><b style={{ fontSize: 20 }}>{ready ? summary.latest : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="harvest-quantity-heading">
        <h2 id="harvest-quantity-heading">Recorded quantity by unit.</h2>
        <p>Units stay separate so pounds, trays, counts, bunches, pints, and other harvest measures are never mixed into a misleading total.</p>
        {groupedUnits.length ? <div className="farm-record-list">{groupedUnits.map(([unit, total]) => <article className="farm-record" key={unit}><div><div className="farm-record-meta">{unit}</div><h3>{total.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}</h3></div></article>)}</div> : <div className="farm-empty">No harvest quantity has been recorded for this filter yet.</div>}
      </section>

      <section className="farm-panel" aria-labelledby="recent-harvests-heading">
        <h2 id="recent-harvests-heading">Recent harvests.</h2>
        {recent.length ? <div className="farm-record-list">{recent.map((item, index) => <article className="farm-record" key={item.id || `${item.date}-${item.crop}-${index}`}><div><div className="farm-record-meta">{item.date} · {item.quantity} {item.unit || "unit"} · {item.destination || "unassigned"}</div><h3>{[item.crop, item.variety].filter(Boolean).join(" · ")}</h3><p>{[item.location, item.saleAmount ? `Sale ${money(item.saleAmount)}` : "", item.notes].filter(Boolean).join(" · ")}</p></div></article>)}</div> : <div className="farm-empty">No harvest records exist in this browser for this filter.</div>}
      </section>

      <div className="farm-actions">
        <Link className="farm-action" href="/farm-records">Log a harvest</Link>
        <Link className="farm-action secondary" href="/farm-analytics">Open Farm Analytics</Link>
        <Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link>
      </div>
    </div>
  );
}
