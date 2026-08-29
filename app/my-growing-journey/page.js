import Link from "next/link";
import styles from "../../components/learn/LearnLibrary.module.css";
import GrowingJourney from "../../components/planner/GrowingJourney";
import PlannerQuickNav from "../../components/planner/PlannerQuickNav";

export const metadata = {
  title: "My Growing Journey | Price Family Farm",
  description:
    "Build a crop-by-crop growing timeline with stage tasks, calendar reminders, saved beds, and local plan backup.",
};

export default function Page() {
  return (
    <main>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>Plan • Grow • Check • Harvest</div>
          <h1>My Growing Journey</h1>
          <p>
            Turn crop choices into an actual sequence of work. Build crop
            timelines, save bed layouts, track completion, and send reminders
            to the calendar already on your device.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <PlannerQuickNav />

        <div className={styles.notice}>
          <strong>Private by default:</strong> This Growing Journey workspace
          and its rolling recovery snapshots are stored only in this browser.
          Export a backup if you want a durable copy or need to move it to
          another device.
        </div>

        <GrowingJourney />

        <p>
          <Link href="/learn/year-round">Learn the year-round system →</Link>
          {" • "}
          <Link href="/farm-planner">Open Farm Planner →</Link>
          {" • "}
          <Link href="/weather">Check growing conditions →</Link>
        </p>
      </div>
    </main>
  );
}
