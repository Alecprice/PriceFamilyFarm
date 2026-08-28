"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const STORES = {
  records: { key: "price-family-farm-records-v2", maxBytes: 2_000_000, maxItems: 5_000 },
  planner: { key: "price-family-farm-planner-v1", maxBytes: 1_000_000, maxItems: 500 },
  calendar: { key: "price-family-farm-calendar-v1", maxBytes: 1_000_000, maxItems: 1_000 },
  journal: { key: "price-family-farm-journal-v1", maxBytes: 1_000_000, maxItems: 1_000 },
};

const TASK_CATEGORIES = new Set(["Planting", "Harvest", "Maintenance", "Market", "Funding", "Weather", "Other"]);
const TASK_STATUSES = new Set(["Planned", "In progress", "Done", "Skipped"]);
const PLAN_STATUSES = new Set(["Planned", "Started", "Transplanted", "Harvesting", "Complete", "Paused"]);
const JOURNAL_CATEGORIES = new Set(["Field note", "Weather observation", "Market", "Maintenance", "Planning", "Other"]);
const HARVEST_UNITS = new Set(["lb", "oz", "count", "bunch", "pint", "quart", "tray"]);
const HARVEST_DESTINATIONS = new Set(["home", "sold", "donated", "saved-seed", "other"]);
const EXPENSE_CATEGORIES = new Set(["seed-plant", "soil-compost", "fertility", "irrigation", "packaging", "equipment", "market-fee", "other"]);

