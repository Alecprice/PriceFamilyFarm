import GardenSitePlanner from "../../../components/learn/GardenSitePlanner";
import SourceLinks from "../../../components/learn/SourceLinks";
import styles from "../../../components/learn/LearnLibrary.module.css";
import planning from "../../../components/learn/GardenPlanning.module.css";
import PlannerQuickNav from '../../../components/planner/PlannerQuickNav';

export const metadata = {
  title: "Garden Planning, Location & Crop Spacing | Learn",
  description: "Choose the best garden location on your property and learn how crop spacing changes with yield, plant size, airflow and accessibility goals in Zone 7a/7b."
};

function SunDiagram() {
  return (
    <figure className={planning.diagramCard}>
      <svg viewBox="0 0 760 400" role="img" aria-labelledby="sunTitle sunDesc">
        <title id="sunTitle">Sun and shade garden-site diagram</title>
        <desc id="sunDesc">A house and tree with the vegetable garden placed in an open sunny area and taller crops toward the north side.</desc>
        <rect width="760" height="400" rx="22" fill="#eef4e8"/><circle cx="110" cy="80" r="42" fill="#e1b850"/>
        <rect x="65" y="235" width="135" height="95" fill="#8c684b"/><polygon points="50,240 132,180 214,240" fill="#704934"/>
        <rect x="585" y="190" width="26" height="150" fill="#7b5636"/><circle cx="598" cy="160" r="78" fill="#6f8d57"/>
        <polygon points="198,330 520,330 455,245 240,245" fill="#b48a52"/><line x1="599" y1="200" x2="480" y2="315" stroke="#87917e" strokeWidth="18" opacity=".28"/>
        <text x="345" y="287" textAnchor="middle" fontSize="22" fontWeight="800">SUNNY GARDEN</text>
        <text x="345" y="315" textAnchor="middle" fontSize="14">6–8+ hr target for most vegetables</text>
        <text x="680" y="96" textAnchor="middle" fontSize="18" fontWeight="800">NORTH</text><path d="M680 115 L680 165 M680 115 L668 132 M680 115 L692 132" stroke="#3e5139" strokeWidth="5" fill="none"/>
        <text x="472" y="226" textAnchor="middle" fontSize="14">Tall trellis/corn toward north side</text>
        <text x="565" y="370" textAnchor="middle" fontSize="14">Check longer spring/fall shadows</text>
      </svg>
      <figcaption>Map actual shade, not just where the yard feels sunny. UT Extension recommends full sun and at least six to eight hours of daylight for most vegetable crops.</figcaption>
    </figure>
  );
}

function SpacingDiagram() {
  const beds = [
    {x:55,label:"DENSE",sub:"baby leaf / max bed yield",points:[[25,25],[70,25],[115,25],[160,25],[25,70],[70,70],[115,70],[160,70],[25,115],[70,115],[115,115],[160,115],[25,160],[70,160],[115,160],[160,160]],r:12},
    {x:285,label:"BALANCED",sub:"general home garden",points:[[35,35],[95,35],[155,35],[35,95],[95,95],[155,95],[35,155],[95,155],[155,155]],r:18},
    {x:515,label:"WIDE",sub:"large plants / airflow",points:[[45,45],[145,45],[45,145],[145,145]],r:30}
  ];
  return (
    <figure className={planning.diagramCard}>
      <svg viewBox="0 0 760 400" role="img" aria-labelledby="spaceTitle spaceDesc">
        <title id="spaceTitle">Three crop-spacing strategies</title><desc id="spaceDesc">Dense, balanced and wide crop spacing beds.</desc>
        <rect width="760" height="400" rx="22" fill="#f6f1e4"/>
        {beds.map((bed)=>(
          <g key={bed.label}><rect x={bed.x} y="100" width="190" height="190" rx="14" fill="#b9915d"/>
            {bed.points.map(([px,py],i)=><circle key={i} cx={bed.x+px} cy={100+py} r={bed.r} fill="#698a51"/>)}
            <text x={bed.x+95} y="324" textAnchor="middle" fontSize="18" fontWeight="800">{bed.label}</text>
            <text x={bed.x+95} y="348" textAnchor="middle" fontSize="12">{bed.sub}</text>
          </g>
        ))}
      </svg>
      <figcaption>“More plants” and “bigger plants” are different goals. Use the crop’s published range and intended harvest stage instead of one spacing rule for everything.</figcaption>
    </figure>
  );
}

