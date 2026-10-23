import { memo } from "react";

/**
 * KhmerBackgroundDecor — រចនាបទផ្ទៃខាងក្រោយបែបខ្មែរ
 * Authentic Khmer Cultural Background Decorative Motif Layer
 *
 * Features:
 * - ផ្ការំដួលជាតិ (Cambodia's National Rumduol Flower Watermarks)
 * - ក្បាច់ភ្ញីទេស និងក្បាច់កាច់ជ្រុងខ្មែរ (Traditional Khmer Kbach Corner Filigree)
 * - ក្បាច់គោមផ្កាឈូក / ក្រឡាសូត្រខ្មែរ (Khmer Lotus & Silk Diamond Watermark Lattice)
 * - គំនូសស្ថាបត្យកម្មអង្គរ (Angkor Sacred Geometric Axis & Compass Watermark)
 * - Angkor Sandstone & Sunset Golden Hour Ambient Radiance
 *
 * Built purely with responsive SVG & CSS. Zero external asset load, zero performance overhead.
 * Completely pointer-events-none and non-intrusive for optimal text legibility and accessibility.
 */

// 1. Traditional Khmer Lotus Diamond Watermark Pattern
const KhmerLatticePattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    aria-hidden="true"
  >
    <defs>
      <pattern
        id="khmer-lotus-tile"
        x="0"
        y="0"
        width="64"
        height="64"
        patternUnits="userSpaceOnUse"
      >
        {/* Diamond Outer Rhombus */}
        <polygon
          points="32,2 62,32 32,62 2,32"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-stone-900 dark:text-amber-500/40"
        />
        {/* Inner Diamond */}
        <polygon
          points="32,14 50,32 32,50 14,32"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="2 2"
          className="text-stone-900 dark:text-amber-400/30"
        />
        {/* Central Lotus Bud Core */}
        <circle
          cx="32"
          cy="32"
          r="3"
          fill="currentColor"
          className="text-stone-900 dark:text-amber-400/60"
        />
        {/* Radiating Petal Dots (8 Directions) */}
        <circle cx="32" cy="7" r="1.2" fill="currentColor" className="text-amber-600 dark:text-amber-300/70" />
        <circle cx="32" cy="57" r="1.2" fill="currentColor" className="text-amber-600 dark:text-amber-300/70" />
        <circle cx="7" cy="32" r="1.2" fill="currentColor" className="text-amber-600 dark:text-amber-300/70" />
        <circle cx="57" cy="32" r="1.2" fill="currentColor" className="text-amber-600 dark:text-amber-300/70" />
        {/* Corner Cross Axis */}
        <line x1="32" y1="0" x2="32" y2="6" stroke="currentColor" strokeWidth="0.8" className="text-stone-800 dark:text-amber-500/25" />
        <line x1="32" y1="58" x2="32" y2="64" stroke="currentColor" strokeWidth="0.8" className="text-stone-800 dark:text-amber-500/25" />
        <line x1="0" y1="32" x2="6" y2="32" stroke="currentColor" strokeWidth="0.8" className="text-stone-800 dark:text-amber-500/25" />
        <line x1="58" y1="32" x2="64" y2="32" stroke="currentColor" strokeWidth="0.8" className="text-stone-800 dark:text-amber-500/25" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#khmer-lotus-tile)" />
  </svg>
);

