import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmRecordWorkspace from "@/components/FarmRecordWorkspace";

export const metadata = {
  title: "Farm Records · Price Family Farm",
  description: "A private browser-local workspace for harvests, farm experiments, expenses, sales, and season backups at Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function FarmRecordsPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Private working records</span>
          <h1>Record what happened. Use it to decide what happens next.</h1>
          <p>Harvests, sales, experiments, and direct farm expenses stay in this browser unless you choose to export them.</p>
        </div>
      </header>
      <main>
        <div className="wrap"><FarmRecordWorkspace /></div>
      </main>
      <Footer />
    </>
  );
}
