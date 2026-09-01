import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmMapExplorer from "@/components/FarmMapExplorer";

export const metadata = {
  title: "Farm Map · Price Family Farm",
  description: "Explore the growing systems at Price Family Farm: orchard, greenhouse, raised beds, containers, and indoor propagation.",
};

export default function FarmMapPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm Map</span><h1>One small farm, several connected growing systems.</h1><p>This diagram shows how the farm is organized without publishing the residence or an exact property layout. Tap an area to see what it does.</p></div></header>
      <section><div className="wrap"><FarmMapExplorer /></div></section>
      <section className="bg-cream bg-line-top"><div className="wrap"><div className="section-head"><span className="eyebrow">Next layer</span><h2>Eventually every tree, bed, and crop can have a record.</h2><p>The data model is ready to grow from broad areas into individual trees, berry rows, containers, and raised beds as those records are collected.</p></div></div></section>
      <Footer />
    </>
  );
}