// 2. Traditional Khmer Corner Kbach (ក្បាច់កាច់ជ្រុងរចនាបថខ្មែរ)
const KhmerCornerKbach = ({ position = "top-left" }) => {
  const getTransform = () => {
    switch (position) {
      case "top-right":
        return "scale(-1, 1)";
      case "bottom-left":
        return "scale(1, -1)";
      case "bottom-right":
        return "scale(-1, -1)";
      default:
        return "none";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-0 right-0";
      case "bottom-left":
        return "bottom-0 left-0";
      case "bottom-right":
        return "bottom-0 right-0";
      default:
        return "top-0 left-0";
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} pointer-events-none select-none w-44 h-44 sm:w-64 sm:h-64 opacity-[0.055] dark:opacity-[0.095] transition-opacity duration-300`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-amber-800 dark:text-amber-400"
        style={{ transform: getTransform(), transformOrigin: "center" }}
      >
        {/* Outer Angular Corner Border */}
        <path
          d="M6 150 V18 C6 11.373 11.373 6 18 6 H150"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Secondary Parallel Accent Border with Dashes */}
        <path
          d="M18 150 V26 C18 21.582 21.582 18 26 18 H150"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Kbach Phni Flame Curves (ក្បាច់ភ្ញីទេសពត់ពែន) */}
        <path
          d="M6 56 C24 56 42 42 42 24 C42 6 24 6 6 6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M14 68 C34 68 56 50 56 30 C56 12 38 10 20 10"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
        {/* Lotus Bud / Snor Kbach (ស្នូលក្បាច់) */}
        <path
          d="M26 26 C34 18 42 20 44 28 C46 36 38 44 26 26 Z"
          fill="currentColor"
          fillOpacity="0.4"
        />
        <circle cx="26" cy="26" r="3.5" fill="currentColor" />
        <circle cx="44" cy="18" r="2" fill="currentColor" />
        <circle cx="18" cy="44" r="2" fill="currentColor" />
        {/* Radiating Traditional Leaf Scrolls */}
        <path
          d="M6 94 C32 94 62 76 72 46 C76 34 72 20 60 16"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M6 126 C42 126 84 100 96 62 C102 46 96 26 82 18"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
      </svg>
    </div>
  );
};

// 3. National Rumduol Flower Watermark (ផ្ការំដួលទឹកមាស)
const RumduolWatermark = ({ className = "", size = 260 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="currentColor"
    className={`pointer-events-none select-none transition-opacity duration-300 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer 3 Large Characteristic Triangular Petals */}
    <path
      d="M50 42 C40 20 34 4 50 0 C66 4 60 20 50 42 Z"
      fill="currentColor"
      fillOpacity="0.8"
    />
    <path
      d="M58 58 C78 68 96 78 92 63 C88 48 72 48 58 58 Z"
      fill="currentColor"
      fillOpacity="0.8"
      transform="rotate(120 50 50)"
    />
    <path
      d="M58 58 C78 68 96 78 92 63 C88 48 72 48 58 58 Z"
      fill="currentColor"
      fillOpacity="0.8"
      transform="rotate(240 50 50)"
    />

    {/* Inner 3 Alternating Heart-shaped Petals */}
    <path
      d="M50 46 C44 32 38 18 50 16 C62 18 56 32 50 46 Z"
      fill="currentColor"
      fillOpacity="0.9"
      transform="rotate(60 50 50)"
    />
    <path
      d="M50 46 C44 32 38 18 50 16 C62 18 56 32 50 46 Z"
      fill="currentColor"
      fillOpacity="0.9"
      transform="rotate(180 50 50)"
    />
    <path
      d="M50 46 C44 32 38 18 50 16 C62 18 56 32 50 46 Z"
      fill="currentColor"
      fillOpacity="0.9"
      transform="rotate(300 50 50)"
    />

    {/* Central Golden Core & Pistil */}
    <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.9" />
    <circle cx="50" cy="50" r="5" fill="#F59E0B" fillOpacity="0.8" />
  </svg>
);

