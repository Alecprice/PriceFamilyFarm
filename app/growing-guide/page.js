import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlantingRow from "@/components/PlantingRow";
import CropCatalog from "@/components/CropCatalog";

export const metadata = {
  title: "Growing Guide · Price Family Farm",
  description:
    "An East Tennessee planting calendar with one-click reminders, plus the real challenges of growing in Greene County and how we handle them.",
};

const CALENDAR = [
  { crop: "Bare-root fruit trees & berries", task: "Plant while dormant", month: 2, day: 15, note: "Late winter, before bud break: the window we used for our own orchard." },
  { crop: "Peppers", task: "Start seeds indoors", month: 2, day: 1, note: "8–10 weeks before last frost. Peppers are slow to germinate, so start early." },
  { crop: "Tomatoes", task: "Start seeds indoors", month: 2, day: 15, note: "6–8 weeks before last frost." },
  { crop: "Spring lettuce & greens", task: "Direct sow", month: 3, day: 1, note: "4–6 weeks before last frost. Tolerates a light frost fine." },
  { crop: "Tomatoes", task: "Transplant outdoors", month: 4, day: 25, note: "After last frost, once soil has warmed." },
  { crop: "Cucumbers & squash", task: "Direct sow or transplant", month: 5, day: 1, note: "Wait until all frost danger has passed." },
  { crop: "Basil & tender herbs", task: "Transplant outdoors", month: 5, day: 1, note: "A late frost will kill basil overnight." },
  { crop: "Peppers", task: "Transplant outdoors", month: 5, day: 1, note: "Wait for soil to hit 65°F or warmer." },
  { crop: "Melons", task: "Direct sow or transplant", month: 5, day: 10, note: "Needs warm soil and consistent moisture." },
  { crop: "Okra", task: "Direct sow", month: 5, day: 15, note: "Needs soil at 65°F+ to germinate well." },
  { crop: "Fall greens (kale, collards)", task: "Direct sow", month: 8, day: 1, note: "For a fall and early-winter harvest." },
  { crop: "Garlic", task: "Plant cloves", month: 10, day: 5, note: "Early October, before the ground cools too far." },
];

const CHALLENGES = [
  {
    title: "Predators",
    risk: "High risk",
    body: "Raccoons, opossums, and foxes are relentless once they find a weak point in a coop or hutch, and they'll test fencing and latches repeatedly. We learned this one the hard way this season.",
    fixes: [
      "Hardware cloth, not chicken wire, buried 12\u2033 deep and turned outward",
      "Locking latches raccoons can't work open with paws that function almost like hands",
      "Motion-sensor lighting near housing",
      "No pet food or fallen fruit left out overnight",
      "Rebuild and predator-proof fully before restocking, don't rush it",
    ],
  },
  {
    title: "Deer pressure",
    risk: "High risk",
    body: "Greene County has heavy deer traffic, and they'll browse fruit tree leaders, berry canes, and garden beds right down to the ground overnight.",
    fixes: [
      "7\u20138 ft. fencing, or a shorter double-fence deer can't judge the jump on",
      "Deer-resistant plantings (herbs, alliums) along the perimeter",
      "Repellent sprays, rotated so deer don't get used to one scent",
      "Tree tubes or netting on young fruit trees for the first few years",
    ],
  },
  {
    title: "Heavy clay soil",
    risk: "Medium risk",
    body: "East Tennessee's red clay compacts easily, drains slowly, and runs acidic, which is hard on root vegetables and anything that hates wet feet.",
    fixes: [
      "Raised beds and containers filled with real growing mix, our main strategy",
      "Heavy compost and organic matter worked into any in-ground beds",
      "A UT Extension soil test before amending blind",
      "Gypsum to help break up compaction over time",
    ],
  },
  {
    title: "Humidity & fungal disease",
    risk: "High risk",
    body: "Tomato blight and powdery mildew move fast in a humid East Tennessee summer, especially once plants get crowded and airflow drops.",
    fixes: [
      "Wide plant spacing for airflow, even when it feels wasteful early on",
      "Drip irrigation at soil level instead of overhead watering",
      "Water in the morning so foliage dries by evening",
      "Pull and dispose of infected leaves immediately, don't compost them",
      "Rotate crop families bed to bed each year",
    ],
  },
  {
    title: "Late spring frost swings",
    risk: "Medium risk",
    body: "A warm stretch in early April can trick you into planting too early. Clear, calm nights right after can still radiate enough heat to frost tender starts even when the forecast low looks safe.",
    fixes: [
      "Keep frost cloth or row cover on hand through early May",
      "Watch overnight lows closely, not just the daytime forecast",
      "Hold tender transplants (tomatoes, peppers, basil) until after the average last frost date, not the first warm week",
    ],
  },
  {
    title: "Summer heat & drought stress",
    risk: "Medium risk",
    body: "July and August heat can stall fruit set on tomatoes and peppers and push cool-season greens to bolt fast.",
    fixes: [
      "Heavy mulch to hold soil moisture and moderate root temperature",
      "Consistent deep watering over frequent shallow watering",
      "Shade cloth over greens during the hottest stretch",
    ],
  },
  {
    title: "Groundhogs & rabbits",
    risk: "Medium risk",
    body: "Groundhogs can flatten a row of beans or greens in a single evening, and rabbits go straight for tender new transplants before they've had a chance to establish.",
    fixes: [
      "Fencing buried a few inches down, since groundhogs dig under a simple perimeter",
      "A hot wire at ground level along the fence line for persistent diggers",
      "Row cover on new transplants until they're established and less tempting",
      "Clearing brush piles nearby that make good groundhog denning spots",
    ],
  },
  {
    title: "Japanese beetles & squash bugs",
    risk: "High risk",
    body: "Japanese beetles show up by the hundreds in midsummer and skeletonize leaves fast, while squash bugs can take out a whole zucchini or squash planting from the base up.",
    fixes: [
      "Hand-picking into soapy water in the cool of the morning, when beetles are sluggish",
      "Row cover on squash family plants until they flower and need pollinator access",
      "Checking the undersides of squash leaves for egg clusters and scraping them off",
      "Pulling and destroying badly infested plants rather than letting them seed the next generation",
    ],
  },
  {
    title: "Weed pressure",
    risk: "Medium risk",
    body: "Warm, humid summers mean weeds establish fast, and in containers and raised beds they compete hard with young plants for the limited soil volume available.",
    fixes: [
      "Mulch on every bed and container, which does most of the work on its own",
      "Weeding little and often instead of letting it pile up into a weekend project",
      "Landscape fabric on the walking paths between beds",
      "Pulling weeds before they set seed, especially in the paths where they spread easiest",
    ],
  },
  {
    title: "Storm damage & wind",
    risk: "Medium risk",
    body: "East Tennessee gets its share of strong summer thunderstorms, and tall crops like tomatoes, okra, and young trees take the brunt of it.",
    fixes: [
      "Sturdy staking and cages installed at planting time, not after a plant is already leaning",
      "Support stakes on containers, which can tip in wind more easily than in-ground beds",
      "Windbreak plantings on the exposed side of the garden",
      "Checking ties and stakes after any significant storm rather than assuming they held",
    ],
  },
  {
    title: "Blossom end rot",
    risk: "Medium risk",
    body: "Tomatoes and peppers both get it here, a sunken, dark patch on the bottom of the fruit caused by inconsistent watering interrupting calcium uptake, not usually a soil calcium problem itself.",
    fixes: [
      "Consistent watering on a schedule rather than letting containers dry out between waterings",
      "Mulch to even out soil moisture swings between waterings",
      "Avoiding heavy nitrogen fertilization early, which pushes leafy growth over root development",
      "Accepting the first few fruits may show it while watering rhythm gets dialed in for a new bed",
    ],
  },
];

