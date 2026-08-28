"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay } from "@/lib/localDate";

const STORES = {
  records: { key: "price-family-farm-records-v2", max: 2_000_000 },
  funding: { key: "price-family-farm-funding-v1", max: 500_000 },
  planner: { key: "price-family-farm-planner-v1", max: 1_000_000 },
  calendar: { key: "price-family-farm-calendar-v1", max: 1_000_000 },
  journal: { key: "price-family-farm-journal-v1", max: 1_000_000 },
  garden: { key: "price-family-farm-garden-layout-v1", max: 500_000 },
  map: { key: "price-family-farm-map-v1", max: 500_000 },
};
const MAX_RECORDS = 5_000;
const MAX_FUNDING = 250;
const MAX_PLANS = 500;
const MAX_CALENDAR = 1_000;
const MAX_JOURNAL = 1_000;
const MAX_BEDS = 100;
const MAX_ZONES = 100;

const EMPTY = {
  harvests: [],
  experiments: [],
  expenses: [],
  funding: [],
  plans: [],
  calendar: [],
  journal: [],
  beds: [],
  zones: [],
  found: {},
};

function safeArray(value, max) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function readJson(store) {
  const raw = localStorage.getItem(store.key);
  if (!raw || raw.length > store.max) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readDashboardState() {
  const next = { ...EMPTY, found: {} };

  const records = readJson(STORES.records);
  if (records && typeof records === "object" && !Array.isArray(records)) {
    next.harvests = safeArray(records.harvests, MAX_RECORDS);
    next.experiments = safeArray(records.experiments, MAX_RECORDS);
    next.expenses = safeArray(records.expenses, MAX_RECORDS);
    next.found.records = true;
  }

  const funding = readJson(STORES.funding);
  if (Array.isArray(funding)) {
    next.funding = safeArray(funding, MAX_FUNDING);
    next.found.funding = true;
  }

  const planner = readJson(STORES.planner);
  if (Array.isArray(planner)) {
    next.plans = safeArray(planner, MAX_PLANS);
    next.found.planner = true;
  }

  const calendar = readJson(STORES.calendar);
  if (Array.isArray(calendar)) {
    next.calendar = safeArray(calendar, MAX_CALENDAR);
    next.found.calendar = true;
  }

  const journal = readJson(STORES.journal);
  if (Array.isArray(journal)) {
    next.journal = safeArray(journal, MAX_JOURNAL);
    next.found.journal = true;
  }

  const garden = readJson(STORES.garden);
  if (Array.isArray(garden)) {
    next.beds = safeArray(garden, MAX_BEDS);
    next.found.garden = true;
  }

  const map = readJson(STORES.map);
  if (Array.isArray(map)) {
    next.zones = safeArray(map, MAX_ZONES);
    next.found.map = true;
  }

  return next;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function FarmOsDashboard() {
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(readDashboardState());
    setReady(true);
  }, []);

  const summary = useMemo(() => {
    const sales = data.harvests.reduce((sum, item) => sum + safeNumber(item?.saleAmount), 0);
    const expenses = data.expenses.reduce((sum, item) => sum + safeNumber(item?.amount), 0);
    const runningExperiments = data.experiments.filter((item) => item?.status === "running").length;
    const activeFunding = data.funding.filter((item) => !["Done", "Not pursuing"].includes(item?.status)).length;
    const activePlans = data.plans.filter((item) => !["Complete", "Paused"].includes(item?.status)).length;
    const openTasks = data.calendar.filter((item) => !["Done", "Skipped"].includes(item?.status)).length;
    const overdueTasks = data.calendar.filter((item) => item?.date && item.date < localDay() && !["Done", "Skipped"].includes(item?.status)).length;
    const gardenArea = data.beds.reduce((sum, item) => sum + safeNumber(item?.length) * safeNumber(item?.width), 0);
    const zonesNeedingWork = data.zones.filter((item) => item?.status === "Needs work").length;
    return {
      harvests: data.harvests.length,
      cashMargin: sales - expenses,
      runningExperiments,
      activeFunding,
      activePlans,
      openTasks,
      overdueTasks,
      journalEntries: data.journal.length,
      gardenBeds: data.beds.length,
      gardenArea,
      zonesNeedingWork,
    };
  }, [data]);

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Private browser dashboard.</strong> This page reads the same browser-local Farm OS stores already saved on this device. It does not upload, sync, geolocate, or publish them.
      </div>

      <div className="farm-summary-grid" role="group" aria-label="Farm OS summary">
        <div className="farm-summary-card"><span>Harvest records</span><b>{ready ? summary.harvests : "—"}</b></div>
        <div className="farm-summary-card"><span>Recorded cash margin</span><b>{ready ? money(summary.cashMargin) : "—"}</b></div>
        <div className="farm-summary-card"><span>Active crop plans</span><b>{ready ? summary.activePlans : "—"}</b></div>
        <div className="farm-summary-card"><span>Open calendar tasks</span><b>{ready ? summary.openTasks : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="farm-os-today-heading">
        <span className="eyebrow">Daily command center</span>
        <h2 id="farm-os-today-heading">Start with Today.</h2>
        <p>See overdue work, today&rsquo;s tasks, the next seven days, active crop plans, recent activity, and quick-capture controls in one private browser-local view.</p>
        <div className="farm-actions">
          <Link className="farm-action" href="/farm-today">Open Farm Today</Link>
          <Link className="farm-action secondary" href="/farm-backup">Back up Farm OS</Link>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="farm-os-next-actions">
        <h2 id="farm-os-next-actions">Next farm actions.</h2>
        <p>Jump straight into the operating task you need instead of hunting through the public site.</p>
        <div className="grid-3">
          <article className="packet"><span className="eyebrow">Capture</span><h3>Log today&rsquo;s work</h3><p>Add a harvest, direct farm expense, or experiment while the details are fresh.</p><Link className="stat-link" href="/farm-records">Open Farm Records →</Link></article>
          <article className="packet"><span className="eyebrow">Plan</span><h3>Work the crop plan</h3><p>{ready && summary.activePlans ? `${countLabel(summary.activePlans, "active crop plan")} ${summary.activePlans === 1 ? "is" : "are"} in this browser.` : "Build or update crop plans, dates, varieties, and working spaces."}</p><Link className="stat-link" href="/farm-planner">Open Farm Planner →</Link></article>
          <article className="packet"><span className="eyebrow">Schedule</span><h3>Clear the task queue</h3><p>{ready && summary.overdueTasks ? `${countLabel(summary.overdueTasks, "open task")} ${summary.overdueTasks === 1 ? "is" : "are"} past ${summary.overdueTasks === 1 ? "its" : "their"} planned date.` : "Keep planting, harvest, maintenance, market, and funding tasks visible."}</p><Link className="stat-link" href="/farm-calendar">Open Farm Calendar →</Link></article>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="farm-os-operating-tools">
        <h2 id="farm-os-operating-tools">Operating tools.</h2>
        <p>The recovered planning tools now report their browser-local state here so they work as one system.</p>
        <div className="farm-record-list">
          <article className="farm-record"><div><div className="farm-record-meta">Season review</div><h3>{ready ? `${countLabel(summary.journalEntries, "journal entry", "journal entries")} · ${countLabel(summary.runningExperiments, "running experiment")}` : "Loading local season activity"}</h3><p>Review observations, experiments, harvests, expenses, and tasks in context.</p></div><div className="farm-actions"><Link className="farm-action secondary" href="/timeline">Timeline</Link><Link className="farm-action secondary" href="/farm-journal">Journal</Link></div></article>
          <article className="farm-record"><div><div className="farm-record-meta">Space planning</div><h3>{ready ? `${countLabel(summary.gardenBeds, "garden bed")} · ${Math.round(summary.gardenArea)} ft² mapped` : "Loading local garden layout"}</h3><p>Use dimensions and working-zone labels without publishing an address, parcel boundary, or GPS location.</p></div><div className="farm-actions"><Link className="farm-action secondary" href="/learn/garden-layout-builder">Garden layout</Link><Link className="farm-action secondary" href="/farm-map">Farm map</Link></div></article>
          <article className="farm-record"><div><div className="farm-record-meta">Decision support</div><h3>{ready ? `${countLabel(summary.activeFunding, "funding item")} · ${countLabel(summary.zonesNeedingWork, "zone")} need${summary.zonesNeedingWork === 1 ? "s" : ""} work` : "Loading local readiness state"}</h3><p>Compare recorded economics, readiness items, and physical work areas before deciding what to do next.</p></div><div className="farm-actions"><Link className="farm-action secondary" href="/farm-analytics">Analytics</Link><Link className="farm-action secondary" href="/funding">Funding</Link></div></article>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="farm-os-browser-state">
        <h2 id="farm-os-browser-state">This browser&rsquo;s Farm OS state.</h2>
        <p>{ready ? `${countLabel(Object.keys(data.found).length, "local Farm OS data store")} detected on this device.` : "Checking this browser for local Farm OS data."}</p>
        <div className="farm-actions">
          <Link className="farm-action secondary" href="/weather">Check growing conditions</Link>
          <Link className="farm-action secondary" href="/farm-backup">Back up local farm data</Link>
          <Link className="farm-action secondary" href="/privacy-tools">Manage local farm data</Link>
        </div>
      </section>
    </div>
  );
}
