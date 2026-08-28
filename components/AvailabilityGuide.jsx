const SEASONS = [
  {
    label: "Spring",
    title: "Starts and early-season plants",
    text: "The main planning window for vegetable starts, herb starts, flowers, and pollinator plants. Exact varieties and quantities depend on germination and what is genuinely ready.",
  },
  {
    label: "Summer",
    title: "Fresh harvests as volume allows",
    text: "Fresh vegetables, herbs, fruit, and berries may become available when harvest volume exceeds household use and planned farm needs. Nothing is promised before it is confirmed.",
  },
  {
    label: "Fall",
    title: "Cool-season and perennial opportunities",
    text: "Interest may shift toward cool-season starts, herbs, selected perennial plants, and other seasonal farm products as the year winds down.",
  },
];

export default function AvailabilityGuide() {
  return (
    <section className="section-tight" aria-labelledby="availability-guide-heading">
      <div className="section-head">
        <span className="eyebrow">How availability works</span>
        <h2 id="availability-guide-heading">Interest first. Confirmation second. No guessed inventory.</h2>
        <p>Price Family Farm is small enough that weather, germination, harvest timing, and family use can change what is truly available. The interest list helps us know what people want without turning a future crop into a promise.</p>
      </div>

      <div className="grid-3">
        <article className="packet">
          <span className="eyebrow">1 · Tell us</span>
          <h3>Choose what you care about.</h3>
          <p>Join the interest list for plant starts, produce, herbs, berries, flowers, or other seasonal products.</p>
        </article>
        <article className="packet">
          <span className="eyebrow">2 · We confirm</span>
          <h3>We only reach out when it is real.</h3>
          <p>A message from the farm means the crop or plant has been checked and there is something relevant to your selected categories.</p>
        </article>
        <article className="packet">
          <span className="eyebrow">3 · You decide</span>
          <h3>No preorder pressure.</h3>
          <p>Joining the list does not reserve inventory, create a purchase obligation, or collect payment information.</p>
        </article>
      </div>

      <div className="section-head" style={{ marginTop: 44 }}>
        <span className="eyebrow">Season planning windows</span>
        <h2>What may be worth watching through the year.</h2>
        <p>These are planning windows, not an inventory calendar. Actual availability is confirmed manually on the farm.</p>
      </div>

      <div className="grid-3">
        {SEASONS.map((season) => (
          <article className="packet" key={season.label}>
            <span className="eyebrow">{season.label}</span>
            <h3>{season.title}</h3>
            <p>{season.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
