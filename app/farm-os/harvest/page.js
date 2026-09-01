import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HarvestDashboard from "@/components/HarvestDashboard";

export const metadata = {
  title: "Harvest Dashboard · Price Family Farm",
  description: "A private browser-local view of Price Family Farm harvest records, quantities, destinations, and recorded sales.",
  robots: { index: false, follow: false },
};

export default function HarvestPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Harvest dashboard</span>
          <h1>See what the season is actually producing.</h1>
          <p>Review browser-local harvest entries by crop without mixing unlike units or turning incomplete records into guessed totals.</p>
        </div>
      </header>
      <main><div className="wrap"><HarvestDashboard /></div></main>
      <Footer />
    </>
  );
}
