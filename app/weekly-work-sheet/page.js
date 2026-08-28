import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WeeklyWorkSheet from "@/components/WeeklyWorkSheet";

export const metadata = {
  title: "Weekly Farm Work Sheet · Price Family Farm",
  description: "Private browser-local printable weekly work sheet for farm tasks, successions, harvest windows, low stock, and market prep.",
  robots: { index: false, follow: false },
};

export default function WeeklyWorkSheetPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Weekly Work Sheet</span>
          <h1>Put the next seven days on one printable page.</h1>
          <p>Combine overdue work, upcoming tasks, successions, harvest windows, low-stock supplies, and market prep from this browser&rsquo;s Farm OS data.</p>
        </div>
      </header>
      <main><div className="wrap"><WeeklyWorkSheet /></div></main>
      <Footer />
    </>
  );
}
