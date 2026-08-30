import LearnSearch from "../../../components/learn/LearnSearch";
import SourceLinks from "../../../components/learn/SourceLinks";
import { IPMLadderDiagram } from "../../../components/learn/PermacultureDiagrams";
import { GOOD_BUGS, BAD_BUGS } from "../../../lib/learn/bugData";
import styles from "../../../components/learn/LearnLibrary.module.css";

export const metadata = {
  title: "Good Bugs & Bad Bugs | Learn",
  description: "A Zone 7a/7b garden insect guide covering pollinators, beneficial predators, common pests, IPM and row-cover decisions."
};

export default function BugsPage() {
  return (
    <main>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>Learn • Garden insects & allies</div>
          <h1>Do not kill the garden trying to save the garden.</h1>
          <p>
            Identify first. Some insects pollinate the crop, some eat the insects eating the crop,
            some are harmless visitors, and some need action. This guide separates those roles
            and gives a practical IPM response for common Zone 7a/7b vegetable-garden pests.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.notice}>
          <strong>Why “just put a net over it” is not universal advice:</strong> insect mesh can
          be excellent before pests arrive, but it also blocks pollinators and natural enemies.
          Bee-pollinated cucurbits generally need covers opened/removed at flowering unless you
          hand-pollinate. Brassicas grown for leaves/heads can often remain covered longer.
          Covers can also trap pests that were already in the soil or on transplants.
        </div>

        <IPMLadderDiagram />

        <h2 className={styles.sectionTitle}>Good bugs — and other garden allies</h2>
        <p>
          “Beneficial” describes a role, not moral goodness. Predators can eat both pests and
          pollinators; pollinator larvae may feed on plants. The goal is a functioning food web
          that keeps crop damage manageable.
        </p>
        <LearnSearch items={GOOD_BUGS} mode="goodbugs" />

        <h2 className={styles.sectionTitle}>Common damaging pests in Zone 7 vegetable gardens</h2>
        <p>
          This is built around pests documented in Tennessee vegetable-garden guidance, with
          protected-culture notes where greenhouse/tent outbreaks behave differently.
        </p>
        <LearnSearch items={BAD_BUGS} mode="bugs" />

        <h2 className={styles.sectionTitle}>When to escalate</h2>
        <ul className={styles.checklist}>
          <li>The pest is positively identified.</li>
          <li>Damage is increasing, not merely present.</li>
          <li>The plant is at a vulnerable stage.</li>
          <li>Hand removal/barriers/cultural controls are insufficient.</li>
          <li>A proposed treatment is labeled for both crop and pest.</li>
          <li>Pollinator exposure and natural-enemy impacts have been considered.</li>
          <li>Preharvest interval and re-entry instructions can be followed.</li>
        </ul>

        <SourceLinks sourceKeys={["UT_INSECTS", "NCSU_IPM", "PSU_BENEFICIALS", "PSU_POLLINATORS"]} />
      </div>
    </main>
  );
}
