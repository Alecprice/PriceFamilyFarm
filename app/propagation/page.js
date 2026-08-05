import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { WhipTongueDiagram, CleftGraftDiagram, ChipBudDiagram } from "@/components/GraftDiagrams";
import { SeedIcon, CuttingIcon, DivisionIcon, LayeringIcon, GraftIcon } from "@/components/PropagationIcons";

export const metadata = {
  title: "Propagation & Grafting · Price Family Farm",
  description:
    "How, when, and why we propagate and graft fruit trees at Price Family Farm, with rootstock choices that actually hold up in Northeast Tennessee's humid Zone 6b/7a climate.",
};

const METHODS = [
  { Icon: SeedIcon, title: "Seed", body: "Cheap and simple, but fruit trees don't come true from seed. An apple seed grows into a genetically unique tree, not a copy of its parent. Good for rootstock, breeding, and most vegetables. Not how you get a specific apple variety." },
  { Icon: CuttingIcon, title: "Cuttings", body: "Softwood cuttings in early summer, hardwood cuttings taken dormant in winter. Works well for figs, grapes, elderberry, blueberries, and most berry canes, roots true to the parent plant every time." },
  { Icon: DivisionIcon, title: "Division", body: "Splitting an established perennial at the roots, rhubarb, asparagus crowns, herbs like chives and mint. The fastest route to a mature plant, but you need an existing one to divide." },
  { Icon: LayeringIcon, title: "Layering", body: "Bending a low branch to the ground and letting it root while still attached to the parent, then cutting it free. Slow, but close to foolproof for brambles and some fruiting shrubs." },
  { Icon: GraftIcon, title: "Grafting", body: "Joining a scion (the variety you want) onto a rootstock (chosen for hardiness, size, or disease resistance). The only reliable way to reproduce a specific fruit tree variety true to type. The rest of this page is about this one." },
];

const TECHNIQUES = [
  {
    Diagram: WhipTongueDiagram,
    title: "Whip-and-tongue graft",
    when: "Dormant season, Jan\u2013Mar",
    body: "The workhorse graft for young apple, pear, and other fruit trees when scion and rootstock are a similar diameter. A matching diagonal cut on each piece, a interlocking tongue notch cut into both, then fit together and wrapped. Strong, precise, and the standard for bench grafting nursery whips.",
  },
  {
    Diagram: CleftGraftDiagram,
    title: "Cleft graft",
    when: "Late winter into early spring",
    body: "Used to topwork an older tree or thicker rootstock onto a new variety, or when the scion is noticeably thinner than the stock. The stock is split down the middle and one or two wedge-cut scions are wedged into the split. Rougher than whip-and-tongue, but forgiving and fast to learn.",
  },
  {
    Diagram: ChipBudDiagram,
    title: "Chip & T-budding",
    when: "Late summer, Jul\u2013Sep",
    body: "A single bud, not a full scion stick, is sliced out and slotted under a T-shaped or chip-shaped cut in the rootstock's bark. Needs the bark to be \u201cslipping\u201d (peeling easily), which only happens with active summer sap flow. The bud sits dormant until the following spring.",
  },
];

const ROOTSTOCK = [
  {
    fruit: "Apples",
    body: "MM.111 is the workhorse choice for this region: good anchorage, good drought tolerance, and meaningfully better fire blight and collar rot resistance than the popular dwarfing rootstocks. M.9 and M.26 give you a smaller tree, but both are noticeably more fire-blight prone here and need permanent staking.",
  },
  {
    fruit: "Pears",
    body: "Straight quince rootstock is a common dwarfing choice nationally, but quince is very fire blight susceptible, a real liability in our humid summers. OHxF (Old Home \u00d7 Farmingdale) series rootstocks were bred specifically for fire blight resistance and are the safer call here.",
  },
  {
    fruit: "Peaches, plums & cherries",
    body: "Lovell, Halford, and Guardian are the rootstocks UT Extension recommends for Tennessee stone fruit. Guardian in particular resists Peach Tree Short Life, a soil-borne problem that shortens the life of peach trees across the Southeast.",
  },
  {
    fruit: "Everything else",
    body: "Figs, blueberries, grapes, and elderberry are all grown from cuttings here, not grafted, since they root readily and true to type on their own. No rootstock decision needed.",
  },
];

