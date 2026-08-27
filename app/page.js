import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WeatherPanel from "@/components/WeatherPanel";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://price-family-farm.alecjprice.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Price Family Farm",
  description: "A family-operated orchard, greenhouse, and market garden in Greeneville, East Tennessee, growing fruit, vegetables, herbs, and seasonal plant starts.",
  url: SITE_URL,
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", url: `${SITE_URL}/contact` },
  address: { "@type": "PostalAddress", addressLocality: "Greeneville", addressRegion: "TN", addressCountry: "US" },
  areaServed: "Greene County, Tennessee",
  foundingDate: "2026",
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow on-dark">Est. 2026 · Greene County, Tennessee</span>
            <h1>Grow the farm. <em>Keep the record.</em></h1>
            <p className="lede">Price Family Farm is a small family-operated orchard, greenhouse, and market garden in Greeneville. This site follows what we grow, what we learn, what becomes available, and the decisions behind the next season.</p>
            <div className="btn-row">
              <Link className="btn btn-clay" href="/available">See farm availability</Link>
              <Link className="btn btn-outline" href="/growing-guide">Plan a garden</Link>
            </div>
          </div>
          <div className="hero-media">
            <Image src="/images/hero-real.jpg" alt="Price Family Farm growing space in Greeneville, Tennessee" fill sizes="(max-width: 860px) 100vw, 42vw" priority style={{ objectFit: "cover" }} />
          </div>
        </div>
      </header>

      <section className="quickfacts">
        <div className="wrap quickfacts-grid">
          <div className="stat stat-seal"><Image src="/images/tn-seal.png" alt="The Great Seal of the State of Tennessee" width={56} height={56} className="seal-icon" /><div><b>2026</b><span>Registered family farm name in Tennessee</span><Link href="/documentation" className="stat-link">See the farm record →</Link></div></div>
          <div className="stat stat-list"><span className="stat-list-label">Growing systems</span><ul><li>Orchard &amp; berries</li><li>Greenhouse propagation</li><li>Raised beds &amp; containers</li><li>Indoor starts</li></ul></div>
          <div className="stat stat-list"><span className="stat-list-label">Local growing</span><ul><li>Zone 7a</li><li>Greene County, TN</li></ul><Link href="/weather" className="stat-link">Current growing conditions →</Link></div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head"><span className="eyebrow">Start here</span><h2>Three useful paths instead of a wall of links.</h2><p>Visitors can follow the farm, use practical growing information, or tell us what they may want to buy when the season produces it.</p></div>
          <div className="grid-3">
            <article className="packet"><span className="eyebrow">Farm</span><h3>Follow the growing record.</h3><p>See the crops, the story, official documentation, and how the growing systems are developing.</p><Link className="stat-link" href="/what-we-grow">Open crop records →</Link></article>
            <article className="packet"><span className="eyebrow">Plan</span><h3>Use the growing resources.</h3><p>Work from East Tennessee growing guidance, propagation notes, recipes, and current area conditions.</p><Link className="stat-link" href="/growing-guide">Open the growing guide →</Link></article>
            <article className="packet"><span className="eyebrow">Availability</span><h3>Join the seasonal interest list.</h3><p>Choose the plants or farm products you care about without treating future production as confirmed inventory.</p><Link className="stat-link" href="/available">Choose interests →</Link></article>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head"><span className="eyebrow">Growing conditions</span><h2>Weather should fail honestly.</h2><p>Live National Weather Service data is useful for farm planning, but the site never substitutes invented numbers when the feed is unavailable.</p></div>
          <WeatherPanel />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head"><span className="eyebrow">Farm OS</span><h2>Private operating records sit behind the public farm story.</h2><p>Harvests, experiments, direct farm expenses, and funding-readiness notes can be kept locally in the browser and exported for backup.</p></div>
          <div className="grid-3">
            <article className="packet"><span className="eyebrow">01 · Records</span><h3>Harvests, sales &amp; expenses</h3><p>Capture the season while it is happening, then export the data to CSV or JSON.</p><Link className="stat-link" href="/farm-records">Open Farm Records →</Link></article>
            <article className="packet"><span className="eyebrow">02 · Experiments</span><h3>Measure what actually works</h3><p>Record a question, variable, control, measure, status, and result instead of relying on memory.</p><Link className="stat-link" href="/farm-records">Log an experiment →</Link></article>
            <article className="packet"><span className="eyebrow">03 · Readiness</span><h3>Funding &amp; education queue</h3><p>Keep grants, cost share, certifications, deadlines, official links, and next actions in one private tracker.</p><Link className="stat-link" href="/funding">Open readiness tracker →</Link></article>
          </div>
        </div>
      </section>

      <section className="stat-band"><div className="wrap"><div><b>Feb 2026</b><span>First trees in the ground</span></div><div><b>Jun 16</b><span>Farm name registered with Tennessee</span></div><div><b>Jul 31</b><span>UT Master Farm Manager completed</span></div><div><b>Next</b><span>Build a measurable, market-ready second season</span></div></div></section>

      <Footer />
    </>
  );
}
