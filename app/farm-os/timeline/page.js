import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SeasonTimeline from "@/components/SeasonTimeline";

export const metadata = {
  title: "Season Timeline · Price Family Farm",
  description: "A private browser-local timeline combining farm records, journal notes, experiments, and planned tasks for Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function TimelinePage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Private timeline</span><h1>See the season as one continuous operating story.</h1><p>Review harvests, experiments, expenses, journal notes, and calendar tasks together without publishing any browser-local farm data.</p></div></header>
      <main><div className="wrap"><SeasonTimeline /></div></main>
      <Footer />
    </>
  );
}
