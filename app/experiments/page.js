import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ExperimentsDashboard from "@/components/ExperimentsDashboard";

export const metadata = {
  title: "Experiment Log · Price Family Farm",
  description: "A private browser-local review of Price Family Farm experiments, controls, variables, status, and recorded results.",
  robots: { index: false, follow: false },
};

export default function ExperimentsPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Experiment log</span><h1>Keep trials separate from guesses.</h1><p>Review planned, running, completed, and stopped farm experiments while keeping incomplete results visibly incomplete.</p></div></header>
      <main><div className="wrap"><ExperimentsDashboard /></div></main>
      <Footer />
    </>
  );
}
