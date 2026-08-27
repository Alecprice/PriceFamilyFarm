"use client";

import { useState } from "react";

const OPTIONS = [
  "Vegetable starts",
  "Herb starts",
  "Flowers / pollinator plants",
  "Berries / fruit plants",
  "Fresh vegetables",
  "Fresh herbs",
  "Fruit / berries",
  "Other seasonal farm products",
];

export default function AvailabilityInterestForm() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "";

  async function submit(event) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const interests = data.getAll("interest");
    if (!interests.length) {
      setStatus("error");
      setMessage("Choose at least one thing you would like to hear about.");
      return;
    }

    if (!accessKey) {
      setStatus("error");
      setMessage("Availability alerts are being connected. Please use the contact page for now.");
      return;
    }

    data.append("access_key", accessKey);
    data.append("subject", "Price Family Farm availability interest");
    data.append("from_name", "Price Family Farm website");
    data.set("message", `Availability interests: ${interests.join(", ")}. Notes: ${data.get("notes") || "None"}`);

    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: data });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("submit-failed");
      setStatus("success");
      setMessage("You are on the interest list. We will only reach out when there is something relevant to the categories you selected.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("The alert request could not be sent. Please try again or use the contact page.");
    }
  }

  return (
    <form className="farm-panel" onSubmit={submit}>
      <input type="checkbox" name="botcheck" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <h2>Tell us what you are interested in.</h2>
      <p>This is an interest list, not a preorder. Nothing is shown as in stock until the farm confirms it.</p>
      <div className="farm-form-grid">
        <div className="farm-field"><label htmlFor="interest-name">Name</label><input id="interest-name" name="name" type="text" required maxLength={100} autoComplete="name" /></div>
        <div className="farm-field"><label htmlFor="interest-email">Email</label><input id="interest-email" name="email" type="email" required maxLength={180} autoComplete="email" /></div>
        <fieldset className="wide" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ font: "700 11px/1.3 var(--font-mono)", color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>What should we contact you about?</legend>
          <div className="interest-options">
            {OPTIONS.map((option) => <label className="interest-option" key={option}><input type="checkbox" name="interest" value={option} /><span>{option}</span></label>)}
          </div>
        </fieldset>
        <div className="farm-field wide"><label htmlFor="interest-notes">Optional notes</label><textarea id="interest-notes" name="notes" maxLength={500} placeholder="Varieties, quantities, timing, or anything else that would help." /></div>
      </div>
      {message ? <p role={status === "error" ? "alert" : "status"} className={status === "error" ? "form-error" : "farm-tools-note"}>{message}</p> : null}
      <div className="farm-actions"><button className="farm-action" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Join the availability list"}</button></div>
      <p className="task-nav-summary">No payment information is collected here. You can ask to be removed from the list at any time.</p>
    </form>
  );
}
