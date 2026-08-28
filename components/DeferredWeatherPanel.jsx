"use client";

import { useEffect, useRef, useState } from "react";
import WeatherPanel from "./WeatherPanel";

export default function DeferredWeatherPanel() {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} data-deferred-weather={ready ? "loaded" : "waiting"}>
      {ready ? (
        <WeatherPanel />
      ) : (
        <div className="weather-fallback" aria-label="Weather forecast waiting to load">
          <h3>Greeneville-area forecast</h3>
          <p>Live National Weather Service data loads when this section approaches the viewport, avoiding an unnecessary request when visitors never scroll this far.</p>
        </div>
      )}
    </div>
  );
}
