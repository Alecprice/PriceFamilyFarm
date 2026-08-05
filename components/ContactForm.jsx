"use client";

import { useState } from "react";

// Sign up free at https://web3forms.com (takes under a minute, just an
// email address, no credit card). It gives you an Access Key, paste it
// below in place of the placeholder. Submissions on this form will then
// land directly in alecjordanprice@gmail.com's inbox, no server needed.
const WEB3FORMS_ACCESS_KEY = "2cbd28d3-7400-421d-b6e5-5de0fa1a2939";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.target;
    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("subject", `Price Family Farm contact form: ${formData.get("topic") || "General"}`);
    formData.append("from_name", "Price Family Farm website");

    if (WEB3FORMS_ACCESS_KEY.startsWith("YOUR-")) {
      setStatus("error");
      setErrorMsg(
        "This form isn't connected yet. Add a free Web3Forms access key in components/ContactForm.jsx to activate it."
      );
      return;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong sending that. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Couldn't reach the form service. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-success">
        <span className="eyebrow">Message sent</span>
        <h3>Thanks for reaching out.</h3>
        <p>We'll get back to you as soon as we can.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {/* honeypot field, hidden from real visitors, catches simple spam bots */}
      <input type="checkbox" name="botcheck" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <div className="form-row">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>

      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="form-row">
        <label htmlFor="topic">What's this about?</label>
        <select id="topic" name="topic" defaultValue="General question">
          <option>General question</option>
          <option>Buying produce or plant starts</option>
          <option>Farmers market / wholesale</option>
          <option>Visiting the farm</option>
          <option>Something else</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={6} required />
      </div>

      {status === "error" ? <p className="form-error">{errorMsg}</p> : null}

      <button type="submit" className="btn btn-clay" style={{ border: "1px solid var(--clay)" }} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
