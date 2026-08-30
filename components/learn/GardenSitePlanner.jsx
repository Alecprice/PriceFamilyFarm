"use client";

import { useMemo, useState } from "react";
import { CROP_SPACING, SITE_FACTORS, SPACING_GOALS } from "../../lib/learn/gardenPlanningData";
import SourceLinks from "./SourceLinks";
import styles from "./GardenPlanning.module.css";

export default function GardenSitePlanner() {
  const [answers, setAnswers] = useState({});
  const [goal, setGoal] = useState("balanced");
  const [query, setQuery] = useState("");

  const completed = SITE_FACTORS.filter((factor) => answers[factor.id] !== undefined).length;
  const score = SITE_FACTORS.reduce((sum, factor) => sum + (answers[factor.id]?.score || 0), 0);
  const max = SITE_FACTORS.reduce((sum, factor) => sum + Math.max(...factor.options.map((o) => o.score)), 0);
  const min = SITE_FACTORS.reduce((sum, factor) => sum + Math.min(...factor.options.map((o) => o.score)), 0);
  const normalized = completed === SITE_FACTORS.length ? Math.max(0, Math.min(100, Math.round(((score - min) / (max - min)) * 100))) : null;

  const verdict = useMemo(() => {
    if (normalized === null) return null;
    if (normalized >= 80) return { title: "Strong garden candidate", text: "This spot has few obvious site-selection penalties. Confirm it with a soil test and actual sun/rain observations before building permanent beds." };
    if (normalized >= 62) return { title: "Good candidate with fixable constraints", text: "This location can work, but design around the weak factors instead of pretending they are not there." };
    if (normalized >= 45) return { title: "Possible, but compare another location", text: "Several constraints may cost more time and money than moving the garden. Compare at least one other site before committing." };
    return { title: "Poor permanent-bed candidate", text: "For a first garden, another location, raised/container system, or protected structure is likely to be easier than forcing this site." };
  }, [normalized]);

  const selectedGoal = SPACING_GOALS.find((item) => item.id === goal);
  const filteredCrops = CROP_SPACING.filter((item) =>
    `${item.crop} ${item.category} ${item.notes} ${item.training}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <section className={styles.tool}>
        <div className={styles.toolHeader}>
          <div>
            <p className={styles.eyebrow}>Interactive property walkthrough</p>
            <h2>Score a possible garden location</h2>
            <p>Use this same scorecard on two or three spots. It is a comparison tool, not a soil or environmental test.</p>
          </div>
          <div className={styles.progress} aria-live="polite"><strong>{completed}/{SITE_FACTORS.length}</strong><span>factors checked</span></div>
        </div>

        <div className={styles.factorGrid}>
          {SITE_FACTORS.map((factor, index) => (
            <fieldset className={styles.factor} key={factor.id}>
              <legend><span>{index + 1}</span>{factor.label}</legend>
              <p>{factor.help}</p>
              <select
                value={answers[factor.id]?.label || ""}
                onChange={(event) => {
                  const option = factor.options.find((item) => item.label === event.target.value);
                  setAnswers((current) => ({ ...current, [factor.id]: option }));
                }}
              >
                <option value="">Choose what fits this spot…</option>
                {factor.options.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}
              </select>
            </fieldset>
          ))}
        </div>

        <div className={styles.resultBox}>
          {verdict ? (
            <>
              <div className={styles.scoreRing} aria-label={`Site screening score ${normalized} out of 100`}>{normalized}</div>
              <div>
                <h3>{verdict.title}</h3>
                <p>{verdict.text}</p>
                <p><strong>Next:</strong> verify direct sun, soil-test the area, watch it after heavy rain, and check utilities/septic/previous use before permanent excavation.</p>
              </div>
            </>
          ) : <p>Complete all {SITE_FACTORS.length} factors to get a comparison score.</p>}
        </div>
      </section>

      <section className={styles.tool}>
        <div className={styles.toolHeader}>
          <div>
            <p className={styles.eyebrow}>Crop-spacing explorer</p>
            <h2>Space for the result you want</h2>
            <p>Published spacing is a range because the goal matters. Choose the management goal first, then use the crop cards as a research-based starting point.</p>
          </div>
        </div>

        <div className={styles.goalGrid}>
          {SPACING_GOALS.map((item) => (
            <button type="button" key={item.id} className={goal === item.id ? styles.goalActive : styles.goal} onClick={() => setGoal(item.id)} aria-pressed={goal === item.id}>
              <strong>{item.label}</strong><span>{item.short}</span>
            </button>
          ))}
        </div>

        <div className={styles.goalExplanation}><strong>{selectedGoal.label}:</strong> {selectedGoal.guidance}</div>

        <label className={styles.cropSearch}>
          <span>Find a crop</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tomato, broccoli, lettuce, beans…" />
        </label>

        <div className={styles.cropGrid}>
          {filteredCrops.map((item) => (
            <article className={styles.cropCard} key={item.crop}>
              <div className={styles.cropTopline}><span>{item.category}</span><strong>{item.spacing}</strong></div>
              <h3>{item.crop}</h3>
              <p><strong>Training/layout:</strong> {item.training}</p>
              <p>{item.notes}</p>
              <SourceLinks sourceKeys={item.sourceKeys} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
