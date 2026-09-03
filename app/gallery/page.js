import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GalleryImage from "@/components/GalleryImage";
import { LightboxProvider } from "@/components/Lightbox";

export const metadata = {
  title: "Gallery · Price Family Farm",
  description: "Photos from a season at Price Family Farm: greenhouse, containers, orchard, and the day-to-day build in Greeneville, TN.",
};

const SECTIONS = [
  {
    label: "February – March",
    title: "Getting started",
    photos: [
      { src: "/images/gallery-26.jpg", alt: "Late February seedling start" },
      { src: "/images/gallery-27.jpg", alt: "Bare-root starts staged before planting" },
      { src: "/images/gallery-01.jpg", alt: "Cuttings rooting in water on a windowsill" },
    ],
  },
  {
    label: "April",
    title: "Infrastructure month",
    photos: [
      { src: "/images/gallery-02.jpg", alt: "Early April farm work" },
      { src: "/images/gallery-03.jpg", alt: "Early April plantings" },
      { src: "/images/gallery-04.jpg", alt: "Early April farm progress" },
      { src: "/images/gallery-05.jpg", alt: "Mid April farm work" },
      { src: "/images/gallery-06.jpg", alt: "Mid April farm progress" },
      { src: "/images/gallery-07.jpg", alt: "Mid April plantings" },
      { src: "/images/gallery-08.jpg", alt: "Mid April farm work" },
      { src: "/images/gallery-09.jpg", alt: "Late April farm progress" },
      { src: "/images/gallery-10.jpg", alt: "Late April plantings" },
    ],
  },
  {
    label: "May",
    title: "Full swing",
    photos: [
      { src: "/images/gallery-11.jpg", alt: "Early May farm work" },
      { src: "/images/gallery-12.jpg", alt: "Early May plantings" },
      { src: "/images/gallery-13.jpg", alt: "Early May farm progress" },
      { src: "/images/gallery-14.jpg", alt: "Mid May farm work" },
      { src: "/images/gallery-15.jpg", alt: "Mid May plantings" },
      { src: "/images/gallery-16.jpg", alt: "Mid May farm progress" },
      { src: "/images/gallery-28.jpg", alt: "Mid May farm work" },
      { src: "/images/gallery-17.jpg", alt: "Late May farm progress" },
      { src: "/images/gallery-29.jpg", alt: "Late May plantings" },
      { src: "/images/gallery-18.jpg", alt: "Late May farm work" },
      { src: "/images/gallery-19.jpg", alt: "Late May farm progress" },
      { src: "/images/gallery-20.jpg", alt: "Late May plantings" },
      { src: "/images/gallery-30.jpg", alt: "Late May farm work" },
      { src: "/images/gallery-21.jpg", alt: "Late May farm progress" },
      { src: "/images/gallery-22.jpg", alt: "Late May plantings" },
    ],
  },
  {
    label: "June",
    title: "Going official",
    photos: [
      { src: "/images/gallery-23.jpg", alt: "Early June farm work" },
      { src: "/images/gallery-24.jpg", alt: "Early June farm progress" },
      { src: "/images/gallery-25.jpg", alt: "Late June farm work" },
      { src: "/images/collage-beds.jpg", alt: "Collage of raised bed plantings" },
      { src: "/images/collage-greenhouse.jpg", alt: "Collage of greenhouse assembly" },
      { src: "/images/collage-starts.jpg", alt: "Collage of seed starts" },
    ],
  },
];

export default function Gallery() {
  return (
    <LightboxProvider>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Nav />

      <main id="main-content" tabIndex={-1}>
        <header className="page-head">
          <div className="wrap">
            <span className="eyebrow on-dark">Gallery</span>
            <h1>A season on the farm, February through June.</h1>
            <p>Unfiltered progress shots: trays, containers, orchard plantings, and the daily texture of building a farm from a home lot. Click any photo to view it larger.</p>
          </div>
        </header>

        <section>
          <div className="wrap">
            {SECTIONS.map((sec, i) => (
              <div key={sec.label}>
                <div className="section-head" style={i > 0 ? { marginTop: 56 } : undefined}>
                  <span className="eyebrow">{sec.label}</span>
                  <h2>{sec.title}</h2>
                </div>
                <div className="gal">
                  {sec.photos.map((p) => (
                    <GalleryImage key={p.src} src={p.src} alt={p.alt} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </LightboxProvider>
  );
}
