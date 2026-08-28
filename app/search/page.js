import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";

export const metadata = {
  title: "Search · Price Family Farm",
  description: "Search public Price Family Farm pages locally in the browser without searching private Farm OS records.",
};

export default function SearchPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Search</span><h1>Find the useful page without opening every menu.</h1><p>Search the public farm site for crops, growing guidance, documentation, weather, recipes, photos, and contact information.</p></div></header>
      <main><div className="wrap"><SiteSearch /></div></main>
      <Footer />
    </>
  );
}
