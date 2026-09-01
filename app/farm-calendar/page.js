import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlantingRow from "@/components/PlantingRow";
import { PLANTING_CALENDAR } from "@/lib/plantingCalendar";
import { MONTHLY_FARM_CALENDAR } from "@/lib/farmData";

export const metadata = {
  title: "Farm Calendar · Price Family Farm",
  description: "A month-by-month Zone 7a farm calendar plus reusable planting reminders for Greeneville, Tennessee.",
};

export default function FarmCalendarPage() {
  return (
    <>
      <Nav />
      <header className="page-head"><div className="wrap"><span className="eyebrow on-dark">Farm Calendar</span><h1>A full year of work, not just planting dates.</h1><p>A month-by-month operating rhythm for the farm, plus calendar reminders for the planting windows already used in the growing guide.</p></div></header>
      <section><div className="wrap"><div className="month-grid">{MONTHLY_FARM_CALENDAR.map((month) => <article className="month-card" key={month.month}><span className="eyebrow">{month.month}</span><ul>{month.tasks.map((task) => <li key={task}>{task}</li>)}</ul></article>)}</div></div></section>
      <section className="bg-cream bg-line-top"><div className="wrap"><div className="section-head"><span className="eyebrow">Reusable reminders</span><h2>Add the major planting windows to your calendar.</h2><p>These are the same Zone 7a planning dates used in the growing guide. Always adjust for the actual forecast.</p></div><div className="plant-table">{PLANTING_CALENDAR.map((item, index) => <PlantingRow key={`${item.crop}-${index}`} {...item} />)}</div></div></section>
      <Footer />
    </>
  );
}
