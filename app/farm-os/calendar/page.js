import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmCalendar from "@/components/FarmCalendar";

export const metadata = {
  title: "Farm Calendar · Price Family Farm",
  description: "A private browser-local planning calendar for Price Family Farm planting, harvest, maintenance, market, funding, and weather-related tasks.",
  robots: { index: false, follow: false },
};

export default function FarmCalendarPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm OS · Private calendar</span><h1>Turn next actions into dated farm work.</h1><p>Track planting, harvest, maintenance, market, funding, and weather-related tasks without treating planning dates as automatically verified deadlines.</p></div></header>
      <main><div className="wrap"><FarmCalendar /></div></main>
      <Footer />
    </>
  );
}
