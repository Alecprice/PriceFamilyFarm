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
        </div>
      </main>
      <Footer />
    </>
  );
}
