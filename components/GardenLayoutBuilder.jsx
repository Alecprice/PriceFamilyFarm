"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-garden-layout-v1";
const MAX_BEDS = 100;
const MAX_STORAGE_BYTES = 500_000;

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function dimension(value) {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 && next <= 500 ? String(next) : "";
}

function sanitizeBed(item, index) {
  const name = text(item?.name, 80);
  const length = dimension(item?.length);
  const width = dimension(item?.width);
  if (!name || !length || !width) return null;
  return {
    id: text(item?.id, 120) || `bed-${Date.now()}-${index}`,
    name,
    length,
    width,
    crop: text(item?.crop, 120),
    notes: text(item?.notes, 400),
  };
}

function sanitizeBeds(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_BEDS).map(sanitizeBed).filter(Boolean);
}

export default function GardenLayoutBuilder() {
  const [beds, setBeds] = useState([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw.length <= MAX_STORAGE_BYTES) setBeds(sanitizeBeds(JSON.parse(raw)));
    } catch {
      setNotice("A saved garden layout could not be read, so it was not loaded.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const payload = JSON.stringify(beds.slice(0, MAX_BEDS));
      if (payload.length > MAX_STORAGE_BYTES) throw new Error("layout-too-large");
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      setNotice("This browser could not save the latest garden layout change.");
    }
  }, [beds, ready]);

  const summary = useMemo(() => ({
    beds: beds.length,
    area: beds.reduce((sum, bed) => sum + Number(bed.length) * Number(bed.width), 0),
    planted: beds.filter((bed) => bed.crop).length,
  }), [beds]);

  function addBed(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const bed = sanitizeBed({
      id: `bed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.get("name"),
      length: data.get("length"),
      width: data.get("width"),
      crop: data.get("crop"),
      notes: data.get("notes"),
    }, beds.length);
    if (!bed) return;
    setBeds((current) => [...current, bed].slice(0, MAX_BEDS));
    event.currentTarget.reset();
    setNotice("Garden bed saved in this browser.");
  }

  function removeBed(bed) {
    if (!window.confirm(`Delete garden bed “${bed.name}”?`)) return;
    setBeds((current) => current.filter((item) => item.id !== bed.id));
    setNotice("Garden bed deleted.");
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Browser-local planning tool.</strong> This builder estimates bed area from the dimensions you enter. It does not know your soil, sun, slope, irrigation, crop spacing, setbacks, or property boundaries, so verify those separately.</div>
      {notice ? <div className="farm-tools-note" role="status">{notice}</div> : null}

      <div className="farm-summary-grid" aria-label="Garden layout summary">
        <div className="farm-summary-card"><span>Garden beds</span><b>{ready ? summary.beds : "—"}</b></div>
        <div className="farm-summary-card"><span>Recorded bed area</span><b>{ready ? `${summary.area.toLocaleString()} ft²` : "—"}</b></div>
        <div className="farm-summary-card"><span>Beds with crop/use</span><b>{ready ? summary.planted : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="layout-add-heading">
        <h2 id="layout-add-heading">Add a garden bed or growing block.</h2>
        <form onSubmit={addBed}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="layout-name">Bed name</label><input id="layout-name" name="name" maxLength={80} required placeholder="Bed A" /></div>
            <div className="farm-field"><label htmlFor="layout-length">Length (ft)</label><input id="layout-length" name="length" type="number" min="0.1" max="500" step="0.1" required /></div>
            <div className="farm-field"><label htmlFor="layout-width">Width (ft)</label><input id="layout-width" name="width" type="number" min="0.1" max="500" step="0.1" required /></div>
            <div className="farm-field"><label htmlFor="layout-crop">Crop / use</label><input id="layout-crop" name="crop" maxLength={120} placeholder="Tomatoes and basil" /></div>
            <div className="farm-field wide"><label htmlFor="layout-notes">Notes</label><textarea id="layout-notes" name="notes" maxLength={400} placeholder="Rotation, trellis, access, irrigation, or amendment notes." /></div>
          </div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add garden bed</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="layout-preview-heading">
        <h2 id="layout-preview-heading">Layout board.</h2>
        <p>The cards show relative bed proportions only; they are not a survey or exact site plan.</p>
        {beds.length ? (
          <div className="farm-summary-grid" aria-label="Garden layout beds">
            {beds.map((bed) => {
              const ratio = Math.max(0.5, Math.min(3, Number(bed.length) / Number(bed.width)));
              const area = Number(bed.length) * Number(bed.width);
              return (
                <article className="farm-summary-card" key={bed.id}>
                  <div aria-hidden="true" style={{ width: "100%", maxWidth: 240, aspectRatio: ratio, border: "2px solid var(--line)", borderRadius: 8, background: "var(--paper, #fff)" }} />
                  <span>{bed.length} ft × {bed.width} ft · {area.toLocaleString()} ft²</span>
                  <b style={{ fontSize: "1.05rem" }}>{bed.name}</b>
                  {bed.crop ? <p>{bed.crop}</p> : <p>No crop/use assigned yet.</p>}
                  {bed.notes ? <p>{bed.notes}</p> : null}
                  <div className="farm-actions"><button className="farm-action danger" type="button" onClick={() => removeBed(bed)} aria-label={`Delete ${bed.name}`}>Delete</button></div>
                </article>
              );
            })}
          </div>
        ) : <div className="farm-empty">No garden beds saved yet.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/growing-guide">Open Growing Guide</Link><Link className="farm-action secondary" href="/farm-planner">Open Farm Planner</Link></div>
    </div>
  );
}
