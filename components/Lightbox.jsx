"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LightboxContext = createContext(() => {});

export function useLightbox() {
  return useContext(LightboxContext);
}

export function LightboxProvider({ children }) {
  const [src, setSrc] = useState(null);
  const [alt, setAlt] = useState("");

  const open = useCallback((imgSrc, imgAlt) => {
    setSrc(imgSrc);
    setAlt(imgAlt || "");
  }, []);

  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <div className={`lightbox${src ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && close()}>
        <button className="lightbox-close" onClick={close}>Close ✕</button>
        {src ? <img src={src} alt={alt} /> : null}
      </div>
    </LightboxContext.Provider>
  );
}
