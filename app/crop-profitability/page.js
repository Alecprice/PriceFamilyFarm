import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CropProfitability from "@/components/CropProfitability";

export const metadata = {
  title: "Crop Profitability · Price Family Farm",
  description: "Private browser-local crop economics dashboard based on recorded sales, direct crop expenses, harvest quantities, and mapped growing area.",
  robots: { index: false, follow: false },
};

export default function CropProfitabilityPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Crop Economics</span>
          <h1>Use recorded numbers to decide what deserves more space.</h1>
          <p>Compare crop sales, direct crop expenses, recorded margin, harvest quantities, mapped area, and year-over-year results without pretending incomplete records are full accounting profit.</p>
        </div>
      </header>
      <main><div className="wrap"><CropProfitability /></div></main>
      <Footer />
    </>
  );
}
