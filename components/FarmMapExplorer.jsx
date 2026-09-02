"use client";

import { useState } from "react";
import Link from "next/link";
import { FARM_AREAS } from "@/lib/farmData";

export default function FarmMapExplorer() {
  const [activeId, setActiveId] = useState(FARM_AREAS[0].id);
  const active = FARM_AREAS.find((area) => area.id === activeId) || FARM_AREAS[0];

  return (
    <div className="farm-map-shell">
      <div className="farm-map-stage" aria-label="Conceptual diagram of Price Family Farm growing areas">
        <div className="farm-map-note">Conceptual system map · not to scale · no home address shown</div>
        {FARM_AREAS.map((area, index) => (
          <button
            key={area.id}
            type="button"
            className={`farm-zone farm-zone-${index + 1}${activeId === area.id ? " active" : ""}`}
            onClick={() => setActiveId(area.id)}
            aria-pressed={activeId === area.id}
          >
            <span>{area.short}</span>
          </button>
        ))}
        <div className="farm-map-path path-a" />
        <div className="farm-map-path path-b" />
      </div>
      <aside className="farm-map-detail">
        <span className="eyebrow">Selected area</span>
        <h3>{active.label}</h3>
        <p>{active.description}</p>
        <div className="tag-cloud">
          {active.crops.map((crop) => <span key={crop}>{crop}</span>)}
        </div>
        <Link className="record-link" href="/what-we-grow">Browse crop records →</Link>
      </aside>
    </div>
  );
}
