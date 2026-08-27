import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AvailabilityInterestForm from "@/components/AvailabilityInterestForm";

export const metadata = {
  title: "Availability · Price Family Farm",
  description: "Seasonal produce and plant-start availability interest for Price Family Farm in Greeneville, Tennessee.",
};

export default function AvailabilityPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm Availability</span>
          <h1>Know what is coming without pretending it is already in stock.</h1>
          <p>Production changes with weather, germination, harvest timing, and the season. Confirmed availability belongs here; future interest belongs on the list below.</p>
        </div>
      </header>
      <main className="farm-tools-shell">
        <div className="wrap">
          <div className="interest-grid">
            <section>
              <span className="availability-status">Inventory is confirmed manually</span>
              <h2 style={{ marginTop: 14 }}>A low-pressure way to follow the harvest.</h2>
              <p>Instead of publishing guessed quantities, Price Family Farm keeps availability conservative. Join the interest list for the products you care about and we can reach out when something is genuinely ready.</p>
              <div className="farm-panel" style={{ marginTop: 22 }}>
                <span className="eyebrow">Likely categories</span>
                <h3>Plants first, then the season decides the rest.</h3>
                <ul>
                  <li>Seasonal vegetable and herb starts</li>
                  <li>Flowers and pollinator plants as production expands</li>
                  <li>Fresh vegetables and herbs when harvest volume supports sales</li>
                  <li>Fruit and berries as perennial plantings mature</li>
                </ul>
                <p>For a specific question, <Link href="/contact">contact the farm directly</Link>.</p>
              </div>
            </section>
            <AvailabilityInterestForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
