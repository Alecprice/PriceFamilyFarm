"use client";

import { useState } from "react";
import { WEB3FORMS_ACCESS_KEY } from "@/lib/contactConfig";

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("subject", `Price Family Farm contact form: ${formData.get("topic") || "General"}`);
    formData.append("from_name", "Price Family Farm website");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "submit-failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Couldn&rsquo;t reach the form service. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-success" role="status">
        <span className="eyebrow">Message sent</span>
        <h3>Thanks for reaching out.</h3>
        <p>We&rsquo;ll get back to you as soon as we can.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <input type="checkbox" name="botcheck" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <div className="form-row">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required minLength={2} maxLength={100} autoComplete="name" />
      </div>

      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required maxLength={180} autoComplete="email" inputMode="email" />
      </div>

      <div className="form-row">
        <label htmlFor="topic">What&rsquo;s this about?</label>
        <select id="topic" name="topic" defaultValue="General question">
          <option>General question</option>
          <option>Availability / plant starts</option>
          <option>Buying produce</option>
          <option>Farmers market / wholesale</option>
          <option>Farm website / educational content</option>
          <option>Something else</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={6} required minLength={10} maxLength={2000} />
      </div>

      {status === "error" ? <p className="form-error" role="alert" dangerouslySetInnerHTML={{ __html: errorMsg }} /> : null}

      <button type="submit" className="btn btn-clay" style={{ border: "1px solid var(--clay)" }} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
