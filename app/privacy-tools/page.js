import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PrivacyTools from "@/components/PrivacyTools";

export const metadata = {
  title: "Farm OS Privacy Tools · Price Family Farm",
  description: "Controls for reviewing and clearing browser-local Price Family Farm operating data.",
  robots: { index: false, follow: false },
};

export default function PrivacyToolsPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Privacy</span>
          <h1>Keep local farm records under your control.</h1>
          <p>Farm OS operating records stay in the current browser unless you export them. This page gives you an explicit way to remove that local data.</p>
        </div>
      </header>
      <main className="farm-tools-shell">
        <div className="wrap">
          <PrivacyTools />
          <p className="task-nav-summary" style={{ marginTop: 18 }}>
            Before clearing important records, return to <Link href="/farm-records">Farm Records</Link> and download a JSON backup.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
