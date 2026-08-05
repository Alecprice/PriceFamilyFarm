import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "How We Grow · Price Family Farm",
  description:
    "Greenhouse propagation, intensive container gardening, organic fertility, and the daily rhythms behind Price Family Farm in Greeneville, TN.",
};

const METHODS = [
  { no: "01", title: "Greenhouse & indoor propagation", body: "A 10×12 ft. greenhouse plus two indoor grow tents with dedicated climate control and lighting give us a controlled environment to start seed year-round and keep a steady pipeline of starts ready for the containers outside." },
  { no: "02", title: "Intensive container & raised-bed gardening", body: "With 80 raised containers and rows of fabric grow bags, we grow at high density on a small footprint. Every container is individually filled, planted, and managed rather than relying on open field rows." },
  { no: "03", title: "Orchard establishment", body: "Fruit trees and berry plants go in as bare-root or potted stock and are individually sited and maintained as the orchard footprint expands year over year." },
  { no: "04", title: "Soil & fertility", body: "We build soil fertility with quality potting mix and garden soil at the start, then maintain it through the season using rabbit manure as a natural fertilizer." },
  { no: "05", title: "Daily care & irrigation", body: "Because everything is container-grown, daily irrigation and hands-on plant care aren't optional. Watering, feeding, and checking on plants happens every day of the season." },
  { no: "06", title: "Seed saving & packaging", body: "Seed from our strongest crops is saved and cleaned for next season's plantings, and for the seasonal starts we raise for other home gardeners, a step toward closing the loop on our own production." },
];

export default function HowWeGrow() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">How We Grow</span>
          <h1>Intensive, container-based, and hands on every single day.</h1>
          <p>We don&rsquo;t have generations of open acreage. We have a home lot in Greeneville, worked hard, and here&rsquo;s the actual system behind it.</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="grid-2">
            {METHODS.map((m) => (
              <div className="packet" key={m.no}>
                <span className="eyebrow">Method {m.no}</span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream bg-line-top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Why container-first</span>
            <h2>Small footprint, high intent.</h2>
            <p>Container and raised-bed growing lets us hit real production volume on a home-scale lot while keeping every planting mobile, protectable, and easy to expand: a deliberate choice suited to a first-generation farm building from zero.</p>
          </div>
          <div className="strip">
            <div className="strip-item">
              <Image src="/images/collage-beds.jpg" alt="Collage of raised bed and container plantings" fill sizes="260px" style={{ objectFit: "cover" }} />
            </div>
            <div className="strip-item">
              <Image src="/images/collage-greenhouse.jpg" alt="Collage of greenhouse assembly and grow shelves" fill sizes="260px" style={{ objectFit: "cover" }} />
            </div>
            <div className="strip-item">
              <Image src="/images/collage-starts.jpg" alt="Collage of seed trays and starts" fill sizes="260px" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="pull">
            &ldquo;My farm operation includes significant infrastructure investment, including 80 raised
            containers, a 10×12 greenhouse, and two indoor grow tents with climate control and lighting.&rdquo;
            <cite>Written Statement of Active Engagement, June 2026</cite>
          </div>
          <div className="btn-row">
            <Link className="btn btn-clay" style={{ border: "1px solid var(--clay)", background: "var(--clay)", color: "#fff" }} href="/documentation">
              See the full paper trail
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
