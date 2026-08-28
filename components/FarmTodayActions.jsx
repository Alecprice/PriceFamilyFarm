"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localDay, localDayPlus } from "@/lib/localDate";

const CALENDAR_KEY = "price-family-farm-calendar-v1";
const PLANNER_KEY = "price-family-farm-planner-v1";
const MAX_BYTES = 1_000_000;
const MAX_TASKS = 1_000;
const MAX_PLANS = 500;
const TASK_STATUSES = new Set(["Planned", "In progress", "Done", "Skipped"]);
const PLAN_STATUSES = ["Planned", "Started", "Transplanted", "Harvesting", "Complete"];

function text(value, max = 180) {
  return String(value ?? "").trim().slice(0, max);
}

function safeDate(value) {
  const next = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
}

function readArray(key, maxItems) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  if (raw.length > MAX_BYTES) throw new Error("store-too-large");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("invalid-store");
  return parsed.slice(0, maxItems);
}

function writeArray(key, items, maxItems) {
  const payload = JSON.stringify(items.slice(0, maxItems));
  if (payload.length > MAX_BYTES) throw new Error("store-too-large");
  localStorage.setItem(key, payload);
}

function sanitizeTask(item, index) {
  const task = text(item?.task);
  const date = safeDate(item?.date);
  if (!task || !date) return null;
  return {
    ...item,
    id: text(item?.id, 120) || `task-${index}`,
    task,
    date,
    category: text(item?.category, 50) || "Other",
    status: TASK_STATUSES.has(item?.status) ? item.status : "Planned",
    notes: text(item?.notes, 600),
  };
}

function sanitizePlan(item, index) {
  const crop = text(item?.crop, 80);
  if (!crop) return null;
  return {
    ...item,
    id: text(item?.id, 120) || `plan-${index}`,
    crop,
    variety: text(item?.variety, 100),
    space: text(item?.space, 100),
    status: [...PLAN_STATUSES, "Paused"].includes(item?.status) ? item.status : "Planned",
  };
}

function nextPlanStatus(status) {
  const index = PLAN_STATUSES.indexOf(status);
  if (index < 0 || index >= PLAN_STATUSES.length - 1) return "";
  return PLAN_STATUSES[index + 1];
}

export default function FarmTodayActions() {
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  function refresh() {
    try {
      setTasks(readArray(CALENDAR_KEY, MAX_TASKS).map(sanitizeTask).filter(Boolean));
      setPlans(readArray(PLANNER_KEY, MAX_PLANS).map(sanitizePlan).filter(Boolean));
    } catch {
      setStatus("Farm Today actions could not safely read one of the browser-local stores. Make a backup before changing the affected data.");
    }
  }

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const actionTasks = useMemo(() => {
    const cutoff = localDayPlus(7);
    return tasks
      .filter((item) => !["Done", "Skipped"].includes(item.status) && item.date <= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date) || a.task.localeCompare(b.task))
      .slice(0, 10);
  }, [tasks]);

  const activePlans = useMemo(() => plans.filter((item) => !["Complete", "Paused"].includes(item.status)).slice(0, 8), [plans]);

  function updateTask(id, updater, message) {
    try {
      const current = readArray(CALENDAR_KEY, MAX_TASKS).map(sanitizeTask).filter(Boolean);
      const next = current.map((item) => item.id === id ? updater(item) : item);
      writeArray(CALENDAR_KEY, next, MAX_TASKS);
      setTasks(next);
      setStatus(message);
    } catch {
      setStatus("The Farm Calendar could not be updated safely. Open the full calendar or make a backup before trying again.");
    }
  }

  function setTaskStatus(task, nextStatus) {
    updateTask(task.id, (item) => ({ ...item, status: nextStatus }), `${task.task} marked ${nextStatus.toLowerCase()} in the private Farm Calendar.`);
  }

  function moveTaskTomorrow(task) {
    updateTask(task.id, (item) => ({ ...item, date: localDayPlus(1), status: item.status === "Skipped" ? "Planned" : item.status }), `${task.task} moved to tomorrow.`);
  }

  function advancePlan(plan) {
    const nextStatus = nextPlanStatus(plan.status);
    if (!nextStatus) return;
    try {
      const current = readArray(PLANNER_KEY, MAX_PLANS).map(sanitizePlan).filter(Boolean);
      const next = current.map((item) => item.id === plan.id ? { ...item, status: nextStatus } : item);
      writeArray(PLANNER_KEY, next, MAX_PLANS);
      setPlans(next);
      setStatus(`${plan.crop}${plan.variety ? ` · ${plan.variety}` : ""} advanced to ${nextStatus}.`);
    } catch {
      setStatus("The Farm Planner could not be updated safely. Open the full planner or make a backup before trying again.");
    }
  }

  return (
    <section className="farm-panel" aria-labelledby="today-actions-heading">
      <span className="eyebrow">Act without leaving Today</span>
      <h2 id="today-actions-heading">Clear work and advance crop plans in place.</h2>
      <p>These controls update the same private browser-local Calendar and Planner stores used by the full Farm OS tools.</p>
      {status ? <div className="farm-tools-note" role="status">{status}</div> : null}

      <div className="grid-2">
        <div>
          <h3>Open work through next 7 days</h3>
          {ready && actionTasks.length ? <div className="farm-record-list">{actionTasks.map((task) => {
            const overdue = task.date < localDay();
            return <article className="farm-record" key={task.id}>
              <div>
                <div className="farm-record-meta">{task.date} · {task.category}{overdue ? " · Overdue" : ""}</div>
                <h3>{task.task}</h3>
                <p>Status: {task.status}</p>
              </div>
              <div className="farm-actions" aria-label={`Actions for ${task.task}`}>
                <button className="farm-action" type="button" onClick={() => setTaskStatus(task, "Done")}>Done</button>
                <button className="farm-action secondary" type="button" onClick={() => moveTaskTomorrow(task)}>Do tomorrow</button>
                <button className="farm-action secondary" type="button" onClick={() => setTaskStatus(task, "Skipped")}>Skip</button>
              </div>
            </article>;
          })}</div> : <div className="farm-empty">{ready ? "No open tasks are due through the next seven days." : "Loading browser-local tasks…"}</div>}
        </div>

        <div>
          <h3>Active crop-plan progression</h3>
          {ready && activePlans.length ? <div className="farm-record-list">{activePlans.map((plan) => {
            const next = nextPlanStatus(plan.status);
            return <article className="farm-record" key={plan.id}>
              <div>
                <div className="farm-record-meta">{plan.space || "No space saved"}</div>
                <h3>{plan.crop}{plan.variety ? ` · ${plan.variety}` : ""}</h3>
                <p>Status: {plan.status}</p>
              </div>
              <div className="farm-actions">
                {next ? <button className="farm-action" type="button" onClick={() => advancePlan(plan)} aria-label={`Advance ${plan.crop} to ${next}`}>Advance to {next}</button> : null}
              </div>
            </article>;
          })}</div> : <div className="farm-empty">{ready ? "No active crop plans are saved in this browser." : "Loading crop plans…"}</div>}
        </div>
      </div>

      <div className="farm-actions"><Link className="farm-action secondary" href="/farm-calendar">Open full Calendar</Link><Link className="farm-action secondary" href="/farm-planner">Open full Planner</Link></div>
    </section>
  );
}
