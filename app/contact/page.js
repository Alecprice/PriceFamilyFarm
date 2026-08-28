import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact · Price Family Farm",
  description: "Get in touch with Price Family Farm in Greeneville, East Tennessee, about produce, plant starts, availability, or pickup questions.",
};

export default function Contact() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Contact</span>
          <h1>Get in touch.</h1>
          <p>
            Questions about what&rsquo;s in season, plant starts, availability, or just want to say hello?
            Send a message and it&rsquo;ll land straight in our inbox.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="farm-tools-note">
            <strong>Location privacy.</strong> The public site intentionally lists Greeneville and Greene County rather than a residential street address. Pickup or visit details are shared directly only when they are relevant and confirmed.
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
