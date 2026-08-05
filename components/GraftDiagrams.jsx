// Simple original line-art diagrams illustrating graft types. Drawn as
// plain vector shapes in the site's own palette, not traced from any
// external source. Labels are kept short and wrapped across two lines
// so nothing overflows the viewBox at small sizes.

const stroke = "#2a2417";
const accent = "#b1531f";
const wood = "#c9a15a";
const labelStyle = { fontFamily: "var(--font-mono)" };

export function WhipTongueDiagram() {
  return (
    <svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Whip-and-tongue graft diagram">
      {/* rootstock (left) */}
      <path d="M50,190 L50,110 L90,80" fill="none" stroke={wood} strokeWidth="14" strokeLinecap="round" />
      {/* scion (right) */}
      <path d="M190,30 L190,110 L150,80" fill="none" stroke={wood} strokeWidth="14" strokeLinecap="round" />
      {/* matching diagonal cuts + tongue interlock, simplified */}
      <path d="M90,80 L150,80" fill="none" stroke={stroke} strokeWidth="2.5" strokeDasharray="3 4" />
      <path d="M110,68 L110,92 M130,68 L130,92" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      {/* wrap ties */}
      <path d="M102,74 L102,86 M118,72 L118,88 M136,70 L136,90" stroke={stroke} strokeWidth="2" opacity="0.5" />
      <text x="120" y="112" textAnchor="middle" fontSize="10.5" fill={stroke} style={labelStyle}>
        <tspan x="120" dy="0">diagonal cuts,</tspan>
        <tspan x="120" dy="13">interlocked</tspan>
      </text>
      <text x="50" y="210" textAnchor="middle" fontSize="11" fill={accent} style={labelStyle}>rootstock</text>
      <text x="190" y="20" textAnchor="middle" fontSize="11" fill={accent} style={labelStyle}>scion</text>
    </svg>
  );
}

export function CleftGraftDiagram() {
  return (
    <svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cleft graft diagram">
      {/* stock, split at top */}
      <path d="M75,205 L75,105" fill="none" stroke={wood} strokeWidth="26" strokeLinecap="round" />
      <path d="M65,105 L65,70 M85,105 L85,70" stroke={stroke} strokeWidth="2" />
      {/* two wedge scions inserted */}
      <path d="M45,30 L65,75 L45,105" fill="none" stroke={accent} strokeWidth="10" strokeLinejoin="round" />
      <path d="M105,30 L85,75 L105,105" fill="none" stroke={accent} strokeWidth="10" strokeLinejoin="round" />
      <text x="75" y="130" textAnchor="middle" fontSize="10.5" fill={stroke} style={labelStyle}>
        <tspan x="75" dy="0">wedge scions</tspan>
        <tspan x="75" dy="13">in a split stock</tspan>
      </text>
      <text x="75" y="212" textAnchor="middle" fontSize="10.5" fill={accent} style={labelStyle}>
        <tspan x="75" dy="0">rootstock /</tspan>
        <tspan x="75" dy="12">older limb</tspan>
      </text>
      <text x="150" y="55" textAnchor="middle" fontSize="10.5" fill={accent} style={labelStyle}>
        <tspan x="150" dy="0">scion</tspan>
        <tspan x="150" dy="12">wedges</tspan>
      </text>
    </svg>
  );
}

export function ChipBudDiagram() {
  return (
    <svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chip and T-bud graft diagram">
      {/* rootstock stem */}
      <path d="M120,205 L120,30" fill="none" stroke={wood} strokeWidth="16" strokeLinecap="round" />
      {/* T incision */}
      <path d="M95,95 L145,95 M120,95 L120,135" stroke={stroke} strokeWidth="2.5" fill="none" />
      {/* bud shield */}
      <path d="M106,105 Q120,97 134,105 L134,133 Q120,141 106,133 Z" fill={accent} opacity="0.85" />
      <circle cx="120" cy="117" r="3" fill="#fdf9ee" />
      <text x="120" y="160" textAnchor="middle" fontSize="10.5" fill={stroke} style={labelStyle}>
        <tspan x="120" dy="0">bud shield under</tspan>
        <tspan x="120" dy="13">a T-cut</tspan>
      </text>
      <text x="120" y="210" textAnchor="middle" fontSize="10.5" fill={accent} style={labelStyle}>rootstock stem</text>
    </svg>
  );
}
