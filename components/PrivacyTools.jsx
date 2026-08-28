"use client";

import { useState } from "react";

const LOCAL_DATA = [
  {
    key: "price-family-farm-records-v2",
    id: "records",
    label: "Farm records",
    detail: "Harvests, sales, expenses, experiments, and their local backup state.",
  },
  {
    key: "price-family-farm-funding-v1",
    id: "funding",
    label: "Funding & education tracker",
    detail: "Locally saved funding opportunities, statuses, deadlines, links, and notes.",
  },
  {
    key: "price-family-farm-planner-v1",
    id: "planner",
    label: "Farm planner",
    detail: "Crop plans, varieties, working spaces, dates, statuses, and planning notes.",
  },
  {
    key: "price-family-farm-plantings-v1",
    id: "plantings",
    label: "Plantings & successions",
    detail: "Browser-local crop, bed, timing, spacing, expected harvest, and succession records.",
  },
  {
    key: "price-family-farm-inventory-v1",
    id: "inventory",
    label: "Farm inventory",
    detail: "Supply names, quantities, reorder thresholds, suppliers, costs, and notes.",
  },
  {
    key: "price-family-farm-calendar-v1",
    id: "calendar",
    label: "Farm calendar",
    detail: "Planting, harvest, maintenance, market, funding, weather, and other local tasks.",
  },
  {
    key: "price-family-farm-journal-v1",
    id: "journal",
    label: "Farm journal",
    detail: "Private browser-local field notes, observations, planning notes, and market notes.",
  },
  {
    key: "price-family-farm-garden-layout-v1",
    id: "garden-layout",
    label: "Garden layout builder",
    detail: "Saved bed names, dimensions, crop uses, and layout notes.",
  },
  {
    key: "price-family-farm-map-v1",
    id: "farm-map",
    label: "Schematic farm map",
    detail: "Non-geographic working-zone labels, uses, area estimates, statuses, and notes.",
  },
  {
    key: "price-family-farm-weather-v1",
    id: "weather",
    label: "Weather cache",
    detail: "The recent National Weather Service forecast cached by this browser.",
  },
  {
    key: "price-family-farm-backup-meta-v1",
    id: "backup-meta",
    label: "Backup history metadata",
    detail: "The date and store count from the most recent Farm OS backup prepared in this browser.",
  },
  {
    key: "price-family-farm-pre-restore-snapshot-v1",
    id: "pre-restore",
    label: "Pre-restore recovery snapshot",
    detail: "A local safety copy captured immediately before the most recent validated restore, when available.",
  },
  {
    key: "price-family-farm-pre-repair-snapshot-v1",
    id: "pre-repair",
    label: "Pre-repair recovery snapshot",
    detail: "A local safety copy captured before the most recent Farm OS data-health repair, when available.",
  },
  {
    key: "price-family-farm-schema-meta-v1",
    id: "schema-meta",
    label: "Schema maintenance metadata",
    detail: "The local Farm OS maintenance/schema version and last repair timestamp.",
  },
];

export default function PrivacyTools() {
  const [selected, setSelected] = useState(() => new Set(["records", "funding"]));
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setStatus("");
  }

  function clearSelected() {
    if (confirmation !== "CLEAR" || selected.size === 0) return;

    let removed = 0;
    try {
      for (const item of LOCAL_DATA) {
        if (!selected.has(item.id)) continue;
        localStorage.removeItem(item.key);
        removed += 1;
      }
      setConfirmation("");
      setStatus(`Cleared ${removed} selected local data ${removed === 1 ? "area" : "areas"} from this browser.`);
    } catch {
      setStatus("This browser did not allow the selected local data to be cleared. Check browser storage/privacy settings and try again.");
    }
  }

  return (
    <section className="farm-panel">
      <span className="eyebrow">Browser-local privacy</span>
      <h2 style={{ marginTop: 8 }}>Clear Farm OS data from this device.</h2>
      <p>
        These controls only affect this browser profile. They do not delete exported JSON/CSV backups, messages already sent through the contact forms, or data stored on another device.
      </p>
      <p>
        Farm OS working tools and local recovery metadata are included individually so you can remove one area without wiping unrelated records.
      </p>

      <div className="farm-record-list" role="group" aria-label="Local data areas to clear">
        {LOCAL_DATA.map((item) => (
          <label className="farm-record" key={item.id} style={{ cursor: "pointer" }}>
            <div>
              <h3>{item.label}</h3>
              <p>{item.detail}</p>
            </div>
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
              aria-label={`Clear ${item.label}`}
              style={{ width: 22, height: 22, alignSelf: "start" }}
            />
          </label>
        ))}
      </div>

      <div className="farm-field" style={{ marginTop: 22, maxWidth: 420 }}>
        <label htmlFor="privacy-confirmation">Type CLEAR to confirm</label>
        <input
          id="privacy-confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value.toUpperCase().slice(0, 5))}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="farm-actions">
        <button
          className="farm-action danger"
          type="button"
          onClick={clearSelected}
          disabled={confirmation !== "CLEAR" || selected.size === 0}
        >
          Clear selected local data
        </button>
      </div>

      {status ? <div className="farm-tools-note" role="status" style={{ marginTop: 20 }}>{status}</div> : null}
    </section>
  );
}
