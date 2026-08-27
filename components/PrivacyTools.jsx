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
    key: "price-family-farm-weather-v1",
    id: "weather",
    label: "Weather cache",
    detail: "The recent National Weather Service forecast cached by this browser.",
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
