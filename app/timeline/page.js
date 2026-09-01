import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { MILESTONES } from "@/lib/farmData";

export const metadata = {
  title: "Farm Timeline · Price Family Farm",
  description: "Milestones in the development of Price Family Farm, beginning with the first orchard trees and official 2026 farm records.",
};

export default function TimelinePage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm Timeline</span><h1>A farm gets built one milestone at a time.</h1><p>Confirmed dates and milestones are preserved here so the story can keep extending year after year.</p></div></header>
      <section><div className="wrap"><div className="milestone-timeline">{MILESTONES.map((item) => <article key={`${item.date}-${item.title}`}><div className="milestone-dot"/><div className="milestone-date">{item.date}</div><h2>{item.title}</h2><p>{item.body}</p></article>)}</div><div className="btn-row"><Link className="btn btn-clay" href="/farm-journal">Read the farm journal</Link><Link className="btn btn-outline btn-on-light" href="/documentation#official-records">Official records</Link></div></div></section>
      <Footer />
    </>
  );
}
