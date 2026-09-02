import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FarmOsDashboard from "@/components/FarmOsDashboard";
import FarmOsExpansionPanel from "@/components/FarmOsExpansionPanel";

export const metadata = {
  title: "Farm OS · Price Family Farm",
  description: "Private browser-local command center for Price Family Farm operating records and planning tools.",
  robots: { index: false, follow: false },
};

export default function FarmOsPage() {
  return (
    <>
      <Nav />
      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Farm OS</span>
          <h1>Run the farm from one working dashboard.</h1>
          <p>See the browser-local operating picture, then move directly into today&rsquo;s work, supplies, plantings, markets, economics, recovery, and weekly review.</p>
        </div>
      </header>
      <main>
        <div className="wrap">
          <FarmOsDashboard />
          <FarmOsExpansionPanel />
          <section className="farm-panel" aria-labelledby="farm-os-cloud-sync-heading">
            <span className="eyebrow">Device continuity</span>
            <h2 id="farm-os-cloud-sync-heading">Keep the private working set available across trusted devices.</h2>
            <p>Farm OS can keep its browser-local workflow while using the dedicated Price Family Farm cloud sync service for revision-aware backup, device restore, and conflict-safe transfers.</p>
            <div className="farm-actions">
              <Link className="farm-action" href="/farm-os/cloud-sync">Open Cloud Sync</Link>
              <Link className="farm-action secondary" href="/farm-backup">Open Local Backup</Link>
            </div>
          </section>

          <section
            className="farm-panel"
            aria-labelledby="farm-os-private-tools-heading"
          >
            <span className="eyebrow">Private operating tools</span>
            <h2 id="farm-os-private-tools-heading">
              Keep operating records separate from the public farm story.
            </h2>
            <p>
              These browser-local tools stay under Farm OS so their URLs
              cannot replace established public farm pages.
            </p>

            <div className="farm-actions">
              <Link className="farm-action" href="/farm-os/harvest">
                Harvest Dashboard
              </Link>
              <Link className="farm-action" href="/farm-os/experiments">
                Experiment Dashboard
              </Link>
              <Link className="farm-action" href="/farm-os/journal">
                Private Journal
              </Link>
              <Link className="farm-action" href="/farm-os/timeline">
                Operating Timeline
              </Link>
              <Link className="farm-action" href="/farm-os/calendar">
                Operating Calendar
              </Link>
              <Link className="farm-action" href="/farm-os/map">
                Farm Zone Map
              </Link>
              <Link className="farm-action" href="/farm-os/planner">
                Crop &amp; Bed Planner
              </Link>
            </div>
          </section>

          <section className="farm-panel" aria-labelledby="farm-os-weekly-review-heading">
            <span className="eyebrow">Review rhythm</span>
            <h2 id="farm-os-weekly-review-heading">Close the week before planning the next one.</h2>
            <p>Summarize the last seven local calendar days of recorded harvests, sales, expenses, notes, and dated task progress, then see overdue work and the next seven days.</p>
            <div className="farm-actions"><Link className="farm-action" href="/farm-weekly-review">Open Weekly Review</Link><Link className="farm-action secondary" href="/weekly-work-sheet">Print Weekly Work Sheet</Link></div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
