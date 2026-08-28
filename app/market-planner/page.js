import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmMarketPlanner from "@/components/FarmMarketPlanner";

export const metadata = {
  title: "Market Planner · Price Family Farm",
  description: "Private browser-local harvest target, market quantity, packing, aggregate demand, and price planning for Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function MarketPlannerPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Market Planner</span>
          <h1>Turn harvest targets into a realistic packing list.</h1>
          <p>Plan what you intend to offer, compare it with recent harvest signals, record aggregate interest counts, and print the market-day list without storing customer contact details.</p>
        </div>
      </header>
      <main><div className="wrap"><FarmMarketPlanner /></div></main>
      <Footer />
    </>
  );
}
