"use client";

import { useMemo, useState } from "react";
import { CROPS, SEASONS } from "@/lib/crops";

export default function CropCatalog() {
  const [season, setSeason] = useState("All");

  const filtered = useMemo(() => {
    if (season === "All") return CROPS;
    return CROPS.filter((c) => c.season === season);
  }, [season]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <div className="season-slider" role="tablist" aria-label="Filter by season">
        {SEASONS.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={season === s}
            className={`season-pill${season === s ? " active" : ""}`}
            onClick={() => setSeason(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="catalog-count">
        Showing <strong>{filtered.length}</strong> of {CROPS.length} crops
        {season !== "All" ? <> that start in <strong>{season}</strong></> : null}.
      </p>

      <div className="catalog-groups">
        {Object.keys(grouped).sort().map((cat) => (
          <div className="catalog-group" key={cat}>
            <h3>{cat}</h3>
            <div className="catalog-chips">
              {grouped[cat].map((c) => (
                <span className="crop-chip" key={c.name}>
                  {c.name}
                  <em>{c.season}</em>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
