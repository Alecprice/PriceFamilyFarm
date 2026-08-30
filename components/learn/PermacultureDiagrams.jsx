import styles from "./LearnLibrary.module.css";

export function PermacultureZonesDiagram() {
  return (
    <figure className={styles.diagram}>
      <svg viewBox="0 0 760 390" role="img" aria-labelledby="zoneTitle zoneDesc">
        <title id="zoneTitle">Permaculture access zones</title>
        <desc id="zoneDesc">Concentric zones showing daily-use areas near the home and lower-frequency management farther away.</desc>
        <rect x="0" y="0" width="760" height="390" rx="22" fill="#f6f1e4" />
        <ellipse cx="380" cy="195" rx="330" ry="160" fill="#dce8ce" />
        <ellipse cx="380" cy="195" rx="260" ry="125" fill="#e9e4b7" />
        <ellipse cx="380" cy="195" rx="190" ry="93" fill="#dfcf9f" />
        <ellipse cx="380" cy="195" rx="118" ry="60" fill="#c9a96f" />
        <rect x="331" y="166" width="98" height="58" rx="8" fill="#7c4b2a" />
        <text x="380" y="201" textAnchor="middle" fill="white" fontSize="18">Home</text>
        <text x="380" y="145" textAnchor="middle" fontSize="15">Zone 1: daily herbs, salad, seedlings</text>
        <text x="380" y="104" textAnchor="middle" fontSize="15">Zone 2: main beds, berries, compost</text>
        <text x="380" y="63" textAnchor="middle" fontSize="15">Zone 3: orchard / lower-frequency crops</text>
        <text x="380" y="358" textAnchor="middle" fontSize="15">Zone 4/5: occasional management + habitat</text>
      </svg>
      <figcaption>Zones are about visit frequency, not rigid circles. Put what needs you most where you naturally pass it.</figcaption>
    </figure>
  );
}

export function WaterDiagram() {
  return (
    <figure className={styles.diagram}>
      <svg viewBox="0 0 760 390" role="img" aria-labelledby="waterTitle waterDesc">
        <title id="waterTitle">Water movement on a garden slope</title>
        <desc id="waterDesc">A gentle slope showing roof collection, mulched beds, contour planting, a rain garden and safe overflow.</desc>
        <rect width="760" height="390" rx="22" fill="#e9f2f5" />
        <path d="M0 250 Q180 195 340 235 T760 190 L760 390 L0 390Z" fill="#b8cf8d" />
        <rect x="70" y="100" width="125" height="95" fill="#8e6949" />
        <polygon points="55,105 132,55 210,105" fill="#6e4630" />
        <path d="M192 115 C240 130 230 185 265 205" stroke="#3a84a8" strokeWidth="8" fill="none" />
        <rect x="235" y="195" width="55" height="48" rx="6" fill="#5b7f95" />
        <path d="M292 220 C345 235 360 245 420 245" stroke="#3a84a8" strokeWidth="6" strokeDasharray="9 9" fill="none" />
        <path d="M310 270 Q400 235 500 257" stroke="#725a37" strokeWidth="8" fill="none" />
        <path d="M500 292 Q590 260 670 290 Q620 355 520 338Z" fill="#78a6b5" opacity=".8" />
        <path d="M666 313 C705 315 720 330 750 328" stroke="#3a84a8" strokeWidth="7" fill="none" />
        <text x="132" y="220" textAnchor="middle" fontSize="15">Roof capture</text>
        <text x="260" y="266" textAnchor="middle" fontSize="15">Cistern</text>
        <text x="405" y="300" textAnchor="middle" fontSize="15">Contour / mulch slows flow</text>
        <text x="588" y="365" textAnchor="middle" fontSize="15">Rain garden + safe overflow</text>
      </svg>
      <figcaption>In a humid Zone 7 climate, slowing water is useful only when roots and structures still drain safely.</figcaption>
    </figure>
  );
}

export function IPMLadderDiagram() {
  const rows = [
    ["1", "Identify", "Pest, beneficial, disease or environmental problem?"],
    ["2", "Observe", "How many? How fast? Which plant stage?"],
    ["3", "Prevent", "Rotation, sanitation, resistant plants, healthy soil"],
    ["4", "Physical", "Hand-pick, prune, barriers, traps"],
    ["5", "Biological", "Conserve predators, parasitoids and pollinators"],
    ["6", "Target", "If needed, use a labeled least-disruptive treatment"]
  ];
  return (
    <figure className={styles.diagram}>
      <div className={styles.ladder} role="img" aria-label="Integrated pest management ladder">
        {rows.map(([number, title, text]) => (
          <div key={number}><span>{number}</span><strong>{title}</strong><p>{text}</p></div>
        ))}
      </div>
      <figcaption>The goal is not zero insects. The goal is a productive system where damage stays acceptable.</figcaption>
    </figure>
  );
}

export function DiseaseTriangleDiagram() {
  return (
    <figure className={styles.diagram}>
      <svg viewBox="0 0 640 410" role="img" aria-labelledby="dTitle dDesc">
        <title id="dTitle">Plant disease triangle</title>
        <desc id="dDesc">Disease requires a susceptible host, a capable pathogen and a favorable environment at the same time.</desc>
        <rect width="640" height="410" rx="22" fill="#f6f1e4" />
        <polygon points="320,55 95,335 545,335" fill="#d8e3c4" stroke="#58704a" strokeWidth="5" />
        <circle cx="320" cy="72" r="45" fill="#7b9b61" />
        <circle cx="112" cy="327" r="45" fill="#b36a54" />
        <circle cx="528" cy="327" r="45" fill="#5f8fa8" />
        <text x="320" y="77" textAnchor="middle" fill="white" fontSize="17">HOST</text>
        <text x="112" y="332" textAnchor="middle" fill="white" fontSize="15">PATHOGEN</text>
        <text x="528" y="332" textAnchor="middle" fill="white" fontSize="13">ENVIRONMENT</text>
        <text x="320" y="235" textAnchor="middle" fontSize="25" fontWeight="700">DISEASE</text>
        <text x="320" y="265" textAnchor="middle" fontSize="15">Break one side to reduce risk</text>
      </svg>
      <figcaption>Good diagnosis asks what host is present, what pathogen could cause the symptom, and whether recent conditions support it.</figcaption>
    </figure>
  );
}
