"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const STORES = {
  calendar: { key: "price-family-farm-calendar-v1", max: 1_000_000 },
  plantings: { key: "price-family-farm-plantings-v1", max: 1_000_000 },
  inventory: { key: "price-family-farm-inventory-v1", max: 500_000 },
  market: { key: "price-family-farm-market-plan-v1", max: 750_000 },
};

function text(value, max = 180) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function readArray(store, maxItems) {
  const raw = localStorage.getItem(store.key);
  if (!raw) return [];
  if (raw.length > store.max) throw new Error("store-too-large");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("invalid-store");
  return parsed.slice(0, maxItems);
}

function readWeek() {
  return {
    tasks: readArray(STORES.calendar, 1_000).map((item) => ({ id: text(item?.id, 120), date: date(item?.date), task: text(item?.task), category: text(item?.category, 50), status: text(item?.status, 40) })).filter((item) => item.date && item.task),
    plantings: readArray(STORES.plantings, 1_000).map((item) => ({ id: text(item?.id, 120), crop: text(item?.crop, 80), variety: text(item?.variety, 100), bed: text(item?.bed, 100), status: text(item?.status, 40), nextSuccessionDate: date(item?.nextSuccessionDate), harvestStart: date(item?.harvestStart) })).filter((item) => item.crop && item.bed),
    inventory: readArray(STORES.inventory, 500).map((item) => ({ id: text(item?.id, 120), name: text(item?.name, 120), quantity: Number(item?.quantity), reorderAt: Number(item?.reorderAt), unit: text(item?.unit, 20), supplier: text(item?.supplier, 120) })).filter((item) => item.name && Number.isFinite(item.quantity) && Number.isFinite(item.reorderAt)),
    market: readArray(STORES.market, 500).map((item) => ({ id: text(item?.id, 120), date: date(item?.date), product: text(item?.product, 100), marketQty: Number(item?.marketQty), packedQty: Number(item?.packedQty), unit: text(item?.unit, 20), interestCount: Number(item?.interestCount), status: text(item?.status, 40) })).filter((item) => item.date && item.product),
  };
}

