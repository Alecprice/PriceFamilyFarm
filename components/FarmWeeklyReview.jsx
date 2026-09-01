"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const STORES = {
  records: { key: "price-family-farm-records-v2", maxBytes: 2_000_000 },
  calendar: { key: "price-family-farm-calendar-v1", maxBytes: 1_000_000 },
  journal: { key: "price-family-farm-journal-v1", maxBytes: 1_000_000 },
  planner: { key: "price-family-farm-planner-v1", maxBytes: 1_000_000 },
};

function text(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function amount(value) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function readJson(store) {
  const raw = localStorage.getItem(store.key);
  if (!raw || raw.length > store.maxBytes) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function downloadSnapshot(snapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `price-family-farm-weekly-review-${localDay()}.json`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildReview() {
  const current = localDay();
  const start = localDayPlus(-6);
  const upcomingEnd = localDayPlus(7);
  const records = readJson(STORES.records);
  const calendar = readJson(STORES.calendar);
  const journal = readJson(STORES.journal);
  const planner = readJson(STORES.planner);

  const harvests = (Array.isArray(records?.harvests) ? records.harvests : []).slice(0, 5_000).map((item, index) => ({
    id: text(item?.id, 120) || `harvest-${index}`,
    date: date(item?.date),
    crop: text(item?.crop, 80),
    variety: text(item?.variety, 100),
    quantity: amount(item?.quantity),
    unit: text(item?.unit, 20),
    destination: text(item?.destination, 40),
    saleAmount: amount(item?.saleAmount),
  })).filter((item) => item.date && item.crop && item.date >= start && item.date <= current);

  const expenses = (Array.isArray(records?.expenses) ? records.expenses : []).slice(0, 5_000).map((item, index) => ({
    id: text(item?.id, 120) || `expense-${index}`,
    date: date(item?.date),
    description: text(item?.description, 160),
    category: text(item?.category, 50),
    crop: text(item?.crop, 80),
    amount: amount(item?.amount),
  })).filter((item) => item.date && item.description && item.date >= start && item.date <= current);

  const notes = (Array.isArray(journal) ? journal : []).slice(0, 1_000).map((item, index) => ({
    id: text(item?.id, 120) || `journal-${index}`,
    date: date(item?.date),
    title: text(item?.title, 120),
    category: text(item?.category, 50),
    body: text(item?.body, 500),
  })).filter((item) => item.date && item.title && item.date >= start && item.date <= current);

  const tasks = (Array.isArray(calendar) ? calendar : []).slice(0, 1_000).map((item, index) => ({
    id: text(item?.id, 120) || `task-${index}`,
    date: date(item?.date),
    task: text(item?.task, 180),
    category: text(item?.category, 50),
    status: text(item?.status, 40),
  })).filter((item) => item.date && item.task);

  const doneDatedThisWeek = tasks.filter((item) => item.date >= start && item.date <= current && item.status === "Done");
  const overdue = tasks.filter((item) => item.date < current && !["Done", "Skipped"].includes(item.status));
  const upcoming = tasks.filter((item) => item.date >= current && item.date <= upcomingEnd && !["Done", "Skipped"].includes(item.status));

  const activePlans = (Array.isArray(planner) ? planner : []).slice(0, 500).map((item, index) => ({
    id: text(item?.id, 120) || `plan-${index}`,
    crop: text(item?.crop, 80),
    variety: text(item?.variety, 100),
    status: text(item?.status, 40),
    targetHarvestDate: date(item?.targetHarvestDate),
  })).filter((item) => item.crop && !["Complete", "Paused"].includes(item.status));

  const sales = harvests.reduce((sum, item) => sum + item.saleAmount, 0);
  const costs = expenses.reduce((sum, item) => sum + item.amount, 0);
  const activity = [
    ...harvests.map((item) => ({ id: `harvest-${item.id}`, date: item.date, type: "Harvest", title: item.variety ? `${item.crop} · ${item.variety}` : item.crop, detail: `${item.quantity} ${item.unit}${item.saleAmount ? ` · ${money(item.saleAmount)}` : ""}` })),
    ...expenses.map((item) => ({ id: `expense-${item.id}`, date: item.date, type: "Expense", title: item.description, detail: money(item.amount) })),
    ...notes.map((item) => ({ id: `journal-${item.id}`, date: item.date, type: "Journal", title: item.title, detail: item.category })),
    ...doneDatedThisWeek.map((item) => ({ id: `task-${item.id}`, date: item.date, type: "Task marked done", title: item.task, detail: item.category })),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type)).slice(0, 20);

  return { current, start, upcomingEnd, harvests, expenses, notes, doneDatedThisWeek, overdue, upcoming, activePlans, sales, costs, cashMargin: sales - costs, activity };
}

export default function FarmWeeklyReview() {
  const [review, setReview] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setReview(buildReview());
  }, []);

  const cropSummary = useMemo(() => {
    if (!review) return [];
    const crops = new Map();
    review.harvests.forEach((item) => {
      const current = crops.get(item.crop) || { crop: item.crop, harvests: 0, sales: 0 };
      current.harvests += 1;
      current.sales += item.saleAmount;
      crops.set(item.crop, current);
    });
    return [...crops.values()].sort((a, b) => b.sales - a.sales || b.harvests - a.harvests || a.crop.localeCompare(b.crop)).slice(0, 8);
  }, [review]);

  if (!review) return <div className="farm-tools-note" role="status">Building this browser&rsquo;s weekly review…</div>;

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private weekly review.</strong> This report is calculated only from browser-local Farm OS data. “Done this week” means a task dated in this seven-day window is currently marked Done; Farm OS does not claim the actual completion time.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="farm-summary-grid" aria-label="Weekly farm review summary">
        <div className="farm-summary-card"><span>Harvest entries</span><b>{review.harvests.length}</b></div>
        <div className="farm-summary-card"><span>Recorded sales</span><b>{money(review.sales)}</b></div>
        <div className="farm-summary-card"><span>Recorded expenses</span><b>{money(review.costs)}</b></div>
        <div className="farm-summary-card"><span>Recorded cash margin</span><b>{money(review.cashMargin)}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="weekly-work-heading">
        <span className="eyebrow">Work queue</span>
        <h2 id="weekly-work-heading">Close the loop before next week.</h2>
        <div className="grid-3">
          <article className="packet"><h3>{review.doneDatedThisWeek.length} dated task{review.doneDatedThisWeek.length === 1 ? "" : "s"} marked done</h3><p>Tasks with a planned date between {review.start} and {review.current} that are currently marked Done.</p></article>
          <article className="packet"><h3>{review.overdue.length} overdue open</h3><p>Open tasks dated before today that still need a decision, update, or completion.</p><Link className="stat-link" href="/farm-os/calendar">Open calendar →</Link></article>
          <article className="packet"><h3>{review.upcoming.length} due through next 7 days</h3><p>Open tasks dated from today through {review.upcomingEnd}.</p><Link className="stat-link" href="/farm-today">Open Today →</Link></article>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="weekly-crops-heading">
        <span className="eyebrow">Production</span>
        <h2 id="weekly-crops-heading">What was harvested.</h2>
        {cropSummary.length ? <div className="farm-record-list">{cropSummary.map((item) => <article className="farm-record" key={item.crop}><div><div className="farm-record-meta">{item.harvests} harvest entr{item.harvests === 1 ? "y" : "ies"}</div><h3>{item.crop}</h3><p>{item.sales ? `${money(item.sales)} recorded sales tied to these entries.` : "No recorded sales tied to these entries."}</p></div></article>)}</div> : <div className="farm-empty">No harvest entries are dated in this seven-day review window.</div>}
      </section>

      <section className="farm-panel" aria-labelledby="weekly-activity-heading">
        <span className="eyebrow">Review trail</span>
        <h2 id="weekly-activity-heading">Recent recorded activity.</h2>
        {review.activity.length ? <div className="farm-record-list">{review.activity.map((item) => <article className="farm-record" key={item.id}><div><div className="farm-record-meta">{item.date} · {item.type}</div><h3>{item.title}</h3>{item.detail ? <p>{item.detail}</p> : null}</div></article>)}</div> : <div className="farm-empty">No harvest, expense, journal, or done-task activity is dated in this review window.</div>}
      </section>

      <section className="farm-panel" aria-labelledby="weekly-next-heading">
        <span className="eyebrow">Next cycle</span>
        <h2 id="weekly-next-heading">Active crop plans.</h2>
        <p>{review.activePlans.length} active crop plan{review.activePlans.length === 1 ? " is" : "s are"} saved in this browser.</p>
        <div className="farm-actions"><Link className="farm-action secondary" href="/farm-os/planner">Open Farm Planner</Link><Link className="farm-action secondary" href="/farm-today">Open Farm Today</Link></div>
      </section>

      <div className="farm-actions">
        <button className="farm-action" type="button" onClick={() => { downloadSnapshot({ version: 1, generatedAt: new Date().toISOString(), range: { start: review.start, end: review.current }, summary: { harvestEntries: review.harvests.length, recordedSales: review.sales, recordedExpenses: review.costs, recordedCashMargin: review.cashMargin, datedTasksMarkedDone: review.doneDatedThisWeek.length, overdueOpen: review.overdue.length, next7Open: review.upcoming.length, activePlans: review.activePlans.length }, activity: review.activity }); setStatus("Weekly review JSON prepared for download."); }}>Download weekly review JSON</button>
        <Link className="farm-action secondary" href="/farm-backup">Back up Farm OS</Link>
        <Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link>
      </div>
    </div>
  );
}
