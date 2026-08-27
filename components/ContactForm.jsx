"use client";

import { useRef, useState } from "react";
import {
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT,
  contactFormsConfigured,
} from "@/lib/contactConfig";

const MIN_SUBMIT_INTERVAL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 15_000;

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const lastSubmitAt = useRef(0);
  const configured = contactFormsConfigured();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!configured) {
      setStatus("error");
      setErrorMsg("The contact form is temporarily unavailable while its secure delivery configuration is being updated.");
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt.current < MIN_SUBMIT_INTERVAL_MS) {
      setStatus("error");
      setErrorMsg("Please wait a few seconds before sending another message.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");
    lastSubmitAt.current = now;

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("subject", `Price Family Farm contact form: ${formData.get("topic") || "General"}`);
    formData.append("from_name", "Price Family Farm website");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "strict-origin-when-cross-origin",
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error("submit-failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Couldn’t send the message. Check your connection and try again in a moment.");
    } finally {
      window.clearTimeout(timeout);
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
      <input type="checkbox" name="botcheck" style={{ display: "none" }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

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

      {!configured ? (
        <p className="form-error" role="status">
          Contact delivery is temporarily disabled until the production form key is supplied at build time.
        </p>
      ) : null}
      {status === "error" && errorMsg ? <p className="form-error" role="alert">{errorMsg}</p> : null}

      <button type="submit" className="btn btn-clay" style={{ border: "1px solid var(--clay)" }} disabled={status === "sending" || !configured}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
