'use client';

import { useEffect, useState } from 'react';
import AddToCalendar, { downloadICS } from './AddToCalendar';
import SaveTaskButton from './SaveTaskButton';
import { YEAR_ROUND_MONTHS } from '../../lib/learn/yearRoundData';
import { uid } from '../../lib/planner/journeyEngine';
import { readPlan, writePlan } from '../../lib/planner/plannerStorage';
import styles from './Planner.module.css';

function targetDate(monthIndex, day = 1) {
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, monthIndex, day);

  if (
    candidate <
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  ) {
    year += 1;
  }

  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function YearRoundCalendar() {
  const [month, setMonth] = useState(0);
  const [bulkSaved, setBulkSaved] = useState(false);

  useEffect(() => {
    setMonth(new Date().getMonth());
  }, []);

  const data = YEAR_ROUND_MONTHS[month];

  const events = data.reminders.map((reminder, index) => ({
    id: `year-round-${month}-${index}`,
    title: reminder,
    date: targetDate(month, Math.min(25, 3 + index * 7)),
    details: `${data.month}: ${data.focus}. Use actual weather, soil condition and crop stage to adjust this planning date.`,
    category: 'Year-round growing',
    weatherSensitive: true,
  }));

  function activateMonth(index, focus = false) {
    const next =
      (index + YEAR_ROUND_MONTHS.length) % YEAR_ROUND_MONTHS.length;

    setMonth(next);
    setBulkSaved(false);

    if (focus) {
      requestAnimationFrame(() => {
        document.getElementById(`month-tab-${next}`)?.focus();
      });
    }
  }

  function handleTabKeyDown(event, index) {
    let next = null;

    if (event.key === 'ArrowRight') next = index + 1;
    else if (event.key === 'ArrowLeft') next = index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = YEAR_ROUND_MONTHS.length - 1;

    if (next === null) return;

    event.preventDefault();
    activateMonth(next, true);
  }

  function saveAll() {
    try {
      const plan = readPlan();
      const existing = new Set(
        (plan.customTasks || []).map(
          (task) => `${task.title}|${task.date}`
        )
      );

      const additions = events
        .filter(
          (event) => !existing.has(`${event.title}|${event.date}`)
        )
        .map((event) => ({
          ...event,
          id: uid('custom'),
        }));

      plan.customTasks = [
        ...(plan.customTasks || []),
        ...additions,
      ];

      writePlan(plan, { forceBackup: true });
      window.dispatchEvent(new Event('pff-journey-updated'));
      setBulkSaved(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className={styles.panel}>
      <div
        className={styles.monthTabs}
        role="tablist"
        aria-label="Growing month"
      >
        {YEAR_ROUND_MONTHS.map((item, index) => (
          <button
            key={item.month}
            id={`month-tab-${index}`}
            role="tab"
            type="button"
            onClick={() => activateMonth(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={index === month ? styles.activeTab : ''}
            aria-selected={index === month}
            aria-controls="year-round-month-panel"
            tabIndex={index === month ? 0 : -1}
          >
            {item.month.slice(0, 3)}
          </button>
        ))}
      </div>

      <div
        className={styles.monthCard}
        id="year-round-month-panel"
        role="tabpanel"
        aria-labelledby={`month-tab-${month}`}
      >
        <div>
          <span className={styles.eyebrow}>{data.month}</span>
          <h2>{data.focus}</h2>
        </div>

        <div className={styles.threeCol}>
          <div>
            <h3>Outside</h3>
            <ul>
              {data.outdoor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Indoor / starts</h3>
            <ul>
              {data.indoor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Protected culture</h3>
            <ul>
              {data.protected.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.forecastHeader}>
          <div>
            <h3>Turn this month into actions</h3>
            <p className={styles.sourceNote}>
              These are planning anchors. Adjust each date for your crop
              stage, property and forecast.
            </p>
          </div>

          <div className={styles.inlineActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={saveAll}
              disabled={bulkSaved}
            >
              {bulkSaved
                ? 'Month added to My Journey'
                : 'Add month to My Journey'}
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                downloadICS(
                  events,
                  `price-family-farm-${data.month.toLowerCase()}-growing.ics`,
                  1
                )
              }
            >
              Month to calendar
            </button>
          </div>
        </div>

        <div className={styles.reminderList}>
          {events.map((event) => (
            <div className={styles.reminderRow} key={event.title}>
              <div>
                <strong>{event.title}</strong>
                <span>
                  Planning date{' '}
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(`${event.date}T12:00:00`))}
                </span>
              </div>

              <div className={styles.inlineActions}>
                <SaveTaskButton
                  title={event.title}
                  date={event.date}
                  details={event.details}
                  category={event.category}
                  className={styles.smallButton}
                />

                <AddToCalendar
                  title={event.title}
                  date={event.date}
                  details={event.details}
                  className={styles.smallButton}
                  label="Calendar"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
