import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact · Price Family Farm",
  description: "Get in touch with Price Family Farm in Greeneville, East Tennessee, about produce, plant starts, the farmers market, or visiting the farm.",
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
            Questions about what's in season, plant starts, the farmers market, or just want to say hello?
            Send a message and it'll land straight in our inbox.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap" style={{ maxWidth: 640 }}>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
