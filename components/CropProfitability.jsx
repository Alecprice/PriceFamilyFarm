"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay } from "@/lib/localDate";

const RECORDS_KEY = "price-family-farm-records-v2";
const PLANTINGS_KEY = "price-family-farm-plantings-v1";
const GARDEN_KEY = "price-family-farm-garden-layout-v1";

function text(value, max = 160) {
  return String(value ?? "").trim().slice(0, max);
}

function moneyNumber(value) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function readJson(key, maxBytes) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  if (raw.length > maxBytes) throw new Error("store-too-large");
  return JSON.parse(raw);
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function cropKey(value) {
  return text(value, 80).toLowerCase();
}

function readData() {
  const records = readJson(RECORDS_KEY, 2_000_000);
  const plantings = readJson(PLANTINGS_KEY, 1_000_000);
  const beds = readJson(GARDEN_KEY, 500_000);
  return {
    harvests: Array.isArray(records?.harvests) ? records.harvests.slice(0, 5_000) : [],
    expenses: Array.isArray(records?.expenses) ? records.expenses.slice(0, 5_000) : [],
    plantings: Array.isArray(plantings) ? plantings.slice(0, 1_000) : [],
    beds: Array.isArray(beds) ? beds.slice(0, 100) : [],
  };
}

function buildBedArea(data) {
  const bedsByName = new Map();
  data.beds.forEach((bed) => {
    const name = text(bed?.name, 80).toLowerCase();
    const length = Number(bed?.length);
    const width = Number(bed?.width);
    if (name && Number.isFinite(length) && Number.isFinite(width) && length > 0 && width > 0) bedsByName.set(name, length * width);
  });
  const cropBeds = new Map();
  data.plantings.forEach((planting) => {
    const crop = cropKey(planting?.crop);
    const bed = text(planting?.bed, 100).toLowerCase();
    if (!crop || !bed || !bedsByName.has(bed)) return;
    if (!cropBeds.has(crop)) cropBeds.set(crop, new Set());
    cropBeds.get(crop).add(bed);
  });
  const area = new Map();
  cropBeds.forEach((names, crop) => {
    area.set(crop, [...names].reduce((sum, name) => sum + (bedsByName.get(name) || 0), 0));
  });
  return area;
}

function summarize(data, year = "all") {
  const areaByCrop = buildBedArea(data);
  const crops = new Map();
  const includeDate = (raw) => year === "all" || date(raw).startsWith(`${year}-`);

  data.harvests.forEach((item) => {
    if (!includeDate(item?.date)) return;
    const key = cropKey(item?.crop);
    if (!key) return;
    const current = crops.get(key) || { key, crop: text(item?.crop, 80), sales: 0, directExpenses: 0, harvestEntries: 0, soldEntries: 0, quantities: new Map(), area: areaByCrop.get(key) || 0 };
    current.harvestEntries += 1;
    const saleAmount = moneyNumber(item?.saleAmount);
    current.sales += saleAmount;
    if (saleAmount > 0) current.soldEntries += 1;
    const quantity = Number(item?.quantity);
    const unit = text(item?.unit, 20) || "units";
    if (Number.isFinite(quantity) && quantity >= 0) current.quantities.set(unit, (current.quantities.get(unit) || 0) + quantity);
    crops.set(key, current);
  });

  data.expenses.forEach((item) => {
    if (!includeDate(item?.date)) return;
    const key = cropKey(item?.crop);
    if (!key) return;
    const current = crops.get(key) || { key, crop: text(item?.crop, 80), sales: 0, directExpenses: 0, harvestEntries: 0, soldEntries: 0, quantities: new Map(), area: areaByCrop.get(key) || 0 };
    current.directExpenses += moneyNumber(item?.amount);
    crops.set(key, current);
  });

  return [...crops.values()].map((item) => {
    const margin = item.sales - item.directExpenses;
    const quantityEntries = [...item.quantities.entries()];
    const onlyQuantity = quantityEntries.length === 1 ? quantityEntries[0] : null;
    return {
      ...item,
      margin,
      quantityText: quantityEntries.length ? quantityEntries.map(([unit, quantity]) => `${quantity} ${unit}`).join(" + ") : "No recorded quantity",
      averageSaleEntry: item.soldEntries ? item.sales / item.soldEntries : 0,
      marginPerSqFt: item.area ? margin / item.area : null,
      salesPerSqFt: item.area ? item.sales / item.area : null,
      costPerUnit: onlyQuantity && onlyQuantity[1] > 0 ? { value: item.directExpenses / onlyQuantity[1], unit: onlyQuantity[0] } : null,
      yieldPerSqFt: onlyQuantity && item.area ? { value: onlyQuantity[1] / item.area, unit: onlyQuantity[0] } : null,
    };
  }).sort((a, b) => b.margin - a.margin || b.sales - a.sales || a.crop.localeCompare(b.crop));
}

