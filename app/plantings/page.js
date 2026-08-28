import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlantingTracker from "@/components/PlantingTracker";

export const metadata = {
  title: "Plantings & Successions · Price Family Farm",
  description: "Private browser-local planting, bed, succession, and harvest-link tracker for Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function PlantingsPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Plantings</span>
          <h1>Track each planting from seed to harvest window.</h1>
          <p>Connect crop, variety, growing area, timing, spacing, succession dates, and matching Farm Records harvests without publishing farm production data.</p>
        </div>
      </header>
      <main><div className="wrap"><PlantingTracker /></div></main>
      <Footer />
    </>
  );
}
