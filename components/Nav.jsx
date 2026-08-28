"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  {
    label: "Farm",
    children: [
      { href: "/farm-os", label: "Farm OS" },
      { href: "/what-we-grow", label: "What We Grow" },
      { href: "/farm-records", label: "Farm Records" },
      { href: "/farm-analytics", label: "Farm Analytics" },
      { href: "/available", label: "Availability" },
      { href: "/funding", label: "Funding & Education" },
    ],
  },
  {
    label: "Plan",
    children: [
      { href: "/growing-guide", label: "Growing Guide" },
      { href: "/weather", label: "Growing Conditions" },
      { href: "/propagation", label: "Propagation & Grafting" },
      { href: "/how-we-grow", label: "How We Grow" },
    ],
  },
  {
    label: "Learn",
    children: [
      { href: "/our-story", label: "Our Story" },
      { href: "/recipes", label: "Recipes" },
      { href: "/heritage", label: "Heritage" },
      { href: "/documentation", label: "Documentation" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  const isChildActive = (children) => children.some((child) => child.href === pathname);

  useEffect(() => {
    function onDocumentPointer(event) {
      if (navRef.current && !navRef.current.contains(event.target)) setOpenMenu("");
    }
    function onKey(event) {
      if (event.key === "Escape") {
        const shouldReturnFocus = navRef.current?.contains(document.activeElement);
        setOpenMenu("");
        setOpen(false);
        if (shouldReturnFocus) window.requestAnimationFrame(() => toggleRef.current?.focus());
      }
    }
    document.addEventListener("pointerdown", onDocumentPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    function onViewportChange(event) {
      if (!event.matches) {
        setOpen(false);
        setOpenMenu("");
      }
    }
    media.addEventListener("change", onViewportChange);
    return () => media.removeEventListener("change", onViewportChange);
  }, []);

  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 780px)").matches) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setOpenMenu("");
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="site-nav" aria-label="Primary" ref={navRef}>
      <div className="wrap">
        <Link className="brand" href="/" aria-label="Price Family Farm home">
          <svg className="mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 36C20 36 8 30 8 18C8 10 14 5 20 5C26 5 32 10 32 18C32 30 20 36 20 36Z" stroke="#d3a52a" strokeWidth="2" />
            <path d="M20 36V14" stroke="#d3a52a" strokeWidth="2" />
            <path d="M20 20C20 20 14 20 12 14" stroke="#d3a52a" strokeWidth="2" />
            <path d="M20 26C20 26 27 26 29 19" stroke="#d3a52a" strokeWidth="2" />
          </svg>
          <span className="brand-text">Price Family Farm<small>Greeneville · East Tennessee</small></span>
        </Link>
        <button
          ref={toggleRef}
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav-links"
          aria-label={open ? "Close primary menu" : "Open primary menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <ul id="primary-nav-links" className={`nav-links${open ? " open" : ""}`}>
          {NAV_ITEMS.map((item) => item.children ? (
            <li key={item.label} className="nav-dropdown">
              <button type="button" className="nav-dropdown-toggle" aria-expanded={openMenu === item.label} aria-current={isChildActive(item.children) ? "page" : undefined} onClick={() => setOpenMenu((current) => current === item.label ? "" : item.label)}>
                {item.label} <span className="caret" aria-hidden="true">▾</span>
              </button>
              <ul className={`dropdown-menu${openMenu === item.label ? " open" : ""}`}>
                {item.children.map((child) => <li key={child.href}><Link href={child.href} aria-current={pathname === child.href ? "page" : undefined}>{child.label}</Link></li>)}
              </ul>
            </li>
          ) : <li key={item.href}><Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link></li>)}
        </ul>
      </div>
    </nav>
  );
}
