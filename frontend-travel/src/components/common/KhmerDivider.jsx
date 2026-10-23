/**
 * KhmerDivider — thin 24px SVG strip (lotus/diamond lattice pattern)
 * Spec: 10–12% opacity, max one per screen, NEVER behind text.
 * Use as a section separator only.
 *
 * Usage:
 *   <KhmerDivider />
 *   <KhmerDivider color="#A8442A" className="my-8" />
 */
const KhmerDivider = ({ color = "currentColor", className = "" }) => (
  <div
    className={`khmer-divider ${className}`}
    aria-hidden="true"
    role="presentation"
  >
    {/* Repeating lotus-diamond lattice — tile is 48px wide × 24px tall */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 24"
      preserveAspectRatio="xMidYMid meet"
      fill={color}
    >
      {/*
        Pattern tile: a diamond shape with lotus petals radiating from centre.
        Repeated 10× across a 480px viewBox to fill any screen width.
      */}
      <defs>
        <pattern id="km-lattice" x="0" y="0" width="48" height="24" patternUnits="userSpaceOnUse">
          {/* Centre diamond */}
          <polygon points="24,2 30,12 24,22 18,12" fill="none" stroke={color} strokeWidth="1" />
          {/* Top and bottom petal dots */}
          <circle cx="24" cy="1" r="1.2" />
          <circle cx="24" cy="23" r="1.2" />
          {/* Side petal dots */}
          <circle cx="1" cy="12" r="1.2" />
          <circle cx="47" cy="12" r="1.2" />
          {/* Small inner diamond */}
          <polygon points="24,7 27,12 24,17 21,12" fill={color} />
          {/* Corner cross marks */}
          <line x1="0" y1="12" x2="4" y2="12" stroke={color} strokeWidth="0.8" />
          <line x1="44" y1="12" x2="48" y2="12" stroke={color} strokeWidth="0.8" />
          <line x1="24" y1="0" x2="24" y2="4" stroke={color} strokeWidth="0.8" />
          <line x1="24" y1="20" x2="24" y2="24" stroke={color} strokeWidth="0.8" />
          {/* Diagonal connectors to corners — creates the lattice feel */}
          <line x1="4" y1="2" x2="18" y2="10" stroke={color} strokeWidth="0.5" opacity="0.5" />
          <line x1="44" y1="2" x2="30" y2="10" stroke={color} strokeWidth="0.5" opacity="0.5" />
          <line x1="4" y1="22" x2="18" y2="14" stroke={color} strokeWidth="0.5" opacity="0.5" />
          <line x1="44" y1="22" x2="30" y2="14" stroke={color} strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="480" height="24" fill="url(#km-lattice)" />
    </svg>
  </div>
);

export { KhmerDivider };
