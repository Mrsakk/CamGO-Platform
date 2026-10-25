import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, MapPin, Compass, X, Sparkles, Star, Navigation, RotateCcw, Maximize2, Minimize2, Layers } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { destinationsApi } from "@/lib/api/destinations";
import { categoriesApi } from "@/lib/api/categories";
import { provincesApi } from "@/lib/api/provinces";
import { explorerPinIcon, userLocationIcon } from "@/lib/leaflet-icons";
import { SEOHead } from "@/components/common/SEOHead";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CustomSelect } from "@/components/common/CustomSelect";
import { AddToPlanModal } from "@/components/planner/AddToPlanModal";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { useTripPlannerStore } from "@/store/tripPlannerStore";
import { toast } from "@/store/toastStore";
import { getImageUrl } from "@/lib/utils";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

// Curated Map Tile Themes (100% Reliable Worldwide Free Tiles)
const MAP_STYLES = {
  streets: {
    name_km: "ទេសចរណ៍",
    name_en: "Explorer",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    name_km: "ផ្កាយរណប",
    name_en: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  topo: {
    name_km: "ធម្មជាតិ & ភ្នំ",
    name_en: "Topography",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, FAO, NPS',
    maxZoom: 18
  }
};

// Controller to smoothly animate map to selected destination or user location
const MapController = ({ selectedCoords, userCoords, resetTrigger, mobileView }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (selectedCoords && selectedCoords[0] && selectedCoords[1]) {
      map.flyTo(selectedCoords, 14, { duration: 1.2 });
    }
  }, [selectedCoords, map]);

  useEffect(() => {
    if (userCoords && userCoords[0] && userCoords[1]) {
      map.flyTo(userCoords, 13, { duration: 1.2 });
    }
  }, [userCoords, map]);

  useEffect(() => {
    if (resetTrigger) {
      map.flyTo([12.5657, 104.991], 7.5, { duration: 1.0 });
    }
  }, [resetTrigger, map]);

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    let timer;
    if (mobileView === "map") {
      timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (timer) clearTimeout(timer);
    };
  }, [mobileView, map]);

  return null;
};

