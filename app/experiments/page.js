import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { EXPERIMENTS } from "@/lib/farmData";

export const metadata = {
  title: "Farm Experiments · Price Family Farm",
  description: "A structured experiment log for container growing, grafting, greenhouse conditions, growing media, and overwintering at Price Family Farm.",
};

export default function ExperimentsPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Experiment Log</span><h1>Turn “I think that worked better” into a record.</h1><p>These are ready-to-use experiment templates. They are not presented as completed trials until real measurements are entered.</p></div></header>
      <main id="main-content" tabIndex={-1}><section><div className="wrap"><div className="experiment-grid">{EXPERIMENTS.map((experiment) => <article className="experiment-card" key={experiment.id}><div className="experiment-top"><span className="status-pill neutral">{experiment.status}</span><span className="experiment-id">{experiment.id}</span></div><h2>{experiment.title}</h2><p>{experiment.question}</p><h3>Record</h3><div className="tag-cloud">{experiment.measures.map((measure) => <span key={measure}>{measure}</span>)}</div></article>)}</div></div></section></main>
      <Footer />
    </>
  );
}
