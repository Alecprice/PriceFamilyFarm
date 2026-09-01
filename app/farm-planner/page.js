import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Farm Planner · Price Family Farm",
  description:
    "Planning tools for East Tennessee growing, crop timing, garden layouts, weather awareness, and Price Family Farm operations.",
};

export default function FarmPlannerPage() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Plan & Grow</span>
          <h1>Plan the work without pretending the forecast is certain.</h1>
          <p>
            Use crop timing, garden layout, current growing conditions,
            and saved plans together while keeping long-range decisions
            grounded in current information.
          </p>
        </div>
      </header>

      <main>
        <section>
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Planning tools</span>
              <h2>Choose the level of planning you need.</h2>
              <p>
                Public growing tools stay useful for visitors while the
                farm's private operating planner remains inside Farm OS.
              </p>
            </div>

            <div className="grid-3">
              <article className="packet">
                <span className="eyebrow">Crop timing</span>
                <h3>My Growing Journey</h3>
                <p>
                  Turn crop dates into staged sowing, transplanting,
                  scouting, and harvest work.
                </p>
                <Link className="stat-link" href="/my-growing-journey">
                  Open My Growing Journey →
                </Link>
              </article>

              <article className="packet">
                <span className="eyebrow">Bed design</span>
                <h3>Garden Layout Builder</h3>
                <p>
                  Estimate crop zones and spacing before committing a bed
                  or growing area.
                </p>
                <Link
                  className="stat-link"
                  href="/learn/garden-layout-builder"
                >
                  Build a garden layout →
                </Link>
              </article>

              <article className="packet">
                <span className="eyebrow">Conditions</span>
                <h3>Current Growing Conditions</h3>
                <p>
                  Check current weather guidance before making
                  weather-sensitive field decisions.
                </p>
                <Link className="stat-link" href="/weather">
                  Check growing conditions →
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-cream bg-line-top">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Learn first</span>
              <h2>Use the growing calendar as context.</h2>
              <p>
                Year-round guidance and the public farm calendar provide
                timing context without turning seasonal guidance into a
                guaranteed date.
              </p>
            </div>

            <div className="btn-row">
              <Link className="btn btn-clay" href="/farm-calendar">
                Open Farm Calendar
              </Link>
              <Link className="btn btn-outline" href="/learn/year-round">
                Year-Round Growing
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="packet">
              <span className="eyebrow">Price Family Farm · Private</span>
              <h2>Operating the farm?</h2>
              <p>
                The browser-local crop and bed operating planner is kept
                separately inside Farm OS so private farm records are not
                confused with the public planning resource.
              </p>
              <Link className="stat-link" href="/farm-os/planner">
                Open private Farm OS Planner →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
