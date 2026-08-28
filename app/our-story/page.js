import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Our Story · Price Family Farm",
  description:
    "How Price Family Farm went from bare-root trees in a truck bed to a registered Tennessee family farm in one growing season.",
};

const ENTRIES = [
  {
    date: "Feb 2026",
    tag: "Ground work",
    title: "Bare root and a truck bed full of ambition",
    body: "The first plantings arrived bare root: canes and young trees hauled home and staged before they'd even gone in the ground. This was the real starting point, before the paperwork and before the business plan. Just deciding to plant.",
    img: "/images/story-01-bareroot.jpg",
    alt: "Bare-root fruit trees and canes loaded in the truck bed",
  },
  {
    date: "Feb – Mar",
    tag: "Propagation",
    title: "Starting seeds indoors",
    body: "The first trays went in under cover while it was still too cold to plant outside, a thick mat of seedling sprouts, the earliest wave of what would become tomatoes, peppers, herbs, and greens once the weather turned.",
    img: "/images/story-02-starts.jpg",
    alt: "A dense tray of young seedling sprouts",
  },
  {
    date: "Mar 2026",
    tag: "Propagation",
    title: "The grow tent gets to work",
    body: "Rows of trays and pots filled one of the indoor grow tents, stretched to capacity. This was the beginning of the propagation system the farm would depend on all season for a steady supply of starts. (The greenhouse itself came later, this early setup was all grow tent.)",
    img: "/images/story-03-greenhouse-trays.jpg",
    alt: "Rows of seed trays and pots inside a grow tent",
  },
  {
    date: "Apr 2026",
    tag: "Infrastructure",
    title: "Soil, mulch, containers, and support stakes",
    body: "All the building blocks for our plants to grow and thrive.",
    img: "/images/story-04-soil.jpg",
    alt: "Bags of soil and mulch staged for the raised beds",
  },
  {
    date: "Apr 2026",
    tag: "Propagation",
    title: "Hardening off",
    body: "Trays moved outside to toughen up before transplant. The daily rhythm of carrying starts in and out settled in as the true full-time job of running a farm.",
    img: "/images/story-05-hardening.jpg",
    alt: "Trays of seedlings on a black plastic shelving unit outdoors",
  },
  {
    date: "Late Apr",
    tag: "Harvest starts",
    title: "First greens ready",
    body: "A tray of lettuce and greens filled in fast, the first crop to go from seed to something you could actually eat. A good early sign the whole system worked.",
    img: "/images/story-06-rows.jpg",
    alt: "A tray of leafy greens filling in",
  },
  {
    date: "May 2026",
    tag: "Containers",
    title: "Container rows take shape",
    body: "The container system started reading as an actual garden: a staked tomato, herbs, and rows of other potted crops, each one earmarked for something different.",
    img: "/images/story-07-greens.jpg",
    alt: "A staked tomato plant in a grow bag surrounded by rows of potted herbs and vegetables",
  },
  {
    date: "May 2026",
    tag: "Infrastructure",
    title: "More starts, moved to catch the sun",
    body: "As the greenhouse filled up, trays started spilling out onto the patio, wherever there was open ground and good light, to keep the pipeline of starts moving.",
    img: "/images/story-08-shelves.jpg",
    alt: "A tray of starts set out on the patio",
  },
  {
    date: "May 2026",
    tag: "Infrastructure",
    title: "Grow shelving joins the lineup",
    body: "A tiered shelving unit went into rotation outdoors, adding vertical growing space so more trays could sit in full sun without eating up more ground.",
    img: "/images/story-09-shelf-rain.jpg",
    alt: "A tiered grow shelving unit on the patio, filled with starts",
  },
  {
    date: "May 2026",
    tag: "Transplant",
    title: "Tomatoes go in",
    body: "Tomato starts moved into their permanent containers, one of the season's main crops, staked and set alongside the peppers, herbs, and squash.",
    img: "/images/story-10-growbags.jpg",
    alt: "Staked tomato plants in pots along a row of containers",
  },
  {
    date: "Late May",
    tag: "Containers",
    title: "Grow bag rows expand",
    body: "Fabric grow bags spread across the yard added another layer of growing space: flexible, cheap to add, and easy to expand as the season demanded more room.",
    img: "/images/story-11-bags-rows.jpg",
    alt: "Rows of black fabric grow bags across the yard",
  },
  {
    date: "Jun 4",
    tag: "Orchard",
    title: "The orchard keeps establishing",
    body: "New trees and shrubs kept going in through early June, filling out the orchard alongside the blueberries and the season's earlier bare-root plantings.",
    img: "/images/story-12-tree.jpg",
    alt: "A newly potted tree set on an old tree stump in the yard",
  },
];

export default function OurStory() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Our Story</span>
          <h1>One growing season, from bare root to registered farm.</h1>
          <p>
            Price Family Farm started this year in Greeneville, Tennessee. No inherited operation, no
            shortcuts. Here&rsquo;s the season as it actually happened, month by month.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="ledger">
            {ENTRIES.map((e) => (
              <div className="entry" key={e.title}>
                <div className="entry-date">{e.date}<div className="dot"></div></div>
                <div className="entry-body">
                  <div>
                    <span className="entry-tag">{e.tag}</span>
                    <h3>{e.title}</h3>
                    <p>{e.body}</p>
                  </div>
                  <div className="entry-photo"><img src={e.img} alt={e.alt} /></div>
                </div>
              </div>
            ))}

            <div className="entry">
              <div className="entry-date">Jun 16 – 23<div className="dot"></div></div>
              <div className="entry-body">
                <div>
                  <span className="entry-tag paper">On paper</span>
                  <h3>It becomes official</h3>
                  <p>
                    In the span of a week: the Tennessee Department of Agriculture registered{" "}
                    <strong>Price Family Farm</strong> as an official family farm name, the business plan was
                    finalized, and the written statement of active engagement went to the Department of Revenue.
                    The full paper trail is on the <Link href="/documentation">Documentation</Link> page.
                  </p>
                </div>
                <div className="entry-photo"><img src="/images/collage-beds.jpg" alt="A collage of the season's raised beds and container plantings" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="pull">
            &ldquo;My operation is currently in a primary growth phase, utilizing intensive container gardening,
            greenhouse propagation, and established orchard management to produce a variety of fruits, berries,
            herbs, and vegetables for the local market.&rdquo;
            <cite>Cover letter to the TN Department of Revenue, June 21, 2026</cite>
          </div>
          <div className="btn-row">
            <Link className="btn btn-clay" style={{ border: "1px solid var(--clay)", background: "var(--clay)", color: "#fff" }} href="/what-we-grow">
              See what we grow next
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