export default function GardenPlanningPage() {
  return (
    <main>
      <header className={styles.hero}><div className={styles.heroInner}>
        <div className={styles.kicker}>Learn • Garden planning & crop spacing</div>
        <h1>Put the garden where it wants to succeed.</h1>
        <p>Before buying lumber or tilling soil, compare sunny places on the property, watch how water moves, test the soil and decide what kind of harvest you want. Then space crops for that goal instead of blindly copying one chart.</p>
      </div></header>

      <div className={styles.content}><PlannerQuickNav/>
        <div className={styles.notice}><strong>Zone 7a/7b reality:</strong> summer heat and humidity make airflow and irrigation management especially important. The sunniest site is usually the first candidate, but poor drainage, steep erosion, difficult water access, tree-root competition or questionable previous land use can make the obvious location a poor long-term choice.</div>

        <h2 className={styles.sectionTitle}>Walk the property before choosing</h2>
        <div className={planning.walkthrough}>
          <article><span>1</span><h3>Mark candidate sites</h3><p>Pick two or three locations that could realistically hold the garden. Do not decide yet.</p></article>
          <article><span>2</span><h3>Map sun</h3><p>Check morning, midday and afternoon light. Repeat outside midsummer because trees and buildings cast longer spring/fall shadows.</p></article>
          <article><span>3</span><h3>Watch a hard rain</h3><p>Look for ponding, runoff, erosion, roof discharge and the direction water leaves the site.</p></article>
          <article><span>4</span><h3>Dig and inspect</h3><p>Check workable soil depth, roots, rock, compaction and obvious fill. Do not work clay when it is wet.</p></article>
          <article><span>5</span><h3>Check history</h3><p>Ask what was there before: orchard, dump/fill, sprayed right-of-way, construction or other uses that could leave residue or compacted soil.</p></article>
          <article><span>6</span><h3>Soil-test finalists</h3><p>Take separate samples from meaningfully different candidate areas instead of averaging unlike soils together.</p></article>
          <article><span>7</span><h3>Plan water + access</h3><p>Measure hose/drip distance and the path used while carrying baskets, compost and tools.</p></article>
          <article><span>8</span><h3>Plan protection</h3><p>Account for deer, rabbits, wind, pets and children before deciding the fence and gate layout.</p></article>
          <article><span>9</span><h3>Start smaller than possible</h3><p>Build the section you can weed, water, scout and harvest well. Expand after one successful season.</p></article>
        </div>

        <div className={planning.diagramGrid} style={{marginTop:"1rem"}}><SunDiagram/><SpacingDiagram/></div>
        <GardenSitePlanner/>

        <h2 className={styles.sectionTitle}>How layout changes the spacing decision</h2>
        <div className={styles.cards}>
          <article className={styles.navCard}><h2>Traditional rows</h2><p>Best when you want straight cultivation lanes or use a tiller. UT notes that between-row spacing often assumes equipment; hand-hoed rows can be closer.</p></article>
          <article className={styles.navCard}><h2>Permanent / raised beds</h2><p>Use plant-to-plant spacing in a grid and keep feet out of the growing soil. Beds should be narrow enough to reach the center comfortably.</p></article>
          <article className={styles.navCard}><h2>Vertical growing</h2><p>Trellised beans, peas, cucumbers and tomatoes can trade horizontal footprint for height. Put tall structures where they will not shade shorter sun-loving crops.</p></article>
          <article className={styles.navCard}><h2>Baby-leaf harvest</h2><p>Leafy crops can be intentionally much denser when harvested young. UT’s leafy-crop guidance uses different band/grid densities for immature harvests.</p></article>
          <article className={styles.navCard}><h2>Large heads / specimen plants</h2><p>Use more room when individual plant size is the objective. Broccoli guidance is a clear example: high density can favor smaller bunching heads, while wider spacing supports large single heads.</p></article>
          <article className={styles.navCard}><h2>Humid-summer spacing</h2><p>Do not force the tightest theoretical spacing on every crop. Wider spacing, trellising and open paths can improve access and air movement when foliar disease pressure is high.</p></article>
        </div>

        <h2 className={styles.sectionTitle}>Rules worth remembering</h2>
        <ul className={styles.checklist}>
          <li>Most vegetables deserve the sunniest practical location; UT recommends at least 6–8 hours of daylight for most crops.</li>
          <li>South/southeast-facing sites often warm and dry earlier, but can also experience larger temperature swings.</li>
          <li>A slight slope can help cold air drain; steep slopes can increase runoff and erosion.</li>
          <li>Tree shade changes with season, and roots compete even when a tree is not directly over the bed.</li>
          <li>Plant spacing and path spacing are separate decisions.</li>
          <li>Dense planting can increase harvest per square foot while reducing individual plant/head size.</li>
          <li>Succession planting often increases annual bed productivity more effectively than permanently overcrowding one planting.</li>
          <li>Use cultivar/seed-packet and current Extension guidance when it conflicts with a generic chart.</li>
          <li>Record actual results; cultivar, trellis, soil, irrigation, pests and harvest goal all affect your best spacing.</li>
        </ul>

        <SourceLinks sourceKeys={["UT_SITE","UT_VEG","UT_LEAFY","NCSU_VEG","NCSU_BROCCOLI"]}/>
      </div>
    </main>
  );
}
