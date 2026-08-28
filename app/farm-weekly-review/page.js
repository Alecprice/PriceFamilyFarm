import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmWeeklyReview from "@/components/FarmWeeklyReview";

export const metadata = {
  title: "Farm Weekly Review · Price Family Farm",
  description: "Private browser-local weekly operating review for Price Family Farm records, tasks, notes, and crop plans.",
  robots: { index: false, follow: false },
};

export default function FarmWeeklyReviewPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS · Weekly review</span>
          <h1>Review the week before starting the next one.</h1>
          <p>Summarize recorded harvests, cash activity, dated task progress, notes, overdue work, and the next seven days from this browser&rsquo;s private Farm OS data.</p>
        </div>
      </header>
      <main>
        <div className="wrap">
          <FarmWeeklyReview />
        </div>
      </main>
      <Footer />
    </>
  );
}
