"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JOURNAL_ENTRIES } from "@/lib/farmData";

export default function JournalFilters() {
  const categories = ["All", ...Array.from(new Set(JOURNAL_ENTRIES.map((entry) => entry.category)))];
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...JOURNAL_ENTRIES]
      .filter((entry) => category === "All" || entry.category === category)
      .filter((entry) => {
        if (!q) return true;
        const haystack = `${entry.title} ${entry.summary} ${entry.details.join(" ")} ${entry.category} ${entry.displayDate}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [category, query]);

  return (
    <>
      <div className="journal-tools">
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journal entries…" aria-label="Search farm journal" />
        <div className="filter-row" role="group" aria-label="Filter farm journal by category">
          {categories.map((item) => (
            <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
      </div>
      <div className="journal-list">
        {entries.length ? entries.map((entry) => (
          <article className="journal-entry" key={entry.slug}>
            <div className="journal-date"><span>{entry.displayDate}</span><b>{entry.category}</b></div>
            <div>
              <h2>{entry.title}</h2>
              <p className="journal-summary">{entry.summary}</p>
              <ul>{entry.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              {entry.links?.length > 0 && <div className="inline-links">{entry.links.map((link) => <Link key={link.href} href={link.href}>{link.label} →</Link>)}</div>}
            </div>
          </article>
        )) : <p className="empty-state">No journal entries match that search yet.</p>}
      </div>
    </>
  );
}
