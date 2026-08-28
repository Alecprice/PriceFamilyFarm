"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-planner-v1";
const MAX_PLANS = 500;
const MAX_STORAGE_BYTES = 1_000_000;
const METHODS = new Set(["Direct sow", "Transplant", "Perennial", "Other"]);
const STATUSES = new Set(["Planned", "Started", "Transplanted", "Harvesting", "Complete", "Paused"]);

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function sanitizePlan(item, index) {
  const crop = text(item?.crop, 80);
  if (!crop) return null;
  return {
    id: text(item?.id, 120) || `plan-${Date.now()}-${index}`,
    crop,
    variety: text(item?.variety, 100),
    space: text(item?.space, 100),
    method: METHODS.has(item?.method) ? item.method : "Other",
    status: STATUSES.has(item?.status) ? item.status : "Planned",
    sowDate: date(item?.sowDate),
    transplantDate: date(item?.transplantDate),
    targetHarvestDate: date(item?.targetHarvestDate),
    notes: text(item?.notes, 600),
  };
}

function sanitizePlans(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_PLANS).map(sanitizePlan).filter(Boolean);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextActionDate(plan) {
  const dates = [plan.sowDate, plan.transplantDate, plan.targetHarvestDate].filter(Boolean).sort();
  const current = today();
  return dates.find((value) => value >= current) || dates.at(-1) || "";
}

