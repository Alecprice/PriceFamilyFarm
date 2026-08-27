import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FundingEducationTracker from "@/components/FundingEducationTracker";

export const metadata = {
  title: "Funding & Education Tracker · Price Family Farm",
  description: "Private browser-local tracking for farm grants, cost share, certifications, courses, deadlines, and next actions.",
  robots: { index: false, follow: false },
};

export default function FundingPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Readiness</span><h1>Keep opportunities, deadlines, and credentials in one queue.</h1><p>A private planning layer for grants, cost-share programs, certifications, and farm education. Always verify changing rules at the official source.</p></div></header>
      <main><div className="wrap"><FundingEducationTracker /></div></main>
      <Footer />
    </>
  );
}
