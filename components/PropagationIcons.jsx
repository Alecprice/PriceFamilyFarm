// Simple original line-art icons for each propagation method, drawn in
// the site's own palette to match the graft diagrams.

const stroke = "#2a2417";
const accent = "#b1531f";
const forest = "#3a5638";

export function SeedIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Seed icon">
      <ellipse cx="50" cy="58" rx="18" ry="26" fill={accent} opacity="0.85" transform="rotate(-10 50 58)" />
      <path d="M50,32 C50,20 40,14 30,14 C30,26 38,34 50,32 Z" fill={forest} />
      <path d="M50,88 L50,32" stroke={stroke} strokeWidth="2" strokeDasharray="2 3" />
    </svg>
  );
}

export function CuttingIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cutting icon">
      <path d="M50,14 L50,60" stroke={forest} strokeWidth="6" strokeLinecap="round" />
      <path d="M50,24 C62,20 68,28 66,36" fill="none" stroke={forest} strokeWidth="5" strokeLinecap="round" />
      <path d="M50,40 C38,36 32,44 34,52" fill="none" stroke={forest} strokeWidth="5" strokeLinecap="round" />
      <path d="M50,60 C44,70 56,74 50,86 C44,74 56,70 50,60" fill="none" stroke={accent} strokeWidth="3" />
      <line x1="30" y1="66" x2="70" y2="66" stroke={stroke} strokeWidth="2" strokeDasharray="2 3" />
    </svg>
  );
}

export function DivisionIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Division icon">
      <path d="M30,70 C22,58 24,42 34,32 C38,44 34,58 30,70 Z" fill={forest} opacity="0.85" />
      <path d="M70,70 C78,58 76,42 66,32 C62,44 66,58 70,70 Z" fill={forest} opacity="0.85" />
      <path d="M30,70 C34,76 66,76 70,70" fill="none" stroke={stroke} strokeWidth="2" />
      <path d="M50,30 L50,72" stroke={accent} strokeWidth="3" strokeDasharray="4 4" />
    </svg>
  );
}

export function LayeringIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Layering icon">
      <path d="M20,50 C40,20 60,20 80,50" fill="none" stroke={forest} strokeWidth="5" strokeLinecap="round" />
      <rect x="10" y="66" width="80" height="14" rx="3" fill="#c9a15a" opacity="0.5" />
      <path d="M80,50 L80,66" stroke={forest} strokeWidth="5" />
      <path d="M80,66 C74,76 86,80 80,90 M80,66 C86,76 74,80 80,90" fill="none" stroke={accent} strokeWidth="2.5" />
    </svg>
  );
}

export function GraftIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Grafting icon">
      <path d="M25,86 L25,50 L45,36" fill="none" stroke="#c9a15a" strokeWidth="8" strokeLinecap="round" />
      <path d="M75,20 L75,50 L55,36" fill="none" stroke="#c9a15a" strokeWidth="8" strokeLinecap="round" />
      <path d="M45,36 L55,36" stroke={stroke} strokeWidth="2" strokeDasharray="2 3" />
      <circle cx="50" cy="36" r="5" fill={accent} />
    </svg>
  );
}