export default function WeeklyWorkSheet() {
  const [data, setData] = useState({ tasks: [], plantings: [], inventory: [], market: [] });
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setData(readWeek());
    } catch {
      setStatus("One or more Farm OS stores could not be read safely for this weekly work sheet. Check Data Health before replacing anything.");
    } finally {
      setReady(true);
    }
  }, []);

  const week = useMemo(() => {
    const today = localDay();
    const end = localDayPlus(7);
    const openTasks = data.tasks.filter((item) => !["Done", "Skipped"].includes(item.status));
    return {
      today,
      end,
      overdue: openTasks.filter((item) => item.date < today).sort((a, b) => a.date.localeCompare(b.date)),
      tasks: openTasks.filter((item) => item.date >= today && item.date <= end).sort((a, b) => a.date.localeCompare(b.date)),
      successions: data.plantings.filter((item) => item.nextSuccessionDate && item.nextSuccessionDate >= today && item.nextSuccessionDate <= end).sort((a, b) => a.nextSuccessionDate.localeCompare(b.nextSuccessionDate)),
      harvestWindows: data.plantings.filter((item) => item.harvestStart && item.harvestStart >= today && item.harvestStart <= end).sort((a, b) => a.harvestStart.localeCompare(b.harvestStart)),
      lowStock: data.inventory.filter((item) => item.quantity <= item.reorderAt).sort((a, b) => a.name.localeCompare(b.name)),
      markets: data.market.filter((item) => item.date >= today && item.date <= end && !["Complete", "Cancelled"].includes(item.status)).sort((a, b) => a.date.localeCompare(b.date) || a.product.localeCompare(b.product)),
    };
  }, [data]);

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Printable private work sheet.</strong> This combines only browser-local Farm OS data for {week.today} through {week.end}. It does not sync or publish the work list.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}
      <div className="farm-actions"><button className="farm-action" type="button" onClick={() => window.print()}>Print weekly work sheet</button><Link className="farm-action secondary" href="/farm-today">Open Farm Today</Link></div>

      <section className="farm-panel" aria-labelledby="worksheet-priority-heading">
        <span className="eyebrow">Priority work</span>
        <h2 id="worksheet-priority-heading">Overdue + next seven days.</h2>
        <div className="grid-2">
          <div><h3>{ready ? `${week.overdue.length} overdue` : "Loading overdue work"}</h3>{week.overdue.length ? <div className="farm-record-list">{week.overdue.map((item) => <article className="farm-record" key={item.id || `${item.date}-${item.task}`}><div><div className="farm-record-meta">{item.date} · {item.category}</div><h3>{item.task}</h3></div></article>)}</div> : <div className="farm-empty">No overdue open tasks.</div>}</div>
          <div><h3>{ready ? `${week.tasks.length} due this week` : "Loading weekly tasks"}</h3>{week.tasks.length ? <div className="farm-record-list">{week.tasks.map((item) => <article className="farm-record" key={item.id || `${item.date}-${item.task}`}><div><div className="farm-record-meta">{item.date} · {item.category}</div><h3>{item.task}</h3></div></article>)}</div> : <div className="farm-empty">No open tasks are dated through the next seven days.</div>}</div>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="worksheet-production-heading">
        <span className="eyebrow">Production timing</span>
        <h2 id="worksheet-production-heading">Successions and harvest windows.</h2>
        <div className="grid-2">
          <div><h3>Succession starts</h3>{week.successions.length ? <div className="farm-record-list">{week.successions.map((item) => <article className="farm-record" key={`succession-${item.id}`}><div><div className="farm-record-meta">{item.nextSuccessionDate} · {item.bed}</div><h3>{item.crop}{item.variety ? ` · ${item.variety}` : ""}</h3></div></article>)}</div> : <div className="farm-empty">No saved succession dates fall in this week.</div>}</div>
          <div><h3>Expected harvest starts</h3>{week.harvestWindows.length ? <div className="farm-record-list">{week.harvestWindows.map((item) => <article className="farm-record" key={`harvest-${item.id}`}><div><div className="farm-record-meta">{item.harvestStart} · {item.bed}</div><h3>{item.crop}{item.variety ? ` · ${item.variety}` : ""}</h3></div></article>)}</div> : <div className="farm-empty">No expected harvest starts fall in this week.</div>}</div>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="worksheet-supplies-heading">
        <span className="eyebrow">Supply run</span>
        <h2 id="worksheet-supplies-heading">Low-stock items.</h2>
        {week.lowStock.length ? <div className="farm-record-list">{week.lowStock.map((item) => <article className="farm-record" key={item.id || item.name}><div><div className="farm-record-meta">Reorder at {item.reorderAt} {item.unit}</div><h3>{item.name}</h3><p>{item.quantity} {item.unit} on hand{item.supplier ? ` · ${item.supplier}` : ""}.</p></div></article>)}</div> : <div className="farm-empty">No tracked inventory item is at or below its saved reorder threshold.</div>}
      </section>

      <section className="farm-panel" aria-labelledby="worksheet-market-heading">
        <span className="eyebrow">Market / pickup prep</span>
        <h2 id="worksheet-market-heading">Harvest targets and packing work.</h2>
        {week.markets.length ? <div className="farm-record-list">{week.markets.map((item) => <article className="farm-record" key={item.id || `${item.date}-${item.product}`}><div><div className="farm-record-meta">{item.date} · {item.status}</div><h3>{item.product}</h3><p>{Number.isFinite(item.marketQty) ? `${item.marketQty} ${item.unit} planned` : "No market quantity saved"} · {Number.isFinite(item.packedQty) ? `${item.packedQty} ${item.unit} packed` : "0 packed"} · {Number.isFinite(item.interestCount) ? `${item.interestCount} aggregate interest signals` : "No interest count saved"}.</p></div></article>)}</div> : <div className="farm-empty">No active market/pickup items fall in this week.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/market-planner">Open Market Planner</Link><Link className="farm-action secondary" href="/farm-inventory">Open Inventory</Link><Link className="farm-action secondary" href="/plantings">Open Plantings</Link><Link className="farm-action secondary" href="/farm-os/calendar">Open Calendar</Link></div>
    </div>
  );
}
