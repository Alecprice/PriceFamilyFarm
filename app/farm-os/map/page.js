import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmMapPlanner from "@/components/FarmMapPlanner";

export const metadata = {
  title: "Farm Map · Price Family Farm",
  description: "A private browser-local schematic zone map for farm planning without storing GPS coordinates, addresses, or parcel boundaries.",
  robots: { index: false, follow: false },
};

export default function FarmMapPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Private schematic</span><h1>Map working zones without publishing the property.</h1><p>Organize beds, nursery space, tunnels, storage, water, buffers, and other working areas using a deliberately non-geographic browser-local schematic.</p></div></header>
      <main><div className="wrap"><FarmMapPlanner /></div></main>
      <Footer />
    </>
  );
}