const RESOURCES = [
  {
    label: "Home Fruit Tree Plan (SP307-H)",
    org: "UT Extension",
    href: "https://uthort.tennessee.edu/wp-content/uploads/sites/228/2023/11/SP307-H.pdf",
  },
  {
    label: "Tree Fruit & Small Fruit Cultivars for Tennessee (PB746)",
    org: "UT Extension",
    href: "https://knox.tennessee.edu/wp-content/uploads/sites/202/2020/11/Tree-Fruit-and-Small-Fruit-Cultivars-for-Tennessee.pdf",
  },
  {
    label: "Fire Blight (SP277-R)",
    org: "UT Extension",
    href: "https://plantsciences.tennessee.edu/wp-content/uploads/sites/25/2021/11/UT-Extension-Fire-Blight-SP277-R.pdf",
  },
  {
    label: "Choosing Fruit Trees for Tennessee",
    org: "UT Institute of Agriculture",
    href: "https://utianews.tennessee.edu/choose-from-a-variety-of-fruit-trees-for-future-harvests/",
  },
];

const SEED_STEPS = [
  {
    n: 1,
    title: "Pick the right plants",
    body: "Only save seed from open-pollinated or heirloom varieties. Hybrid (F1) seed won't come true to type, the next generation is a genetic wildcard, same problem as growing a fruit tree from seed. Check the seed packet or plant tag if you're not sure.",
  },
  {
    n: 2,
    title: "Let it go further than you'd want to eat it",
    body: "Seed-ripe and eating-ripe aren't the same stage. Cucumbers need to yellow and soften well past the pickling stage. Peppers need to fully color past green. Beans and peas need to dry and rattle in the pod on the plant. Pulling too early gets you immature, non-viable seed.",
  },
  {
    n: 3,
    title: "Wet-process or dry-process, depending on the crop",
    body: "Tomatoes and cucumbers carry a germination-inhibiting gel around the seed that needs a few days of fermentation in water to break down, scoop the pulp into a jar, let it sit and bubble for 2\u20133 days, then rinse and dry. Beans, peas, lettuce, and most flowers just need to dry on the plant, no fermentation involved.",
  },
  {
    n: 4,
    title: "Dry them fully before storage",
    body: "Spread seed in a single layer somewhere with airflow, out of direct sun, for one to two weeks. Bend-test check on anything seed-sized or larger, it should snap, not fold, when fully dry. Sealing damp seed away is the single most common way to lose a whole batch to mold.",
  },
  {
    n: 5,
    title: "Label and store cold, dark, and dry",
    body: "Paper envelopes, not plastic bags, seed needs to breathe. Write the variety and the year on every envelope, memory is not a storage system. A cool closet works; the refrigerator works even better for anything you want to keep viable for several years.",
  },
];

const SEED_DIFFICULTY = [
  { level: "Easiest", crops: "Tomatoes, beans, peas, lettuce, peppers", note: "Self-pollinating, minimal cross-pollination risk, straightforward processing." },
  { level: "Moderate", crops: "Cucumbers, herbs, most flowers", note: "Some fermentation or drying know-how required, but forgiving." },
  { level: "Advanced", crops: "Squash, melons, corn", note: "Cross-pollinate readily with other varieties nearby. Isolation distance or hand-pollination needed to keep a variety true." },
];

const OVERWINTER_STEPS = [
  {
    n: 1,
    title: "Dig before the first hard frost",
    body: "Peppers, and some herbs like rosemary and bay, are tender perennials, not true annuals, they just die in our winters. Dig the whole root ball before a hard freeze, ideally with some cool nights already behind it to trigger dormancy.",
  },
  {
    n: 2,
    title: "Cut it back hard",
    body: "Prune the top growth back by half to two-thirds. A smaller plant means less to keep alive under low winter light, and it forces new, stockier growth in spring instead of leggy stretching.",
  },
  {
    n: 3,
    title: "Pot up in well-draining mix",
    body: "A container with drainage holes and fresh potting mix, not garden soil, which compacts and holds too much water indoors. Undersized pots are fine, even a rootbound plant will hold through winter dormancy.",
  },
  {
    n: 4,
    title: "Find it a cool, bright spot",
    body: "A basement or garage near a window, or an actual grow light, kept on the cooler side. Warm and dim is the worst combination, it pushes weak, stretched growth that won't hold up.",
  },
  {
    n: 5,
    title: "Water sparingly, watch for pests",
    body: "Let the soil dry most of the way between waterings, overwintering plants need a fraction of their summer water. Check the undersides of leaves regularly, aphids and spider mites move in fast on stressed indoor plants.",
  },
  {
    n: 6,
    title: "Harden off before it goes back out",
    body: "Once the average last frost has passed, reintroduce it to outdoor light gradually over a week or two rather than moving it straight from a dim room into full sun, which will scorch the leaves.",
  },
];

