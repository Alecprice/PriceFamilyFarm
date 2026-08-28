"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-records-v2";
const MAX_RECORDS = 5_000;
const ALLOWED_STATUSES = new Set(["planned", "running", "complete", "stopped"]);

function safeText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function readExperiments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 2_000_000) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.experiments)) return [];
    return parsed.experiments.slice(0, MAX_RECORDS).map((item) => ({
      id: safeText(item?.id, 120),
      date: safeText(item?.date, 10),
      title: safeText(item?.title, 120),
      crop: safeText(item?.crop, 80),
      question: safeText(item?.question, 500),
      variable: safeText(item?.variable, 180),
      control: safeText(item?.control, 180),
      measure: safeText(item?.measure, 240),
      status: ALLOWED_STATUSES.has(item?.status) ? item.status : "planned",
      result: safeText(item?.result, 800),
    })).filter((item) => item.title && /^\d{4}-\d{2}-\d{2}$/.test(item.date));
  } catch {
    return [];
  }
}

export default function ExperimentsDashboard() {
  const [experiments, setExperiments] = useState([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("all");
  const [crop, setCrop] = useState("all");

  useEffect(() => {
    setExperiments(readExperiments());
    setReady(true);
  }, []);

  const crops = useMemo(() => [...new Set(experiments.map((item) => item.crop).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [experiments]);
  const visible = useMemo(() => experiments.filter((item) => (status === "all" || item.status === status) && (crop === "all" || item.crop === crop)), [crop, experiments, status]);
  const counts = useMemo(() => ({
    total: experiments.length,
    running: experiments.filter((item) => item.status === "running").length,
    complete: experiments.filter((item) => item.status === "complete").length,
    withoutResult: experiments.filter((item) => item.status === "complete" && !item.result).length,
  }), [experiments]);
  const recent = useMemo(() => [...visible].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20), [visible]);

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private experiment review.</strong> This page reads experiment records already saved in this browser. It never turns planned or unfinished trials into completed results.</div>

      <div className="farm-summary-grid" aria-label="Experiment summary">
        <div className="farm-summary-card"><span>Total experiments</span><b>{ready ? counts.total : "—"}</b></div>
        <div className="farm-summary-card"><span>Running</span><b>{ready ? counts.running : "—"}</b></div>
        <div className="farm-summary-card"><span>Complete</span><b>{ready ? counts.complete : "—"}</b></div>
        <div className="farm-summary-card"><span>Complete, result blank</span><b>{ready ? counts.withoutResult : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="experiment-filters-heading">
        <h2 id="experiment-filters-heading">Filter the trial log.</h2>
        <div className="farm-form-grid">
          <div className="farm-field"><label htmlFor="experiment-status-filter">Status</label><select id="experiment-status-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="planned">Planned</option><option value="running">Running</option><option value="complete">Complete</option><option value="stopped">Stopped</option></select></div>
          <div className="farm-field"><label htmlFor="experiment-crop-filter">Crop</label><select id="experiment-crop-filter" value={crop} onChange={(event) => setCrop(event.target.value)}><option value="all">All crops</option>{crops.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="experiment-list-heading">
        <h2 id="experiment-list-heading">Experiment log.</h2>
        {recent.length ? <div className="farm-record-list">{recent.map((item, index) => <article className="farm-record" key={item.id || `${item.date}-${item.title}-${index}`}><div><div className="farm-record-meta">{item.date} · {item.status}{item.crop ? ` · ${item.crop}` : ""}</div><h3>{item.title}</h3><p>{[item.question, item.variable ? `Variable: ${item.variable}` : "", item.control ? `Control: ${item.control}` : "", item.measure ? `Measure: ${item.measure}` : "", item.result ? `Result: ${item.result}` : item.status === "complete" ? "Result not recorded yet." : ""].filter(Boolean).join(" · ")}</p></div></article>)}</div> : <div className="farm-empty">No experiments match the current filters.</div>}
      </section>

      <div className="farm-actions">
        <Link className="farm-action" href="/farm-records">Log or update experiment records</Link>
        <Link className="farm-action secondary" href="/farm-analytics">Open Farm Analytics</Link>
        <Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link>
      </div>
    </div>
  );
}
