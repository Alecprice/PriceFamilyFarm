import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmOsDashboard from "@/components/FarmOsDashboard";

export const metadata = {
  title: "Farm OS · Price Family Farm",
  description: "Private browser-local command center for Price Family Farm operating records and planning tools.",
  robots: { index: false, follow: false },
};

export default function FarmOsPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS</span>
          <h1>Run the farm from one working dashboard.</h1>
          <p>See the browser-local operating picture, then jump directly into records, analytics, funding readiness, weather, or privacy controls.</p>
        </div>
      </header>
      <main>
        <div className="wrap">
          <FarmOsDashboard />
          <section className="farm-panel" aria-labelledby="farm-os-weekly-review-heading">
            <span className="eyebrow">Review rhythm</span>
            <h2 id="farm-os-weekly-review-heading">Close the week before planning the next one.</h2>
            <p>Summarize the last seven local calendar days of recorded harvests, sales, expenses, notes, and dated task progress, then see overdue work and the next seven days.</p>
            <div className="farm-actions"><Link className="farm-action" href="/farm-weekly-review">Open Weekly Review</Link></div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
