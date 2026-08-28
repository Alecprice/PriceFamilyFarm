"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const PAGES = [
  { href: "/", title: "Home", summary: "Farm overview, growing systems, availability, weather, and Farm OS entry points.", keywords: "home farm overview greeneville east tennessee" },
  { href: "/available", title: "Availability", summary: "Seasonal interest list and planning windows for plants and farm products.", keywords: "available availability plants starts produce seasonal interest" },
  { href: "/what-we-grow", title: "What We Grow", summary: "Crops, orchard, berries, vegetables, herbs, greenhouse propagation, and growing systems.", keywords: "crops orchard berries vegetables herbs greenhouse plants" },
  { href: "/growing-guide", title: "Growing Guide", summary: "East Tennessee growing guidance for planning, planting, and seasonal decisions.", keywords: "garden growing guide planting zone 7a east tennessee" },
  { href: "/weather", title: "Growing Conditions", summary: "Greeneville-area National Weather Service forecast with explicit fallback behavior.", keywords: "weather forecast frost rain wind nws growing conditions" },
  { href: "/propagation", title: "Propagation & Grafting", summary: "Propagation notes, seed starting, cuttings, grafting, and plant-start practices.", keywords: "propagation grafting seeds cuttings starts seedlings" },
  { href: "/how-we-grow", title: "How We Grow", summary: "How the farm uses containers, raised beds, greenhouse propagation, orchard systems, and practical growing methods.", keywords: "methods containers raised beds greenhouse orchard soil" },
  { href: "/our-story", title: "Our Story", summary: "The 2026 farm story from bare-root plantings through Tennessee farm-name registration.", keywords: "story history timeline 2026 registered farm" },
  { href: "/recipes", title: "Recipes", summary: "Recipes and ways to use seasonal farm produce.", keywords: "recipes cooking produce food kitchen" },
  { href: "/heritage", title: "Heritage", summary: "Family, regional, and agricultural heritage connected to Price Family Farm.", keywords: "heritage family tennessee agriculture history" },
  { href: "/documentation", title: "Documentation", summary: "Public farm documentation and records supporting the farm story.", keywords: "documents registration certificate tennessee department agriculture" },
  { href: "/gallery", title: "Gallery", summary: "Photo gallery documenting the farm, crops, starts, infrastructure, and season.", keywords: "photos pictures gallery farm plants greenhouse" },
  { href: "/contact", title: "Contact", summary: "Contact Price Family Farm about availability, plant starts, produce, pickup, or general questions.", keywords: "contact message email pickup questions" },
];

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

export default function SiteSearch() {
  const [query, setQuery] = useState("");
  const normalized = normalize(query);
  const results = useMemo(() => {
    if (!normalized) return PAGES;
    const terms = normalized.split(/\s+/).filter(Boolean).slice(0, 8);
    return PAGES.filter((page) => {
      const haystack = normalize(`${page.title} ${page.summary} ${page.keywords}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [normalized]);

  return (
    <div className="farm-tools-shell">
      <section className="farm-panel" aria-labelledby="site-search-heading">
        <h2 id="site-search-heading">Search the public farm site.</h2>
        <p>This search runs entirely in your browser against a small curated page index. It does not send the search phrase to a server or search private Farm OS records.</p>
        <div className="farm-field">
          <label htmlFor="site-search-input">Search phrase</label>
          <input id="site-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value.slice(0, 120))} maxLength={120} autoComplete="off" placeholder="Try: tomato, grafting, weather, registration…" />
        </div>
      </section>

      <section className="farm-panel" aria-labelledby="site-search-results-heading">
        <h2 id="site-search-results-heading">{normalized ? `${results.length} matching page${results.length === 1 ? "" : "s"}` : "Browse all indexed pages"}.</h2>
        {results.length ? <div className="farm-record-list">{results.map((page) => <article className="farm-record" key={page.href}><div><div className="farm-record-meta">Public page</div><h3>{page.title}</h3><p>{page.summary}</p></div><Link className="farm-action secondary" href={page.href}>Open</Link></article>)}</div> : <div className="farm-empty">No indexed public page matches every search term. Try a shorter phrase or one topic at a time.</div>}
      </section>
    </div>
  );
}
