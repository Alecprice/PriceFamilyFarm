"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const STORAGE_KEY = "price-family-farm-market-plan-v1";
const RECORDS_KEY = "price-family-farm-records-v2";
const MAX_BYTES = 750_000;
const MAX_ITEMS = 500;
const UNITS = ["lb", "oz", "count", "bunch", "pint", "quart", "tray", "each"];
const STATUSES = ["Planning", "Ready", "Complete", "Cancelled"];

function text(value, max = 160) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function numberString(value, max = 1_000_000) {
  if (value === "" || value == null) return "";
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0 || next > max) return "";
  return String(next);
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `market-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitize(item, index = 0) {
  const product = text(item?.product, 100);
  const marketDate = date(item?.date);
  if (!product || !marketDate) return null;
  return {
    id: text(item?.id, 120) || `market-${index}`,
    date: marketDate,
    product,
    targetHarvestQty: numberString(item?.targetHarvestQty),
    marketQty: numberString(item?.marketQty),
    packedQty: numberString(item?.packedQty),
    unit: UNITS.includes(item?.unit) ? item.unit : "count",
    interestCount: numberString(item?.interestCount, 100_000) || "0",
    unitPrice: numberString(item?.unitPrice, 100_000),
    status: STATUSES.includes(item?.status) ? item.status : "Planning",
    notes: text(item?.notes, 600),
  };
}

function readPlan() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  if (raw.length > MAX_BYTES) throw new Error("market-plan-too-large");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("invalid-market-plan");
  return parsed.slice(0, MAX_ITEMS).map(sanitize).filter(Boolean);
}

function writePlan(items) {
  const raw = JSON.stringify(items.slice(0, MAX_ITEMS));
  if (raw.length > MAX_BYTES) throw new Error("market-plan-too-large");
  localStorage.setItem(STORAGE_KEY, raw);
}

function readHarvests() {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw || raw.length > 2_000_000) return [];
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Array.isArray(parsed.harvests)) return [];
  const start = localDayPlus(-14);
  const end = localDay();
  return parsed.harvests.slice(0, 5_000).map((item) => ({
    date: date(item?.date),
    crop: text(item?.crop, 80),
    quantity: Number(item?.quantity),
    unit: text(item?.unit, 20),
  })).filter((item) => item.date >= start && item.date <= end && item.crop && Number.isFinite(item.quantity) && item.quantity >= 0);
}

function harvestSignal(harvests, product) {
  const matches = harvests.filter((item) => item.crop.toLowerCase() === product.toLowerCase());
  const totals = new Map();
  matches.forEach((item) => totals.set(item.unit || "units", (totals.get(item.unit || "units") || 0) + item.quantity));
  return [...totals.entries()].map(([unit, quantity]) => `${quantity} ${unit}`).join(" + ");
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function FarmMarketPlanner() {
  const [items, setItems] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [focusDate, setFocusDate] = useState(localDay());
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(readPlan());
      setHarvests(readHarvests());
    } catch {
      setStatus("Market planning data could not be read safely. Make a Farm OS backup before replacing affected browser-local data.");
    } finally {
      setReady(true);
    }
  }, []);

  const visible = useMemo(() => items.filter((item) => item.date === focusDate).sort((a, b) => a.product.localeCompare(b.product)), [focusDate, items]);
  const summary = useMemo(() => {
    const active = items.filter((item) => !["Complete", "Cancelled"].includes(item.status));
    const interest = active.reduce((sum, item) => sum + Number(item.interestCount || 0), 0);
    const plannedRevenue = active.reduce((sum, item) => sum + Number(item.marketQty || 0) * Number(item.unitPrice || 0), 0);
    const fullyPacked = active.filter((item) => Number(item.marketQty || 0) > 0 && Number(item.packedQty || 0) >= Number(item.marketQty || 0)).length;
    return { active: active.length, interest, plannedRevenue, fullyPacked };
  }, [items]);

  function persist(next, message) {
    try {
      writePlan(next);
      setItems(next);
      setStatus(message);
    } catch {
      setStatus("Market plan could not be updated safely. Make a Farm OS backup before trying again.");
    }
  }

  function addItem(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const item = sanitize({
      id: makeId(),
      date: data.get("date"),
      product: data.get("product"),
      targetHarvestQty: data.get("targetHarvestQty"),
      marketQty: data.get("marketQty"),
      packedQty: data.get("packedQty"),
      unit: data.get("unit"),
      interestCount: data.get("interestCount"),
      unitPrice: data.get("unitPrice"),
      status: "Planning",
      notes: data.get("notes"),
    });
    if (!item) {
      setStatus("Add a valid date and product/crop before saving the market plan.");
      return;
    }
    if (items.length >= MAX_ITEMS) {
      setStatus("Market planner has reached its 500-entry local safety limit.");
      return;
    }
    persist([item, ...items], `${item.product} added to the ${item.date} market plan.`);
    setFocusDate(item.date);
    form.reset();
    form.elements.date.value = item.date;
    form.elements.unit.value = "count";
  }

  function updateItem(id, patch, message) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    persist(items.map((item) => item.id === id ? { ...item, ...patch } : item), message);
  }

  function remove(id) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    if (!window.confirm(`Delete ${current.product} from the ${current.date} market plan?`)) return;
    persist(items.filter((item) => item.id !== id), `${current.product} removed from the market plan.`);
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Manual availability and demand plan.</strong> Market quantity is the amount you intentionally plan to offer. Recent harvest records are shown only as a production signal—they are not treated as available stock. Interest counts are aggregate numbers only; do not store customer names, email addresses, phone numbers, or payment details here.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="farm-summary-grid" aria-label="Market planning summary">
        <div className="farm-summary-card"><span>Active market items</span><b>{ready ? summary.active : "—"}</b></div>
        <div className="farm-summary-card"><span>Aggregate interest count</span><b>{ready ? summary.interest : "—"}</b></div>
        <div className="farm-summary-card"><span>Fully packed items</span><b>{ready ? summary.fullyPacked : "—"}</b></div>
        <div className="farm-summary-card"><span>Planned gross if sold</span><b>{ready ? money(summary.plannedRevenue) : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="market-plan-add-heading">
        <span className="eyebrow">Harvest target + demand</span>
        <h2 id="market-plan-add-heading">Build the next pickup or market-day list.</h2>
        <form className="farm-form" onSubmit={addItem}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="market-date">Market / pickup date</label><input id="market-date" name="date" type="date" defaultValue={localDay()} required /></div>
            <div className="farm-field"><label htmlFor="market-product">Product / crop</label><input id="market-product" name="product" maxLength={100} required placeholder="Tomato" /></div>
            <div className="farm-field"><label htmlFor="market-target">Harvest target</label><input id="market-target" name="targetHarvestQty" type="number" min="0" step="0.01" /></div>
            <div className="farm-field"><label htmlFor="market-quantity">Planned market quantity</label><input id="market-quantity" name="marketQty" type="number" min="0" step="0.01" /></div>
            <div className="farm-field"><label htmlFor="market-packed">Packed now</label><input id="market-packed" name="packedQty" type="number" min="0" step="0.01" defaultValue="0" /></div>
            <div className="farm-field"><label htmlFor="market-unit">Unit</label><select id="market-unit" name="unit" defaultValue="count">{UNITS.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="market-interest">Aggregate interest count</label><input id="market-interest" name="interestCount" type="number" min="0" step="1" defaultValue="0" /></div>
            <div className="farm-field"><label htmlFor="market-price">Price per unit</label><input id="market-price" name="unitPrice" type="number" min="0" step="0.01" /></div>
          </div>
          <div className="farm-field"><label htmlFor="market-notes">Packing / market notes</label><textarea id="market-notes" name="notes" maxLength={600} rows={3} /></div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add market item</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="packing-list-heading">
        <span className="eyebrow">Packing list</span>
        <h2 id="packing-list-heading">Pack against an intentional quantity, not a guessed stock number.</h2>
        <div className="farm-field" style={{ maxWidth: 320 }}><label htmlFor="market-focus-date">Packing-list date</label><input id="market-focus-date" type="date" value={focusDate} onChange={(event) => setFocusDate(event.target.value)} /></div>
        {visible.length ? <div className="farm-record-list">{visible.map((item) => {
          const signal = harvestSignal(harvests, item.product);
          const packed = Number(item.packedQty || 0);
          const planned = Number(item.marketQty || 0);
          const readyToGo = planned > 0 && packed >= planned;
          return <article className="farm-record" key={item.id}>
            <div>
              <div className="farm-record-meta">{item.status} · {item.date}</div>
              <h3>{item.product}</h3>
              <p>{item.targetHarvestQty ? `Harvest target: ${item.targetHarvestQty} ${item.unit}. ` : ""}{item.marketQty ? `Planned market quantity: ${item.marketQty} ${item.unit}. ` : "No market quantity saved. "}{item.packedQty ? `Packed: ${item.packedQty} ${item.unit}.` : "Packed: 0."}</p>
              <p>{item.interestCount} aggregate interest signal{Number(item.interestCount) === 1 ? "" : "s"}{item.unitPrice ? ` · ${money(Number(item.marketQty || 0) * Number(item.unitPrice))} planned gross if all planned quantity sells` : ""}.</p>
              <p>{signal ? `Recent 14-day Farm Records harvest signal: ${signal}. This is not automatically available stock.` : "No matching 14-day harvest signal in Farm Records."}</p>
              <p>{readyToGo ? "Packing target reached for this item." : planned ? `${Math.max(0, planned - packed)} ${item.unit} remain to pack against the saved market quantity.` : "Set a market quantity before using packing completion."}</p>
              {item.notes ? <p>{item.notes}</p> : null}
            </div>
            <div className="farm-actions" aria-label={`Market actions for ${item.product}`}>
              {planned ? <button className="farm-action" type="button" onClick={() => updateItem(item.id, { packedQty: item.marketQty, status: "Ready" }, `${item.product} marked fully packed.`)}>Mark fully packed</button> : null}
              <button className="farm-action secondary" type="button" onClick={() => updateItem(item.id, { status: "Complete" }, `${item.product} market item marked complete.`)}>Complete</button>
              <button className="farm-action danger" type="button" onClick={() => remove(item.id)}>Delete</button>
            </div>
          </article>;
        })}</div> : <div className="farm-empty">No market items are saved for {focusDate}.</div>}
        <div className="farm-actions"><button className="farm-action secondary" type="button" onClick={() => window.print()}>Print this market plan</button><Link className="farm-action secondary" href="/weekly-work-sheet">Open weekly work sheet</Link></div>
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/available">Public availability page</Link><Link className="farm-action secondary" href="/farm-records">Farm Records</Link><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link></div>
    </div>
  );
}