// Calculate distance in km between two GPS coordinates (Haversine formula)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const MapExplorerPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";

  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedType, setSelectedType] = useState("destinations");
  const [selectedMapStyle, setSelectedMapStyle] = useState("streets");
  const [activeDestination, setActiveDestination] = useState(null);
  const [planDestination, setPlanDestination] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // User Geolocation
  const [userCoords, setUserCoords] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Mobile layout switch (map vs list)
  const [mobileView, setMobileView] = useState("map");

  // Fullscreen view state
  const consoleRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  // Live Itinerary Count from Trip Planner Store
  const { plans, activePlanId } = useTripPlannerStore();
  const activePlan = plans?.find((p) => p.id === activePlanId) || plans?.[0];
  const totalPlannedItems = useMemo(() => {
    if (!activePlan?.days) return 0;
    return activePlan.days.reduce((acc, day) => acc + (day.items?.length || 0), 0);
  }, [activePlan]);

  const mapProvinceOptions = useMemo(() => [
    { value: "all", label: km ? "គ្រប់ខេត្ត-រាជធានី" : "All Provinces" },
    ...provinces.map((prov) => ({
      value: String(prov.slug || prov.id),
      label: km && prov.name_km ? prov.name_km : prov.name_en,
    })),
  ], [provinces, km]);

  const mapCategoryOptions = useMemo(() => [
    { value: "all", label: km ? "គ្រប់ប្រភេទទេសចរណ៍" : "All Categories" },
    ...categories.map((cat) => ({
      value: String(cat.slug || cat.id),
      label: km && cat.name_km ? cat.name_km : cat.name_en,
    })),
  ], [categories, km]);

  // Fetch real database records
  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      destinationsApi.getAll({ per_page: 100 }),
      categoriesApi.getAll(),
      provincesApi.getAll()
    ])
      .then(([destRes, catRes, provRes]) => {
        if (destRes.status === "fulfilled" && destRes.value) {
          const items =
            destRes.value.data?.items || destRes.value.data || destRes.value.items || [];
          setDestinations(Array.isArray(items) ? items : []);
        }
        if (catRes.status === "fulfilled" && catRes.value) {
          const cats = catRes.value.data || [];
          setCategories(Array.isArray(cats) ? cats : []);
        }
        if (provRes.status === "fulfilled" && provRes.value) {
          const provs = provRes.value.data || [];
          setProvinces(Array.isArray(provs) ? provs : []);
        }
      })
      .catch(() => {
        toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យផែនទី");
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle "Near Me" GPS trigger
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error(km ? "ឧបករណ៍របស់អ្នកមិនគាំទ្រ GPS ទេ" : "Geolocation not supported");
      return;
    }

    if (isNearMeActive) {
      setIsNearMeActive(false);
      setUserCoords(null);
      setResetTrigger((v) => v + 1);
      return;
    }

    toast.info(km ? "កំពុងកំណត់ទីតាំង GPS របស់អ្នក..." : "Locating your GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setIsNearMeActive(true);
        toast.success(
          km
            ? "បានរកឃើញទីតាំងរបស់អ្នក! តម្រៀបទីកន្លែងដែលនៅជិតបំផុត។"
            : "Location identified! Sorted by nearest sights."
        );
      },
      () => {
        toast.error(km ? "មិនអាចចាប់ទីតាំងបានទេ សូមអនុញ្ញាតសិទ្ធិ GPS" : "Location access denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filtered and Sorted Destinations
  const filteredDestinations = useMemo(() => {
    if (selectedType === "businesses") {
      return [];
    }

    let result = destinations.filter((dest) => {
      const nameKm = (dest.name_km || "").toLowerCase();
      const nameEn = (dest.name_en || "").toLowerCase();
      const provKm = (dest.province?.name_km || "").toLowerCase();
      const provEn = (dest.province?.name_en || "").toLowerCase();
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        nameKm.includes(q) ||
        nameEn.includes(q) ||
        provKm.includes(q) ||
        provEn.includes(q);

      const matchesCategory =
        selectedCategory === "all" ||
        dest.category?.slug === selectedCategory ||
        String(dest.category_id) === String(selectedCategory);

      const matchesProvince =
        selectedProvince === "all" ||
        dest.province?.slug === selectedProvince ||
        String(dest.province_id) === String(selectedProvince);

      return matchesSearch && matchesCategory && matchesProvince;
    });

    if (isNearMeActive && userCoords) {
      result = result
        .map((d) => {
          const lat = Number(d.latitude);
          const lng = Number(d.longitude);
          const dist =
            lat && lng ? getDistanceKm(userCoords[0], userCoords[1], lat, lng) : 99999;
          return { ...d, distanceKm: dist };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return result;
  }, [
    destinations,
    search,
    selectedCategory,
    selectedProvince,
    selectedType,
    isNearMeActive,
    userCoords
  ]);

  const selectedCoords = useMemo(() => {
    if (!activeDestination) return null;
    const lat = Number(activeDestination.latitude);
    const lng = Number(activeDestination.longitude);
    return lat && lng ? [lat, lng] : null;
  }, [activeDestination]);

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-16 sm:pt-20 pb-12 flex flex-col">
      <SEOHead
        title={km ? "Map Explorer — ផែនទីរុករកគោលដៅទេសចរណ៍" : "Map Explorer — Cambodia Tourism Atlas"}
        description={
          km
            ? "ស្វែងយល់ពីប្រាសាទបុរាណ កន្លែងកម្សាន្តព្រៃភ្នំ កោះ ឆ្នេរ និងរតនសម្បត្តិវប្បធម៌ទូទាំងប្រទេសកម្ពុជាលើប្រព័ន្ធផែនទីភូមិសាស្ត្រជាតិ"
            : "Explore ancient Angkorian ruins, waterfalls, tropical islands, and cultural attractions on an interactive Cambodia travel GIS map."
        }
      />

      {/* 1. ANGKOR SANDSTONE HERO BANNER & CONTROL CONSOLE */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-3 space-y-3">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "ផែនទីរុករកភូមិសាស្ត្រ" : "Interactive Atlas" },
          ]}
        />

        {/* Hero Banner with Ambient Glow & Rumduol Flower */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-7 lg:p-8 shadow-sm overflow-hidden"
        >
          {/* Layered Ambient Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-laterite-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Rotating Rumduol Flower Watermark */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute -right-16 -top-16 opacity-[0.035] dark:opacity-[0.025] pointer-events-none select-none"
          >
            <RumduolFlower size={380} className="text-laterite-600" />
          </motion.div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Title & Description */}
            <div className="space-y-2">


              <h1 className="font-heading font-black text-2xl sm:text-4xl text-stone-950 dark:text-white leading-[1.15] tracking-tight">
                {km ? "ផែនទីរុករកគោលដៅទេសចរណ៍កម្ពុជា" : "Interactive Cambodia Travel Explorer"}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed max-w-2xl font-medium">
                {km
                  ? `ស្វែងយល់ពីប្រាសាទបុរាណ កោះ ឆ្នេរ ទឹកធ្លាក់ និងរតនសម្បត្តិធម្មជាតិចំនួន ${toKm(filteredDestinations.length)} កន្លែងទូទាំង ២៥ ខេត្ត-រាជធានី លើប្រព័ន្ធផែនទីអន្តរកម្ម។`
                  : `Explore ${filteredDestinations.length} heritage temples, tropical islands, waterfalls, and cultural wonders across 25 provinces on an interactive GIS map.`}
              </p>
            </div>

            {/* Quick Live Counters & Trip Planner Shortcut */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-sans font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{km ? `${toKm(filteredDestinations.length)} គោលដៅសកម្ម` : `${filteredDestinations.length} Active Sights`}</span>
              </span>

              {totalPlannedItems > 0 && (
                <Link
                  to="/trip-planner"
                  className="min-h-[38px] px-4 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider bg-laterite-600 hover:bg-laterite-700 text-white transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{km ? `កាលវិភាគ (${toKm(totalPlannedItems)})` : `My Plan (${totalPlannedItems})`}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Unified Search & Filters Row */}
          <div className="relative z-10 mt-5 pt-5 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-sm">
            {/* Search bar */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-laterite-600 dark:text-laterite-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={km ? "ស្វែងរកប្រាសាទ កោះ ឆ្នេរ ទឹកធ្លាក់..." : "Search temples, islands, beaches..."}
                className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm font-km rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20 transition-all shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
              {/* Province Dropdown */}
              <div className="w-36 sm:w-44">
                <CustomSelect
                  value={selectedProvince}
                  onChange={setSelectedProvince}
                  options={mapProvinceOptions}
                  icon={MapPin}
                  placeholder={km ? "គ្រប់ខេត្ត-រាជធានី" : "All Provinces"}
                  searchable
                  size="md"
                />
              </div>

              {/* Category Dropdown */}
              <div className="w-36 sm:w-44">
                <CustomSelect
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={mapCategoryOptions}
                  icon={Compass}
                  placeholder={km ? "គ្រប់ប្រភេទទេសចរណ៍" : "All Categories"}
                  size="md"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="inline-flex p-0.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className={`min-h-[34px] px-3 rounded-lg text-small font-sans font-semibold uppercase transition-all cursor-pointer ${selectedType === "all"
                      ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                >
                  {km ? `ទាំងអស់` : `All`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("destinations")}
                  className={`min-h-[34px] px-3 rounded-lg text-small font-sans font-semibold uppercase transition-all cursor-pointer ${selectedType === "destinations"
                      ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                >
                  {km ? `រមណីយដ្ឋាន` : `Sights`}
                </button>
              </div>

              {/* Near Me GPS */}
              <button
                type="button"
                onClick={handleNearMe}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-small font-sans font-semibold uppercase transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${isNearMeActive
                    ? "bg-moss-700 text-white border border-moss-800 shadow-sm"
                    : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
                  }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${isNearMeActive ? "text-emerald-300" : "text-stone-500"}`} />
                <span>{km ? (isNearMeActive ? "ជិតខ្ញុំ (សកម្ម)" : "ជិតខ្ញុំ (GPS)") : (isNearMeActive ? "Near Me (Active)" : "Near Me GPS")}</span>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProvince("all");
                  setSelectedCategory("all");
                  setSelectedType("destinations");
                  setSearch("");
                  setResetTrigger((v) => v + 1);
                }}
                className="min-h-[36px] px-3 py-1 rounded-xl text-small font-sans font-semibold uppercase bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>{km ? "កំណត់ឡើងវិញ" : "Reset"}</span>
              </button>

              {/* Mobile Segmented Toggle (Map vs List) */}
              <div className="flex p-0.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileView("map")}
                  className={`min-h-[32px] px-3 rounded-lg text-small font-sans font-semibold uppercase transition-all cursor-pointer ${mobileView === "map"
                      ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400"
                    }`}
                >
                  <span>{km ? "ផែនទី" : "Map"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className={`min-h-[32px] px-3 rounded-lg text-small font-sans font-semibold uppercase transition-all cursor-pointer ${mobileView === "list"
                      ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400"
                    }`}
                >
                  <span>{km ? `បញ្ជី (${toKm(filteredDestinations.length)})` : `List (${filteredDestinations.length})`}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE MAP & EXPLORER CONSOLE - FULL WIDTH (EDGE TO EDGE, NO GAPS)*/}
      {/* ========================================================================= */}
      <div
        ref={consoleRef}
        className={`w-full flex flex-col lg:flex-row bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800 relative overflow-hidden transition-all shadow-xs ${isFullscreen
            ? "!fixed !inset-0 !z-50 !h-screen !max-h-screen !min-h-screen"
            : "h-[650px] lg:h-[720px]"
          }`}
      >
        {/* ======================================================================= */}
        {/* LEFT SIDEBAR: Destination Cards Deck                                    */}
        {/* ======================================================================= */}
        <aside
          className={`w-full lg:w-[460px] xl:w-[500px] h-full max-h-full min-h-0 flex flex-col border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 z-20 overflow-hidden ${mobileView === "list" ? "flex" : "hidden lg:flex"
            }`}
        >
          {/* Quick Province Filter Chips Bar */}
          {provinces.length > 0 && (
            <div className="shrink-0 p-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedProvince("all")}
                className={`px-3 py-1.5 rounded-lg text-small font-sans font-semibold uppercase whitespace-nowrap shrink-0 transition-all cursor-pointer ${selectedProvince === "all"
                    ? "bg-laterite-600 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-laterite-600 hover:bg-stone-50"
                  }`}
              >
                {km ? "គ្រប់ខេត្ត" : "All"}
              </button>
              {provinces.map((prov) => {
                const isSelected = selectedProvince === prov.slug || String(selectedProvince) === String(prov.id);
                const provTitle = km && prov.name_km ? prov.name_km : prov.name_en;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => {
                      setSelectedProvince(prov.slug || prov.id);
                      const match = destinations.find(
                        (d) =>
                          d.province?.slug === prov.slug ||
                          String(d.province_id) === String(prov.id)
                      );
                      if (match) setActiveDestination(match);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-small font-sans font-semibold uppercase whitespace-nowrap shrink-0 transition-all cursor-pointer ${isSelected
                        ? "bg-laterite-600 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-laterite-600 hover:bg-stone-50"
                      }`}
                  >
                    {provTitle}
                  </button>
                );
              })}
            </div>
          )}

          {/* Results count & hint */}
          <div className="shrink-0 px-3.5 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{km ? "ចុចលើ Card ដើម្បីពង្រីកលើផែនទី" : "Click card to focus on map"}</span>
            </span>
            <div className="flex items-center gap-2">
              {(selectedProvince !== "all" || selectedCategory !== "all" || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvince("all");
                    setSelectedCategory("all");
                    setSearch("");
                  }}
                  className="text-stone-500 hover:text-laterite-600 underline cursor-pointer text-[11px]"
                >
                  {km ? "សម្អាតតម្រង" : "Clear filters"}
                </button>
              )}
              <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs">
                {km ? `លទ្ធផល ${toKm(filteredDestinations.length)}` : `${filteredDestinations.length} places`}
              </span>
            </div>
          </div>

          {/* Scrollable Destination Cards Deck */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-3.5 space-y-2.5">
            {loading ? (
              <div className="space-y-3 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredDestinations.length > 0 ? (
              filteredDestinations.map((dest) => {
                const isSelected = activeDestination?.id === dest.id;
                const name = km && dest.name_km ? dest.name_km : dest.name_en;
                const altName = km ? dest.name_en : dest.name_km;
                const provinceName = dest.province
                  ? km && dest.province.name_km
                    ? dest.province.name_km
                    : dest.province.name_en
                  : null;
                const categoryName = dest.category
                  ? km && dest.category.name_km
                    ? dest.category.name_km
                    : dest.category.name_en
                  : km
                    ? "ទេសចរណ៍"
                    : "Attraction";

                const coverImg = getImageUrl(
                  dest.cover_image || dest.primary_image?.image_url,
                  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=300&q=80"
                );

                const rating = Number(dest.avg_rating ?? dest.rating_avg ?? 0);
                const priceLabel = dest.is_free
                  ? km
                    ? "ឥតគិតថ្លៃ"
                    : "Free"
                  : dest.price_foreign
                    ? `${dest.price_foreign} $`
                    : km
                      ? "មានសំបុត្រ"
                      : "Ticketed";

                return (
                  <motion.div
                    key={dest.id}
                    whileHover={{ y: -4, scale: 1.012 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 340, damping: 22 }}
                  >
                  <div
                    onClick={() => {
                      setActiveDestination(dest);
                      if (mobileView === "list") setMobileView("map");
                    }}
                    className={`p-3 sm:p-3.5 rounded-2xl transition-all duration-300 cursor-pointer flex gap-3.5 group relative select-none border ${isSelected
                        ? "bg-laterite-50/70 dark:bg-laterite-950/40 border-laterite-500/80 shadow-sm ring-2 ring-laterite-500/25"
                        : "bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-laterite-500/50 hover:bg-stone-50/70 dark:hover:bg-stone-850/60 hover:shadow-2xs"
                      }`}
                  >
                    {/* Left Accent indicator for active card */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-laterite-600 rounded-r-full shadow-2xs" />
                    )}

                    {/* Image Thumbnail (clean, unobstructed photo) */}
                    <div className="w-28 h-24 sm:w-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 relative border border-stone-200/90 dark:border-stone-700/80">
                      <img
                        src={coverImg}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=300&q=80";
                        }}
                      />
                      {isSelected && (
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-laterite-600/95 backdrop-blur-xs text-white text-[10px] font-sans font-bold shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>{km ? "សកម្ម" : "Active"}</span>
                        </span>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Top Row: Province Name + Category Badge */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            {provinceName && (
                              <span className="text-xs font-bold text-laterite-600 dark:text-laterite-400 truncate flex items-center gap-1.5 shrink-0">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-laterite-600 shrink-0" />
                                <span>{provinceName}</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-sans font-medium text-[11px] truncate border border-stone-200/80 dark:border-stone-700/80">
                              {categoryName}
                            </span>
                          </div>
                          {dest.distanceKm !== undefined && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0 text-xs">
                              {dest.distanceKm < 1
                                ? `${Math.round(dest.distanceKm * 1000)}ម`
                                : `${dest.distanceKm.toFixed(1)} គ.ម`}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-heading font-black text-stone-900 dark:text-stone-100 group-hover:text-laterite-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 tracking-tight leading-snug">
                          {name}
                        </h4>
                        {altName && (
                          <p className="text-xs text-stone-500 font-sans truncate mt-0.5">
                            {altName}
                          </p>
                        )}
                      </div>

                      {/* Bottom Row: Rating, Price, + Plan */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-bold text-[11px] border border-amber-500/20 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{rating > 0 ? rating.toFixed(1) : "5.0"}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg font-sans font-medium text-[11px] border ${dest.is_free
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/80"
                            }`}>
                            {priceLabel}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlanDestination(dest);
                            setPlanModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white font-sans font-bold text-xs tracking-wider cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                          title={km ? "បញ្ចូលក្នុងកាលវិភាគ" : "Add to Itinerary"}
                        >
                          <span>{km ? "+ គម្រោង" : "+ Plan"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-16 text-center text-stone-500 space-y-2">
                <p className="text-sm font-medium">
                  {km ? "រកមិនឃើញគោលដៅទេសចរណ៍ទេ" : "No destinations found"}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* RIGHT MAIN MAP CANVAS                                                   */}
        {/* ======================================================================= */}
        <main
          className={`flex-1 h-full max-h-full min-h-0 relative w-full overflow-hidden ${mobileView === "map" ? "block" : "hidden lg:block"
            }`}
        >
          {/* Top-Right Floating Theme Switcher */}
          <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-[1000] flex items-center bg-white/95 dark:bg-stone-900/95 p-1 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 shadow-md backdrop-blur-md">
            {Object.entries(MAP_STYLES).map(([key, style]) => {
              const isSelected = selectedMapStyle === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMapStyle(key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold uppercase transition-all cursor-pointer ${isSelected
                      ? "bg-laterite-600 text-white shadow-xs"
                      : "text-stone-700 dark:text-stone-300 hover:text-laterite-600"
                    }`}
                >
                  <span>{km ? style.name_km : style.name_en}</span>
                </button>
              );
            })}
          </div>

          {/* Leaflet Map Canvas */}
          <MapContainer
            center={[12.5657, 104.991]}
            zoom={7.5}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              key={selectedMapStyle}
              attribution={MAP_STYLES[selectedMapStyle].attribution}
              url={MAP_STYLES[selectedMapStyle].url}
              maxZoom={MAP_STYLES[selectedMapStyle].maxZoom || 19}
            />

            <MapController
              selectedCoords={selectedCoords}
              userCoords={userCoords}
              resetTrigger={resetTrigger}
              mobileView={mobileView}
            />

            {/* User GPS location pulsing pin */}
            {userCoords && (
              <Marker position={userCoords} icon={userLocationIcon()}>
                <Popup>
                  <div className="p-1.5 text-center font-bold font-sans text-xs text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>{km ? "ទីតាំងបច្ចុប្បន្នរបស់អ្នក" : "You are here"}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination Markers */}
            {filteredDestinations.map((dest) => {
              const lat = Number(dest.latitude);
              const lng = Number(dest.longitude);
              if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

              const isSelected = activeDestination?.id === dest.id;
              const name = km && dest.name_km ? dest.name_km : dest.name_en;
              const provinceName = dest.province
                ? km && dest.province.name_km
                  ? dest.province.name_km
                  : dest.province.name_en
                : "";
              const coverImg = getImageUrl(
                dest.cover_image || dest.primary_image?.image_url,
                "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80"
              );

              return (
                <Marker
                  key={dest.id}
                  position={[lat, lng]}
                  icon={explorerPinIcon(isSelected)}
                  eventHandlers={{
                    click: () => setActiveDestination(dest)
                  }}
                >
                  <Popup className="custom-explorer-popup">
                    <div className="w-60 p-1 font-sans text-stone-900 dark:text-stone-100">
                      {coverImg && (
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-2 bg-stone-200 dark:bg-stone-800">
                          <img
                            src={coverImg}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mb-1 text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-sans text-[10px] font-medium border border-stone-200 dark:border-stone-700">
                          {dest.category?.name_km || dest.category?.name_en || "រមណីយដ្ឋាន"}
                        </span>
                        {provinceName && (
                          <span className="text-stone-500 font-medium text-xs">
                            • {provinceName}
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-black text-base text-stone-950 dark:text-stone-100 line-clamp-1 mb-0.5 tracking-tight">
                        {name}
                      </h4>
                      {provinceName && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mb-2">
                          {provinceName}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                        <Link
                          to={`/destinations/${dest.slug}`}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-200 font-sans font-bold text-xs uppercase text-center transition-colors"
                        >
                          <span>{km ? "មើលលម្អិត →" : "View →"}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setPlanDestination(dest);
                            setPlanModalOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>{km ? "+ គម្រោង" : "+ Plan"}</span>
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Bottom-Right Floating Controls */}
          <div
            className={`absolute right-4 z-[1000] flex flex-col gap-2 transition-all ${activeDestination && mobileView === "map"
                ? "bottom-28 sm:bottom-6 sm:right-6"
                : "bottom-4 sm:bottom-6 sm:right-6"
              }`}
          >
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 hover:text-laterite-600 text-xs font-sans font-bold uppercase shadow-md transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5"
              title={km ? "ពង្រីកពេញអេក្រង់" : "Toggle Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? (km ? "បង្រួម" : "Normal") : (km ? "ពេញអេក្រង់" : "Fullscreen")}</span>
            </button>

            <button
              type="button"
              onClick={() => setResetTrigger((v) => v + 1)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 hover:text-laterite-600 text-xs font-sans font-bold uppercase shadow-md transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{km ? "កំណត់ឡើងវិញ" : "Reset"}</span>
            </button>

            <button
              type="button"
              onClick={handleNearMe}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-sans font-bold uppercase shadow-md transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5 ${isNearMeActive
                  ? "bg-moss-700 text-white border border-moss-800"
                  : "bg-laterite-600 hover:bg-laterite-700 text-white"
                }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{km ? (isNearMeActive ? "ជិតខ្ញុំ (សកម្ម)" : "ជិតខ្ញុំ (GPS)") : (isNearMeActive ? "Near (On)" : "Near Me")}</span>
            </button>
          </div>

          {/* Mobile Bottom Slide-Up Preview Card */}
          {activeDestination && mobileView === "map" && (
            <div className="lg:hidden absolute bottom-3 left-3 right-3 z-[1001] bg-white/95 dark:bg-stone-900/95 rounded-3xl p-3.5 border border-stone-200/90 dark:border-stone-700/80 shadow-2xl backdrop-blur-md animate-fade-in flex gap-3.5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 relative border border-stone-200 dark:border-stone-700">
                <img
                  src={getImageUrl(
                    activeDestination.cover_image || activeDestination.primary_image?.image_url,
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=300&q=80"
                  )}
                  alt={km && activeDestination.name_km ? activeDestination.name_km : activeDestination.name_en}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=300&q=80";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-sans font-medium border border-stone-200 dark:border-stone-700">
                        {activeDestination.category?.name_km || activeDestination.category?.name_en || "រមណីយដ្ឋាន"}
                      </span>
                      <span className="text-xs font-bold text-laterite-600 dark:text-laterite-400 truncate">
                        {km && activeDestination.province?.name_km
                          ? activeDestination.province.name_km
                          : activeDestination.province?.name_en}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveDestination(null)}
                      className="w-6 h-6 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-xs font-mono font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <h4 className="text-base font-heading font-black text-stone-900 dark:text-stone-100 line-clamp-1 tracking-tight">
                    {km && activeDestination.name_km
                      ? activeDestination.name_km
                      : activeDestination.name_en}
                  </h4>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <Link
                    to={`/destinations/${activeDestination.slug}`}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-sans font-bold text-xs uppercase text-center transition-colors"
                  >
                    <span>{km ? "មើលលម្អិត →" : "Details →"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanDestination(activeDestination);
                      setPlanModalOpen(true);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white font-sans font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>{km ? "+ គម្រោង" : "+ Plan"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add To Trip Plan Modal (Icon-Free) */}
      <AddToPlanModal
        destination={planDestination}
        isOpen={planModalOpen}
        onClose={() => {
          setPlanModalOpen(false);
          setPlanDestination(null);
        }}
      />
    </div>
  );
};

export default MapExplorerPage;
