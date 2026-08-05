import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Price Family Farm",
  description:
    "A family-operated orchard, greenhouse, and market garden in Greeneville, East Tennessee, growing fruit, vegetables, and herbs.",
  url: SITE_URL,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: `${SITE_URL}/contact`,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Greeneville",
    addressRegion: "TN",
    addressCountry: "US",
  },
  areaServed: "Greene County, Tennessee",
  foundingDate: "2026",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <header className="hero">
        <div className="wrap">
          <span className="eyebrow on-dark">Est. 2026 · Greene County, Tennessee</span>
          <h1>
            Growing something real in <em>East Tennessee.</em>
          </h1>
          <p className="lede">
            A family-operated, small-scale farm in Greeneville, Tennessee, serving communities throughout
            Northeast Tennessee. We grow with a simple philosophy: plants, seeds, soil, water, and compost made
            from what we grow. We do not rely on sprays, synthetic fertilizers, or added treatments. Instead, we
            work with nature, return plant material to the soil, and let each crop grow as naturally as possible.
          </p>
          <div className="btn-row">
            <Link className="btn btn-clay" href="/our-story">Read our story</Link>
            <Link className="btn btn-outline" href="/what-we-grow">See what we grow</Link>
          </div>
        </div>
      </header>

      <section className="quickfacts">
        <div className="wrap quickfacts-grid">
          <div className="stat stat-seal">
            <Image src="/images/tn-seal.png" alt="The Great Seal of the State of Tennessee" width={56} height={56} className="seal-icon" />
            <div>
              <b>2026</b><span>Registered farm name, State of TN</span>
            </div>
          </div>
          <div className="stat stat-list">
            <span className="stat-list-label">How we grow</span>
            <ul>
              <li>Container gardening</li>
              <li>Raised beds</li>
              <li>Greenhouse propagation</li>
              <li>Indoor grow tents</li>
            </ul>
          </div>
          <div className="stat stat-list">
            <span className="stat-list-label">Where we grow</span>
            <ul>
              <li>Zone 7a</li>
              <li>Greene County, TN</li>
            </ul>
            <Link href="/growing-guide" className="stat-link">Growing tips &amp; tricks →</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Mission</span>
            <h2>Traditional cultivation, modern methods, one family running it.</h2>
            <p>
              We&rsquo;re building a resilient, family-operated farm on disciplined recordkeeping and diversified
              production, combining an expanding orchard with greenhouse propagation to serve our local
              Greeneville community.
            </p>
          </div>

          <div className="grid-2">
            <div className="packet">
              <span className="eyebrow">No. 01 · Orchard &amp; Perennials</span>
              <h3>Orchard &amp; Berries</h3>
              <p>Apples, pears, peaches, figs, grapes, elderberry, plum, cherry, pomegranate, pawpaw, and 23+ blueberry bushes, all established since spring 2026.</p>
            </div>
            <div className="packet">
              <span className="eyebrow">No. 02 · Infrastructure</span>
              <h3>Greenhouse &amp; Grow Space</h3>
              <p>A 10×12 greenhouse and two climate-controlled indoor grow tents extend our season and keep a steady supply of starts moving to the containers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">This year</span>
            <h2>What actually got done in one season.</h2>
            <p>No inherited acreage, no head start. Here&rsquo;s what one growing season on a home lot in Greeneville added up to.</p>
          </div>
          <div className="grid-3">
            <div className="packet">
              <span className="eyebrow">Built</span>
              <h3>The infrastructure</h3>
              <ul>
                <li>Constructed raised garden beds from scratch</li>
                <li>Acquired containers across every size we needed: 3, 5, 7, 10, 15, 20, and 25 gallon</li>
                <li>Built out a full seed-starting setup with trays and propagation supplies</li>
                <li>Purchased a 10×12 greenhouse to extend our growing seasons</li>
                <li>Added two climate-controlled indoor grow tents</li>
              </ul>
            </div>
            <div className="packet">
              <span className="eyebrow">Filed</span>
              <h3>The paperwork</h3>
              <p>Farm name registered with the TN Dept. of Agriculture, business plan written, and a formal application submitted to the TN Dept. of Revenue.</p>
            </div>
            <div className="packet">
              <span className="eyebrow">Learned</span>
              <h3>The craft</h3>
              <p>Completed the University of Tennessee Institute of Agriculture&rsquo;s Master Farm Manager Program on July 31, 2026.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-band">
        <div className="wrap">
          <div><b>Feb 2026</b><span>First trees in the ground</span></div>
          <div><b>Jun 16</b><span>Farm name registered w/ TN Dept. of Ag</span></div>
          <div><b>Jul 31</b><span>UT Master Farm Manager Program</span></div>
          <div><b>Direct</b><span>Farmers market &amp; on-farm sales</span></div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap" style={{ textAlign: "center", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <span className="eyebrow">Follow along</span>
          <h2 style={{ marginTop: 10 }}>This is a working farm, and this site is a working record.</h2>
          <p style={{ color: "var(--ink-soft)", marginTop: 14 }}>
            Read the full story of how the farm came together, browse what we grow and how, check the East
            Tennessee planting calendar, or try a recipe made with what came off the farm.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-clay" style={{ border: "1px solid var(--clay)" }} href="/growing-guide">See the growing guide</Link>
            <Link className="btn btn-outline" style={{ borderColor: "var(--ink-soft)", color: "var(--ink)" }} href="/recipes">Browse farm recipes</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
