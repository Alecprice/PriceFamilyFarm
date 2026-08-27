"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-records-v2";
const MAX_BACKUP_BYTES = 2_000_000;
const MAX_RECORDS_PER_SECTION = 5_000;
const EMPTY = { harvests: [], experiments: [], expenses: [] };

const HARVEST_UNITS = new Set(["lb", "oz", "count", "bunch", "pint", "quart", "tray"]);
const HARVEST_DESTINATIONS = new Set(["home", "sold", "donated", "saved-seed", "other"]);
const EXPERIMENT_STATUSES = new Set(["planned", "running", "complete", "stopped"]);
const EXPENSE_CATEGORIES = new Set(["seed-plant", "soil-compost", "fertility", "irrigation", "packaging", "equipment", "market-fee", "other"]);

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function text(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function date(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function numberString(value, { max = 1_000_000_000 } = {}) {
  if (value === "" || value == null) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > max) return "";
  return String(numeric);
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
}

// Spreadsheet programs can execute formulas from CSV cells beginning with
// =, +, -, or @. Prefixing user-controlled values with an apostrophe keeps
// the exported sheet inert without changing the visible value in Excel.
function csvEscape(value) {
  let cell = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(cell)) cell = `'${cell}`;
  return /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeHarvest(item, index) {
  const unit = HARVEST_UNITS.has(item?.unit) ? item.unit : "lb";
  const destination = HARVEST_DESTINATIONS.has(item?.destination) ? item.destination : "home";
  const crop = text(item?.crop, 80);
  const quantity = numberString(item?.quantity, { max: 10_000_000 });
  if (!crop || !quantity || !date(item?.date)) return null;
  return {
    id: `harvest-${Date.now()}-${index}`,
    date: date(item.date),
    crop,
    variety: text(item?.variety, 100),
    location: text(item?.location, 100),
    quantity,
    unit,
    destination,
    saleAmount: numberString(item?.saleAmount),
    notes: text(item?.notes, 500),
  };
}

function sanitizeExperiment(item, index) {
  const status = EXPERIMENT_STATUSES.has(item?.status) ? item.status : "planned";
  const title = text(item?.title, 120);
  if (!title || !date(item?.date)) return null;
  return {
    id: `experiment-${Date.now()}-${index}`,
    date: date(item.date),
    title,
    crop: text(item?.crop, 80),
    question: text(item?.question, 500),
    variable: text(item?.variable, 180),
    control: text(item?.control, 180),
    measure: text(item?.measure, 240),
    status,
    result: text(item?.result, 800),
  };
}

function sanitizeExpense(item, index) {
  const category = EXPENSE_CATEGORIES.has(item?.category) ? item.category : "other";
  const description = text(item?.description, 160);
  const amount = numberString(item?.amount);
  if (!description || !amount || !date(item?.date)) return null;
  return {
    id: `expense-${Date.now()}-${index}`,
    date: date(item.date),
    category,
    description,
    crop: text(item?.crop, 80),
    amount,
    notes: text(item?.notes, 300),
  };
}

function sanitizeRecords(value) {
  if (!value || typeof value !== "object") return null;
  if (!Array.isArray(value.harvests) || !Array.isArray(value.experiments) || !Array.isArray(value.expenses)) return null;

  return {
    harvests: value.harvests.slice(0, MAX_RECORDS_PER_SECTION).map(sanitizeHarvest).filter(Boolean),
    experiments: value.experiments.slice(0, MAX_RECORDS_PER_SECTION).map(sanitizeExperiment).filter(Boolean),
    expenses: value.expenses.slice(0, MAX_RECORDS_PER_SECTION).map(sanitizeExpense).filter(Boolean),
  };
}

export default function FarmRecordWorkspace() {
  const [records, setRecords] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("harvests");
  const [storageNotice, setStorageNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.length <= MAX_BACKUP_BYTES) {
        const sanitized = sanitizeRecords(JSON.parse(saved));
        if (sanitized) setRecords(sanitized);
      }
    } catch {
      setStorageNotice("A saved browser record could not be read, so it was not loaded.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      setStorageNotice("This browser could not save the latest change. Export a backup before leaving this page.");
    }
  }, [loaded, records]);

  const totals = useMemo(() => {
    const sales = records.harvests.reduce((sum, item) => sum + Number(item.saleAmount || 0), 0);
    const expenses = records.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { harvests: records.harvests.length, experiments: records.experiments.length, sales, expenses, net: sales - expenses };
  }, [records]);

  function addHarvest(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = sanitizeHarvest({
      date: data.get("date"), crop: data.get("crop"), variety: data.get("variety"), location: data.get("location"), quantity: data.get("quantity"), unit: data.get("unit"), destination: data.get("destination"), saleAmount: data.get("saleAmount"), notes: data.get("notes"),
    }, records.harvests.length);
    if (!entry) return;
    entry.id = id("harvest");
    setRecords((current) => ({ ...current, harvests: [entry, ...current.harvests].slice(0, MAX_RECORDS_PER_SECTION) }));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
  }

  function addExperiment(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = sanitizeExperiment({
      date: data.get("date"), title: data.get("title"), crop: data.get("crop"), question: data.get("question"), variable: data.get("variable"), control: data.get("control"), measure: data.get("measure"), status: data.get("status"), result: data.get("result"),
    }, records.experiments.length);
    if (!entry) return;
    entry.id = id("experiment");
    setRecords((current) => ({ ...current, experiments: [entry, ...current.experiments].slice(0, MAX_RECORDS_PER_SECTION) }));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
  }

  function addExpense(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = sanitizeExpense({
      date: data.get("date"), category: data.get("category"), description: data.get("description"), crop: data.get("crop"), amount: data.get("amount"), notes: data.get("notes"),
    }, records.expenses.length);
    if (!entry) return;
    entry.id = id("expense");
    setRecords((current) => ({ ...current, expenses: [entry, ...current.expenses].slice(0, MAX_RECORDS_PER_SECTION) }));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
  }

  function remove(section, recordId) {
    setRecords((current) => ({ ...current, [section]: current[section].filter((item) => item.id !== recordId) }));
  }

  function exportJson() {
    download(`price-family-farm-records-${today()}.json`, JSON.stringify(records, null, 2), "application/json");
  }

  function exportCsv() {
    const rows = [["record_type", "date", "crop", "title_or_description", "quantity", "unit", "sales", "expense", "status", "notes"]];
    records.harvests.forEach((item) => rows.push(["harvest", item.date, item.crop, item.variety || item.destination, item.quantity, item.unit, item.saleAmount, "", item.destination, item.notes]));
    records.experiments.forEach((item) => rows.push(["experiment", item.date, item.crop, item.title, "", "", "", "", item.status, [item.question, item.result].filter(Boolean).join(" — ")]));
    records.expenses.forEach((item) => rows.push(["expense", item.date, item.crop, item.description, "", "", "", item.amount, item.category, item.notes]));
    download(`price-family-farm-records-${today()}.csv`, rows.map((row) => row.map(csvEscape).join(",")).join("\n"), "text/csv;charset=utf-8");
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      window.alert("That backup is too large to import safely.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = String(reader.result || "");
        if (raw.length > MAX_BACKUP_BYTES) throw new Error("too-large");
        const sanitized = sanitizeRecords(JSON.parse(raw));
        if (!sanitized) throw new Error("invalid");
        setRecords(sanitized);
        setStorageNotice("Backup restored after validating and sanitizing its records.");
      } catch {
        window.alert("That file is not a valid Price Family Farm records backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-summary-grid" aria-label="Farm record summary">
        <div className="farm-summary-card"><span>Harvest records</span><b>{totals.harvests}</b></div>
        <div className="farm-summary-card"><span>Experiments</span><b>{totals.experiments}</b></div>
        <div className="farm-summary-card"><span>Recorded sales</span><b>{money(totals.sales)}</b></div>
        <div className="farm-summary-card"><span>Net cash recorded</span><b>{money(totals.net)}</b></div>
      </div>

      <div className="farm-tools-note"><strong>Private by default.</strong> These working records stay in this browser&rsquo;s local storage. They are not published with the farm website or sent to a server. Export a JSON backup regularly if the records matter to you.</div>
      {storageNotice ? <div className="farm-tools-note" role="status">{storageNotice}</div> : null}

      <div className="farm-tabs" role="tablist" aria-label="Farm record type">
        <button type="button" role="tab" aria-selected={tab === "harvests"} onClick={() => setTab("harvests")}>Harvests &amp; sales</button>
        <button type="button" role="tab" aria-selected={tab === "experiments"} onClick={() => setTab("experiments")}>Experiments</button>
        <button type="button" role="tab" aria-selected={tab === "expenses"} onClick={() => setTab("expenses")}>Expenses</button>
        <button type="button" role="tab" aria-selected={tab === "backup"} onClick={() => setTab("backup")}>Backup &amp; export</button>
      </div>

      {tab === "harvests" ? <HarvestPanel records={records.harvests} onAdd={addHarvest} onRemove={(recordId) => remove("harvests", recordId)} /> : null}
      {tab === "experiments" ? <ExperimentPanel records={records.experiments} onAdd={addExperiment} onRemove={(recordId) => remove("experiments", recordId)} /> : null}
      {tab === "expenses" ? <ExpensePanel records={records.expenses} onAdd={addExpense} onRemove={(recordId) => remove("expenses", recordId)} total={totals.expenses} /> : null}
      {tab === "backup" ? <BackupPanel onJson={exportJson} onCsv={exportCsv} onImport={importJson} /> : null}
    </div>
  );
}

function HarvestPanel({ records, onAdd, onRemove }) {
  return (
    <section className="farm-panel" role="tabpanel">
      <h2>Log a harvest.</h2>
      <p>Capture enough detail to compare crops, varieties, growing areas, and revenue later without making data entry a chore.</p>
      <form onSubmit={onAdd}>
        <div className="farm-form-grid">
          <Field id="harvest-date" label="Date"><input id="harvest-date" name="date" type="date" defaultValue={today()} required /></Field>
          <Field id="harvest-crop" label="Crop"><input id="harvest-crop" name="crop" type="text" placeholder="Tomato" maxLength={80} required /></Field>
          <Field id="harvest-variety" label="Variety"><input id="harvest-variety" name="variety" type="text" placeholder="Cherokee Purple" maxLength={100} /></Field>
          <Field id="harvest-location" label="Growing area"><input id="harvest-location" name="location" type="text" placeholder="High tunnel, Bed 2, Greenhouse" maxLength={100} /></Field>
          <Field id="harvest-quantity" label="Quantity"><input id="harvest-quantity" name="quantity" type="number" min="0.01" max="10000000" step="0.01" inputMode="decimal" required /></Field>
          <Field id="harvest-unit" label="Unit"><select id="harvest-unit" name="unit" defaultValue="lb"><option value="lb">lb</option><option value="oz">oz</option><option value="count">count</option><option value="bunch">bunch</option><option value="pint">pint</option><option value="quart">quart</option><option value="tray">tray</option></select></Field>
          <Field id="harvest-destination" label="Destination"><select id="harvest-destination" name="destination" defaultValue="home"><option value="home">Home use</option><option value="sold">Sold</option><option value="donated">Donated</option><option value="saved-seed">Saved seed</option><option value="other">Other</option></select></Field>
          <Field id="harvest-sale" label="Sale amount, if sold"><input id="harvest-sale" name="saleAmount" type="number" min="0" max="1000000000" step="0.01" inputMode="decimal" placeholder="0.00" /></Field>
          <Field id="harvest-notes" label="Notes" wide><textarea id="harvest-notes" name="notes" maxLength={500} placeholder="Quality, pest pressure, harvest timing, customer feedback…" /></Field>
        </div>
        <div className="farm-actions"><button className="farm-action" type="submit">Save harvest</button></div>
      </form>
      <RecordList records={records} empty="No harvests recorded in this browser yet." render={(item) => ({ meta: `${item.date} · ${item.quantity} ${item.unit} · ${item.destination}`, title: [item.crop, item.variety].filter(Boolean).join(" · "), detail: [item.location, item.saleAmount ? `Sale ${money(item.saleAmount)}` : "", item.notes].filter(Boolean).join(" · ") })} onRemove={onRemove} />
    </section>
  );
}

function ExperimentPanel({ records, onAdd, onRemove }) {
  return (
    <section className="farm-panel" role="tabpanel">
      <h2>Turn a hunch into an experiment.</h2>
      <p>Record the question, what changed, what stayed constant, and the result. An unfinished trial stays visibly unfinished.</p>
      <form onSubmit={onAdd}>
        <div className="farm-form-grid">
          <Field id="experiment-date" label="Start / observation date"><input id="experiment-date" name="date" type="date" defaultValue={today()} required /></Field>
          <Field id="experiment-status" label="Status"><select id="experiment-status" name="status" defaultValue="planned"><option value="planned">Planned</option><option value="running">Running</option><option value="complete">Complete</option><option value="stopped">Stopped</option></select></Field>
          <Field id="experiment-title" label="Experiment title"><input id="experiment-title" name="title" type="text" placeholder="Potting mix comparison" maxLength={120} required /></Field>
          <Field id="experiment-crop" label="Crop"><input id="experiment-crop" name="crop" type="text" placeholder="Pepper starts" maxLength={80} /></Field>
          <Field id="experiment-question" label="Question" wide><textarea id="experiment-question" name="question" maxLength={500} placeholder="Which mix holds enough moisture without staying too wet?" required /></Field>
          <Field id="experiment-variable" label="Variable changed"><input id="experiment-variable" name="variable" type="text" maxLength={180} placeholder="Mix recipe" /></Field>
          <Field id="experiment-control" label="Control / baseline"><input id="experiment-control" name="control" type="text" maxLength={180} placeholder="Current standard mix" /></Field>
          <Field id="experiment-measure" label="What will be measured" wide><input id="experiment-measure" name="measure" type="text" maxLength={240} placeholder="Watering interval, growth, root condition" /></Field>
          <Field id="experiment-result" label="Result / observation" wide><textarea id="experiment-result" name="result" maxLength={800} placeholder="Leave blank until there is a real observation." /></Field>
        </div>
        <div className="farm-actions"><button className="farm-action" type="submit">Save experiment</button></div>
      </form>
      <RecordList records={records} empty="No experiments recorded in this browser yet." render={(item) => ({ meta: `${item.date} · ${item.status}`, title: item.title, detail: [item.crop, item.question, item.result].filter(Boolean).join(" · ") })} onRemove={onRemove} />
    </section>
  );
}

function ExpensePanel({ records, onAdd, onRemove, total }) {
  return (
    <section className="farm-panel" role="tabpanel">
      <h2>Track direct farm expenses.</h2>
      <p>Tag costs to a crop when practical. Over time, crop-tagged sales and expenses make profitability decisions less dependent on memory.</p>
      <p><strong>Total recorded expenses: {money(total)}</strong></p>
      <form onSubmit={onAdd}>
        <div className="farm-form-grid">
          <Field id="expense-date" label="Date"><input id="expense-date" name="date" type="date" defaultValue={today()} required /></Field>
          <Field id="expense-category" label="Category"><select id="expense-category" name="category" defaultValue="seed-plant"><option value="seed-plant">Seed / plants</option><option value="soil-compost">Soil / compost</option><option value="fertility">Fertility</option><option value="irrigation">Irrigation</option><option value="packaging">Packaging</option><option value="equipment">Equipment</option><option value="market-fee">Market fee</option><option value="other">Other</option></select></Field>
          <Field id="expense-description" label="Description"><input id="expense-description" name="description" type="text" maxLength={160} placeholder="Seed order" required /></Field>
          <Field id="expense-crop" label="Crop, if attributable"><input id="expense-crop" name="crop" type="text" maxLength={80} placeholder="Tomatoes" /></Field>
          <Field id="expense-amount" label="Amount"><input id="expense-amount" name="amount" type="number" min="0.01" max="1000000000" step="0.01" inputMode="decimal" required /></Field>
          <Field id="expense-notes" label="Notes"><input id="expense-notes" name="notes" type="text" maxLength={300} /></Field>
        </div>
        <div className="farm-actions"><button className="farm-action" type="submit">Save expense</button></div>
      </form>
      <RecordList records={records} empty="No expenses recorded in this browser yet." render={(item) => ({ meta: `${item.date} · ${item.category}`, title: `${item.description} · ${money(item.amount)}`, detail: [item.crop, item.notes].filter(Boolean).join(" · ") })} onRemove={onRemove} />
    </section>
  );
}

function BackupPanel({ onJson, onCsv, onImport }) {
  return (
    <section className="farm-panel" role="tabpanel">
      <h2>Own your records.</h2>
      <p>Download a complete JSON backup for restoration, or a CSV that can be opened in Excel, Numbers, Google Sheets, or accounting tools. Imported backups are size-limited and sanitized before they are stored.</p>
      <div className="farm-actions">
        <button className="farm-action" type="button" onClick={onJson}>Download JSON backup</button>
        <button className="farm-action secondary" type="button" onClick={onCsv}>Download CSV</button>
        <label className="farm-action secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Restore JSON backup<input type="file" accept="application/json,.json" onChange={onImport} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} /></label>
      </div>
    </section>
  );
}

function Field({ id: fieldId, label, wide = false, children }) {
  return <div className={`farm-field${wide ? " wide" : ""}`}><label htmlFor={fieldId}>{label}</label>{children}</div>;
}

function RecordList({ records, empty, render, onRemove }) {
  if (!records.length) return <div className="farm-empty">{empty}</div>;
  return (
    <div className="farm-record-list">
      {records.map((item) => {
        const display = render(item);
        return <article className="farm-record" key={item.id}><div><div className="farm-record-meta">{display.meta}</div><h3>{display.title}</h3>{display.detail ? <p>{display.detail}</p> : null}</div><button type="button" className="farm-action danger" onClick={() => onRemove(item.id)} aria-label={`Delete ${display.title}`}>Delete</button></article>;
      })}
    </div>
  );
}
