import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmCloudSync from "@/components/FarmCloudSync";

export const metadata = {
  title: "Farm OS Cloud Sync · Price Family Farm",
  description: "Private device-to-device Farm OS synchronization controls.",
  robots: { index: false, follow: false },
};

export default function FarmCloudSyncPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Private</span>
          <h1>Cloud sync & device recovery</h1>
          <p>Move validated Farm OS working data between trusted devices without exposing the Neon database connection to the public site.</p>
        </div>
      </header>
      <main>
        <div className="wrap">
          <FarmCloudSync />
        </div>
      </main>
      <Footer />
    </>
  );
}
