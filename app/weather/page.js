import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WeatherPanel from "@/components/WeatherPanel";

export const metadata = {
  title: "Growing Conditions · Price Family Farm",
  description: "Greeneville-area National Weather Service forecast presented with explicit fallbacks for practical farm planning.",
};

export default function WeatherPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Growing Conditions</span><h1>Use live weather when it is available. Never invent it when it is not.</h1><p>General Greeneville-area National Weather Service data, using city-center coordinates rather than a private residential location.</p></div></header>
      <main className="farm-tools-shell"><div className="wrap"><WeatherPanel /></div></main>
      <Footer />
    </>
  );
}
