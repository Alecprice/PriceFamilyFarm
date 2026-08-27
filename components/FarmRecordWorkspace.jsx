"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "price-family-farm-records-v2";
const EMPTY = { harvests: [], experiments: [], expenses: [] };

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FarmRecordWorkspace() {
  const [records, setRecords] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("harvests");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecords({
          harvests: Array.isArray(parsed.harvests) ? parsed.harvests : [],
          experiments: Array.isArray(parsed.experiments) ? parsed.experiments : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        });
      }
    } catch {
      // A damaged local backup should never prevent the public page from loading.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [loaded, records]);

  const totals = useMemo(() => {
    const sales = records.harvests.reduce((sum, item) => sum + Number(item.saleAmount || 0), 0);
    const expenses = records.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      harvests: records.harvests.length,
      experiments: records.experiments.length,
      sales,
      expenses,
      net: sales - expenses,
    };
  }, [records]);

  function addHarvest(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = {
      id: id("harvest"),
      date: data.get("date"),
      crop: data.get("crop")?.trim(),
      variety: data.get("variety")?.trim(),
      location: data.get("location")?.trim(),
      quantity: data.get("quantity"),
      unit: data.get("unit"),
      destination: data.get("destination"),
      saleAmount: data.get("saleAmount"),
      notes: data.get("notes")?.trim(),
    };
    setRecords((current) => ({ ...current, harvests: [entry, ...current.harvests] }));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
  }

  function addExperiment(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = {
      id: id("experiment"),
      date: data.get("date"),
      title: data.get("title")?.trim(),
      crop: data.get("crop")?.trim(),
      question: data.get("question")?.trim(),
      variable: data.get("variable")?.trim(),
      control: data.get("control")?.trim(),
      measure: data.get("measure")?.trim(),
      status: data.get("status"),
      result: data.get("result")?.trim(),
    };
    setRecords((current) => ({ ...current, experiments: [entry, ...current.experiments] }));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
  }

  function addExpense(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = {
      id: id("expense"),
      date: data.get("date"),
      category: data.get("category"),
      description: data.get("description")?.trim(),
      crop: data.get("crop")?.trim(),
      amount: data.get("amount"),
      notes: data.get("notes")?.trim(),
    };
    setRecords((current) => ({ ...current, expenses: [entry, ...current.expenses] }));
    event.currentTarget.reset();
    event.currentTarget.elements.date.value = today();
  }

  function remove(section, recordId) {
    setRecords((current) => ({
      ...current,
      [section]: current[section].filter((item) => item.id !== recordId),
    }));
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
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.harvests) || !Array.isArray(parsed.experiments) || !Array.isArray(parsed.expenses)) throw new Error("invalid");
        setRecords(parsed);
      } catch {
        window.alert("That file is not a valid Price Family Farm records backup.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-summary-grid" aria-label="Farm record summary">
        <div className="farm-summary-card"><span>Harvest records</span><b>{totals.harvests}</b></div>
        <div className="farm-summary-card"><span>Experiments</span><b>{totals.experiments}</b></div>
        <div className="farm-summary-card"><span>Recorded sales</span><b>{money(totals.sales)}</b></div>
        <div className="farm-summary-card"><span>Net cash recorded</span><b>{money(totals.net)}</b></div>
      </div>

      <div className="farm-tools-note">
        <strong>Private by default.</strong> These working records are stored only in this browser&rsquo;s local storage. They are not published with the farm website or sent to a server. Export a JSON backup regularly if the records matter to you.
      </div>

      <div className="farm-tabs" role="tablist" aria-label="Farm record type">
        <button type="button" role="tab" aria-selected={tab === "harvests"} onClick={() => setTab("harvests")}>Harvests &amp; sales</button>
        <button type="button" role="tab" aria-selected={tab === "experiments"} onClick={() => setTab("experiments")}>Experiments</button>
        <button type="button" role="tab" aria-selected={tab === "expenses"} onClick={() => setTab("expenses")}>Expenses</button>
        <button type="button" role="tab" aria-selected={tab === "backup"} onClick={() => setTab("backup")}>Backup &amp; export</button>
      </div>

      {tab === "harvests" ? <HarvestPanel records={records.harvests} onAdd={addHarvest} onRemove={(recordId) => remove("harvests", recordId)} /> : null}
      {tab === "experiments" ? <ExperimentPanel records={records.experiments} onAdd={addExperiment} onRemove={(recordId) => remove("experiments", recordId)} /> : null}
      {tab === "expenses" ? <ExpensePanel records={records.expenses} onAdd={addExpense} onRemove={(recordId) => remove("expenses", recordId)} total={totals.expenses} /> : null}
      {tab === "backup" ? (
        <section className="farm-panel" role="tabpanel">
          <h2>Own your records.</h2>
          <p>Download a complete JSON backup for restoration, or a CSV that can be opened in Excel, Numbers, Google Sheets, or accounting tools.</p>
          <div className="farm-actions">
            <button className="farm-action" type="button" onClick={exportJson}>Download JSON backup</button>
            <button className="farm-action secondary" type="button" onClick={exportCsv}>Download CSV</button>
            <label className="farm-action secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Restore JSON backup
              <input type="file" accept="application/json,.json" onChange={importJson} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} />
            </label>
          </div>
        </section>
      ) : null}
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
          <Field label="Date"><input name="date" type="date" defaultValue={today()} required /></Field>
          <Field label="Crop"><input name="crop" type="text" placeholder="Tomato" maxLength={80} required /></Field>
          <Field label="Variety"><input name="variety" type="text" placeholder="Cherokee Purple" maxLength={100} /></Field>
          <Field label="Growing area"><input name="location" type="text" placeholder="High tunnel, Bed 2, Greenhouse" maxLength={100} /></Field>
          <Field label="Quantity"><input name="quantity" type="number" min="0" step="0.01" inputMode="decimal" required /></Field>
          <Field label="Unit"><select name="unit" defaultValue="lb"><option value="lb">lb</option><option value="oz">oz</option><option value="count">count</option><option value="bunch">bunch</option><option value="pint">pint</option><option value="quart">quart</option><option value="tray">tray</option></select></Field>
          <Field label="Destination"><select name="destination" defaultValue="home"><option value="home">Home use</option><option value="sold">Sold</option><option value="donated">Donated</option><option value="saved-seed">Saved seed</option><option value="other">Other</option></select></Field>
          <Field label="Sale amount, if sold"><input name="saleAmount" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" /></Field>
          <Field label="Notes" wide><textarea name="notes" maxLength={500} placeholder="Quality, pest pressure, harvest timing, customer feedback…" /></Field>
        </div>
        <div className="farm-actions"><button className="farm-action" type="submit">Save harvest</button></div>
      </form>
      <RecordList records={records} empty="No harvests recorded in this browser yet." render={(item) => ({
        meta: `${item.date} · ${item.quantity} ${item.unit} · ${item.destination}`,
        title: [item.crop, item.variety].filter(Boolean).join(" · "),
        detail: [item.location, item.saleAmount ? `Sale ${money(item.saleAmount)}` : "", item.notes].filter(Boolean).join(" · "),
      })} onRemove={onRemove} />
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
          <Field label="Start / observation date"><input name="date" type="date" defaultValue={today()} required /></Field>
          <Field label="Status"><select name="status" defaultValue="planned"><option value="planned">Planned</option><option value="running">Running</option><option value="complete">Complete</option><option value="stopped">Stopped</option></select></Field>
          <Field label="Experiment title"><input name="title" type="text" placeholder="Potting mix comparison" maxLength={120} required /></Field>
          <Field label="Crop"><input name="crop" type="text" placeholder="Pepper starts" maxLength={80} /></Field>
          <Field label="Question" wide><textarea name="question" maxLength={500} placeholder="Which mix holds enough moisture without staying too wet?" required /></Field>
          <Field label="Variable changed"><input name="variable" type="text" maxLength={180} placeholder="Mix recipe" /></Field>
          <Field label="Control / baseline"><input name="control" type="text" maxLength={180} placeholder="Current standard mix" /></Field>
          <Field label="What will be measured" wide><input name="measure" type="text" maxLength={240} placeholder="Watering interval, growth, root condition" /></Field>
          <Field label="Result / observation" wide><textarea name="result" maxLength={800} placeholder="Leave blank until there is a real observation." /></Field>
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
          <Field label="Date"><input name="date" type="date" defaultValue={today()} required /></Field>
          <Field label="Category"><select name="category" defaultValue="seed-plant"><option value="seed-plant">Seed / plants</option><option value="soil-compost">Soil / compost</option><option value="fertility">Fertility</option><option value="irrigation">Irrigation</option><option value="packaging">Packaging</option><option value="equipment">Equipment</option><option value="market-fee">Market fee</option><option value="other">Other</option></select></Field>
          <Field label="Description"><input name="description" type="text" maxLength={160} placeholder="Seed order" required /></Field>
          <Field label="Crop, if attributable"><input name="crop" type="text" maxLength={80} placeholder="Tomatoes" /></Field>
          <Field label="Amount"><input name="amount" type="number" min="0" step="0.01" inputMode="decimal" required /></Field>
          <Field label="Notes"><input name="notes" type="text" maxLength={300} /></Field>
        </div>
        <div className="farm-actions"><button className="farm-action" type="submit">Save expense</button></div>
      </form>
      <RecordList records={records} empty="No expenses recorded in this browser yet." render={(item) => ({ meta: `${item.date} · ${item.category}`, title: `${item.description} · ${money(item.amount)}`, detail: [item.crop, item.notes].filter(Boolean).join(" · ") })} onRemove={onRemove} />
    </section>
  );
}

function Field({ label, wide = false, children }) {
  return <div className={`farm-field${wide ? " wide" : ""}`}><label>{label}</label>{children}</div>;
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
