"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const STORAGE_KEY = "price-family-farm-plantings-v1";
const GARDEN_KEY = "price-family-farm-garden-layout-v1";
const RECORDS_KEY = "price-family-farm-records-v2";
const MAX_BYTES = 1_000_000;
const MAX_ITEMS = 1_000;
const STATUSES = ["Planned", "Seeded", "Transplanted", "Harvesting", "Finished"];
const HARVEST_UNITS = ["lb", "oz", "count", "bunch", "pint", "quart", "tray"];

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
  return `planting-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitize(item, index = 0) {
  const crop = text(item?.crop, 80);
  const bed = text(item?.bed, 100);
  if (!crop || !bed) return null;
  return {
    id: text(item?.id, 120) || `planting-${index}`,
    crop,
    variety: text(item?.variety, 100),
    bed,
    status: STATUSES.includes(item?.status) ? item.status : "Planned",
    seededDate: date(item?.seededDate),
    transplantDate: date(item?.transplantDate),
    plantedCount: numberString(item?.plantedCount),
    spacingInches: numberString(item?.spacingInches, 1_000),
    harvestStart: date(item?.harvestStart),
    harvestEnd: date(item?.harvestEnd),
    nextSuccessionDate: date(item?.nextSuccessionDate),
    notes: text(item?.notes, 600),
  };
}

function readArray(key, maxBytes = MAX_BYTES, maxItems = MAX_ITEMS) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  if (raw.length > maxBytes) throw new Error("store-too-large");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("invalid-store");
  return parsed.slice(0, maxItems);
}

function writeItems(items) {
  const payload = JSON.stringify(items.slice(0, MAX_ITEMS));
  if (payload.length > MAX_BYTES) throw new Error("store-too-large");
  localStorage.setItem(STORAGE_KEY, payload);
}

function readGardenBeds() {
  return readArray(GARDEN_KEY, 500_000, 100).map((item) => ({
    name: text(item?.name, 80),
    length: Number(item?.length),
    width: Number(item?.width),
  })).filter((item) => item.name && Number.isFinite(item.length) && Number.isFinite(item.width) && item.length > 0 && item.width > 0);
}

function readHarvests() {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw || raw.length > 2_000_000) return [];
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Array.isArray(parsed.harvests)) return [];
  return parsed.harvests.slice(0, 5_000).map((item) => ({
    crop: text(item?.crop, 80),
    variety: text(item?.variety, 100),
    location: text(item?.location, 100),
    quantity: Number(item?.quantity),
    unit: HARVEST_UNITS.includes(item?.unit) ? item.unit : text(item?.unit, 20),
  })).filter((item) => item.crop && Number.isFinite(item.quantity) && item.quantity >= 0);
}

function harvestSummary(harvests, planting) {
  const linked = harvests.filter((item) => item.crop.toLowerCase() === planting.crop.toLowerCase()
    && (!planting.variety || !item.variety || item.variety.toLowerCase() === planting.variety.toLowerCase())
    && item.location.toLowerCase() === planting.bed.toLowerCase());
  const byUnit = new Map();
  linked.forEach((item) => byUnit.set(item.unit || "units", (byUnit.get(item.unit || "units") || 0) + item.quantity));
  return {
    entries: linked.length,
    quantities: [...byUnit.entries()].map(([unit, quantity]) => `${quantity} ${unit}`).join(" + "),
  };
}

export default function PlantingTracker() {
  const [plantings, setPlantings] = useState([]);
  const [beds, setBeds] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setPlantings(readArray(STORAGE_KEY).map(sanitize).filter(Boolean));
      setBeds(readGardenBeds());
      setHarvests(readHarvests());
    } catch {
      setStatus("One or more browser-local planting sources could not be read safely. Make a Farm OS backup before replacing affected data.");
    } finally {
      setReady(true);
    }
  }, []);

  const summary = useMemo(() => {
    const today = localDay();
    const successionEnd = localDayPlus(14);
    const active = plantings.filter((item) => item.status !== "Finished");
    const successionDue = active.filter((item) => item.nextSuccessionDate && item.nextSuccessionDate >= today && item.nextSuccessionDate <= successionEnd);
    const uniqueBeds = new Set(active.map((item) => item.bed.toLowerCase()));
    return { active: active.length, successionDue: successionDue.length, beds: uniqueBeds.size };
  }, [plantings]);

  function persist(next, message) {
    try {
      writeItems(next);
      setPlantings(next);
      setStatus(message);
    } catch {
      setStatus("Planting tracker could not be updated safely. Make a Farm OS backup before trying again.");
    }
  }

  function addPlanting(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const entry = sanitize({
      id: makeId(),
      crop: data.get("crop"),
      variety: data.get("variety"),
      bed: data.get("bed"),
      status: data.get("status"),
      seededDate: data.get("seededDate"),
      transplantDate: data.get("transplantDate"),
      plantedCount: data.get("plantedCount"),
      spacingInches: data.get("spacingInches"),
      harvestStart: data.get("harvestStart"),
      harvestEnd: data.get("harvestEnd"),
      nextSuccessionDate: data.get("nextSuccessionDate"),
      notes: data.get("notes"),
    });
    if (!entry) {
      setStatus("Add a crop and bed/area before saving a planting.");
      return;
    }
    if (plantings.length >= MAX_ITEMS) {
      setStatus("Planting tracker has reached its 1,000-entry local safety limit.");
      return;
    }
    persist([entry, ...plantings], `${entry.crop} planting saved for ${entry.bed}.`);
    form.reset();
  }

  function updateStatus(id, nextStatus) {
    const current = plantings.find((item) => item.id === id);
    if (!current || !STATUSES.includes(nextStatus)) return;
    persist(plantings.map((item) => item.id === id ? { ...item, status: nextStatus } : item), `${current.crop} in ${current.bed} marked ${nextStatus}.`);
  }

  function remove(id) {
    const current = plantings.find((item) => item.id === id);
    if (!current) return;
    if (!window.confirm(`Delete the ${current.crop} planting in ${current.bed}?`)) return;
    persist(plantings.filter((item) => item.id !== id), `${current.crop} planting deleted.`);
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private production tracker.</strong> Planting dates, bed names, spacing, succession dates, and linked harvest summaries stay in this browser. Harvest totals are only linked when Farm Records uses the same crop and location/bed name.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="farm-summary-grid" aria-label="Planting tracker summary">
        <div className="farm-summary-card"><span>Active plantings</span><b>{ready ? summary.active : "—"}</b></div>
        <div className="farm-summary-card"><span>Growing areas in use</span><b>{ready ? summary.beds : "—"}</b></div>
        <div className="farm-summary-card"><span>Succession due next 14 days</span><b>{ready ? summary.successionDue : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="planting-add-heading">
        <span className="eyebrow">Production plan</span>
        <h2 id="planting-add-heading">Add a planting or succession.</h2>
        <form className="farm-form" onSubmit={addPlanting}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="planting-crop">Crop</label><input id="planting-crop" name="crop" maxLength={80} required /></div>
            <div className="farm-field"><label htmlFor="planting-variety">Variety</label><input id="planting-variety" name="variety" maxLength={100} /></div>
            <div className="farm-field"><label htmlFor="planting-bed">Bed / area</label><input id="planting-bed" name="bed" maxLength={100} required list="planting-bed-options" /><datalist id="planting-bed-options">{beds.map((bed) => <option value={bed.name} key={bed.name} />)}</datalist></div>
            <div className="farm-field"><label htmlFor="planting-status">Status</label><select id="planting-status" name="status" defaultValue="Planned">{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="planting-seeded">Seeded date</label><input id="planting-seeded" name="seededDate" type="date" /></div>
            <div className="farm-field"><label htmlFor="planting-transplant">Transplant date</label><input id="planting-transplant" name="transplantDate" type="date" /></div>
            <div className="farm-field"><label htmlFor="planting-count">Number planted</label><input id="planting-count" name="plantedCount" type="number" min="0" step="1" /></div>
            <div className="farm-field"><label htmlFor="planting-spacing">Spacing (inches)</label><input id="planting-spacing" name="spacingInches" type="number" min="0" step="0.25" /></div>
            <div className="farm-field"><label htmlFor="planting-harvest-start">Expected harvest start</label><input id="planting-harvest-start" name="harvestStart" type="date" /></div>
            <div className="farm-field"><label htmlFor="planting-harvest-end">Expected harvest end</label><input id="planting-harvest-end" name="harvestEnd" type="date" /></div>
            <div className="farm-field"><label htmlFor="planting-succession">Next succession date</label><input id="planting-succession" name="nextSuccessionDate" type="date" /></div>
          </div>
          <div className="farm-field"><label htmlFor="planting-notes">Notes</label><textarea id="planting-notes" name="notes" maxLength={600} rows={3} /></div>
          <div className="farm-actions"><button className="farm-action" type="submit">Save planting</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="planting-list-heading">
        <span className="eyebrow">Planting board</span>
        <h2 id="planting-list-heading">Connect timing, space, and actual harvest records.</h2>
        {plantings.length ? <div className="farm-record-list">{plantings.map((item) => {
          const bed = beds.find((candidate) => candidate.name.toLowerCase() === item.bed.toLowerCase());
          const linked = harvestSummary(harvests, item);
          return <article className="farm-record" key={item.id}>
            <div>
              <div className="farm-record-meta">{item.status} · {item.bed}{bed ? ` · ${Math.round(bed.length * bed.width)} ft² mapped` : ""}</div>
              <h3>{item.crop}{item.variety ? ` · ${item.variety}` : ""}</h3>
              <p>{item.seededDate ? `Seeded ${item.seededDate}. ` : ""}{item.transplantDate ? `Transplant ${item.transplantDate}. ` : ""}{item.plantedCount ? `${item.plantedCount} planted. ` : ""}{item.spacingInches ? `${item.spacingInches} in spacing.` : ""}</p>
              <p>{item.harvestStart || item.harvestEnd ? `Expected harvest ${item.harvestStart || "?"} to ${item.harvestEnd || "?"}.` : "No expected harvest window saved."}</p>
              <p>{item.nextSuccessionDate ? `Next succession: ${item.nextSuccessionDate}.` : "No next succession date saved."}</p>
              <p>{linked.entries ? `${linked.entries} linked Farm Records harvest entr${linked.entries === 1 ? "y" : "ies"}${linked.quantities ? ` · ${linked.quantities}` : ""}.` : "No Farm Records harvests currently link to this exact crop + bed name."}</p>
              {item.notes ? <p>{item.notes}</p> : null}
            </div>
            <div className="farm-actions" aria-label={`Actions for ${item.crop} in ${item.bed}`}>
              <select aria-label={`Status for ${item.crop} in ${item.bed}`} value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>{STATUSES.map((option) => <option key={option}>{option}</option>)}</select>
              <button className="farm-action danger" type="button" onClick={() => remove(item.id)}>Delete</button>
            </div>
          </article>;
        })}</div> : <div className="farm-empty">No plantings are saved in this browser yet.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/learn/garden-layout-builder">Open Garden Layout</Link><Link className="farm-action secondary" href="/farm-records">Open Farm Records</Link><Link className="farm-action secondary" href="/farm-planner">Open Farm Planner</Link></div>
    </div>
  );
}
