"use client";

import { useMemo, useState } from "react";
import SourceLinks from "./SourceLinks";
import ScheduleAction from "../planner/ScheduleAction";
import styles from "./LearnLibrary.module.css";

function searchable(item) {
  return JSON.stringify(item).toLowerCase();
}

export default function LearnSearch({ items, mode = "lessons" }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = useMemo(() => {
    const key = mode === "lessons" ? "environment" : mode === "bugs" ? "type" : "category";
    return ["All", ...Array.from(new Set(items.map((item) => item[key]).filter(Boolean)))];
  }, [items, mode]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const key = mode === "lessons" ? "environment" : mode === "bugs" ? "type" : "category";
    return items.filter((item) => {
      const filterMatch = filter === "All" || item[key] === filter;
      return filterMatch && (!q || searchable(item).includes(q));
    });
  }, [items, query, filter, mode]);

  return (
    <section className={styles.library}>
      <div className={styles.controls}>
        <label>
          <span>Search this guide</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: aphids, swale, mildew, greenhouse, tomatoes..."
          />
        </label>
        <label>
          <span>Filter</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            {filters.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <p className={styles.resultCount}>{results.length} result{results.length === 1 ? "" : "s"}</p>

      <div className={styles.cardGrid}>
        {results.map((item) => (
          <article className={styles.detailCard} id={item.slug} key={item.slug || item.name}>
            <div className={styles.badges}>
              {item.level && <span>{item.level}</span>}
              {item.environment && <span>{item.environment}</span>}
              {item.local && <span>{item.local}</span>}
              {item.type && <span>{item.type}</span>}
              {item.category && <span>{item.category}</span>}
            </div>
            <h2>{item.title || item.name}</h2>
            {item.summary && <p className={styles.lead}>{item.summary}</p>}
            {item.crops && <p><strong>Common hosts:</strong> {item.crops}</p>}
            {item.id && <p><strong>How to identify it:</strong> {item.id}</p>}
            {item.symptoms && <p><strong>What you may see:</strong> {item.symptoms}</p>}
            {item.damage && <p><strong>Why it matters:</strong> {item.damage}</p>}
            {item.favors && <p><strong>Conditions that favor it:</strong> {item.favors}</p>}
            {item.lookalikes && <p><strong>Common look-alikes:</strong> {item.lookalikes}</p>}

            {item.steps && <List title="Walk-through" values={item.steps} ordered />}
            {item.methods && <List title="Ways to do it" values={item.methods} />}
            {item.now && <List title="What to do now" values={item.now} />}
            {item.prevent && <List title="Prevention" values={item.prevent} />}
            {item.support && <List title="How to support them" values={item.support} />}

            {item.role && <p><strong>Job in the garden:</strong> {item.role}</p>}
            {item.value && <p><strong>Why it helps:</strong> {item.value}</p>}
            {item.treatment && <p><strong>Remedy:</strong> {item.treatment}</p>}
            {item.cure && <p><strong>Can it be cured?</strong> {item.cure}</p>}
            {item.netNote && <p className={styles.netNote}><strong>Net/row-cover note:</strong> {item.netNote}</p>}
            {item.caution && <p className={styles.warning}><strong>Important:</strong> {item.caution}</p>}
            <SourceLinks sourceKeys={item.sourceKeys} />
            <ScheduleAction
              defaultTitle={`Follow up: ${item.title || item.name}`}
              details={item.summary || item.damage || item.value || item.role || "Follow up on this Price Family Farm Learn topic."}
              category={mode === "bugs" || mode === "goodbugs" ? "Pest & disease" : mode === "diseases" ? "Pest & disease" : "Learn"}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function List({ title, values = [], ordered = false }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className={styles.listBlock}>
      <strong>{title}</strong>
      <Tag>{values.map((value) => <li key={value}>{value}</li>)}</Tag>
    </div>
  );
}
