import React from "react";

/**
 * Frieze - A thin horizontal strip (24px) of repeating abstract motifs
 * (geometric lotus petals, diamond lattice, or naga scales).
 * Subtle 10-14% opacity for quiet bas-relief section separation.
 * Never depicts sacred figures or faces.
 */
export default function Frieze({
  variant = "lotus", // 'lotus' | 'lattice' | 'naga'
  className = "",
  opacity = 0.12,
}) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`w-full overflow-hidden flex items-center justify-center my-6 select-none pointer-events-none ${className}`}
      style={{ height: "24px", opacity }}
    >
      {variant === "lotus" && (
        <svg
          className="w-full h-6 text-stone-900 dark:text-stone-100"
          viewBox="0 0 720 24"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="frieze-lotus-pattern" width="48" height="24" patternUnits="userSpaceOnUse">
              {/* Geometric lotus petal repeat */}
              <path
                d="M 24 2 C 28 8, 36 12, 48 12 C 36 12, 28 16, 24 22 C 20 16, 12 12, 0 12 C 12 12, 20 8, 24 2 Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="24" cy="12" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="0.8" />
          <rect y="0" width="100%" height="24" fill="url(#frieze-lotus-pattern)" />
          <line x1="0" y1="23" x2="100%" y2="23" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      )}

      {variant === "lattice" && (
        <svg
          className="w-full h-6 text-stone-900 dark:text-stone-100"
          viewBox="0 0 720 24"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="frieze-lattice-pattern" width="32" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 16 0 L 32 12 L 16 24 L 0 12 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M 16 4 L 26 12 L 16 20 L 6 12 Z"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
              />
            </pattern>
          </defs>
          <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="0.8" />
          <rect y="0" width="100%" height="24" fill="url(#frieze-lattice-pattern)" />
          <line x1="0" y1="23" x2="100%" y2="23" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      )}

      {variant === "naga" && (
        <svg
          className="w-full h-6 text-stone-900 dark:text-stone-100"
          viewBox="0 0 720 24"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="frieze-naga-pattern" width="40" height="24" patternUnits="userSpaceOnUse">
              {/* Stylized geometric arched scale wave */}
              <path
                d="M 0 18 Q 10 6 20 18 Q 30 6 40 18"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 10 12 Q 20 4 30 12"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                fill="none"
              />
            </pattern>
          </defs>
          <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="0.8" />
          <rect y="0" width="100%" height="24" fill="url(#frieze-naga-pattern)" />
          <line x1="0" y1="23" x2="100%" y2="23" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      )}
    </div>
  );
}

export { Frieze };
