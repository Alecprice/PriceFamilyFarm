import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmDataHealth from "@/components/FarmDataHealth";

export const metadata = {
  title: "Farm OS Data Health · Price Family Farm",
  description: "Private browser-local Farm OS integrity, backup-age, duplicate-ID, and recovery readiness checks.",
  robots: { index: false, follow: false },
};

export default function FarmDataHealthPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Data Health</span>
          <h1>Know whether the farm data is healthy before you need it.</h1>
          <p>Check local store shape, size, duplicate IDs, backup age, recovery snapshots, and controlled maintenance without uploading farm records.</p>
        </div>
      </header>
      <main><div className="wrap"><FarmDataHealth /></div></main>
      <Footer />
    </>
  );
}