function safeText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function safeDate(value) {
  const next = safeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function safeNumberString(value, max = 1_000_000_000) {
  if (value === "" || value == null) return "";
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > max) return "";
  return String(amount);
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

function readArray(store) {
  const parsed = readJson(store);
  return Array.isArray(parsed) ? parsed.slice(0, store.maxItems) : [];
}

function strictArray(store) {
  const raw = localStorage.getItem(store.key);
  if (!raw) return [];
  if (raw.length > store.maxBytes) throw new Error("store-too-large");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("invalid-store");
  return parsed.slice(0, store.maxItems);
}

function writeArray(store, items) {
  const payload = JSON.stringify(items.slice(0, store.maxItems));
  if (payload.length > store.maxBytes) throw new Error("store-too-large");
  localStorage.setItem(store.key, payload);
}

function strictRecords() {
  const raw = localStorage.getItem(STORES.records.key);
  if (!raw) return { harvests: [], experiments: [], expenses: [] };
  if (raw.length > STORES.records.maxBytes) throw new Error("records-too-large");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid-records");
  if (!Array.isArray(parsed.harvests) || !Array.isArray(parsed.experiments) || !Array.isArray(parsed.expenses)) throw new Error("invalid-records");
  return {
    harvests: parsed.harvests.slice(0, STORES.records.maxItems),
    experiments: parsed.experiments.slice(0, STORES.records.maxItems),
    expenses: parsed.expenses.slice(0, STORES.records.maxItems),
  };
}

function writeRecords(records) {
  const payload = JSON.stringify({
    harvests: records.harvests.slice(0, STORES.records.maxItems),
    experiments: records.experiments.slice(0, STORES.records.maxItems),
    expenses: records.expenses.slice(0, STORES.records.maxItems),
  });
  if (payload.length > STORES.records.maxBytes) throw new Error("records-too-large");
  localStorage.setItem(STORES.records.key, payload);
}

function safeMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function sanitizeTask(item, index) {
  const date = safeDate(item?.date);
  const task = safeText(item?.task, 180);
  if (!date || !task) return null;
  return {
    id: safeText(item?.id, 120) || `calendar-${Date.now()}-${index}`,
    date,
    task,
    category: TASK_CATEGORIES.has(item?.category) ? item.category : "Other",
    status: TASK_STATUSES.has(item?.status) ? item.status : "Planned",
    notes: safeText(item?.notes, 600),
  };
}

function sanitizePlan(item, index) {
  const crop = safeText(item?.crop, 80);
  if (!crop) return null;
  return {
    id: safeText(item?.id, 120) || `plan-${index}`,
    crop,
    variety: safeText(item?.variety, 100),
    space: safeText(item?.space, 100),
    status: PLAN_STATUSES.has(item?.status) ? item.status : "Planned",
    sowDate: safeDate(item?.sowDate),
    transplantDate: safeDate(item?.transplantDate),
    targetHarvestDate: safeDate(item?.targetHarvestDate),
  };
}

function sanitizeJournal(item, index) {
  const date = safeDate(item?.date);
  const title = safeText(item?.title, 120);
  const body = safeText(item?.body, 2_000);
  if (!date || !title || !body) return null;
  return {
    id: safeText(item?.id, 120) || `journal-${Date.now()}-${index}`,
    date,
    title,
    category: JOURNAL_CATEGORIES.has(item?.category) ? item.category : "Other",
    body,
  };
}

function sanitizeQuickHarvest(item) {
  const date = safeDate(item?.date);
  const crop = safeText(item?.crop, 80);
  const quantity = safeNumberString(item?.quantity, 10_000_000);
  const unit = HARVEST_UNITS.has(item?.unit) ? item.unit : "lb";
  const destination = HARVEST_DESTINATIONS.has(item?.destination) ? item.destination : "home";
  if (!date || !crop || !quantity || Number(quantity) <= 0) return null;
  return {
    id: `harvest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    crop,
    variety: safeText(item?.variety, 100),
    location: "",
    quantity,
    unit,
    destination,
    saleAmount: safeNumberString(item?.saleAmount),
    notes: "",
  };
}

function sanitizeQuickExpense(item) {
  const date = safeDate(item?.date);
  const description = safeText(item?.description, 160);
  const amount = safeNumberString(item?.amount);
  if (!date || !description || !amount || Number(amount) <= 0) return null;
  return {
    id: `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    category: EXPENSE_CATEGORIES.has(item?.category) ? item.category : "other",
    description,
    crop: safeText(item?.crop, 80),
    amount,
    notes: "",
  };
}

function nextPlanDate(plan) {
  const current = localDay();
  const dates = [plan.sowDate, plan.transplantDate, plan.targetHarvestDate].filter(Boolean).sort();
  return dates.find((date) => date >= current) || dates.at(-1) || "";
}

function readSnapshot() {
  const calendar = readArray(STORES.calendar).map(sanitizeTask).filter(Boolean);
  const planner = readArray(STORES.planner).map(sanitizePlan).filter(Boolean);
  const journal = readArray(STORES.journal).map(sanitizeJournal).filter(Boolean);
  const records = readJson(STORES.records);
  const harvests = Array.isArray(records?.harvests) ? records.harvests.slice(0, 5_000).map((item, index) => ({
    id: safeText(item?.id, 120) || `harvest-${index}`,
    date: safeDate(item?.date),
    crop: safeText(item?.crop, 80),
    variety: safeText(item?.variety, 100),
    quantity: safeText(item?.quantity, 30),
    unit: safeText(item?.unit, 20),
    destination: safeText(item?.destination, 30),
    saleAmount: safeMoney(item?.saleAmount),
  })).filter((item) => item.date && item.crop) : [];
  const expenses = Array.isArray(records?.expenses) ? records.expenses.slice(0, 5_000).map((item, index) => ({
    id: safeText(item?.id, 120) || `expense-${index}`,
    date: safeDate(item?.date),
    description: safeText(item?.description, 160),
    category: safeText(item?.category, 50),
    amount: safeMoney(item?.amount),
  })).filter((item) => item.date && item.description) : [];

  return { calendar, planner, journal, harvests, expenses };
}

function emptySnapshot() {
  return { calendar: [], planner: [], journal: [], harvests: [], expenses: [] };
}

export default function FarmToday() {
  const [data, setData] = useState(emptySnapshot);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  function refresh() {
    setData(readSnapshot());
  }

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const summary = useMemo(() => {
    const today = localDay();
    const week = localDayPlus(7);
    const open = data.calendar.filter((item) => !["Done", "Skipped"].includes(item.status));
    const dueToday = open.filter((item) => item.date === today);
    const overdue = open.filter((item) => item.date < today);
    const upcoming = open.filter((item) => item.date > today && item.date <= week);
    const activePlans = data.planner.filter((item) => !["Complete", "Paused"].includes(item.status));
    const queue = [...overdue, ...dueToday, ...upcoming]
      .sort((a, b) => a.date.localeCompare(b.date) || a.task.localeCompare(b.task))
      .slice(0, 10);
    const plans = [...activePlans]
      .sort((a, b) => (nextPlanDate(a) || "9999-12-31").localeCompare(nextPlanDate(b) || "9999-12-31") || a.crop.localeCompare(b.crop))
      .slice(0, 6);
    const recent = [
      ...data.journal.map((item) => ({ id: `journal-${item.id}`, date: item.date, type: "Journal", title: item.title, detail: item.category, href: "/farm-journal" })),
      ...data.harvests.map((item) => ({ id: `harvest-${item.id}`, date: item.date, type: "Harvest", title: item.variety ? `${item.crop} · ${item.variety}` : item.crop, detail: [item.quantity && item.unit ? `${item.quantity} ${item.unit}` : "", item.destination, item.saleAmount ? money(item.saleAmount) : ""].filter(Boolean).join(" · "), href: "/farm-records" })),
      ...data.expenses.map((item) => ({ id: `expense-${item.id}`, date: item.date, type: "Expense", title: item.description, detail: [item.category, money(item.amount)].filter(Boolean).join(" · "), href: "/farm-records" })),
    ].sort((a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type)).slice(0, 8);

    return { dueToday, overdue, upcoming, activePlans, queue, plans, recent };
  }, [data]);

  function addTask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const entry = sanitizeTask({
      id: `calendar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: formData.get("date"),
      task: formData.get("task"),
      category: formData.get("category"),
      status: "Planned",
      notes: formData.get("notes"),
    }, 0);
    if (!entry) {
      setStatus("Add a valid date and task before saving.");
      return;
    }

    try {
      const current = strictArray(STORES.calendar).map(sanitizeTask).filter(Boolean);
      writeArray(STORES.calendar, [...current, entry]);
      form.reset();
      form.elements.date.value = localDay();
      form.elements.category.value = "Planting";
      refresh();
      setStatus("Task added to the private Farm Calendar in this browser.");
    } catch {
      setStatus("The Farm Calendar could not be updated safely. Open the full calendar or make a backup before trying again.");
    }
  }

  function addNote(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const entry = sanitizeJournal({
      id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: formData.get("date"),
      title: formData.get("title"),
      category: formData.get("category"),
      body: formData.get("body"),
    }, 0);
    if (!entry) {
      setStatus("Add a date, title, and note before saving.");
      return;
    }

    try {
      const current = strictArray(STORES.journal).map(sanitizeJournal).filter(Boolean);
      writeArray(STORES.journal, [entry, ...current]);
      form.reset();
      form.elements.date.value = localDay();
      form.elements.category.value = "Field note";
      refresh();
      setStatus("Farm note saved to the private Journal in this browser.");
    } catch {
      setStatus("The Farm Journal could not be updated safely. Open the full journal or make a backup before trying again.");
    }
  }

  function addHarvest(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const entry = sanitizeQuickHarvest({
      date: formData.get("date"),
      crop: formData.get("crop"),
      variety: formData.get("variety"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit"),
      destination: formData.get("destination"),
      saleAmount: formData.get("saleAmount"),
    });
    if (!entry) {
      setStatus("Add a valid harvest date, crop, and quantity before saving.");
      return;
    }

    try {
      const current = strictRecords();
      writeRecords({ ...current, harvests: [entry, ...current.harvests] });
      form.reset();
      form.elements.date.value = localDay();
      form.elements.unit.value = "lb";
      form.elements.destination.value = "home";
      refresh();
      setStatus("Harvest saved to private Farm Records in this browser.");
    } catch {
      setStatus("Farm Records could not be updated safely. Open the full records tool or make a backup before trying again.");
    }
  }

  function addExpense(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const entry = sanitizeQuickExpense({
      date: formData.get("date"),
      category: formData.get("category"),
      description: formData.get("description"),
      crop: formData.get("crop"),
      amount: formData.get("amount"),
    });
    if (!entry) {
      setStatus("Add a valid expense date, description, and amount before saving.");
      return;
    }

    try {
      const current = strictRecords();
      writeRecords({ ...current, expenses: [entry, ...current.expenses] });
      form.reset();
      form.elements.date.value = localDay();
      form.elements.category.value = "seed-plant";
      refresh();
      setStatus("Expense saved to private Farm Records in this browser.");
    } catch {
      setStatus("Farm Records could not be updated safely. Open the full records tool or make a backup before trying again.");
    }
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note">
        <strong>Private daily command center.</strong> Today reads and writes only the browser-local Farm OS stores already used by this site. Nothing here is synced, geolocated, or published.
      </div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="farm-summary-grid" aria-label="Today summary">
        <div className="farm-summary-card"><span>Due today</span><b>{ready ? summary.dueToday.length : "—"}</b></div>
        <div className="farm-summary-card"><span>Overdue open</span><b>{ready ? summary.overdue.length : "—"}</b></div>
        <div className="farm-summary-card"><span>Next 7 days</span><b>{ready ? summary.upcoming.length : "—"}</b></div>
        <div className="farm-summary-card"><span>Active crop plans</span><b>{ready ? summary.activePlans.length : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="today-queue-heading">
        <span className="eyebrow">Priority queue</span>
        <h2 id="today-queue-heading">What needs attention.</h2>
        {summary.queue.length ? (
          <div className="farm-record-list">
            {summary.queue.map((item) => {
              const timing = item.date < localDay() ? "Overdue" : item.date === localDay() ? "Today" : "Upcoming";
              return (
                <article className="farm-record" key={item.id}>
                  <div>
                    <div className="farm-record-meta">{timing} · {item.date} · {item.category} · {item.status}</div>
                    <h3>{item.task}</h3>
                    {item.notes ? <p>{item.notes}</p> : null}
                  </div>
                  <Link className="farm-action secondary" href="/farm-calendar">Calendar</Link>
                </article>
              );
            })}
          </div>
        ) : <div className="farm-empty">No overdue, today, or next-7-day farm tasks are saved in this browser.</div>}
      </section>

      <section className="farm-panel" aria-labelledby="today-capture-heading">
        <span className="eyebrow">Quick capture</span>
        <h2 id="today-capture-heading">Record the next thing without leaving Today.</h2>
        <div className="grid-2">
          <form className="packet" onSubmit={addTask}>
            <h3>Add a farm task</h3>
            <div className="farm-form-grid">
              <div className="farm-field"><label htmlFor="today-task-date">Date</label><input id="today-task-date" name="date" type="date" defaultValue={localDay()} required /></div>
              <div className="farm-field"><label htmlFor="today-task-category">Category</label><select id="today-task-category" name="category" defaultValue="Planting">{[...TASK_CATEGORIES].map((category) => <option key={category}>{category}</option>)}</select></div>
              <div className="farm-field wide"><label htmlFor="today-task">Task</label><input id="today-task" name="task" maxLength={180} required placeholder="Water starts before noon" /></div>
              <div className="farm-field wide"><label htmlFor="today-task-notes">Notes</label><textarea id="today-task-notes" name="notes" maxLength={600} placeholder="Optional details, materials, source, or follow-up." /></div>
            </div>
            <div className="farm-actions"><button className="farm-action" type="submit">Add task</button></div>
          </form>

          <form className="packet" onSubmit={addNote}>
            <h3>Add a farm note</h3>
            <div className="farm-form-grid">
              <div className="farm-field"><label htmlFor="today-note-date">Date</label><input id="today-note-date" name="date" type="date" defaultValue={localDay()} required /></div>
              <div className="farm-field"><label htmlFor="today-note-category">Category</label><select id="today-note-category" name="category" defaultValue="Field note">{[...JOURNAL_CATEGORIES].map((category) => <option key={category}>{category}</option>)}</select></div>
              <div className="farm-field wide"><label htmlFor="today-note-title">Title</label><input id="today-note-title" name="title" maxLength={120} required placeholder="What changed?" /></div>
              <div className="farm-field wide"><label htmlFor="today-note-body">Observation / note</label><textarea id="today-note-body" name="body" maxLength={2000} required placeholder="Capture the observation, decision, result, issue, or next action." /></div>
            </div>
            <div className="farm-actions"><button className="farm-action" type="submit">Save note</button></div>
          </form>

          <form className="packet" onSubmit={addHarvest}>
            <h3>Log a harvest</h3>
            <div className="farm-form-grid">
              <div className="farm-field"><label htmlFor="today-harvest-date">Harvest date</label><input id="today-harvest-date" name="date" type="date" defaultValue={localDay()} required /></div>
              <div className="farm-field"><label htmlFor="today-harvest-crop">Harvest crop</label><input id="today-harvest-crop" name="crop" maxLength={80} required placeholder="Tomato" /></div>
              <div className="farm-field"><label htmlFor="today-harvest-variety">Variety</label><input id="today-harvest-variety" name="variety" maxLength={100} placeholder="Cherokee Purple" /></div>
              <div className="farm-field"><label htmlFor="today-harvest-quantity">Quantity</label><input id="today-harvest-quantity" name="quantity" type="number" min="0.01" max="10000000" step="0.01" inputMode="decimal" required /></div>
              <div className="farm-field"><label htmlFor="today-harvest-unit">Unit</label><select id="today-harvest-unit" name="unit" defaultValue="lb">{[...HARVEST_UNITS].map((unit) => <option key={unit}>{unit}</option>)}</select></div>
              <div className="farm-field"><label htmlFor="today-harvest-destination">Destination</label><select id="today-harvest-destination" name="destination" defaultValue="home"><option value="home">Home use</option><option value="sold">Sold</option><option value="donated">Donated</option><option value="saved-seed">Saved seed</option><option value="other">Other</option></select></div>
              <div className="farm-field wide"><label htmlFor="today-harvest-sale">Sale amount, if sold</label><input id="today-harvest-sale" name="saleAmount" type="number" min="0" max="1000000000" step="0.01" inputMode="decimal" placeholder="0.00" /></div>
            </div>
            <div className="farm-actions"><button className="farm-action" type="submit">Save harvest</button></div>
          </form>

          <form className="packet" onSubmit={addExpense}>
            <h3>Log an expense</h3>
            <div className="farm-form-grid">
              <div className="farm-field"><label htmlFor="today-expense-date">Expense date</label><input id="today-expense-date" name="date" type="date" defaultValue={localDay()} required /></div>
              <div className="farm-field"><label htmlFor="today-expense-category">Expense category</label><select id="today-expense-category" name="category" defaultValue="seed-plant"><option value="seed-plant">Seed / plants</option><option value="soil-compost">Soil / compost</option><option value="fertility">Fertility</option><option value="irrigation">Irrigation</option><option value="packaging">Packaging</option><option value="equipment">Equipment</option><option value="market-fee">Market fee</option><option value="other">Other</option></select></div>
              <div className="farm-field wide"><label htmlFor="today-expense-description">Expense description</label><input id="today-expense-description" name="description" maxLength={160} required placeholder="Fall lettuce seed" /></div>
              <div className="farm-field"><label htmlFor="today-expense-crop">Expense crop (optional)</label><input id="today-expense-crop" name="crop" maxLength={80} placeholder="Lettuce" /></div>
              <div className="farm-field"><label htmlFor="today-expense-amount">Expense amount</label><input id="today-expense-amount" name="amount" type="number" min="0.01" max="1000000000" step="0.01" inputMode="decimal" required /></div>
            </div>
            <div className="farm-actions"><button className="farm-action" type="submit">Save expense</button></div>
          </form>
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="today-plans-heading">
        <span className="eyebrow">Crop plan</span>
        <h2 id="today-plans-heading">Active plans.</h2>
        {summary.plans.length ? (
          <div className="farm-record-list">
            {summary.plans.map((plan) => (
              <article className="farm-record" key={plan.id}>
                <div>
                  <div className="farm-record-meta">{plan.status}{plan.space ? ` · ${plan.space}` : ""}{nextPlanDate(plan) ? ` · next dated milestone ${nextPlanDate(plan)}` : ""}</div>
                  <h3>{plan.crop}{plan.variety ? ` · ${plan.variety}` : ""}</h3>
                </div>
                <Link className="farm-action secondary" href="/farm-planner">Planner</Link>
              </article>
            ))}
          </div>
        ) : <div className="farm-empty">No active crop plans are saved in this browser.</div>}
      </section>

      <section className="farm-panel" aria-labelledby="today-recent-heading">
        <span className="eyebrow">Recent activity</span>
        <h2 id="today-recent-heading">Latest browser-local records.</h2>
        {summary.recent.length ? (
          <div className="farm-record-list">
            {summary.recent.map((item) => (
              <article className="farm-record" key={item.id}>
                <div><div className="farm-record-meta">{item.date} · {item.type}</div><h3>{item.title}</h3>{item.detail ? <p>{item.detail}</p> : null}</div>
                <Link className="farm-action secondary" href={item.href}>Open</Link>
              </article>
            ))}
          </div>
        ) : <div className="farm-empty">No recent journal, harvest, or expense activity is saved in this browser.</div>}
      </section>

      <div className="farm-actions">
        <Link className="farm-action secondary" href="/farm-calendar">Full calendar</Link>
        <Link className="farm-action secondary" href="/farm-records">Farm records</Link>
        <Link className="farm-action secondary" href="/farm-journal">Farm journal</Link>
        <Link className="farm-action secondary" href="/farm-backup">Back up Farm OS</Link>
        <Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link>
      </div>
    </div>
  );
}
