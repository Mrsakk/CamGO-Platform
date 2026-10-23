import { useState, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Map, MapPin, Compass, Navigation } from "lucide-react";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

// Dynamic import of LeafletMap to save ~200KB of upfront JS/CSS on mobile
const LazyLeafletMap = lazy(() =>
  import("@/components/common/LeafletMap").then((m) => ({ default: m.LeafletMap }))
);

const MapSkeleton = ({ height = "360px" }) => (
  <div
    style={{ height }}
    className="w-full rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 flex flex-col items-center justify-center p-6 text-center animate-pulse"
  >
    <div className="w-10 h-10 rounded-full border-4 border-laterite-600 border-t-transparent animate-spin mb-3" />
    <span className="text-small font-medium text-stone-600 dark:text-stone-400 font-km">
      កំពុងផ្ទុកផែនទី... / Loading Map...
    </span>
  </div>
);

/**
 * MapOnDemand Component
 * 2026 Mobile UX Performance Best Practice:
 * Renders a lightweight static preview card by default.
 * Heavy Leaflet map libraries load ONLY on tap when the user requests it.
 */
export const MapOnDemand = ({
  destinations,
  singleDestination,
  center,
  zoom,
  height = "clamp(320px, 55dvh, 480px)",
  className = "",
  initialLoad = true
}) => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const [isLoaded, setIsLoaded] = useState(initialLoad);

  if (isLoaded) {
    return (
      <Suspense fallback={<MapSkeleton height={height} />}>
        <LazyLeafletMap
          destinations={destinations}
          singleDestination={singleDestination}
          center={center}
          zoom={zoom}
          height={height}
          className={className}
        />
      </Suspense>
    );
  }

  const title = singleDestination
    ? (km && singleDestination.name_km ? singleDestination.name_km : singleDestination.name_en)
    : (km ? "ផែនទីគោលដៅទេសចរណ៍" : "Interactive Travel Map");

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 shadow-raise flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <div className="max-w-md space-y-4 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-laterite-600/10 dark:bg-laterite-600/20 border border-laterite-600/30 dark:border-laterite-600/40 flex items-center justify-center mx-auto text-laterite-600 dark:text-laterite-400 shadow-sm">
          <Map className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h4 className="text-subheading font-bold text-stone-900 dark:text-stone-100 font-km">
            {title}
          </h4>
          <p className="text-small text-stone-700 dark:text-stone-300 max-w-xs mx-auto font-km">
            {km
              ? "ចុចដើម្បីមើលទីតាំងភូមិសាស្ត្រ និងទិសដៅធ្វើដំណើរនៅលើផែនទី"
              : "Tap to interactively explore geographical coordinates and routing."}
          </p>
        </div>

        {/* 1-Tap Trigger Button (min 44px tap target) */}
        <button
          type="button"
          onClick={() => setIsLoaded(true)}
          className="btn-primary inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-body font-bold cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>{km ? "បង្ហាញផែនទីអន្តរកម្ម" : "Show interactive map"}</span>
        </button>
      </div>
    </div>
  );
};