export default function Propagation() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Propagation &amp; Grafting</span>
          <h1>How we multiply what already works.</h1>
          <p>
            Growing a plant from scratch is one thing. Reproducing the exact variety that did well in <em>your</em>{" "}
            soil, on <em>your</em> rootstock, in <em>this</em> climate, is another. Here's how, when, and why we
            propagate and graft, and what actually holds up in Northeast Tennessee.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Why graft at all</span>
            <h2>Because seeds lie about what you'll get.</h2>
            <p>
              Plant the seed from a great apple and you won't get that apple back. Fruit trees are wildly
              heterozygous, the seedling is a genetic roll of the dice, closer to a sibling than a copy. Grafting
              sidesteps that entirely: a cutting (the scion) from a tree you already know is joined onto a root
              system (the rootstock) chosen for a completely different set of traits, size, soil tolerance, disease
              resistance, hardiness. You get the fruit you wanted, on roots suited to where it's actually planted,
              and years sooner than a seedling would ever bear.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Propagation methods</span>
            <h2>Grafting is one tool. Here's the whole kit.</h2>
          </div>
          <div className="grid-3">
            {METHODS.map((m) => (
              <div className="packet" key={m.title}>
                <div className="method-icon"><m.Icon /></div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Grafting techniques</span>
            <h2>Three grafts cover almost everything we do.</h2>
            <p>Each one exists for a different situation, stem thickness, time of year, and whether you're building a new tree or reworking an old one.</p>
          </div>
          <div className="graft-grid">
            {TECHNIQUES.map((t) => (
              <div className="graft-card" key={t.title}>
                <div className="graft-diagram"><t.Diagram /></div>
                <span className="entry-tag">{t.when}</span>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What works here</span>
            <h2>Rootstock choices for Northeast Tennessee.</h2>
            <p>
              Zone 6b/7a with humid summers means one thing dominates every rootstock decision we make: fire
              blight pressure. Here's what we actually use, and why.
            </p>
          </div>
          <div className="grid-2">
            {ROOTSTOCK.map((r) => (
              <div className="packet" key={r.fruit}>
                <h3>{r.fruit}</h3>
                <p>{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Seed Saving &amp; Harvesting</span>
            <h2>Free plants next year, if you pick the right ones.</h2>
            <p>
              Seed saving isn't complicated, but it does have to be done right, wrong timing or wrong storage and
              you'll open a packet of dead seed next spring with no way to know until it fails to sprout.
            </p>
          </div>
          <div style={{ maxWidth: 760 }}>
            {SEED_STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section-head" style={{ marginTop: 44 }}>
            <span className="eyebrow">Quick reference</span>
            <h2 style={{ fontSize: "1.5rem" }}>What to start with.</h2>
          </div>
          <div className="grid-3">
            {SEED_DIFFICULTY.map((d) => (
              <div className="packet" key={d.level}>
                <span className="eyebrow">{d.level}</span>
                <h3>{d.crops}</h3>
                <p>{d.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Overwintering</span>
            <h2>Keep a pepper plant alive, skip starting from seed twice.</h2>
            <p>
              A lot of what we grow as "annuals" here are actually perennials that just can't survive an East
              Tennessee winter outdoors. Bring the right ones inside instead of composting them every fall.
            </p>
          </div>
          <div style={{ maxWidth: 760 }}>
            {OVERWINTER_STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Resource links</span>
            <h2>Where we actually got this information.</h2>
            <p>Primary sources, not secondhand gardening blogs. Worth reading in full if you're grafting for the first time.</p>
          </div>
          <div className="grid-2">
            {RESOURCES.map((r) => (
              <a className="resource-card" href={r.href} target="_blank" rel="noopener noreferrer" key={r.label}>
                <div className="resource-text">
                  <span className="resource-org">{r.org}</span>
                  <span className="resource-label">{r.label}</span>
                </div>
                <span className="resource-arrow">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
