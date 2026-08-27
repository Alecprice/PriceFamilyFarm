"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const GREENEVILLE = { lat: 36.1632, lon: -82.8310 };
const CACHE_KEY = "price-family-farm-weather-v1";
const MAX_CACHE_AGE = 60 * 60 * 1000;

export default function WeatherPanel() {
  const [state, setState] = useState({ status: "loading", periods: [], updated: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const pointResponse = await fetch(`https://api.weather.gov/points/${GREENEVILLE.lat},${GREENEVILLE.lon}`, { headers: { Accept: "application/geo+json" } });
        if (!pointResponse.ok) throw new Error("point");
        const point = await pointResponse.json();
        const forecastResponse = await fetch(point.properties.forecast, { headers: { Accept: "application/geo+json" } });
        if (!forecastResponse.ok) throw new Error("forecast");
        const forecast = await forecastResponse.json();
        const value = { periods: (forecast.properties?.periods || []).slice(0, 6), savedAt: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(value));
        if (!cancelled) setState({ status: "live", periods: value.periods, updated: new Date(value.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
      } catch {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
          if (cached?.periods?.length && Date.now() - Number(cached.savedAt || 0) <= MAX_CACHE_AGE) {
            if (!cancelled) setState({ status: "cached", periods: cached.periods, updated: new Date(cached.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
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
    return <div className="weather-fallback" role="status"><h3>Live conditions are temporarily unavailable.</h3><p>No weather values are being guessed. Check the official National Weather Service forecast before making frost, storm, irrigation, or transplant decisions.</p><div className="farm-actions"><a className="farm-action secondary" href="https://www.weather.gov/mrx/" target="_blank" rel="noreferrer">Open NWS Morristown ↗</a><Link className="farm-action secondary" href="/growing-guide">Use the growing guide</Link></div></div>;
  }

  return (
    <div>
      <p className="task-nav-summary" role="status">{state.status === "cached" ? "Recent cached NWS forecast" : "Live NWS forecast"} · Greeneville city-center area · updated {state.updated}</p>
      <div className="weather-grid">
        {state.periods.map((period) => <article className="weather-card" key={period.number}><span className="farm-record-meta">{period.name}</span><b>{period.temperature}°{period.temperatureUnit}</b><p>{period.shortForecast}</p><p className="task-nav-summary">Wind {period.windSpeed} {period.windDirection}</p></article>)}
      </div>
      <p className="task-nav-summary" style={{ marginTop: 14 }}>General area forecast only. It does not represent a private farm weather station or exact property conditions.</p>
    </div>
  );
}
