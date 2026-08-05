"use client";

function nextOccurrence(month, day) {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, month - 1, day);
  // if that date already passed this year, use next year
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (target < today) {
    target = new Date(year + 1, month - 1, day);
  }
  return target;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function ymd(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function buildIcsHref(title, details, date) {
  const dt = ymd(date);
  // day after, for all-day DTEND (exclusive)
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  const dtEnd = ymd(end);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Price Family Farm//Growing Guide//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@pricefamilyfarm`,
    `DTSTAMP:${dt}T000000Z`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    "RRULE:FREQ=YEARLY",
    "BEGIN:VALARM",
    "TRIGGER:-P3D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${title} in 3 days`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}

function buildGoogleHref(title, details, date) {
  const dt = ymd(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  const dtEnd = ymd(end);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: details,
    dates: `${dt}/${dtEnd}`,
    recur: "RRULE:FREQ=YEARLY",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function PlantingRow({ crop, task, month, day, note }) {
  const date = nextOccurrence(month, day);
  const readable = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const title = `${crop}: ${task} — Price Family Farm`;
  const details = note ? `${note} (East Tennessee, Zone 7a)` : "Price Family Farm growing guide reminder";

  return (
    <div className="plant-row">
      <div className="plant-row-main">
        <span className="plant-crop">{crop}</span>
        <span className="plant-task">{task}</span>
        <span className="plant-note">{note}</span>
      </div>
      <div className="plant-row-actions">
        <span className="plant-date">{readable}</span>
        <a
          className="remind-btn"
          href={buildGoogleHref(title, details, date)}
          target="_blank"
          rel="noopener noreferrer"
        >
          + Google Cal
        </a>
        <a
          className="remind-btn"
          href={buildIcsHref(title, details, date)}
          download={`${crop.replace(/\s+/g, "-").toLowerCase()}-${task.replace(/\s+/g, "-").toLowerCase()}.ics`}
        >
          .ics (Apple / Outlook)
        </a>
      </div>
    </div>
  );
}
