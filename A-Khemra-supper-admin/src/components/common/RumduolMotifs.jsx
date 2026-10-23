// Khmer Cultural Motifs & Architectural Blueprint Assets
// ផ្ការំដួលជាតិ ក្បាច់រចនាខ្មែរ និងគំនូរប្លង់ស្ថាបត្យកម្មអង្គរ

export const RumduolFlower = ({ className = "w-6 h-6 text-amber-500", size = 24 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Center Pistil / Core */}
    <circle cx="50" cy="50" r="10" className="opacity-90" fill="currentColor" />
    <circle cx="50" cy="50" r="5" fill="#FFE58F" />

    {/* Outer 3 Large Petals (Romduol characteristic triangular spread) */}
    {/* Petal Top */}
    <path
      d="M50 40 C42 22 36 6 50 2 C64 6 58 22 50 40 Z"
      fill="currentColor"
      className="opacity-95"
    />
    {/* Petal Bottom-Right */}
    <path
      d="M57 56 C74 65 90 75 87 61 C85 47 70 47 57 56 Z"
      fill="currentColor"
      className="opacity-95"
      transform="rotate(120 50 50)"
    />
    {/* Petal Bottom-Left */}
    <path
      d="M57 56 C74 65 90 75 87 61 C85 47 70 47 57 56 Z"
      fill="currentColor"
      className="opacity-95"
      transform="rotate(240 50 50)"
    />

    {/* Inner 3 Smaller Alternating Petals */}
    <path
      d="M50 44 C45 32 40 20 50 18 C60 20 55 32 50 44 Z"
      fill="#F59E0B"
      transform="rotate(60 50 50)"
    />
    <path
      d="M50 44 C45 32 40 20 50 18 C60 20 55 32 50 44 Z"
      fill="#F59E0B"
      transform="rotate(180 50 50)"
    />
    <path
      d="M50 44 C45 32 40 20 50 18 C60 20 55 32 50 44 Z"
      fill="#F59E0B"
      transform="rotate(300 50 50)"
    />
  </svg>
);

