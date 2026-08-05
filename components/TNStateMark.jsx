// Simplified outline of Tennessee, traced from real state-boundary
// coordinates (not from any watermarked/stock image), with a small
// tristar marker pinned at roughly Greeneville's location in the
// northeast corner of the state.

export default function TNStateMark({ className, opacity = 1, showMarker = true }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g style={{ opacity }}>
        <path
          d="M615.6,26.3 L330.9,53.8 L244.2,63.6 L218.9,66.4 L197.5,66.4 L197.5,87.8 L151.4,90.5 L113.0,93.8
             L52.1,94.4 L50.5,126.2 L39.0,160.8 L33.5,177.2 L26.3,201.4 L24.7,215.6 L2.7,228.3 L11.0,248.0
             L5.5,272.2 L0.0,276.5 L40.1,275.4 L172.3,265.0 L201.4,263.9 L245.8,261.2 L398.4,246.9 L454.3,242.5
             L500.4,237.0 L546.5,231.0 L572.8,226.6 L572.3,201.9 L582.2,193.7 L597.0,190.4 L600.3,170.1
             L623.3,155.3 L644.7,147.1 L667.8,127.3 L691.9,115.8 L696.8,96.6 L720.4,75.2 L723.7,74.1 L723.9,75.6
             L725.0,78.5 L728.1,80.1 L732.7,80.5 L736.8,81.3 L738.5,81.8 L751.2,62.0 L762.7,58.7 L775.3,60.4
             L784.1,40.6 L795.6,28.5 L798.9,23.0 L800.0,1.6 L791.8,0.0 L778.6,10.4 L735.3,11.5 L669.4,21.9 Z"
          fill="currentColor"
          fillOpacity="0.5"
          stroke="currentColor"
          strokeWidth="3"
        />
      </g>
      {showMarker ? (
        <image
          href="/images/tn-tristar-marker.png"
          x="694"
          y="80"
          width="22"
          height="22"
        />
      ) : null}
    </svg>
  );
}
