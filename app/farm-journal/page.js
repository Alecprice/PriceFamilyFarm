import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmJournal from "@/components/FarmJournal";

export const metadata = {
  title: "Farm Journal · Price Family Farm",
  description: "A private browser-local journal for Price Family Farm field notes, observations, maintenance, planning, and market notes.",
  robots: { index: false, follow: false },
};

export default function FarmJournalPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Private journal</span><h1>Keep the context that numbers alone cannot capture.</h1><p>Record observations, maintenance, market feedback, planning notes, and field decisions in a browser-local journal you can export.</p></div></header>
      <main><div className="wrap"><FarmJournal /></div></main>
      <Footer />
    </>
  );
}
