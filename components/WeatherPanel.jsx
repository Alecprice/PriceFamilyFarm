"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const GREENEVILLE = { lat: 36.1632, lon: -82.8310 };
const CACHE_KEY = "price-family-farm-weather-v1";
const MAX_CACHE_AGE = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_PERIODS = 6;

function safeText(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

function sanitizePeriods(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_PERIODS).map((period, index) => ({
    number: Number.isFinite(Number(period?.number)) ? Number(period.number) : index + 1,
    name: safeText(period?.name, 80) || "Forecast period",
    temperature: Number.isFinite(Number(period?.temperature)) ? Math.round(Number(period.temperature)) : null,
    temperatureUnit: period?.temperatureUnit === "C" ? "C" : "F",
    shortForecast: safeText(period?.shortForecast, 160),
    windSpeed: safeText(period?.windSpeed, 40),
    windDirection: safeText(period?.windDirection, 12),
  })).filter((period) => period.temperature !== null);
}

function assertNwsForecastUrl(value) {
  const url = new URL(String(value || ""));
  if (url.protocol !== "https:" || url.hostname !== "api.weather.gov") throw new Error("invalid-forecast-origin");
  return url.toString();
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function WeatherPanel() {
  const [state, setState] = useState({ status: "loading", periods: [], updated: "" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pointUrl = `https://api.weather.gov/points/${GREENEVILLE.lat},${GREENEVILLE.lon}`;
        const pointResponse = await fetchWithTimeout(pointUrl, { headers: { Accept: "application/geo+json" } });
        if (!pointResponse.ok) throw new Error("point");
        const point = await pointResponse.json();
        const forecastUrl = assertNwsForecastUrl(point?.properties?.forecast);

        const forecastResponse = await fetchWithTimeout(forecastUrl, { headers: { Accept: "application/geo+json" } });
        if (!forecastResponse.ok) throw new Error("forecast");
        const forecast = await forecastResponse.json();
        const periods = sanitizePeriods(forecast?.properties?.periods);
        if (!periods.length) throw new Error("empty-forecast");

        const savedAt = Date.now();
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ periods, savedAt })); } catch { /* cache failure is non-fatal */ }
        if (!cancelled) setState({ status: "live", periods, updated: new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
      } catch {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
          const periods = sanitizePeriods(cached?.periods);
          const savedAt = Number(cached?.savedAt || 0);
          if (periods.length && Number.isFinite(savedAt) && Date.now() - savedAt <= MAX_CACHE_AGE) {
            if (!cancelled) setState({ status: "cached", periods, updated: new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
            return;
          }
        } catch { /* fall through to explicit unavailable state */ }
        if (!cancelled) setState({ status: "unavailable", periods: [], updated: "" });
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") {
    return <div className="weather-fallback" aria-live="polite"><h3>Checking Greeneville-area conditions…</h3><p>The page will fall back cleanly if the National Weather Service feed is unavailable.</p></div>;
  }

  if (state.status === "unavailable") {
    return <div className="weather-fallback" role="status"><h3>Live conditions are temporarily unavailable.</h3><p>No weather values are being guessed. Check the official National Weather Service forecast before making frost, storm, irrigation, or transplant decisions.</p><div className="farm-actions"><a className="farm-action secondary" href="https://www.weather.gov/mrx/" target="_blank" rel="noopener noreferrer">Open NWS Morristown ↗</a><Link className="farm-action secondary" href="/growing-guide">Use the growing guide</Link></div></div>;
  }

  return (
    <div>
      <p className="task-nav-summary" role="status">{state.status === "cached" ? "Recent cached NWS forecast" : "Live NWS forecast"} · Greeneville city-center area · updated {state.updated}</p>
      <div className="weather-grid">
        {state.periods.map((period) => <article className="weather-card" key={`${period.number}-${period.name}`}><span className="farm-record-meta">{period.name}</span><b>{period.temperature}°{period.temperatureUnit}</b><p>{period.shortForecast}</p><p className="task-nav-summary">Wind {period.windSpeed} {period.windDirection}</p></article>)}
      </div>
      <p className="task-nav-summary" style={{ marginTop: 14 }}>General area forecast only. It does not represent a private farm weather station or exact property conditions.</p>
    </div>
  );
}