export default function GrowingGuide() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Growing Guide</span>
          <h1>What actually works, growing in East Tennessee.</h1>
          <p>A planting calendar built for Greene County's climate, and an honest look at the challenges that come with it. Not a generic zone chart. What we actually plan around.</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="zone-banner">
            <div className="zi"><b>Zone 7a</b><span>USDA Hardiness, Greeneville</span></div>
            <div className="zi"><b>~Apr 15</b><span>Average last spring frost</span></div>
            <div className="zi"><b>~Oct 20</b><span>Average first fall frost</span></div>
            <div className="zi"><b>~190 days</b><span>Typical growing season</span></div>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap map-feature">
          <div className="map-feature-copy">
            <span className="eyebrow">Greene County</span>
            <h2>Farming here isn&rsquo;t new.</h2>
            <p>
              People have been growing food in this valley, between the Bays Mountains and the Nolichucky, for
              a very long time. This antique county map shows Greeneville and the surrounding settlements as
              they were laid out generations ago, the same land and the same watersheds we&rsquo;re working
              with today.
            </p>
            <p style={{ marginTop: 14 }}>
              <Link href="/heritage" className="stat-link" style={{ color: "var(--clay-dark)", borderColor: "var(--clay)" }}>
                See the full county history &amp; cash crop timeline →
              </Link>
            </p>
          </div>
          <div className="map-feature-image">
            <Image
              src="/images/greene-county-antique-map.jpg"
              alt="Antique map of Greene County, Tennessee, showing Greeneville, Rogersville, and surrounding settlements"
              width={736}
              height={506}
              sizes="(max-width: 800px) 100vw, 640px"
            />
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Planting calendar</span>
            <h2>Tap a date, get a reminder.</h2>
            <p>Each row shows the next occurrence of that planting window. Add it straight to Google Calendar, or download an .ics file that works with Apple Calendar, Outlook, and most other calendar apps on iOS and Android. Reminders repeat every year.</p>
          </div>
          <div className="plant-table">
            {CALENDAR.map((c, i) => (
              <PlantingRow key={`${c.crop}-${c.task}-${i}`} {...c} />
            ))}
          </div>
          <p style={{ marginTop: 16, color: "var(--ink-soft)", fontSize: 13.5 }}>
            Dates are averages for Zone 7a in Greeneville, TN. Always check the current forecast before planting frost-sensitive crops. A 30% chance of frost still means a real chance.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">The full list</span>
            <h2>130+ crops grown across Northeast Tennessee.</h2>
            <p>
              Everything below is realistic for a Zone 6b/7a garden in this part of the state, whether or not
              it's in our own beds yet. Filter by season to see what should be going in the ground right now,
              or browse the whole list by category.
            </p>
          </div>
          <CropCatalog />
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Challenges &amp; mitigation</span>
            <h2>What actually goes wrong here, and what we do about it.</h2>
            <p>East Tennessee is a good place to grow, but it's not an easy one. Here's what we plan around, prevent where we can, and rebuild from when we can't.</p>
          </div>
          <div className="grid-2">
            {CHALLENGES.map((c) => (
              <div className="challenge-card" key={c.title}>
                <span className="risk">{c.risk}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <div className="fix-label">Mitigation</div>
                <ul>
                  {c.fixes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
