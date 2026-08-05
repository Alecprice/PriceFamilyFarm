import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Heritage · Price Family Farm",
  description:
    "The history of Greene County, Tennessee, and the cash crops that shaped it, from Cherokee agriculture and the State of Franklin to burley tobacco and today's diversified small farms.",
};

const ERAS = [
  {
    year: "Before 1775",
    title: "Cherokee homeland",
    body: "This valley between the Bays Mountains and the Nolichucky was Cherokee hunting ground, and had been home to Woodland-era and mound-building peoples for thousands of years before that. Corn, beans, and squash, the \u201cthree sisters,\u201d were already being farmed here long before any settler arrived.",
  },
  {
    year: "1775",
    title: "Jacob Brown's Purchase",
    body: "Jacob Brown negotiated a purchase of Cherokee land along the Nolichucky River, opening roughly a third of present-day Greene County to settlement, the first real wave of the farms that would follow.",
  },
  {
    year: "1783",
    title: "Greene County organized",
    body: "Formed out of North Carolina and named for Gen. Nathanael Greene of Revolutionary War fame, under whom many local settlers had served.",
  },
  {
    year: "1785\u20131788",
    title: "Capital of the State of Franklin",
    body: "Greeneville served as capital of the short-lived, breakaway State of Franklin, an attempt by settlers here to form their own state outside North Carolina's control. It fell just short of admission to the Union.",
  },
  {
    year: "1786",
    title: "Davy Crockett born",
    body: "Frontiersman and folk hero David \u201cDavy\u201d Crockett was born in the Limestone community of eastern Greene County.",
  },
  {
    year: "1794\u20131795",
    title: "First college west of the Alleghenies",
    body: "Greeneville College, founded by Hezekiah Balch, and Washington College, chartered under Samuel Doak, both trace to this decade. Their lineage continues today as Tusculum University.",
  },
  {
    year: "1796",
    title: "Tennessee becomes a state",
    body: "Greene County's Overmountain settlers were there for it: Tennessee entered the Union as the 16th state, folding this valley's farms into a new state's economy.",
  },
  {
    year: "1826\u20131875",
    title: "Andrew Johnson's Greeneville",
    body: "A runaway tailor's apprentice from North Carolina set up shop in Greeneville and made it his home for the rest of his life, eventually becoming the 17th President of the United States.",
  },
  {
    year: "Mid-1800s",
    title: "The railroad arrives",
    body: "Rail lines reached East Tennessee, connecting local farms to markets beyond the mountains for the first time. Before this, most of what was grown here stayed here.",
  },
  {
    year: "1885",
    title: "Greeneville's tobacco market opens",
    body: "A dedicated market for burley tobacco was established in Greeneville, and the town grew into one of the leading burley tobacco markets in the entire country.",
  },
  {
    year: "1928",
    title: "Pet Milk comes to town",
    body: "A Pet Milk processing plant opened in Greeneville, and dairy farming grew into a major part of the local economy alongside tobacco for the rest of the century.",
  },
  {
    year: "2004",
    title: "The tobacco buyout",
    body: "The federal Fair and Equitable Tobacco Reform Act ended more than 70 years of price supports and production quotas overnight, reshaping how, and whether, local farms grew tobacco at all.",
  },
  {
    year: "Today",
    title: "Small, diversified farms",
    body: "A new generation of small farms, ours included, is growing fruit, vegetables, and seed and selling it directly to the people eating it, the same direct, hands-on relationship to the land this valley started with.",
  },
];

const CROPS = [
  {
    no: "01",
    era: "Pre-1775",
    title: "Corn, beans & squash",
    body: "The \u201cthree sisters\u201d were grown together by the Cherokee throughout this valley long before European contact, corn for structure, beans climbing it, squash shading the ground beneath.",
  },
  {
    no: "02",
    era: "1780s\u20131800s",
    title: "Corn & driven livestock",
    body: "Early settler farms grew corn for their own tables and stock, while cattle and hogs were driven on foot over mountain roads to markets in Virginia and the Carolinas. Almost nothing left the valley by wagon until the roads improved.",
  },
  {
    no: "03",
    era: "Early 1800s",
    title: "Flax & wool",
    body: "Alongside food crops, small farms grew flax and raised sheep for wool, spun and woven at home into the cloth that clothed a frontier household.",
  },
  {
    no: "04",
    era: "1885\u20132004",
    title: "Burley tobacco",
    body: "The defining cash crop of the region for well over a century. Greeneville's 1885 tobacco market grew the town into one of the nation's top burley markets, regulated for decades by federal quotas until the 2004 buyout ended the program nationwide.",
  },
  {
    no: "05",
    era: "1928 onward",
    title: "Dairy",
    body: "Pet Milk's 1928 plant in Greeneville turned dairy into a serious second income for local farms, a role it held well into the second half of the century.",
  },
  {
    no: "06",
    era: "20th century\u2013today",
    title: "Beef cattle & hay",
    body: "Alongside tobacco and dairy, cattle and hay have stayed a steady, unglamorous constant in the county's farm economy, and remain some of Greene County's most valuable agricultural products today.",
  },
  {
    no: "07",
    era: "Today",
    title: "Diversified, direct-to-market produce",
    body: "Fruit, vegetables, herbs, and seed, grown on a small footprint and sold straight to local families instead of through a single commodity market. Where Price Family Farm fits into this same 250-year line.",
  },
];

export default function Heritage() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Heritage</span>
          <h1>Two hundred and fifty years of farming this same valley.</h1>
          <p>
            Greeneville and Greene County have a real, documented agricultural history, from Cherokee corn fields
            to a century of burley tobacco to the small, diversified farms growing here today. This is that story,
            and where ours fits into it.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">The timeline</span>
            <h2>From Cherokee hunting ground to the 16th state.</h2>
            <p>Scroll through. Thirteen moments that shaped this county, in order.</p>
          </div>
        </div>
        <div className="era-rail">
          {ERAS.map((e) => (
            <div className="era-card" key={e.title}>
              <span className="era-year">{e.year}</span>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Cash Crops Through Time</span>
            <h2>What actually paid the bills here, era by era.</h2>
            <p>
              Farming in Greene County was never just one thing, but for a long stretch of the 20th century it was
              mostly one thing: tobacco. Here's the full arc, from subsistence crops to today.
            </p>
          </div>
          <div className="crop-era-grid">
            {CROPS.map((c) => (
              <div className="crop-era-card" key={c.no}>
                <div className="crop-era-no">{c.no}</div>
                <div>
                  <span className="crop-era-tag">{c.era}</span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ textAlign: "center", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <span className="eyebrow">Where we fit in</span>
          <h2 style={{ marginTop: 10 }}>We&rsquo;re not the first farm on this land, and we won&rsquo;t be the last.</h2>
          <p style={{ color: "var(--ink-soft)", marginTop: 14 }}>
            Burley tobacco built this county for a hundred years and then, almost overnight, stopped being the
            answer. What&rsquo;s replaced it, here and on farms like ours across the county, is smaller,
            more varied, and sold directly to the people eating it. Read how we&rsquo;re doing that today.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-clay" style={{ border: "1px solid var(--clay)", background: "var(--clay)", color: "#fff" }} href="/our-story">
              Read our story
            </Link>
            <Link className="btn btn-outline" style={{ borderColor: "var(--ink-soft)", color: "var(--ink)" }} href="/growing-guide">
              See the growing guide
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
