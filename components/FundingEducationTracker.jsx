"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "price-family-farm-funding-v1";
const STARTERS = [
  { id: "taep", name: "Tennessee Agricultural Enhancement Program (TAEP)", type: "Funding", status: "Watch", deadline: "", url: "https://www.tn.gov/agriculture/farms/taep.html", notes: "Verify the current program-year rules before purchasing reimbursable equipment." },
  { id: "eqip", name: "USDA NRCS EQIP", type: "Cost share", status: "Research", deadline: "", url: "https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives/tennessee", notes: "Ask the local USDA Service Center about high tunnel, irrigation, soil-health, and conservation priorities." },
  { id: "sare", name: "Southern SARE Producer Grant", type: "Grant", status: "Research", deadline: "", url: "https://southernsare.org/grants/apply-for-a-grant/producer-grants/", notes: "Best fit when there is a real on-farm sustainable-agriculture question to test and share." },
];

function newId() { return `fund-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

export default function FundingEducationTracker() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      setItems(Array.isArray(saved) ? saved : STARTERS);
    } catch { setItems(STARTERS); }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const counts = useMemo(() => ({ total: items.length, active: items.filter((x) => !["Done", "Not pursuing"].includes(x.status)).length }), [items]);

  function add(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setItems((current) => [{ id: newId(), name: data.get("name")?.trim(), type: data.get("type"), status: data.get("status"), deadline: data.get("deadline"), url: data.get("url")?.trim(), notes: data.get("notes")?.trim() }, ...current]);
    event.currentTarget.reset();
  }

  function update(id, patch) { setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  function remove(id) { setItems((current) => current.filter((item) => item.id !== id)); }

  return (
    <div className="farm-tools-shell">
      <div className="farm-summary-grid">
        <div className="farm-summary-card"><span>Tracked opportunities</span><b>{counts.total}</b></div>
        <div className="farm-summary-card"><span>Still active</span><b>{counts.active}</b></div>
        <div className="farm-summary-card"><span>Storage</span><b style={{ fontSize: 20 }}>This browser</b></div>
        <div className="farm-summary-card"><span>Public visibility</span><b style={{ fontSize: 20 }}>None</b></div>
      </div>
      <div className="farm-tools-note"><strong>Planning aid, not eligibility advice.</strong> Funding rules change. Use the official program link in each record and verify the current program year before committing money.</div>
      <section className="farm-panel">
        <h2>Add funding, certification, or training.</h2>
        <form onSubmit={add}>
          <div className="farm-form-grid">
            <div className="farm-field"><label htmlFor="fund-name">Program / course</label><input id="fund-name" name="name" required maxLength={160} /></div>
            <div className="farm-field"><label htmlFor="fund-type">Type</label><select id="fund-type" name="type" defaultValue="Grant"><option>Grant</option><option>Cost share</option><option>Funding</option><option>Certification</option><option>Course</option><option>Registration</option></select></div>
            <div className="farm-field"><label htmlFor="fund-status">Status</label><select id="fund-status" name="status" defaultValue="Research"><option>Research</option><option>Watch</option><option>Preparing</option><option>Applied</option><option>Approved</option><option>Done</option><option>Not pursuing</option></select></div>
            <div className="farm-field"><label htmlFor="fund-deadline">Deadline / renewal</label><input id="fund-deadline" name="deadline" type="date" /></div>
            <div className="farm-field wide"><label htmlFor="fund-url">Official URL</label><input id="fund-url" name="url" type="url" placeholder="https://…" maxLength={500} /></div>
            <div className="farm-field wide"><label htmlFor="fund-notes">Requirements / next action</label><textarea id="fund-notes" name="notes" maxLength={900} /></div>
          </div>
          <div className="farm-actions"><button className="farm-action" type="submit">Add to tracker</button></div>
        </form>
      </section>
      <section className="farm-panel">
        <h2>Readiness queue.</h2>
        <div className="farm-record-list">
          {items.map((item) => (
            <article className="farm-record" key={item.id}>
              <div>
                <div className="farm-record-meta">{item.type} · {item.status}{item.deadline ? ` · ${item.deadline}` : ""}</div>
                <h3>{item.name}</h3>
                {item.notes ? <p>{item.notes}</p> : null}
                <div className="farm-actions">
                  {item.url ? <a className="farm-action secondary" href={item.url} target="_blank" rel="noreferrer">Open official source ↗</a> : null}
                  <select aria-label={`Update status for ${item.name}`} value={item.status} onChange={(event) => update(item.id, { status: event.target.value })} style={{ minHeight: 44, border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px" }}><option>Research</option><option>Watch</option><option>Preparing</option><option>Applied</option><option>Approved</option><option>Done</option><option>Not pursuing</option></select>
                </div>
              </div>
              <button className="farm-action danger" type="button" onClick={() => remove(item.id)} aria-label={`Delete ${item.name}`}>Delete</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
