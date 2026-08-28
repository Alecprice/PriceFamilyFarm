"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const SOURCES = {
  records: { key: "price-family-farm-records-v2", max: 2_000_000 },
  journal: { key: "price-family-farm-journal-v1", max: 1_000_000 },
  calendar: { key: "price-family-farm-calendar-v1", max: 1_000_000 },
};
const TYPES = ["All", "Harvest", "Experiment", "Expense", "Journal", "Task"];

function text(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function readJson(key, max) {
  const raw = localStorage.getItem(key);
  if (!raw || raw.length > max) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function money(value) {
  if (value === "" || value == null) return "";
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function buildEvents() {
  const events = [];
  const records = readJson(SOURCES.records.key, SOURCES.records.max);
  const journal = readJson(SOURCES.journal.key, SOURCES.journal.max);
  const calendar = readJson(SOURCES.calendar.key, SOURCES.calendar.max);

  for (const item of Array.isArray(records?.harvests) ? records.harvests.slice(0, 5_000) : []) {
    const eventDate = date(item?.date);
    const crop = text(item?.crop, 80);
    if (!eventDate || !crop) continue;
    const quantity = Number(item?.quantity);
    const unit = text(item?.unit, 20);
    const amount = money(item?.saleAmount);
    const detail = [Number.isFinite(quantity) && quantity >= 0 ? `${quantity} ${unit}`.trim() : "", text(item?.destination, 40), amount].filter(Boolean).join(" · ");
    events.push({ id: `harvest-${text(item?.id, 120)}-${eventDate}-${events.length}`, date: eventDate, type: "Harvest", title: text(item?.variety, 100) ? `${crop} · ${text(item.variety, 100)}` : crop, detail, note: text(item?.notes, 500), href: "/farm-records" });
  }

  for (const item of Array.isArray(records?.experiments) ? records.experiments.slice(0, 5_000) : []) {
    const eventDate = date(item?.date);
    const title = text(item?.title, 120);
    if (!eventDate || !title) continue;
    const status = text(item?.status, 30);
    const result = text(item?.result, 500);
    events.push({ id: `experiment-${text(item?.id, 120)}-${eventDate}-${events.length}`, date: eventDate, type: "Experiment", title, detail: [text(item?.crop, 80), status].filter(Boolean).join(" · "), note: result || text(item?.question, 500), href: "/experiments" });
  }

  for (const item of Array.isArray(records?.expenses) ? records.expenses.slice(0, 5_000) : []) {
    const eventDate = date(item?.date);
    const title = text(item?.description, 160);
    if (!eventDate || !title) continue;
    events.push({ id: `expense-${text(item?.id, 120)}-${eventDate}-${events.length}`, date: eventDate, type: "Expense", title, detail: [text(item?.category, 50), text(item?.crop, 80), money(item?.amount)].filter(Boolean).join(" · "), note: text(item?.notes, 300), href: "/farm-records" });
  }

  for (const item of Array.isArray(journal) ? journal.slice(0, 1_000) : []) {
    const eventDate = date(item?.date);
    const title = text(item?.title, 160);
    if (!eventDate || !title) continue;
    events.push({ id: `journal-${text(item?.id, 120)}-${eventDate}-${events.length}`, date: eventDate, type: "Journal", title, detail: text(item?.category, 50), note: text(item?.body, 800), href: "/farm-journal" });
  }

  for (const item of Array.isArray(calendar) ? calendar.slice(0, 1_000) : []) {
    const eventDate = date(item?.date);
    const title = text(item?.task, 180);
    if (!eventDate || !title) continue;
    events.push({ id: `task-${text(item?.id, 120)}-${eventDate}-${events.length}`, date: eventDate, type: "Task", title, detail: [text(item?.category, 50), text(item?.status, 40)].filter(Boolean).join(" · "), note: text(item?.notes, 600), href: "/farm-calendar" });
  }

  return events.sort((a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type));
}

export default function SeasonTimeline() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEvents(buildEvents());
    setReady(true);
  }, []);

  const visible = useMemo(() => filter === "All" ? events : events.filter((item) => item.type === filter), [events, filter]);
  const counts = useMemo(() => ({
    total: events.length,
    harvests: events.filter((item) => item.type === "Harvest").length,
    tasks: events.filter((item) => item.type === "Task").length,
    journals: events.filter((item) => item.type === "Journal").length,
  }), [events]);

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private browser timeline.</strong> This page only reads Farm OS data already stored in this browser. It does not upload, edit, or publish those records.</div>

      <div className="farm-summary-grid" aria-label="Season timeline summary">
        <div className="farm-summary-card"><span>Timeline events</span><b>{ready ? counts.total : "—"}</b></div>
        <div className="farm-summary-card"><span>Harvest entries</span><b>{ready ? counts.harvests : "—"}</b></div>
        <div className="farm-summary-card"><span>Calendar tasks</span><b>{ready ? counts.tasks : "—"}</b></div>
        <div className="farm-summary-card"><span>Journal notes</span><b>{ready ? counts.journals : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">Season activity timeline.</h2>
        <div className="farm-field" style={{ maxWidth: 360 }}>
          <label htmlFor="timeline-filter">Event type</label>
          <select id="timeline-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>

        {visible.length ? (
          <div className="farm-record-list">
            {visible.map((item) => (
              <article className="farm-record" key={item.id}>
                <div>
                  <div className="farm-record-meta">{item.date} · {item.type}{item.detail ? ` · ${item.detail}` : ""}</div>
                  <h3>{item.title}</h3>
                  {item.note ? <p>{item.note}</p> : null}
                  <div className="farm-actions"><Link className="farm-action secondary" href={item.href}>Open source records</Link></div>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="farm-empty">No timeline events match this filter.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link><Link className="farm-action secondary" href="/farm-records">Add farm records</Link></div>
    </div>
  );
}
