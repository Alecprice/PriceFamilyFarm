import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "What We Grow · Price Family Farm",
  description:
    "Orchard fruit, berries, vegetables, herbs, and seasonal plant starts: everything grown at Price Family Farm in Greeneville, TN.",
};

export default function WhatWeGrow() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">What We Grow</span>
          <h1>Orchard fruit, market vegetables, and seasonal plant starts.</h1>
          <p>Everything below is in active production at Price Family Farm right now, grown across the orchard, greenhouse, and container rows on Magnolia Dr.</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">No. 01</span>
            <h2>Orchard &amp; Perennial Crops</h2>
            <p>Established and expanding plantings, most going into the ground this year and building toward full production over the next several seasons.</p>
          </div>
          <div className="grid-3">
            <div className="packet">
              <h3>Tree Fruit</h3>
              <ul><li>Apples</li><li>Pears</li><li>Peaches</li><li>Pawpaws</li></ul>
            </div>
            <div className="packet">
              <h3>Stone Fruit &amp; Vine</h3>
              <ul><li>6+ varieties of plum</li><li>4 varieties of cherry</li><li>Figs</li><li>Grapes</li></ul>
            </div>
            <div className="packet">
              <h3>Berries &amp; Uncommon Fruit</h3>
              <ul><li>23+ mature blueberry plants</li><li>4 varieties of elderberry</li><li>2 varieties of pomegranate</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">No. 02</span>
            <h2>Vegetables &amp; Herbs</h2>
            <p>Grown intensively in raised containers and greenhouse beds, cycling through the season from spring starts to summer harvest.</p>
          </div>
          <div className="grid-3">
            <div className="packet">
              <h3>Fruiting Crops</h3>
              <ul><li>Tomatoes</li><li>Peppers</li><li>Cucumbers</li><li>Melons</li></ul>
            </div>
            <div className="packet">
              <h3>Squash &amp; Pods</h3>
              <ul><li>Squash</li><li>Zucchini</li><li>Okra</li></ul>
            </div>
            <div className="packet">
              <h3>Greens &amp; Herbs</h3>
              <ul><li>Culinary herbs</li><li>Salad and cooking greens</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">No. 03</span>
            <h2>Our Plant Starts</h2>
            <p>
              Alongside our farm-grown produce, we offer seasonal plant starts for home gardeners throughout
              Greeneville and the surrounding Northeast Tennessee region. Our selection includes vegetables,
              herbs, flowers, and fruiting plants such as blackberry, raspberry, and boysenberry varieties.
            </p>
          </div>
          <div className="packet" style={{ maxWidth: 640 }}>
            <span className="eyebrow">Seasonal availability</span>
            <h3>Started, grown, and cared for in-house</h3>
            <p>
              Our vegetable, herb, and flower starts are grown from seed and raised by our family until they
              are ready for transplanting. We also propagate select berry plants and other fruiting varieties
              for customers looking to establish productive gardens and edible landscapes of their own. Every
              plant is grown with the same straightforward approach we use across the farm: quality seed or
              plant stock, soil, water, sunlight, and patient care.
            </p>
          </div>
        </div>
      </section>

      <section className="stat-band">
        <div className="wrap">
          <div><b>10</b><span>Distinct orchard fruit types</span></div>
          <div><b>9</b><span>Vegetable &amp; herb crops in rotation</span></div>
          <div><b>3</b><span>Berry varieties available as starts</span></div>
          <div><b>2026</b><span>First full growing season</span></div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap" style={{ textAlign: "center", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <span className="eyebrow">Next</span>
          <h2 style={{ marginTop: 10 }}>Curious how all of this actually gets grown?</h2>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-clay" style={{ border: "1px solid var(--clay)", background: "var(--clay)", color: "#fff" }} href="/how-we-grow">
              See how we grow it
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
