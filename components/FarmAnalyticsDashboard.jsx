"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-records-v2";
const MAX_STORAGE_BYTES = 2_000_000;
const MAX_RECORDS_PER_SECTION = 5_000;
const EMPTY = { harvests: [], experiments: [], expenses: [] };

function safeArray(value) {
  return Array.isArray(value) ? value.slice(0, MAX_RECORDS_PER_SECTION) : [];
}

function safeText(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

function safeDate(value) {
  const next = safeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function safeNumber(value, max = 1_000_000_000) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= max ? numeric : 0;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function normalizeRecords(value) {
  if (!value || typeof value !== "object") return EMPTY;
  return {
    harvests: safeArray(value.harvests).map((item) => ({
      date: safeDate(item?.date),
      crop: safeText(item?.crop, 80),
      variety: safeText(item?.variety, 100),
      destination: safeText(item?.destination, 40),
      saleAmount: safeNumber(item?.saleAmount),
    })).filter((item) => item.date && item.crop),
    experiments: safeArray(value.experiments).map((item) => ({
      date: safeDate(item?.date),
      title: safeText(item?.title, 120),
      crop: safeText(item?.crop, 80),
      status: safeText(item?.status, 40),
    })).filter((item) => item.date && item.title),
    expenses: safeArray(value.expenses).map((item) => ({
      date: safeDate(item?.date),
      crop: safeText(item?.crop, 80),
      description: safeText(item?.description, 160),
      category: safeText(item?.category, 60),
      amount: safeNumber(item?.amount),
    })).filter((item) => item.date && item.description),
  };
}

function cropKey(value) {
  return safeText(value, 80).toLocaleLowerCase("en-US");
}

export default function FarmAnalyticsDashboard() {
  const [records, setRecords] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [year, setYear] = useState("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setNotice("No Farm Records are saved in this browser yet.");
        return;
      }
      if (saved.length > MAX_STORAGE_BYTES) {
        setNotice("Saved Farm Records are too large to analyze safely in the browser.");
        return;
      }
      setRecords(normalizeRecords(JSON.parse(saved)));
    } catch {
      setNotice("Saved Farm Records could not be read, so no analytics were calculated.");
    } finally {
      setLoaded(true);
    }
  }, []);

  const years = useMemo(() => {
    const values = new Set();
    for (const section of [records.harvests, records.experiments, records.expenses]) {
      section.forEach((item) => item.date && values.add(item.date.slice(0, 4)));
    }
    return [...values].sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filtered = useMemo(() => {
    if (year === "all") return records;
    const match = (item) => item.date.startsWith(`${year}-`);
    return {
      harvests: records.harvests.filter(match),
      experiments: records.experiments.filter(match),
      expenses: records.expenses.filter(match),
    };
  }, [records, year]);

  const analytics = useMemo(() => {
    const sales = filtered.harvests.reduce((sum, item) => sum + item.saleAmount, 0);
    const expenses = filtered.expenses.reduce((sum, item) => sum + item.amount, 0);
    const crops = new Map();

    filtered.harvests.forEach((item) => {
      const key = cropKey(item.crop);
      if (!key) return;
      const current = crops.get(key) || { crop: item.crop, harvests: 0, sales: 0, expenses: 0, lastHarvest: "" };
      current.harvests += 1;
      current.sales += item.saleAmount;
      if (!current.lastHarvest || item.date > current.lastHarvest) current.lastHarvest = item.date;
      crops.set(key, current);
    });

    filtered.expenses.forEach((item) => {
      const key = cropKey(item.crop);
      if (!key) return;
      const current = crops.get(key) || { crop: item.crop, harvests: 0, sales: 0, expenses: 0, lastHarvest: "" };
      current.expenses += item.amount;
      crops.set(key, current);
    });

    const cropRows = [...crops.values()]
      .map((item) => ({ ...item, recordedMargin: item.sales - item.expenses }))
      .sort((a, b) => b.recordedMargin - a.recordedMargin || b.sales - a.sales || b.harvests - a.harvests)
      .slice(0, 8);

    const activity = [
      ...filtered.harvests.map((item) => ({ date: item.date, type: "Harvest", title: item.crop, detail: item.saleAmount ? `${money(item.saleAmount)} recorded sale` : "No sale recorded" })),
      ...filtered.experiments.map((item) => ({ date: item.date, type: "Experiment", title: item.title, detail: item.status || "Status not recorded" })),
      ...filtered.expenses.map((item) => ({ date: item.date, type: "Expense", title: item.description, detail: money(item.amount) })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

    return {
      sales,
      expenses,
      net: sales - expenses,
      harvests: filtered.harvests.length,
      experiments: filtered.experiments.length,
      cropRows,
      activity,
    };
  }, [filtered]);

  const hasRecords = filtered.harvests.length + filtered.experiments.length + filtered.expenses.length > 0;

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Private analytics.</strong> This page reads the same browser-local Farm Records data and performs calculations in your browser. It does not send farm records to a server.
      </div>

      {notice ? <div className="farm-tools-note" role="status">{notice}</div> : null}

      <div className="farm-panel" style={{ marginBottom: 22 }}>
        <div className="farm-form-grid">
          <div className="farm-field">
            <label htmlFor="analytics-year">Season</label>
            <select id="analytics-year" value={year} onChange={(event) => setYear(event.target.value)} disabled={!loaded || years.length === 0}>
              <option value="all">All recorded seasons</option>
              {years.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div className="farm-field">
            <span className="farm-field-label">What this means</span>
            <p style={{ margin: 0 }}>Recorded cash margin is sales minus expenses entered in Farm Records. It is not accounting profit and does not include unrecorded labor, depreciation, taxes, or overhead.</p>
          </div>
        </div>
      </div>

      <div className="farm-summary-grid" aria-label="Farm analytics summary">
        <div className="farm-summary-card"><span>Harvest entries</span><b>{analytics.harvests}</b></div>
        <div className="farm-summary-card"><span>Recorded sales</span><b>{money(analytics.sales)}</b></div>
        <div className="farm-summary-card"><span>Recorded expenses</span><b>{money(analytics.expenses)}</b></div>
        <div className="farm-summary-card"><span>Recorded cash margin</span><b>{money(analytics.net)}</b></div>
      </div>

      {!loaded ? <div className="farm-empty">Loading browser-local Farm Records…</div> : null}

      {loaded && !hasRecords ? (
        <div className="farm-empty">
          <p>No records match this season yet.</p>
          <Link className="farm-action" href="/farm-records">Open Farm Records</Link>
        </div>
      ) : null}

      {loaded && hasRecords ? (
        <>
          <section className="farm-panel" aria-labelledby="crop-performance-heading">
            <h2 id="crop-performance-heading">Crop performance from recorded cash.</h2>
            <p>Only expenses tagged to a crop are assigned to that crop. Untagged farm expenses still count in the overall margin above.</p>
            {analytics.cropRows.length ? (
              <div className="farm-record-list">
                {analytics.cropRows.map((item) => (
                  <article className="farm-record" key={`${cropKey(item.crop)}-${item.lastHarvest || "expense"}`}>
                    <div>
                      <span className="farm-record-meta">{item.harvests} harvest {item.harvests === 1 ? "entry" : "entries"}{item.lastHarvest ? ` · last ${item.lastHarvest}` : ""}</span>
                      <h3>{item.crop}</h3>
                      <p>Sales {money(item.sales)} · tagged expenses {money(item.expenses)}</p>
                    </div>
                    <div className="farm-record-meta" aria-label={`${item.crop} recorded cash margin`}>{money(item.recordedMargin)}</div>
                  </article>
                ))}
              </div>
            ) : <div className="farm-empty">Tag harvests or expenses with a crop to see crop-level comparisons.</div>}
          </section>

          <section className="farm-panel" aria-labelledby="recent-activity-heading">
            <h2 id="recent-activity-heading">Recent recorded activity.</h2>
            <p>{analytics.experiments} experiment {analytics.experiments === 1 ? "entry" : "entries"} are included in this season view.</p>
            <div className="farm-record-list">
              {analytics.activity.map((item, index) => (
                <article className="farm-record" key={`${item.type}-${item.date}-${item.title}-${index}`}>
                  <div>
                    <span className="farm-record-meta">{item.date} · {item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
