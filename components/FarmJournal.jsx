"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay } from "@/lib/localDate";

const STORAGE_KEY = "price-family-farm-journal-v1";
const MAX_ENTRIES = 1_000;
const MAX_STORAGE_BYTES = 1_000_000;
const CATEGORIES = new Set(["Field note", "Weather observation", "Market", "Maintenance", "Planning", "Other"]);

function safeText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function safeDate(value) {
  const next = safeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function sanitizeEntry(item, index) {
  const date = safeDate(item?.date);
  const title = safeText(item?.title, 120);
  const body = safeText(item?.body, 2_000);
  if (!date || !title || !body) return null;
  return {
    id: safeText(item?.id, 120) || `journal-${Date.now()}-${index}`,
    date,
    title,
    category: CATEGORIES.has(item?.category) ? item.category : "Other",
    body,
  };
}

function sanitizeEntries(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_ENTRIES).map(sanitizeEntry).filter(Boolean);
}

function downloadJson(entries) {
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `price-family-farm-journal-${localDay()}.json`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function FarmJournal() {
  const [entries, setEntries] = useState([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("All");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw.length <= MAX_STORAGE_BYTES) setEntries(sanitizeEntries(JSON.parse(raw)));
    } catch {
      setNotice("A saved journal could not be read, so it was not loaded.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const payload = JSON.stringify(entries.slice(0, MAX_ENTRIES));
      if (payload.length > MAX_STORAGE_BYTES) throw new Error("journal-too-large");
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      setNotice("This browser could not save the latest journal change. Export a backup before leaving this page.");
    }
  }, [entries, ready]);

  const visible = useMemo(() => {
    const list = filter === "All" ? entries : entries.filter((item) => item.category === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, filter]);

  function addEntry(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = sanitizeEntry({
      id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: data.get("date"),
      title: data.get("title"),
      category: data.get("category"),
      body: data.get("body"),
    }, entries.length);
    if (!entry) return;
    setEntries((current) => [entry, ...current].slice(0, MAX_ENTRIES));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = localDay();
    setNotice("Journal entry saved in this browser.");
  }

  function removeEntry(entry) {
    if (!window.confirm(`Delete journal entry “${entry.title}”? This cannot be undone unless you exported a backup.`)) return;
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    setNotice("Journal entry deleted.");
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private browser journal.</strong> Entries stay on this device unless you export them. Do not use this journal for passwords, tax IDs, banking information, or other secrets.</div>
      {notice ? <div className="farm-tools-note" role="status">{notice}</div> : null}

      <section className="farm-panel" aria-labelledby="journal-entry-heading">
        <h2 id="journal-entry-heading">Add a farm note.</h2>
        <form onSubmit={addEntry}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="journal-date">Date</label><input id="journal-date" name="date" type="date" defaultValue={localDay()} required /></div>
            <div className="farm-field"><label htmlFor="journal-category">Category</label><select id="journal-category" name="category" defaultValue="Field note">{[...CATEGORIES].map((category) => <option key={category}>{category}</option>)}</select></div>
            <div className="farm-field wide"><label htmlFor="journal-title">Title</label><input id="journal-title" name="title" maxLength={120} required placeholder="What happened?" /></div>
            <div className="farm-field wide"><label htmlFor="journal-body">Observation / note</label><textarea id="journal-body" name="body" maxLength={2000} required placeholder="Record the observation, decision, problem, customer feedback, maintenance work, or next action." /></div>
          </div>
          <div className="farm-actions"><button className="farm-action" type="submit">Save journal entry</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="journal-history-heading">
        <h2 id="journal-history-heading">Journal history.</h2>
        <div className="farm-field" style={{ maxWidth: 360 }}><label htmlFor="journal-filter">Category filter</label><select id="journal-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{[...CATEGORIES].map((category) => <option key={category}>{category}</option>)}</select></div>
        {visible.length ? <div className="farm-record-list">{visible.map((entry) => <article className="farm-record" key={entry.id}><div><div className="farm-record-meta">{entry.date} · {entry.category}</div><h3>{entry.title}</h3><p>{entry.body}</p></div><button className="farm-action danger" type="button" onClick={() => removeEntry(entry)} aria-label={`Delete ${entry.title}`}>Delete</button></article>)}</div> : <div className="farm-empty">No journal entries match this filter.</div>}
      </section>

      <div className="farm-actions">
        <button className="farm-action secondary" type="button" onClick={() => downloadJson(entries)} disabled={!entries.length}>Export journal JSON</button>
        <Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link>
      </div>
    </div>
  );
}