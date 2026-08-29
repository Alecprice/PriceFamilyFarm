import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FARM_CROPS, JOURNAL_ENTRIES } from "@/lib/farmData";

export function generateStaticParams() { return FARM_CROPS.map((crop) => ({ slug: crop.slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const crop = FARM_CROPS.find((item) => item.slug === slug);
  return crop ? { title: `${crop.name} · Price Family Farm`, description: `${crop.name} at Price Family Farm: growing area, status, season, and ongoing records.` } : {};
}

export default async function CropPage({ params }) {
  const { slug } = await params;
  const crop = FARM_CROPS.find((item) => item.slug === slug);
  if (!crop) notFound();
  const relatedJournal = JOURNAL_ENTRIES.filter((entry) => entry.summary.toLowerCase().includes(crop.name.toLowerCase()) || entry.details.join(" ").toLowerCase().includes(crop.name.toLowerCase()));
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Crop Record · {crop.category}</span><h1>{crop.name}</h1><p>{crop.status} · {crop.area} · first farm record: {crop.established}</p></div></header>
      <section><div className="wrap"><div className="crop-record-grid"><article className="packet"><span className="eyebrow">Current record</span><h2>{crop.status}</h2><dl className="record-dl"><div><dt>Growing area</dt><dd>{crop.area}</dd></div><div><dt>First farm record</dt><dd>{crop.established}</dd></div><div><dt>Season</dt><dd>{crop.season}</dd></div></dl></article><article className="packet"><span className="eyebrow">What is documented</span><ul>{crop.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><p className="source-note">Specific cultivar, rootstock, yield, disease, and harvest records are intentionally left open when they have not been documented yet.</p></article></div>{relatedJournal.length > 0 && <div className="related-records"><span className="eyebrow">Related journal record</span>{relatedJournal.map((entry) => <div key={entry.slug}><strong>{entry.displayDate} · {entry.title}</strong><p>{entry.summary}</p></div>)}</div>}<div className="btn-row"><Link className="btn btn-clay" href="/farm-journal">Farm journal</Link><Link className="btn btn-outline btn-on-light" href="/what-we-grow">All crops</Link></div></div></section>
      <Footer />
    </>
  );
}
