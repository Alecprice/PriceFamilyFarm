import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmInventory from "@/components/FarmInventory";

export const metadata = {
  title: "Farm Inventory · Price Family Farm",
  description: "Private browser-local farm supply inventory with reorder thresholds and low-stock visibility.",
  robots: { index: false, follow: false },
};

export default function FarmInventoryPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Inventory</span>
          <h1>Keep supplies visible before they become a bottleneck.</h1>
          <p>Track seeds, growing media, fertility, irrigation, trays, packaging, equipment, and other working supplies in this browser.</p>
        </div>
      </header>
      <main><div className="wrap"><FarmInventory /></div></main>
      <Footer />
    </>
  );
}
