import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function LearnLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
