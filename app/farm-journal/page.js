import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JournalFilters from "@/components/JournalFilters";

export const metadata = {
  title: "Farm Journal · Price Family Farm",
  description: "A living record of Price Family Farm: orchard work, infrastructure, education, experiments, harvests, and seasonal changes.",
};

export default function FarmJournalPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm Journal</span><h1>The farm as it actually happens.</h1><p>Projects, milestones, mistakes, observations, and seasonal work—kept in one timeline so each year can build on the last.</p></div></header>
      <section><div className="wrap"><div className="section-head"><span className="eyebrow">2026 baseline</span><h2>The first season becomes the reference point.</h2><p>This journal starts with confirmed milestones already documented across the site. Future entries can connect directly to a crop, farm area, harvest total, or experiment.</p></div><JournalFilters /></div></section>
      <Footer />
    </>
  );
}
