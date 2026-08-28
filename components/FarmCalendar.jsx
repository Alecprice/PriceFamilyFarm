"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-calendar-v1";
const MAX_ITEMS = 1_000;
const MAX_STORAGE_BYTES = 1_000_000;
const CATEGORIES = new Set(["Planting", "Harvest", "Maintenance", "Market", "Funding", "Weather", "Other"]);
const STATUSES = new Set(["Planned", "In progress", "Done", "Skipped"]);

function safeText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function safeDate(value) {
  const next = safeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function sanitizeItem(item, index) {
  const date = safeDate(item?.date);
  const task = safeText(item?.task, 180);
  if (!date || !task) return null;
  return {
    id: safeText(item?.id, 120) || `calendar-${Date.now()}-${index}`,
    date,
    task,
    category: CATEGORIES.has(item?.category) ? item.category : "Other",
    status: STATUSES.has(item?.status) ? item.status : "Planned",
    notes: safeText(item?.notes, 600),
  };
}

function sanitizeItems(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_ITEMS).map(sanitizeItem).filter(Boolean);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FarmCalendar() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("Open");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw.length <= MAX_STORAGE_BYTES) setItems(sanitizeItems(JSON.parse(raw)));
    } catch {
      setNotice("A saved farm calendar could not be read, so it was not loaded.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const payload = JSON.stringify(items.slice(0, MAX_ITEMS));
      if (payload.length > MAX_STORAGE_BYTES) throw new Error("calendar-too-large");
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      setNotice("This browser could not save the latest calendar change.");
    }
  }, [items, ready]);

  const summary = useMemo(() => {
    const current = today();
    const open = items.filter((item) => !["Done", "Skipped"].includes(item.status));
    const overdue = open.filter((item) => item.date < current).length;
    const next7 = new Date();
    next7.setDate(next7.getDate() + 7);
    const next7Date = next7.toISOString().slice(0, 10);
    const dueSoon = open.filter((item) => item.date >= current && item.date <= next7Date).length;
    return { total: items.length, open: open.length, overdue, dueSoon };
  }, [items]);

  const visible = useMemo(() => {
    const filtered = filter === "All" ? items : filter === "Open" ? items.filter((item) => !["Done", "Skipped"].includes(item.status)) : items.filter((item) => item.status === filter);
    return [...filtered].sort((a, b) => a.date.localeCompare(b.date));
  }, [filter, items]);

  function addItem(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const item = sanitizeItem({
      id: `calendar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: data.get("date"),
      task: data.get("task"),
      category: data.get("category"),
      status: "Planned",
      notes: data.get("notes"),
    }, items.length);
    if (!item) return;
    setItems((current) => [...current, item].slice(0, MAX_ITEMS));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
    setNotice("Farm task saved in this browser.");
  }

  function updateStatus(id, status) {
    if (!STATUSES.has(status)) return;
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  function removeItem(item) {
    if (!window.confirm(`Delete “${item.task}” from the farm calendar?`)) return;
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setNotice("Farm task deleted.");
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private browser calendar.</strong> This is a planning aid stored only on this device. Weather, funding, planting, and market dates still need to be verified against their official source when timing matters.</div>
      {notice ? <div className="farm-tools-note" role="status">{notice}</div> : null}

      <div className="farm-summary-grid" aria-label="Farm calendar summary">
        <div className="farm-summary-card"><span>Total tasks</span><b>{ready ? summary.total : "—"}</b></div>
        <div className="farm-summary-card"><span>Open tasks</span><b>{ready ? summary.open : "—"}</b></div>
        <div className="farm-summary-card"><span>Overdue open</span><b>{ready ? summary.overdue : "—"}</b></div>
        <div className="farm-summary-card"><span>Due in 7 days</span><b>{ready ? summary.dueSoon : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="farm-calendar-add-heading">
        <h2 id="farm-calendar-add-heading">Add a farm task.</h2>
        <form onSubmit={addItem}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="calendar-date">Date</label><input id="calendar-date" name="date" type="date" defaultValue={today()} required /></div>
            <div className="farm-field"><label htmlFor="calendar-category">Category</label><select id="calendar-category" name="category" defaultValue="Planting">{[...CATEGORIES].map((category) => <option key={category}>{category}</option>)}</select></div>
            <div className="farm-field wide"><label htmlFor="calendar-task">Task</label><input id="calendar-task" name="task" maxLength={180} required placeholder="Transplant fall lettuce" /></div>
            <div className="farm-field wide"><label htmlFor="calendar-notes">Notes</label><textarea id="calendar-notes" name="notes" maxLength={600} placeholder="Source, prerequisites, materials, timing notes, or follow-up." /></div>
          </div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add farm task</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="farm-calendar-list-heading">
        <h2 id="farm-calendar-list-heading">Task calendar.</h2>
        <div className="farm-field" style={{ maxWidth: 360 }}><label htmlFor="calendar-filter">Status filter</label><select id="calendar-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Open</option><option>All</option><option>Planned</option><option>In progress</option><option>Done</option><option>Skipped</option></select></div>
        {visible.length ? <div className="farm-record-list">{visible.map((item) => <article className="farm-record" key={item.id}><div><div className="farm-record-meta">{item.date} · {item.category} · {item.status}</div><h3>{item.task}</h3>{item.notes ? <p>{item.notes}</p> : null}<div className="farm-actions"><select aria-label={`Update status for ${item.task}`} value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)} style={{ minHeight: 44, border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px" }}><option>Planned</option><option>In progress</option><option>Done</option><option>Skipped</option></select></div></div><button className="farm-action danger" type="button" onClick={() => removeItem(item)} aria-label={`Delete ${item.task}`}>Delete</button></article>)}</div> : <div className="farm-empty">No farm tasks match this filter.</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link><Link className="farm-action secondary" href="/weather">Check growing conditions</Link></div>
    </div>
  );
}
