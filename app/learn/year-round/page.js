import Link from 'next/link';
import styles from '../../../components/learn/LearnLibrary.module.css';
import plannerStyles from '../../../components/planner/Planner.module.css';
import YearRoundCalendar from '../../../components/planner/YearRoundCalendar';
import { YEAR_ROUND_SYSTEMS } from '../../../lib/learn/yearRoundData';
import SourceLinks from '../../../components/learn/SourceLinks';
import PlannerQuickNav from '../../../components/planner/PlannerQuickNav';

export const metadata={title:'Year-Round Growing | Price Family Farm',description:'A Zone 7a/7b guide to harvesting and growing through all four seasons using outdoor beds, season extension, greenhouse and indoor growing.'};

export default function YearRoundPage(){return <main>
  <header className={styles.hero}><div className={styles.heroInner}><div className={styles.kicker}>Learn • All 12 months</div><h1>Grow year-round without pretending every month is summer.</h1><p>Build a continuous system: cool-season crops, warm-season crops, succession planting, low tunnels, greenhouse space, indoor propagation, storage and preservation. The goal is a year-round growing journey—not forcing tender crops outdoors through winter.</p></div></header>
  <div className={styles.content}><PlannerQuickNav/>
    <div className={styles.notice}><strong>Zone 7a/7b principle:</strong> dates are planning anchors, not guarantees. Actual frost, soil condition, heat, rainfall and crop stage should move the schedule. Use the <Link href="/farm-planner">Farm Planner</Link> to turn the calendar into weather-aware tasks.</div>
    <h2 className={styles.sectionTitle}>The six systems that make twelve-month production possible</h2>
    <section className={styles.cards}>{YEAR_ROUND_SYSTEMS.map(s=><article key={s.title} className={styles.detailCard}><h2>{s.title}</h2><p>{s.text}</p></article>)}</section>
    <h2 className={styles.sectionTitle}>Month-by-month growing journey</h2>
    <YearRoundCalendar/>
    <h2 className={styles.sectionTitle}>A simple year-round rhythm</h2>
    <div className={plannerStyles.taskGrid}>
      <article className={plannerStyles.taskCard}><h3>1. Plan backward</h3><p>Choose a target harvest or transplant window, then count backward using cultivar days-to-maturity plus establishment time and seasonal conditions.</p></article>
      <article className={plannerStyles.taskCard}><h3>2. Sow in waves</h3><p>Succession sowing spreads harvest and risk. Use smaller repeat plantings rather than filling every foot on one date.</p></article>
      <article className={plannerStyles.taskCard}><h3>3. Protect strategically</h3><p>Row cover, tunnels, cold frames and greenhouse space extend seasons, but must be vented and may block pollinators and beneficial insects.</p></article>
      <article className={plannerStyles.taskCard}><h3>4. Let weather modify the plan</h3><p>A calendar starts the conversation; forecast lows, rainfall, heat, wind, soil moisture and disease pressure decide the exact day.</p></article>
      <article className={plannerStyles.taskCard}><h3>5. Preserve the surplus</h3><p>Year-round food security also includes curing, storage, freezing, drying and safe canning—not just live plants.</p></article>
      <article className={plannerStyles.taskCard}><h3>6. Record results</h3><p>Save actual sowing, transplant, first harvest and failure dates. Your own property record becomes more valuable each season.</p></article>
    </div>
    <h2 className={styles.sectionTitle}>Sources & next step</h2>
    <SourceLinks sourceKeys={['UT_FRUIT_CAL','UT_VEG','UT_MGMT']}/>
    <p><Link href="/farm-planner">Open the Farm Planner →</Link> • <Link href="/my-growing-journey">Build My Growing Journey →</Link></p>
  </div>
</main>}
