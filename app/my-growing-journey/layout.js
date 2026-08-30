import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function GrowingJourneyLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
