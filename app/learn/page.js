import Link from "next/link";
import styles from "../../components/learn/LearnLibrary.module.css";

export const metadata = {
  title: "Learn | Price Family Farm",
  description: "Zone 7a/7b year-round growing, interactive garden layout planning, crop spacing, permaculture, beneficial insects, garden pests and plant disease education."
};

const sections = [
  {
    href: "/learn/garden-layout-builder",
    title: "Interactive Garden Layout Builder",
    text: "Enter bed dimensions, choose crops and production goals, estimate plant counts, reserve pollinator space, plan trellises, and save the bed into My Growing Journey."
  },
  {
    href: "/learn/year-round",
    title: "Year-Round Growing",
    text: "A 12-month Zone 7a/7b growing journey using succession planting, season extension, greenhouse space, indoor starts, storage and weather-aware timing."
  },
  {
    href: "/learn/garden-planning",
    title: "Garden Planning, Location & Crop Spacing",
    text: "Compare possible garden sites, score sunlight/drainage/access, and learn how crop spacing changes for yield, plant size, airflow, trellising and accessibility."
  },
  {
    href: "/learn/permaculture",
    title: "Permaculture & Resilient Gardening",
    text: "A start-to-advanced curriculum for soil, water, beds, compost, annuals, perennials, pollinators, season extension, greenhouse and indoor growing."
  },
  {
    href: "/learn/bugs",
    title: "Good Bugs & Bad Bugs",
    text: "Learn who pollinates, who hunts pests, who damages crops, what to do, and when insect netting helps or hurts."
  },
  {
    href: "/learn/plant-diseases",
    title: "Plant Diseases & Disorders",
    text: "A symptom-first diagnostic library for common Zone 7 vegetable problems plus greenhouse/tent disease and abiotic disorders."
  }
];

export default function LearnPage() {
  return (
    <main>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>Learn • Zone 7a/7b first</div>
          <h1>Grow by understanding the whole system.</h1>
          <p>
            Practical, searchable lessons built around a humid four-season Zone 7 garden,
            with protected-culture notes for greenhouses and indoor grow tents. Each guide
            separates locally appropriate outdoor growing from tender or protected-culture
            plants and cites Extension or other horticultural sources.
          </p>
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.notice}>
          <strong>How the climate labels work:</strong> “Zone hardy” describes winter survival.
          “Tender annual” means a crop can grow well outside during the warm season but normally
          dies with frost. “Protected culture” means greenhouse/tent protection is expected.
          “Native” describes ecological origin — it is not a synonym for hardiness.
        </div>
        <div className={styles.notice} style={{ marginTop: "0.8rem" }}>
          <strong>Turn learning into a plan:</strong> use <Link href="/my-growing-journey">My Growing Journey</Link> to generate crop-stage tasks and reminders, then use the <Link href="/farm-planner">Farm Planner</Link> to check near-term weather and longer-range planning signals before weather-sensitive work.
        </div>
        <section className={styles.cards} style={{ marginTop: "1.2rem" }}>
          {sections.map((section) => (
            <article className={styles.navCard} key={section.href}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              <Link href={section.href}>Open guide →</Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
