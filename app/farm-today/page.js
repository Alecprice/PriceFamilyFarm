import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmToday from "@/components/FarmToday";

export const metadata = {
  title: "Farm Today · Price Family Farm",
  description: "Private browser-local daily command center for Price Family Farm tasks, crop plans, notes, and recent records.",
  robots: { index: false, follow: false },
};

export default function FarmTodayPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Today</span>
          <h1>See what needs attention and capture the next thing.</h1>
          <p>One private daily view for overdue work, today&rsquo;s tasks, upcoming items, active crop plans, quick notes, and recent farm activity.</p>
        </div>
      </header>
      <main>
        <div className="wrap">
          <FarmToday />
        </div>
      </main>
      <Footer />
    </>
  );
}