export default function CropProfitability() {
  const [data, setData] = useState({ harvests: [], expenses: [], plantings: [], beds: [] });
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [year, setYear] = useState("all");

  useEffect(() => {
    try {
      setData(readData());
    } catch {
      setStatus("Farm economics data could not be read safely from this browser. Use Farm OS backup/data-health tools before replacing affected stores.");
    } finally {
      setReady(true);
    }
  }, []);

  const years = useMemo(() => {
    const values = new Set();
    [...data.harvests, ...data.expenses].forEach((item) => {
      const saved = date(item?.date);
      if (saved) values.add(saved.slice(0, 4));
    });
    return [...values].sort((a, b) => b.localeCompare(a));
  }, [data]);

  const rows = useMemo(() => summarize(data, year), [data, year]);
  const seasons = useMemo(() => years.map((season) => {
    const seasonRows = summarize(data, season);
    return {
      season,
      sales: seasonRows.reduce((sum, item) => sum + item.sales, 0),
      directExpenses: seasonRows.reduce((sum, item) => sum + item.directExpenses, 0),
      margin: seasonRows.reduce((sum, item) => sum + item.margin, 0),
      crops: seasonRows.length,
    };
  }), [data, years]);

  const totals = useMemo(() => ({
    sales: rows.reduce((sum, item) => sum + item.sales, 0),
    directExpenses: rows.reduce((sum, item) => sum + item.directExpenses, 0),
    margin: rows.reduce((sum, item) => sum + item.margin, 0),
  }), [rows]);

  const strongest = rows[0];
  const lowest = rows.length > 1 ? rows[rows.length - 1] : null;

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Recorded crop economics, not accounting profit.</strong> Farm OS subtracts only expenses explicitly tagged to a crop from recorded harvest sales. Labor, depreciation, overhead, taxes, family use, unsold inventory, and unassigned expenses are excluded unless you record and assign them.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <section className="farm-panel" aria-labelledby="crop-economics-filter">
        <span className="eyebrow">Decision window</span>
        <h2 id="crop-economics-filter">Compare the numbers you actually recorded.</h2>
        <div className="farm-field" style={{ maxWidth: 320 }}><label htmlFor="crop-economics-year">Season</label><select id="crop-economics-year" value={year} onChange={(event) => setYear(event.target.value)}><option value="all">All recorded seasons</option>{years.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>
      </section>

      <div className="farm-summary-grid" aria-label="Crop economics summary">
        <div className="farm-summary-card"><span>Recorded crop sales</span><b>{ready ? money(totals.sales) : "—"}</b></div>
        <div className="farm-summary-card"><span>Direct crop expenses</span><b>{ready ? money(totals.directExpenses) : "—"}</b></div>
        <div className="farm-summary-card"><span>Recorded crop margin</span><b>{ready ? money(totals.margin) : "—"}</b></div>
        <div className="farm-summary-card"><span>Crops with tagged economics</span><b>{ready ? rows.length : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="crop-performance-heading">
        <span className="eyebrow">Crop comparison</span>
        <h2 id="crop-performance-heading">See what is earning its space in the recorded data.</h2>
        {rows.length ? <div className="farm-record-list">{rows.map((item, index) => <article className="farm-record" key={item.key}>
          <div>
            <div className="farm-record-meta">#{index + 1} by recorded margin{item.area ? ` · ${Math.round(item.area)} ft² mapped from linked planting beds` : " · No mapped area linked"}</div>
            <h3>{item.crop}</h3>
            <p><strong>{money(item.margin)} recorded margin</strong> · {money(item.sales)} sales · {money(item.directExpenses)} direct crop expenses.</p>
            <p>{item.harvestEntries} harvest entr{item.harvestEntries === 1 ? "y" : "ies"} · {item.quantityText} · {item.soldEntries ? `${money(item.averageSaleEntry)} average sale amount per harvest entry with recorded sales` : "No harvest entry has a recorded sale amount"}.</p>
            <p>{item.area ? `${money(item.salesPerSqFt)} sales/ft² · ${money(item.marginPerSqFt)} recorded margin/ft².` : "Link this crop to mapped beds in Plantings to calculate per-square-foot results."}</p>
            <p>{item.costPerUnit ? `${money(item.costPerUnit.value)} direct crop expense per ${item.costPerUnit.unit}.` : item.quantities.size > 1 ? "Mixed harvest units are intentionally not converted into a single cost-per-unit number." : "Record harvest quantity and direct crop expenses to calculate cost per unit."}</p>
            <p>{item.yieldPerSqFt ? `${item.yieldPerSqFt.value.toFixed(2)} ${item.yieldPerSqFt.unit}/ft² recorded yield.` : "Yield per ft² needs one harvest unit plus mapped bed area."}</p>
          </div>
        </article>)}</div> : <div className="farm-empty">No crop-tagged harvest sales or expenses are available for this season filter.</div>}
        {strongest ? <div className="farm-tools-note" style={{ marginTop: 18 }}><strong>Strongest recorded margin:</strong> {strongest.crop} at {money(strongest.margin)}.{lowest ? ` Lowest recorded margin in this view: ${lowest.crop} at ${money(lowest.margin)}.` : ""}</div> : null}
      </section>

      <section className="farm-panel" aria-labelledby="season-comparison-heading">
        <span className="eyebrow">Season comparison</span>
        <h2 id="season-comparison-heading">Compare recorded crop economics by year.</h2>
        {seasons.length ? <div className="farm-record-list">{seasons.map((item) => <article className="farm-record" key={item.season}><div><div className="farm-record-meta">{item.crops} crop{item.crops === 1 ? "" : "s"} with tagged economics</div><h3>{item.season}</h3><p>{money(item.sales)} recorded sales · {money(item.directExpenses)} direct crop expenses · <strong>{money(item.margin)} recorded crop margin</strong>.</p></div></article>)}</div> : <div className="farm-empty">No dated crop economics are available for a season comparison yet.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-records">Improve Records</Link><Link className="farm-action secondary" href="/plantings">Link Plantings & Beds</Link><Link className="farm-action secondary" href="/farm-analytics">Open Farm Analytics</Link><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link></div>
    </div>
  );
}