// 4. Sacred Angkor Architectural Frieze Watermark (ក្បាច់ខឿនប្រាសាទបុរាណ)
const AngkorSacredAxisWatermark = () => (
  <div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-[700px] h-[700px] max-w-[90vw] max-h-[90vw] opacity-[0.025] dark:opacity-[0.05]"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 500 500"
      fill="none"
      stroke="currentColor"
      className="w-full h-full text-amber-700 dark:text-amber-400"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Concentric Temple Enclosure Rings */}
      <circle cx="250" cy="250" r="230" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="250" cy="250" r="190" strokeWidth="1.2" />
      <circle cx="250" cy="250" r="140" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="250" cy="250" r="90" strokeWidth="1.5" />
      <circle cx="250" cy="250" r="30" strokeWidth="1.5" />
      <circle cx="250" cy="250" r="8" fill="currentColor" />

      {/* 4 Cardinal Axis Causeway Lines (ទិសទាំង ៤ នៃប្រាសាទ) */}
      <line x1="250" y1="10" x2="250" y2="490" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="10" y1="250" x2="490" y2="250" strokeWidth="1" strokeDasharray="4 4" />

      {/* 8-Pointed Angkor Solar Lotus Star */}
      <polygon
        points="250,110 262,238 390,250 262,262 250,390 238,262 110,250 238,238"
        strokeWidth="1"
      />
      <polygon
        points="250,140 258,242 360,250 258,258 250,360 242,258 140,250 242,242"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        transform="rotate(45 250 250)"
      />
    </svg>
  </div>
);

/**
 * Main KhmerBackgroundDecor Component
 * Placed in main layouts (PublicLayout and AuthLayout) as a fixed background layer.
 */
export const KhmerBackgroundDecor = memo(function KhmerBackgroundDecor() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* 1. Angkor Sandstone & Sunset Golden Hour Soft Ambient Glows */}
      {/* Top Center Golden Horizon Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] max-w-[95vw] h-[360px] rounded-full bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl dark:from-amber-500/12 dark:via-amber-600/5 dark:to-transparent" />

      {/* Bottom Right Laterite Warmth Glow */}
      <div className="absolute -bottom-40 right-[-10%] w-[520px] max-w-[85vw] h-[420px] rounded-full bg-gradient-to-t from-orange-600/6 via-amber-600/4 to-transparent blur-3xl dark:from-laterite-600/10 dark:via-amber-500/5 dark:to-transparent" />

      {/* Bottom Left Deep Sandstone Mist */}
      <div className="absolute -bottom-36 left-[-10%] w-[480px] max-w-[80vw] h-[380px] rounded-full bg-gradient-to-t from-stone-400/8 via-amber-600/3 to-transparent blur-3xl dark:from-amber-700/8 dark:via-stone-900/15 dark:to-transparent" />

      {/* 2. Seamless Khmer Lotus & Silk Diamond Watermark Texture (Full Screen) */}
      <KhmerLatticePattern />

      {/* 3. Sacred Angkor Ground Plan Central Watermark Axis */}
      <AngkorSacredAxisWatermark />

      {/* 4. Traditional Khmer Kbach Corners (Four Corners) */}
      <KhmerCornerKbach position="top-left" />
      <KhmerCornerKbach position="top-right" />
      <KhmerCornerKbach position="bottom-left" />
      <KhmerCornerKbach position="bottom-right" />

      {/* 5. Watermark Floating Rumduol National Flowers */}
      {/* Top Left Rumduol (Near corner below header) */}
      <div className="absolute top-20 left-4 sm:left-12 opacity-[0.045] dark:opacity-[0.08] text-amber-700 dark:text-amber-400 transform -rotate-12">
        <RumduolWatermark size={220} />
      </div>

      {/* Middle Right Rumduol (Watermark on body margin) */}
      <div className="absolute top-[45%] right-2 sm:right-10 opacity-[0.04] dark:opacity-[0.07] text-amber-600 dark:text-amber-300 transform rotate-45 hidden md:block">
        <RumduolWatermark size={300} />
      </div>

      {/* Bottom Left Rumduol (Above footer) */}
      <div className="absolute bottom-24 left-6 sm:left-20 opacity-[0.042] dark:opacity-[0.075] text-amber-700 dark:text-amber-400 transform rotate-20">
        <RumduolWatermark size={240} />
      </div>
    </div>
  );
});

export default KhmerBackgroundDecor;
