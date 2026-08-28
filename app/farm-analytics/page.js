import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmAnalyticsDashboard from "@/components/FarmAnalyticsDashboard";

export const metadata = {
  title: "Farm Analytics · Price Family Farm",
  description: "Private browser-local analysis of harvests, recorded sales, expenses, experiments, and crop-level cash margin for Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function FarmAnalyticsPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Private analytics</span>
          <h1>Turn farm records into better next-season decisions.</h1>
          <p>Compare recorded sales, direct expenses, harvest activity, experiments, and crop-level cash margin without sending private farm records off the device.</p>
        </div>
      </header>
      <main>
        <div className="wrap"><FarmAnalyticsDashboard /></div>
      </main>
      <Footer />
    </>
  );
}
