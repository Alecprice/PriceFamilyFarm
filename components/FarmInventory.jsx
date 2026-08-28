"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay } from "@/lib/localDate";

const STORAGE_KEY = "price-family-farm-inventory-v1";
const MAX_BYTES = 500_000;
const MAX_ITEMS = 500;
const CATEGORIES = ["Seeds & plants", "Growing media", "Fertility", "Irrigation", "Containers & trays", "Packaging", "Tools & equipment", "Market supplies", "Other"];
const UNITS = ["each", "pack", "bag", "lb", "oz", "gal", "qt", "ft", "roll", "tray", "case"];

function text(value, max = 160) {
  return String(value ?? "").trim().slice(0, max);
}

function numberString(value, max = 1_000_000) {
  if (value === "" || value == null) return "";
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0 || next > max) return "";
  return String(next);
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `inventory-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitize(item, fallbackIndex = 0) {
  const name = text(item?.name, 120);
  if (!name) return null;
  return {
    id: text(item?.id, 120) || `inventory-${fallbackIndex}`,
    name,
    category: CATEGORIES.includes(item?.category) ? item.category : "Other",
    quantity: numberString(item?.quantity) || "0",
    unit: UNITS.includes(item?.unit) ? item.unit : "each",
    reorderAt: numberString(item?.reorderAt) || "0",
    supplier: text(item?.supplier, 120),
    lastCost: numberString(item?.lastCost, 1_000_000),
    notes: text(item?.notes, 600),
    updatedDate: /^\d{4}-\d{2}-\d{2}$/.test(String(item?.updatedDate || "")) ? item.updatedDate : localDay(),
  };
}

function readItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  if (raw.length > MAX_BYTES) throw new Error("inventory-too-large");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("invalid-inventory");
  const seen = new Set();
  return parsed.slice(0, MAX_ITEMS).map(sanitize).filter(Boolean).map((item) => {
    let id = item.id;
    if (seen.has(id)) id = makeId();
    seen.add(id);
    return { ...item, id };
  });
}

function writeItems(items) {
  const payload = JSON.stringify(items.slice(0, MAX_ITEMS));
  if (payload.length > MAX_BYTES) throw new Error("inventory-too-large");
  localStorage.setItem(STORAGE_KEY, payload);
}

function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function FarmInventory() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(readItems());
    } catch {
      setStatus("Inventory data in this browser could not be read safely. Use Farm OS backup/data-health tools before replacing it.");
    } finally {
      setReady(true);
    }
  }, []);

  const lowStock = useMemo(() => items.filter((item) => Number(item.quantity) <= Number(item.reorderAt)), [items]);
  const visible = useMemo(() => {
    const source = filter === "low" ? lowStock : items;
    return [...source].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [filter, items, lowStock]);

  function persist(next, message) {
    try {
      writeItems(next);
      setItems(next);
      setStatus(message);
      return true;
    } catch {
      setStatus("Inventory could not be updated safely. Make a Farm OS backup before trying again.");
      return false;
    }
  }

  function addItem(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = sanitize({
      id: makeId(),
      name: data.get("name"),
      category: data.get("category"),
      quantity: data.get("quantity"),
      unit: data.get("unit"),
      reorderAt: data.get("reorderAt"),
      supplier: data.get("supplier"),
      lastCost: data.get("lastCost"),
      notes: data.get("notes"),
      updatedDate: localDay(),
    });
    if (!next) {
      setStatus("Add an item name before saving inventory.");
      return;
    }
    if (items.length >= MAX_ITEMS) {
      setStatus("Inventory has reached the 500-item local safety limit. Export or clean up old entries before adding more.");
      return;
    }
    if (persist([next, ...items], `${next.name} added to browser-local inventory.`)) form.reset();
  }

  function adjust(id, delta) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const quantity = Math.max(0, Number(current.quantity) + delta);
    const next = items.map((item) => item.id === id ? { ...item, quantity: String(quantity), updatedDate: localDay() } : item);
    persist(next, `${current.name} quantity updated to ${quantity} ${current.unit}.`);
  }

  function removeItem(id) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    if (!window.confirm(`Delete ${current.name} from this browser's farm inventory? This cannot be undone unless it is in a backup.`)) return;
    persist(items.filter((item) => item.id !== id), `${current.name} deleted from farm inventory.`);
  }

  return (
    <div className="farm-tools-shell">
      <div className="farm-tools-note"><strong>Private supply inventory.</strong> Quantities, supplier names, costs, and notes stay in this browser. Low-stock status is calculated locally; Farm OS does not place orders or contact suppliers.</div>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="farm-summary-grid" aria-label="Farm inventory summary">
        <div className="farm-summary-card"><span>Tracked items</span><b>{ready ? items.length : "—"}</b></div>
        <div className="farm-summary-card"><span>Low stock</span><b>{ready ? lowStock.length : "—"}</b></div>
        <div className="farm-summary-card"><span>At healthy level</span><b>{ready ? Math.max(0, items.length - lowStock.length) : "—"}</b></div>
      </div>

      <section className="farm-panel" aria-labelledby="inventory-add-heading">
        <span className="eyebrow">Add supply</span>
        <h2 id="inventory-add-heading">Track what the farm needs to keep moving.</h2>
        <form onSubmit={addItem} className="farm-form">
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="inventory-name">Item</label><input id="inventory-name" name="name" maxLength={120} required placeholder="Potting mix" /></div>
            <div className="farm-field"><label htmlFor="inventory-category">Category</label><select id="inventory-category" name="category" defaultValue="Seeds & plants">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="inventory-quantity">Quantity on hand</label><input id="inventory-quantity" name="quantity" type="number" min="0" step="0.01" defaultValue="0" /></div>
            <div className="farm-field"><label htmlFor="inventory-unit">Unit</label><select id="inventory-unit" name="unit" defaultValue="each">{UNITS.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="farm-field"><label htmlFor="inventory-reorder">Reorder at or below</label><input id="inventory-reorder" name="reorderAt" type="number" min="0" step="0.01" defaultValue="0" /></div>
            <div className="farm-field"><label htmlFor="inventory-supplier">Supplier</label><input id="inventory-supplier" name="supplier" maxLength={120} placeholder="Optional" /></div>
            <div className="farm-field"><label htmlFor="inventory-cost">Last cost</label><input id="inventory-cost" name="lastCost" type="number" min="0" step="0.01" placeholder="0.00" /></div>
          </div>
          <div className="farm-field"><label htmlFor="inventory-notes">Notes</label><textarea id="inventory-notes" name="notes" maxLength={600} rows={3} placeholder="Brand, size, preferred source, or reorder note" /></div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add inventory item</button></div>
        </form>
      </section>

      <section className="farm-panel" aria-labelledby="inventory-list-heading">
        <span className="eyebrow">Supply status</span>
        <h2 id="inventory-list-heading">Know what is low before it stops the work.</h2>
        <div className="farm-actions" role="group" aria-label="Inventory filter">
          <button className={`farm-action${filter === "all" ? "" : " secondary"}`} type="button" onClick={() => setFilter("all")}>All items</button>
          <button className={`farm-action${filter === "low" ? "" : " secondary"}`} type="button" onClick={() => setFilter("low")}>Low stock ({lowStock.length})</button>
        </div>
        {visible.length ? <div className="farm-record-list">{visible.map((item) => {
          const isLow = Number(item.quantity) <= Number(item.reorderAt);
          return <article className="farm-record" key={item.id}>
            <div>
              <div className="farm-record-meta">{item.category} · Updated {item.updatedDate}</div>
              <h3>{item.name}</h3>
              <p><strong>{item.quantity} {item.unit}</strong> on hand · Reorder at {item.reorderAt} {item.unit}{item.supplier ? ` · Supplier: ${item.supplier}` : ""}{item.lastCost ? ` · Last cost: ${money(item.lastCost)}` : ""}</p>
              <p>{isLow ? "Low stock — add this to the next supply run." : "Stock level is above the saved reorder threshold."}</p>
              {item.notes ? <p>{item.notes}</p> : null}
            </div>
            <div className="farm-actions" aria-label={`Inventory actions for ${item.name}`}>
              <button className="farm-action secondary" type="button" onClick={() => adjust(item.id, -1)} aria-label={`Decrease ${item.name} quantity`}>−1</button>
              <button className="farm-action secondary" type="button" onClick={() => adjust(item.id, 1)} aria-label={`Increase ${item.name} quantity`}>+1</button>
              <button className="farm-action danger" type="button" onClick={() => removeItem(item.id)} aria-label={`Delete ${item.name}`}>Delete</button>
            </div>
          </article>;
        })}</div> : <div className="farm-empty">{filter === "low" ? "No tracked supplies are at or below their reorder threshold." : "No farm supplies are tracked in this browser yet."}</div>}
      </section>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-os">Back to Farm OS</Link><Link className="farm-action secondary" href="/farm-backup">Back up Farm OS</Link></div>
    </div>
  );
}
