// Shared visual template for all Open Graph preview images. Built with
// next/og (no external font fetch, no photography needed) so it renders
// reliably at build time and matches the site's own brand colors.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function ogElement({ eyebrow, title, sub }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#253a20",
        padding: "72px 76px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "3px solid #d3a52a",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#fdf9ee", fontSize: 26, fontWeight: 700 }}>Price Family Farm</span>
          <span style={{ color: "#d3a52a", fontSize: 16, letterSpacing: 2 }}>GREENEVILLE · EAST TENNESSEE</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
        <span style={{ color: "#d3a52a", fontSize: 22, letterSpacing: 3, marginBottom: 18 }}>
          {eyebrow.toUpperCase()}
        </span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {(Array.isArray(title) ? title : [title]).map((line, i) => (
            <span key={i} style={{ color: "#fdf9ee", fontSize: 60, fontWeight: 700, lineHeight: 1.15 }}>
              {line}
            </span>
          ))}
        </div>
        {sub ? (
          <span style={{ color: "#e8e2cd", fontSize: 26, marginTop: 22, maxWidth: 880 }}>{sub}</span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          height: 6,
          width: "100%",
          background: "#b1531f",
          borderRadius: 3,
        }}
      />
    </div>
  );
}
