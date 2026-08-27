import Link from "next/link";
import TNStateMark from "./TNStateMark";

export default function Footer() {
  return (
    <footer>
      <TNStateMark className="footer-mark" opacity={0.1} />
      <div className="wrap">
        <div>
          <h3>Price Family Farm</h3>
          <div className="loc">Greeneville, East Tennessee</div>
          <p style={{ marginTop: 14, maxWidth: "36ch", color: "#cfc7ab", fontSize: 14.5 }}>A family-operated orchard, greenhouse, and market garden in Greene County.</p>
          <p style={{ marginTop: 10 }}><Link className="email" href="/available">Seasonal availability →</Link></p>
        </div>
        <ul className="foot-links">
          <li><Link href="/what-we-grow">What We Grow</Link></li>
          <li><Link href="/available">Availability</Link></li>
          <li><Link href="/growing-guide">Growing Guide</Link></li>
          <li><Link href="/weather">Growing Conditions</Link></li>
          <li><Link href="/our-story">Our Story</Link></li>
          <li><Link href="/documentation">Documentation</Link></li>
          <li><Link href="/gallery">Gallery</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </div>
      <div className="wrap foot-bottom">Price Family Farm · Greeneville, East Tennessee · Est. 2026</div>
    </footer>
  );
}
