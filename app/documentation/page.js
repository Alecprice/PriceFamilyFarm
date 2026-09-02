import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import farmNameRegistration from "@/public/images/documents/farm-name-registration.webp";
import masterFarmManager from "@/public/images/documents/master-farm-manager.webp";

export const metadata = {
  title: "Documentation · Price Family Farm",
  description:
    "The step-by-step process of registering a family farm and applying for an agricultural sales tax exemption in Tennessee.",
};

const STEPS = [
  {
    n: 1,
    title: "Keep records from day one",
    body: "Every purchase, from soil and containers to plants and greenhouse materials, gets kept as a receipt and logged. This habit starts before any application does, because you can't document commercial intent after the fact.",
    filed: "Ongoing · receipts & production logs",
  },
  {
    n: 2,
    title: "Register the farm name",
    body: "Under Tennessee Code Annotated, Title 43, Chapter 25, a family farm can register its official name with the Tennessee Department of Agriculture. \u201cPrice Family Farm\u201d was registered and authorized for use in Greene County.",
    filed: "Filed · June 16, 2026 · TN Dept. of Agriculture",
  },
  {
    n: 3,
    title: "Write the business plan",
    body: "A formal plan covering the business overview, mission, production and infrastructure, sales & marketing strategy, and financial management. It's the document that turns \u201cgrowing a lot of plants\u201d into a defined agricultural business.",
    filed: "Filed · June 17, 2026",
  },
  {
    n: 4,
    title: "Draft the written statement of active engagement",
    body: "A signed statement to the Tennessee Department of Revenue laying out exactly what's being grown, what's been invested, and how daily farm activity is carried out. It's the evidence that this is a real, active operation and not a plan on paper.",
    filed: "Filed · June 21, 2026",
  },
  {
    n: 5,
    title: "Apply for the Agricultural Sales & Use Tax Exemption",
    body: "A cover letter plus Form RV-F1308401, submitted to the Department of Revenue's Taxpayer Services Division in Nashville, with the business plan, written statement, and supporting documentation of land use and 2026 capital investment attached.",
    filed: "Filed · June 21–23, 2026 · TN Dept. of Revenue",
  },
  {
    n: 6,
    title: "Keep learning the business of farming",
    body: "Alongside the state paperwork, ongoing education matters too. Completing the University of Tennessee Institute of Agriculture's Master Farm Manager Program rounded out the first year with real farm management training, not just growing know-how.",
    filed: "Completed · July 31, 2026 · UT Institute of Agriculture",
  },
];

export default function Documentation() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Documentation</span>
          <h1>Becoming an official Tennessee family farm: the paper trail.</h1>
          <p>Growing the food is only half the job. This is the recordkeeping and state process behind Price Family Farm, laid out step by step for anyone doing this in Tennessee for the first time.</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">The process</span>
            <h2>Six steps, one growing season.</h2>
            <p>None of this happens overnight. It runs alongside the actual farm work, built up through the season as the operation became real enough to document.</p>
          </div>

          <div style={{ maxWidth: 760 }}>
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <div className="filed">{s.filed}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stat-band">
        <div className="wrap">
          <div><b>6</b><span>Steps completed this season</span></div>
          <div><b>12+</b><span>Receipts &amp; sources logged</span></div>
          <div><b>2</b><span>State agencies involved</span></div>
          <div><b>1</b><span>Growing season, start to registered</span></div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What went into it</span>
            <h2>The infrastructure behind &ldquo;actively engaged.&rdquo;</h2>
            <p>The recordkeeping behind the written statement: real receipts across soil, containers, seed, and structures, not a placeholder plan.</p>
          </div>
          <div className="grid-3">
            <div className="packet">
              <h3>Growing structures</h3>
              <ul>
                <li>10×12 ft. greenhouse</li>
                <li>Two indoor grow tents with climate control</li>
                <li>Grow shelving &amp; raised metal beds</li>
              </ul>
            </div>
            <div className="packet">
              <h3>Soil &amp; materials</h3>
              <ul>
                <li>Potting mix &amp; garden soil, multiple orders</li>
                <li>Berry-Tone &amp; plant food</li>
                <li>Mulch and wood for raised beds</li>
              </ul>
            </div>
            <div className="packet">
              <h3>Plants &amp; seed</h3>
              <ul>
                <li>Blueberries, peppers &amp; nursery stock</li>
                <li>Multiple seed orders</li>
                <li>44 pots and growing supplies</li>
              </ul>
            </div>
          </div>
          <p style={{ marginTop: 20, color: "var(--ink-soft)", fontSize: 14.5 }}>
            Note: this page summarizes our own recordkeeping and application process for anyone curious about how a
            Tennessee family farm gets registered. It isn&rsquo;t legal or tax advice, so if you&rsquo;re starting your
            own farm, check current forms and requirements with the TN Department of Agriculture and Department of
            Revenue directly.
          </p>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Official records &amp; training</span>
            <h2>The documents behind the milestones.</h2>
            <p>
              Original records supporting the farm registration and
              completed farm-management training are preserved here with
              the public farm record.
            </p>
          </div>

          <div className="grid-2">
            <article className="packet">
              <Image
                src={farmNameRegistration}
                alt="Tennessee family farm name registration for Price Family Farm"
                sizes="(max-width: 760px) 100vw, 50vw"
                style={{ width: "100%", height: "auto", borderRadius: 12 }}
              />
              <h3>Price Family Farm registration</h3>
              <p>
                Tennessee Department of Agriculture family farm name
                registration for Greene County, dated June 16, 2026.
              </p>
              <a
                className="stat-link"
                href="/documents/price-family-farm-registration.pdf"
                target="_blank"
                rel="noreferrer"
              >
                View original registration PDF →
              </a>
            </article>

            <article className="packet">
              <Image
                src={masterFarmManager}
                alt="University of Tennessee Master Farm Manager Program completion certificate"
                sizes="(max-width: 760px) 100vw, 50vw"
                style={{ width: "100%", height: "auto", borderRadius: 12 }}
              />
              <h3>Master Farm Manager Program</h3>
              <p>
                University of Tennessee Institute of Agriculture Master
                Farm Manager Program completion, July 31, 2026.
              </p>
              <a
                className="stat-link"
                href="/documents/alec-price-master-farm-manager.pdf"
                target="_blank"
                rel="noreferrer"
              >
                View original training certificate PDF →
              </a>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