// Traditional Khmer Kbach (Lotus flame corner motif)
export const KhmerKbachCorner = ({ className = "w-8 h-8 text-amber-500/70" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 44 V4 H44" strokeLinecap="round" />
    <path d="M12 44 V12 H44" strokeLinecap="round" strokeDasharray="2 3" opacity="0.6" />
    <path d="M4 16 C10 16 16 10 16 4" strokeLinecap="round" />
    <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    <path d="M4 28 C16 28 28 16 28 4" strokeLinecap="round" opacity="0.4" />
  </svg>
);

// Architectural Blueprint Corner Drafting Marks
export const BlueprintCornerMarks = ({ className = "text-amber-500/80" }) => (
  <div className={`pointer-events-none absolute inset-0 ${className}`}>
    {/* Top Left */}
    <div className="absolute top-2 left-2 flex items-center font-mono text-small select-none">
      <span className="font-bold">⌜</span>
      <span className="opacity-70 ml-1">00,00</span>
    </div>
    {/* Top Right */}
    <div className="absolute top-2 right-2 flex items-center font-mono text-small select-none">
      <span className="opacity-70 mr-1">X+</span>
      <span className="font-bold">⌝</span>
    </div>
    {/* Bottom Left */}
    <div className="absolute bottom-2 left-2 flex items-center font-mono text-small select-none">
      <span className="font-bold">⌞</span>
      <span className="opacity-70 ml-1">Y-</span>
    </div>
    {/* Bottom Right */}
    <div className="absolute bottom-2 right-2 flex items-center font-mono text-small select-none">
      <span className="opacity-70 mr-1">⌖ ELEV</span>
      <span className="font-bold">⌟</span>
    </div>
  </div>
);

// Angkor Wat Cruciform Terrace & Concentric Temple Ground Plan Overlay
export const TempleBlueprintSchematic = ({ className = "text-amber-500/10" }) => (
  <svg
    viewBox="0 0 600 400"
    fill="none"
    stroke="currentColor"
    className={`w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Moat & Enclosure Axis */}
    <rect x="20" y="20" width="560" height="360" strokeWidth="1" strokeDasharray="8 6" />
    <rect x="50" y="45" width="500" height="310" strokeWidth="1" />

    {/* Grid Reference Axes */}
    <line x1="300" y1="0" x2="300" y2="400" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    <line x1="0" y1="200" x2="600" y2="200" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

    {/* Concentric Temple Galleries (ថែវប្រាសាទ) */}
    <rect x="120" y="90" width="360" height="220" strokeWidth="1.5" />
    <rect x="180" y="125" width="240" height="150" strokeWidth="1.5" />
    <rect x="230" y="150" width="140" height="100" strokeWidth="2" />

    {/* Central Sanctuary & 5 Towers (កំពូលទាំង ៥) */}
    {/* Central Tower */}
    <rect x="280" y="180" width="40" height="40" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
    <circle cx="300" cy="200" r="14" strokeWidth="1.5" />
    <circle cx="300" cy="200" r="5" fill="currentColor" />

    {/* 4 Corner Towers */}
    <rect x="235" y="155" width="24" height="24" strokeWidth="1.5" />
    <rect x="341" y="155" width="24" height="24" strokeWidth="1.5" />
    <rect x="235" y="221" width="24" height="24" strokeWidth="1.5" />
    <rect x="341" y="221" width="24" height="24" strokeWidth="1.5" />

    {/* Cruciform Causeway (ស្ពានហាលកាកបាទ) */}
    <path
      d="M300 355 L300 310 M280 330 L320 330"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="300" y1="355" x2="300" y2="400" strokeWidth="3" />

    {/* Architectural Annotation Tags */}
    <text x="310" y="38" fill="currentColor" fontSize="8" fontFamily="monospace" letterSpacing="2">
      ANGKOR WAT // PRINCIPAL EAST-WEST AXIS (1,024M × 802M)
    </text>
    <text x="52" y="342" fill="currentColor" fontSize="7" fontFamily="monospace">
      OUTER GOPURA // ខ្លោងទ្វារកំពែងក្រៅ
    </text>
    <text x="440" y="342" fill="currentColor" fontSize="7" fontFamily="monospace">
      SCALE 1:2500
    </text>
  </svg>
);

// Silk Weave Texture Motif (ក្បាច់គោមសូត្រខ្មែរ)
export const SilkDiamondPattern = ({ className = "text-amber-500/15" }) => (
  <svg
    viewBox="0 0 60 60"
    width="60"
    height="60"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rhomboid Silk Weave Repeat */}
    <path d="M30 0 L60 30 L30 60 L0 30 Z" />
    <path d="M30 10 L50 30 L30 50 L10 30 Z" strokeDasharray="2 2" />
    <circle cx="30" cy="30" r="3" fill="currentColor" />
  </svg>
);

// Architectural Blueprint Compass Rose (ត្រីវិស័យស្ថាបត្យកម្ម)
export const BlueprintCompass = ({ className = "w-12 h-12 text-amber-500/70" }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="38" strokeWidth="1" />
    <circle cx="50" cy="50" r="8" strokeWidth="1.5" />

    {/* North Arrow */}
    <polygon points="50,6 56,42 50,38 44,42" fill="currentColor" />
    <polygon points="50,94 56,58 50,62 44,58" fill="currentColor" opacity="0.4" />
    {/* East-West */}
    <polygon points="94,50 58,56 62,50 58,44" fill="currentColor" opacity="0.6" />
    <polygon points="6,50 42,56 38,50 42,44" fill="currentColor" opacity="0.4" />

    <text x="47" y="18" fill="currentColor" fontSize="9" fontWeight="bold" fontFamily="monospace">N</text>
  </svg>
);
