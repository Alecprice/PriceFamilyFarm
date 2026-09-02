import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GardenLayoutBuilder from "@/components/GardenLayoutBuilder";

export const metadata = {
  title: "Garden Layout Builder · Price Family Farm",
  description: "A browser-local garden bed layout and area planning tool from Price Family Farm.",
  robots: { index: false, follow: false },
};

export default function GardenLayoutBuilderPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Learn · Planning tool</span><h1>Sketch garden beds by dimensions and growing use.</h1><p>Build a simple browser-local bed board, total the growing area you record, and keep crop or rotation notes without treating the result as a surveyed property plan.</p></div></header>
      <main><div className="wrap"><GardenLayoutBuilder /></div></main>
      <Footer />
    </>
  );
}