export default function FarmPlanner() {
  const [plans, setPlans] = useState([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("Active");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw.length <= MAX_STORAGE_BYTES) setPlans(sanitizePlans(JSON.parse(raw)));
    } catch {
      setNotice("A saved farm plan could not be read, so it was not loaded.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const payload = JSON.stringify(plans.slice(0, MAX_PLANS));
      if (payload.length > MAX_STORAGE_BYTES) throw new Error("planner-too-large");
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      setNotice("This browser could not save the latest farm plan change.");
    }
  }, [plans, ready]);

  const summary = useMemo(() => {
    const active = plans.filter((plan) => !["Complete", "Paused"].includes(plan.status));
    const current = today();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const horizonDate = horizon.toISOString().slice(0, 10);
    const next14 = active.filter((plan) => {
      const actionDate = nextActionDate(plan);
      return actionDate && actionDate >= current && actionDate <= horizonDate;
    }).length;
    return {
      total: plans.length,
      active: active.length,
      harvesting: plans.filter((plan) => plan.status === "Harvesting").length,
      next14,
    };
  }, [plans]);

  const visible = useMemo(() => {
    const filtered = filter === "All" ? plans : filter === "Active" ? plans.filter((plan) => !["Complete", "Paused"].includes(plan.status)) : plans.filter((plan) => plan.status === filter);
    return [...filtered].sort((a, b) => nextActionDate(a).localeCompare(nextActionDate(b)) || a.crop.localeCompare(b.crop));
  }, [filter, plans]);

  function addPlan(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const plan = sanitizePlan({
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      crop: data.get("crop"),
      variety: data.get("variety"),
      space: data.get("space"),
      method: data.get("method"),
      status: "Planned",
      sowDate: data.get("sowDate"),
      transplantDate: data.get("transplantDate"),
      targetHarvestDate: data.get("targetHarvestDate"),
      notes: data.get("notes"),
    }, plans.length);
    if (!plan) return;
    setPlans((current) => [...current, plan].slice(0, MAX_PLANS));
    event.currentTarget.reset();
    setNotice("Crop plan saved in this browser.");
  }

  function updateStatus(id, status) {
    if (!STATUSES.has(status)) return;
    setPlans((current) => current.map((plan) => plan.id === id ? { ...plan, status } : plan));
  }

  function removePlan(plan) {
    if (!window.confirm(`Delete crop plan “${plan.crop}${plan.variety ? ` · ${plan.variety}` : ""}”?`)) return;
    setPlans((current) => current.filter((item) => item.id !== plan.id));
    setNotice("Crop plan deleted.");
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private browser planner.</strong> Dates here are your working plan, not guaranteed agronomic, weather, market, or funding deadlines. Verify important timing with the appropriate source before acting.</div>
      {notice ? <div className="farm-tools-note" role="status">{notice}</div> : null}

      <div className="farm-summary-grid" aria-label="Farm planner summary">
        <div className="farm-summary-card"><span>Crop plans</span><b>{ready ? summary.total : "—"}</b></div>
        <div className="farm-summary-card"><span>Active plans</span><b>{ready ? summary.active : "—"}</b></div>
        <div className="farm-summary-card"><span>Harvesting</span><b>{ready ? summary.harvesting : "—"}</b></div>
        <div className="farm-summary-card"><span>Actions in 14 days</span><b>{ready ? summary.next14 : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="farm-planner-add-heading">
        <h2 id="farm-planner-add-heading">Add a crop plan.</h2>
        <form onSubmit={addPlan}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="planner-crop">Crop</label><input id="planner-crop" name="crop" maxLength={80} required placeholder="Tomato" /></div>
            <div className="farm-field"><label htmlFor="planner-variety">Variety</label><input id="planner-variety" name="variety" maxLength={100} placeholder="Cherokee Purple" /></div>
            <div className="farm-field"><label htmlFor="planner-space">Bed / space</label><input id="planner-space" name="space" maxLength={100} placeholder="Bed A" /></div>
            <div className="farm-field"><label htmlFor="planner-method">Method</label><select id="planner-method" name="method" defaultValue="Transplant">{[...METHODS].map((method) => <option key={method}>{method}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="planner-sow-date">Sow / start date</label><input id="planner-sow-date" name="sowDate" type="date" /></div>
            <div className="farm-field"><label htmlFor="planner-transplant-date">Transplant date</label><input id="planner-transplant-date" name="transplantDate" type="date" /></div>
            <div className="farm-field"><label htmlFor="planner-harvest-date">Target harvest date</label><input id="planner-harvest-date" name="targetHarvestDate" type="date" /></div>
            <div className="farm-field wide"><label htmlFor="planner-notes">Notes</label><textarea id="planner-notes" name="notes" maxLength={600} placeholder="Succession timing, spacing, source, trellis, fertility, or harvest goals." /></div>
          </div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add crop plan</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="farm-planner-list-heading">
        <h2 id="farm-planner-list-heading">Crop plan board.</h2>
        <div className="farm-field" style={{ maxWidth: 360 }}><label htmlFor="planner-filter">Status filter</label><select id="planner-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Active</option><option>All</option>{[...STATUSES].map((status) => <option key={status}>{status}</option>)}</select></div>
        {visible.length ? <div className="farm-record-list">{visible.map((plan) => <article className="farm-record" key={plan.id}><div><div className="farm-record-meta">{plan.method} · {plan.status}{plan.space ? ` · ${plan.space}` : ""}</div><h3>{plan.crop}{plan.variety ? ` · ${plan.variety}` : ""}</h3><p>{[plan.sowDate ? `Start ${plan.sowDate}` : "", plan.transplantDate ? `Transplant ${plan.transplantDate}` : "", plan.targetHarvestDate ? `Harvest target ${plan.targetHarvestDate}` : ""].filter(Boolean).join(" · ") || "No dates recorded yet."}</p>{plan.notes ? <p>{plan.notes}</p> : null}<div className="farm-actions"><select aria-label={`Update status for ${plan.crop}${plan.variety ? ` ${plan.variety}` : ""}`} value={plan.status} onChange={(event) => updateStatus(plan.id, event.target.value)} style={{ minHeight: 44, border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px" }}>{[...STATUSES].map((status) => <option key={status}>{status}</option>)}</select></div></div><button className="farm-action danger" type="button" onClick={() => removePlan(plan)} aria-label={`Delete ${plan.crop}${plan.variety ? ` ${plan.variety}` : ""}`}>Delete</button></article>)}</div> : <div className="farm-empty">No crop plans match this filter.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-calendar">Open Farm Calendar</Link><Link className="farm-action secondary" href="/weather">Check growing conditions</Link><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link></div>
    </div>
  );
}
