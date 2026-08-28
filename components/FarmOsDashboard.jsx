"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const RECORDS_KEY = "price-family-farm-records-v2";
const FUNDING_KEY = "price-family-farm-funding-v1";
const MAX_RECORDS = 5_000;
const MAX_FUNDING = 250;

const EMPTY = {
  harvests: [],
  experiments: [],
  expenses: [],
  funding: [],
  recordsFound: false,
  fundingFound: false,
};

function safeArray(value, max) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function readDashboardState() {
  const next = { ...EMPTY };

  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (raw && raw.length <= 2_000_000) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        next.harvests = safeArray(parsed.harvests, MAX_RECORDS);
        next.experiments = safeArray(parsed.experiments, MAX_RECORDS);
        next.expenses = safeArray(parsed.expenses, MAX_RECORDS);
        next.recordsFound = true;
      }
    }
  } catch {
    // A malformed browser record should not break the command center.
  }

  try {
    const raw = localStorage.getItem(FUNDING_KEY);
    if (raw && raw.length <= 500_000) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        next.funding = safeArray(parsed, MAX_FUNDING);
        next.fundingFound = true;
      }
    }
  } catch {
    // Funding data is optional and stays isolated from the records store.
  }

  return next;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
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
    return {
      harvests: data.harvests.length,
      cashMargin: sales - expenses,
      runningExperiments,
      activeFunding,
    };
  }, [data]);

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Private browser dashboard.</strong> This page reads the same browser-local Farm Records and funding tracker already stored on this device. It does not upload, sync, or publish them.
      </div>

      <div className="farm-summary-grid" role="group" aria-label="Farm OS summary">
        <div className="farm-summary-card"><span>Harvest records</span><b>{ready ? summary.harvests : "—"}</b></div>
        <div className="farm-summary-card"><span>Recorded cash margin</span><b>{ready ? money(summary.cashMargin) : "—"}</b></div>
        <div className="farm-summary-card"><span>Running experiments</span><b>{ready ? summary.runningExperiments : "—"}</b></div>
        <div className="farm-summary-card"><span>Active funding items</span><b>{ready ? summary.activeFunding : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="farm-os-next-actions">
        <h2 id="farm-os-next-actions">Next farm actions.</h2>
        <p>Jump straight into the operating task you need instead of hunting through the public site.</p>
        <div className="grid-3">
          <article className="packet"><span className="eyebrow">Capture</span><h3>Log today&rsquo;s work</h3><p>Add a harvest, direct farm expense, or experiment while the details are fresh.</p><Link className="stat-link" href="/farm-records">Open Farm Records →</Link></article>
          <article className="packet"><span className="eyebrow">Decide</span><h3>Review what is paying off</h3><p>Compare recorded sales, tagged expenses, crop cash margin, and season activity.</p><Link className="stat-link" href="/farm-analytics">Open Farm Analytics →</Link></article>
          <article className="packet"><span className="eyebrow">Prepare</span><h3>Check funding readiness</h3><p>Review grants, cost share, certifications, courses, deadlines, and next actions.</p><Link className="stat-link" href="/funding">Open readiness tracker →</Link></article>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="farm-os-browser-state">
        <h2 id="farm-os-browser-state">This browser&rsquo;s data state.</h2>
        <div className="farm-record-list">
          <article className="farm-record"><div><div className="farm-record-meta">Farm Records</div><h3>{data.recordsFound ? "Local records found" : "No local record store yet"}</h3><p>{data.recordsFound ? "This dashboard is summarizing the records already saved in this browser." : "Open Farm Records and save the first entry to create this browser-local record store."}</p></div><Link className="farm-action secondary" href="/farm-records">Records</Link></article>
          <article className="farm-record"><div><div className="farm-record-meta">Funding &amp; education</div><h3>{data.fundingFound ? "Local tracker found" : "Tracker has not been saved yet"}</h3><p>{data.fundingFound ? "Active-item counts come from the funding tracker saved in this browser." : "Open the readiness tracker to initialize and review the current planning queue."}</p></div><Link className="farm-action secondary" href="/funding">Readiness</Link></article>
        </div>
      </section>

      <div className="farm-actions">
        <Link className="farm-action secondary" href="/weather">Check growing conditions</Link>
        <Link className="farm-action secondary" href="/privacy-tools">Manage local farm data</Link>
      </div>
    </div>
  );
}
