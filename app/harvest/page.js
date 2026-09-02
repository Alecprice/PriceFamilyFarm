import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { HARVEST_STATS } from "@/lib/farmData";

export const metadata = {
  title: "2026 Season Tracker · Price Family Farm",
  description: "Price Family Farm's 2026 baseline for perennial plantings, variety counts, and future harvest records.",
};

export default function HarvestPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">2026 Season Tracker</span><h1>Start with what is known. Track the rest instead of guessing.</h1><p>This dashboard keeps confirmed planting counts separate from harvest metrics that still need to be recorded.</p></div></header>
      <main id="main-content" tabIndex={-1}><section><div className="wrap"><div className="metric-grid">{HARVEST_STATS.map((metric) => <div className={`metric-card ${metric.state}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div><div className="recording-panel"><span className="eyebrow">Next data to capture</span><h2>Every harvest can become useful farm history.</h2><div className="grid-3"><div><h3>Per crop</h3><p>Date, crop, variety, count or weight, quality notes.</p></div><div><h3>Per area</h3><p>Which bed/container/tree produced it and what inputs it received.</p></div><div><h3>Per season</h3><p>Total yield, first/last harvest, failures, disease pressure, and what changes next year.</p></div></div></div></div></section></main>
      <Footer />
    </>
  );
}
