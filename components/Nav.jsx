"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/what-we-grow", label: "What We Grow" },
  { href: "/how-we-grow", label: "How We Grow" },
  {
    label: "Learn",
    children: [
      { href: "/growing-guide", label: "Growing Guide" },
      { href: "/propagation", label: "Propagation & Grafting" },
      { href: "/recipes", label: "Recipes" },
      { href: "/heritage", label: "Heritage" },
      { href: "/documentation", label: "Documentation" },
    ],
  },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isChildActive = (children) => children.some((c) => c.href === pathname);

  // Close the dropdown on outside click, and on Escape.
  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLearnOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setLearnOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close the dropdown whenever the route changes (after a nav).
  useEffect(() => {
    setLearnOpen(false);
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="site-nav">
      <div className="wrap">
        <Link className="brand" href="/">
          <svg className="mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 36C20 36 8 30 8 18C8 10 14 5 20 5C26 5 32 10 32 18C32 30 20 36 20 36Z" stroke="#d3a52a" strokeWidth="2" />
            <path d="M20 36V14" stroke="#d3a52a" strokeWidth="2" />
            <path d="M20 20C20 20 14 20 12 14" stroke="#d3a52a" strokeWidth="2" />
            <path d="M20 26C20 26 27 26 29 19" stroke="#d3a52a" strokeWidth="2" />
          </svg>
          <span className="brand-text">
            Price Family Farm
            <small>Greeneville · East Tennessee</small>
          </span>
        </Link>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
        <ul className={`nav-links${open ? " open" : ""}`}>
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <li key={item.label} className="nav-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-dropdown-toggle"
                  aria-expanded={learnOpen}
                  aria-current={isChildActive(item.children) ? "page" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLearnOpen((v) => !v);
                  }}
                >
                  {item.label} <span className="caret">▾</span>
                </button>
                <ul className={`dropdown-menu${learnOpen ? " open" : ""}`}>
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={pathname === child.href ? "page" : undefined}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={item.href}>
                <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}
