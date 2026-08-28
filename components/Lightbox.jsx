"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import styles from "./Lightbox.module.css";

const LightboxContext = createContext(() => {});

export function useLightbox() {
  return useContext(LightboxContext);
}

export function LightboxProvider({ children }) {
  const [src, setSrc] = useState(null);
  const [alt, setAlt] = useState("");
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const open = useCallback((imgSrc, imgAlt) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSrc(imgSrc);
    setAlt(imgAlt || "");
  }, []);

  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    if (!src) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [close, src]);

  return (
    <LightboxContext.Provider value={open}>
      {children}
      {src ? (
        <div
          className="lightbox open"
          role="dialog"
          aria-modal="true"
          aria-label={alt ? `Expanded photo: ${alt}` : "Expanded farm photo"}
          onClick={(event) => event.target === event.currentTarget && close()}
        >
          <button ref={closeRef} type="button" className="lightbox-close" onClick={close} aria-label="Close expanded photo">
            Close ✕
          </button>
          <div className={styles.media}>
            <Image src={src} alt={alt} fill sizes="92vw" priority style={{ objectFit: "contain" }} />
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}
