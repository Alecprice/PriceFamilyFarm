import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmPlanner from "@/components/FarmPlanner";

export const metadata = {
  title: "Farm Planner · Price Family Farm",
  description: "A private browser-local crop and bed planning board for Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function FarmPlannerPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Private planner</span><h1>Plan crops, spaces, starts, transplants, and harvest targets.</h1><p>Keep a practical crop board tied to your own working dates while leaving weather and other time-sensitive decisions to their verified sources.</p></div></header>
      <main><div className="wrap"><FarmPlanner /></div></main>
      <Footer />
    </>
  );
}
