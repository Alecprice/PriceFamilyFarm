"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-map-v1";
const MAX_ZONES = 100;
const MAX_STORAGE_BYTES = 500_000;
const TYPES = new Set(["Garden bed", "High tunnel", "Nursery", "Orchard", "Compost", "Storage", "Water", "Wildlife buffer", "Other"]);
const STATUSES = new Set(["Active", "Planned", "Resting", "Needs work"]);

function safeText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function safeArea(value) {
  if (value === "" || value == null) return "";
  const area = Number(value);
  return Number.isFinite(area) && area >= 0 && area <= 1_000_000 ? String(area) : "";
}

function sanitizeZone(item, index) {
  const name = safeText(item?.name, 100);
  if (!name) return null;
  return {
    id: safeText(item?.id, 120) || `zone-${Date.now()}-${index}`,
    name,
    type: TYPES.has(item?.type) ? item.type : "Other",
    status: STATUSES.has(item?.status) ? item.status : "Planned",
    areaSqFt: safeArea(item?.areaSqFt),
    use: safeText(item?.use, 140),
    notes: safeText(item?.notes, 500),
  };
}

function sanitizeZones(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_ZONES).map(sanitizeZone).filter(Boolean);
}

export default function FarmMapPlanner() {
  const [zones, setZones] = useState([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw.length <= MAX_STORAGE_BYTES) setZones(sanitizeZones(JSON.parse(raw)));
    } catch {
      setNotice("A saved schematic farm map could not be read, so it was not loaded.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const payload = JSON.stringify(zones.slice(0, MAX_ZONES));
      if (payload.length > MAX_STORAGE_BYTES) throw new Error("farm-map-too-large");
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      setNotice("This browser could not save the latest map change.");
    }
  }, [zones, ready]);

  const summary = useMemo(() => ({
    total: zones.length,
    active: zones.filter((zone) => zone.status === "Active").length,
    needsWork: zones.filter((zone) => zone.status === "Needs work").length,
    area: zones.reduce((sum, zone) => sum + Number(zone.areaSqFt || 0), 0),
  }), [zones]);

  function addZone(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const zone = sanitizeZone({
      id: `zone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.get("name"),
      type: data.get("type"),
      status: data.get("status"),
      areaSqFt: data.get("areaSqFt"),
      use: data.get("use"),
      notes: data.get("notes"),
    }, zones.length);
    if (!zone) return;
    setZones((current) => [...current, zone].slice(0, MAX_ZONES));
    event.currentTarget.reset();
    setNotice("Farm zone saved in this browser.");
  }

  function updateStatus(id, status) {
    if (!STATUSES.has(status)) return;
    setZones((current) => current.map((zone) => zone.id === id ? { ...zone, status } : zone));
  }

  function removeZone(zone) {
    if (!window.confirm(`Delete schematic zone “${zone.name}”?`)) return;
    setZones((current) => current.filter((item) => item.id !== zone.id));
    setNotice("Farm zone deleted.");
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Privacy-safe schematic only.</strong> This tool stores zone names and notes in this browser. It does not collect GPS coordinates, street addresses, parcel boundaries, or an exact property map.</div>
      {notice ? <div className="farm-tools-note" role="status">{notice}</div> : null}

      <div className="farm-summary-grid" aria-label="Farm map summary">
        <div className="farm-summary-card"><span>Zones</span><b>{ready ? summary.total : "—"}</b></div>
        <div className="farm-summary-card"><span>Active</span><b>{ready ? summary.active : "—"}</b></div>
        <div className="farm-summary-card"><span>Needs work</span><b>{ready ? summary.needsWork : "—"}</b></div>
        <div className="farm-summary-card"><span>Recorded area</span><b>{ready ? `${summary.area.toLocaleString()} ft²` : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="farm-map-add-heading">
        <h2 id="farm-map-add-heading">Add a schematic farm zone.</h2>
        <form onSubmit={addZone}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="map-zone-name">Zone name</label><input id="map-zone-name" name="name" maxLength={100} required placeholder="North garden beds" /></div>
            <div className="farm-field"><label htmlFor="map-zone-type">Zone type</label><select id="map-zone-type" name="type" defaultValue="Garden bed">{[...TYPES].map((type) => <option key={type}>{type}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="map-zone-status">Status</label><select id="map-zone-status" name="status" defaultValue="Active">{[...STATUSES].map((status) => <option key={status}>{status}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="map-zone-area">Area (ft², optional)</label><input id="map-zone-area" name="areaSqFt" type="number" min="0" max="1000000" step="0.1" /></div>
            <div className="farm-field wide"><label htmlFor="map-zone-use">Crop or use</label><input id="map-zone-use" name="use" maxLength={140} placeholder="Tomatoes, peppers, and basil" /></div>
            <div className="farm-field wide"><label htmlFor="map-zone-notes">Notes</label><textarea id="map-zone-notes" name="notes" maxLength={500} placeholder="Irrigation, rotation, soil, access, or maintenance notes." /></div>
          </div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add farm zone</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="farm-map-zones-heading">
        <h2 id="farm-map-zones-heading">Schematic zone map.</h2>
        <p>Cards are intentionally non-geographic. Use names that are meaningful to you without exposing an exact property layout.</p>
        {zones.length ? (
          <div className="farm-summary-grid" aria-label="Schematic farm zones">
            {zones.map((zone) => (
              <article className="farm-summary-card" key={zone.id}>
                <span>{zone.type} · {zone.status}</span>
                <b style={{ fontSize: "1.05rem" }}>{zone.name}</b>
                {zone.use ? <p>{zone.use}</p> : null}
                {zone.areaSqFt ? <p>{Number(zone.areaSqFt).toLocaleString()} ft² recorded</p> : null}
                {zone.notes ? <p>{zone.notes}</p> : null}
                <div className="farm-actions">
                  <select aria-label={`Update status for ${zone.name}`} value={zone.status} onChange={(event) => updateStatus(zone.id, event.target.value)} style={{ minHeight: 44, border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px" }}>{[...STATUSES].map((status) => <option key={status}>{status}</option>)}</select>
                  <button className="farm-action danger" type="button" onClick={() => removeZone(zone)} aria-label={`Delete ${zone.name}`}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="farm-empty">No schematic farm zones saved yet.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link><Link className="farm-action secondary" href="/farm-os/planner">Open Farm Planner</Link></div>
    </div>
  );
}
