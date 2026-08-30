import LearnSearch from "../../../components/learn/LearnSearch";
import SourceLinks from "../../../components/learn/SourceLinks";
import {
  PermacultureZonesDiagram,
  WaterDiagram,
  IPMLadderDiagram
} from "../../../components/learn/PermacultureDiagrams";
import { PERMACULTURE_LESSONS } from "../../../lib/learn/permacultureData";
import styles from "../../../components/learn/LearnLibrary.module.css";

export const metadata = {
  title: "Permaculture & Resilient Gardening | Learn",
  description: "A searchable Zone 7a/7b permaculture curriculum covering soil, water, compost, beds, plants, pollinators, greenhouse and indoor growing."
};

export default function PermaculturePage() {
  return (
    <main>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>Learn • Permaculture & resilient gardening</div>
          <h1>From first seed to whole-site design.</h1>
          <p>
            A practical curriculum for beginners through experienced growers. The emphasis is
            outdoor Zone 7a/7b production, while greenhouse and grow-tent lessons clearly flag
            plants and practices that should not be mistaken for year-round outdoor hardiness.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.notice}>
          <strong>Local-first rule:</strong> Start with plants and methods proven for the local
          climate and soil. Use a greenhouse or indoor tent to extend seasons, start transplants
          and experiment with tender crops — not to erase the distinction between protected
          culture and outdoor survival.
        </div>

        <h2 className={styles.sectionTitle}>The design ideas at a glance</h2>
        <div className={styles.split}>
          <PermacultureZonesDiagram />
          <WaterDiagram />
        </div>
        <IPMLadderDiagram />

        <h2 className={styles.sectionTitle}>The curriculum</h2>
        <p>
          Search by topic or filter by environment. Every lesson includes multiple ways to do
          the same job because a raised-bed gardener, an in-ground gardener, a greenhouse grower
          and someone gardening from a chair should not be forced into one method.
        </p>
        <LearnSearch items={PERMACULTURE_LESSONS} mode="lessons" />

        <h2 className={styles.sectionTitle}>A few source anchors for the entire curriculum</h2>
        <SourceLinks sourceKeys={["UT_HOME", "UT_VEG", "UT_MGMT", "NCSU_IPM", "TNIPC"]} />
      </div>
    </main>
  );
}
