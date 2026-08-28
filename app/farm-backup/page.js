import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmLocalBackup from "@/components/FarmLocalBackup";

export const metadata = {
  title: "Farm OS Backup · Price Family Farm",
  description: "Private browser-local export and restore controls for Price Family Farm operating data.",
  robots: { index: false, follow: false },
};

export default function FarmBackupPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Local backup</span>
          <h1>Keep a portable copy of browser-local farm data.</h1>
          <p>Export the current Farm OS working set to a file, inspect a compatible backup, and choose exactly which local data areas to restore.</p>
        </div>
      </header>
      <main>
        <div className="wrap">
          <FarmLocalBackup />
        </div>
      </main>
      <Footer />
    </>
  );
}
