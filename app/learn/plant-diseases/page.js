import LearnSearch from "../../../components/learn/LearnSearch";
import SourceLinks from "../../../components/learn/SourceLinks";
import { DiseaseTriangleDiagram } from "../../../components/learn/PermacultureDiagrams";
import { PLANT_PROBLEMS } from "../../../lib/learn/diseaseData";
import styles from "../../../components/learn/LearnLibrary.module.css";

export const metadata = {
  title: "Plant Diseases & Disorders | Learn",
  description: "A searchable Zone 7a/7b plant-disease and disorder diagnostic guide for vegetables, greenhouse crops and indoor starts."
};

export default function PlantDiseasesPage() {
  return (
    <main>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>Learn • Plant health diagnostics</div>
          <h1>Diagnose the pattern before choosing the remedy.</h1>
          <p>
            Leaf spots are not one disease, wilting does not always mean “needs water,” and a
            distorted plant may have insects, virus, herbicide exposure or root stress. Start
            with symptoms, crop, distribution and recent conditions before treating.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <DiseaseTriangleDiagram />

        <h2 className={styles.sectionTitle}>The 8-step diagnostic walk-through</h2>
        <ol>
          <li><strong>Identify the plant</strong> — crop, cultivar if known, age and whether it is outside, greenhouse or tent-grown.</li>
          <li><strong>Define the symptom</strong> — spots, wilt, rot, distortion, yellowing, holes, stunting or fruit disorder.</li>
          <li><strong>Look at the pattern</strong> — one plant, one bed, one crop family, field edge, irrigation zone or the whole garden?</li>
          <li><strong>Inspect the whole plant</strong> — leaf underside, stem base, vascular tissue where appropriate, roots and fruit.</li>
          <li><strong>Check for insects</strong> — especially vectors such as thrips, aphids, whiteflies and cucumber beetles.</li>
          <li><strong>Review the last 1–2 weeks</strong> — rain, leaf wetness, irrigation changes, heat, cold, fertilizer, sprays and transplanting.</li>
          <li><strong>Separate infectious from abiotic</strong> — blossom-end rot, herbicide injury, sunscald and edema need environmental correction, not fungicide.</li>
          <li><strong>Confirm before major action</strong> — take clear photos and use Extension/diagnostic services for unusual, severe or recurring problems.</li>
        </ol>

        <div className={styles.warning}>
          <strong>Pesticide/fungicide rule:</strong> this library intentionally does not give
          “spray X ounces every Y days” recipes. Labels and Extension recommendations change,
          and many fungicides are preventative rather than curative. Diagnose first, then use
          only a product currently labeled for that crop and problem, following the label exactly.
        </div>

        <h2 className={styles.sectionTitle}>Search common diseases and look-alike disorders</h2>
        <LearnSearch items={PLANT_PROBLEMS} mode="diseases" />

        <h2 className={styles.sectionTitle}>Protected-culture disease checklist</h2>
        <ul className={styles.checklist}>
          <li>Quarantine incoming plants before they enter the greenhouse/tent.</li>
          <li>Do not keep media chronically saturated.</li>
          <li>Vent humidity and prevent overnight condensation on leaves.</li>
          <li>Use horizontal air movement without blasting seedlings dry.</li>
          <li>Water early enough for foliage/surfaces to dry.</li>
          <li>Remove fallen flowers, leaves and diseased debris.</li>
          <li>Sanitize pruning tools when moving among suspect plants.</li>
          <li>Scout leaf undersides for insect vectors every week.</li>
          <li>Keep clean and dirty trays/pots separated.</li>
          <li>Do not move runoff from diseased containers into healthy ones.</li>
        </ul>

        <SourceLinks sourceKeys={["UT_DISEASE", "NCSU_DIAG", "NCSU_DISEASE", "NCSU_PATH"]} />
      </div>
    </main>
  );
}
