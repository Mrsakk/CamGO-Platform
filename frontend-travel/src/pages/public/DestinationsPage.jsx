import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Compass,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationQuickViewModal } from "@/components/destinations/DestinationQuickViewModal";
import { DestinationCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { MapOnDemand } from "@/components/common/MapOnDemand";
import { FilterSheet } from "@/components/layout/FilterSheet";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CustomSelect } from "@/components/common/CustomSelect";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { destinationsApi } from "@/lib/api/destinations";
import { provincesApi } from "@/lib/api/provinces";
import { categoriesApi } from "@/lib/api/categories";

const toKm = (n) => String(n ?? 0);

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
};

const DestinationsPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [provinceId, setProvinceId] = useState(searchParams.get("province_id") || searchParams.get("province") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") || searchParams.get("category") || "");
  const [minRating, setMinRating] = useState(searchParams.get("min_rating") || searchParams.get("rating") || "");
  const [isFree, setIsFree] = useState(searchParams.get("is_free") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || searchParams.get("sort") || "popular");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data & Modal States
  const [quickViewDest, setQuickViewDest] = useState(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load provinces and categories with TanStack Query caching
  const { data: provResponse } = useQuery({
    queryKey: ["provinces-all"],
    queryFn: () => provincesApi.getAll(),
    staleTime: 1000 * 60 * 10,
  });
  const provinces = useMemo(() => {
    const raw = provResponse?.data;
    return Array.isArray(raw) ? raw : raw?.items || [];
  }, [provResponse]);

  const { data: catResponse } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 1000 * 60 * 10,
  });
  const categories = useMemo(() => {
    const raw = catResponse?.data;
    return Array.isArray(raw) ? raw : raw?.items || [];
  }, [catResponse]);

  // Match slug to ID if URL params use slugs
  useEffect(() => {
    if (provinceId && isNaN(Number(provinceId)) && provinces.length > 0) {
      const matched = provinces.find((p) => p.slug === provinceId || p.code === provinceId);
      if (matched) setProvinceId(String(matched.id));
    }
  }, [provinceId, provinces]);

  useEffect(() => {
    if (categoryId && isNaN(Number(categoryId)) && categories.length > 0) {
      const matched = categories.find((c) => c.slug === categoryId);
      if (matched) setCategoryId(String(matched.id));
    }
  }, [categoryId, categories]);

  // Sync searchParams with filter states
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (provinceId) params.province_id = provinceId;
    if (categoryId) params.category_id = categoryId;
    if (minRating) params.min_rating = minRating;
    if (isFree) params.is_free = isFree;
    if (sortBy) params.sort_by = sortBy;
    if (page > 1) params.page = String(page);
    if (viewMode !== "grid") params.view = viewMode;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, provinceId, categoryId, minRating, isFree, sortBy, page, viewMode, setSearchParams]);

  const queryParams = useMemo(() => ({
    search: debouncedSearch.trim() || undefined,
    province_id: provinceId || undefined,
    category_id: categoryId || undefined,
    min_rating: minRating ? Number(minRating) : undefined,
    is_free: isFree === "1" ? true : isFree === "0" ? false : undefined,
    sort_by: sortBy,
    page,
    per_page: viewMode === "map" ? 60 : 12,
  }), [debouncedSearch, provinceId, categoryId, minRating, isFree, sortBy, page, viewMode]);

  // Fetch destinations with TanStack Query caching
  const { data: destinationsResponse, isLoading } = useQuery({
    queryKey: ["destinations", queryParams],
    queryFn: () => destinationsApi.getAll(queryParams),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const destinations = useMemo(() => {
    const raw = destinationsResponse?.data;
    return Array.isArray(raw) ? raw : raw?.items || [];
  }, [destinationsResponse]);

  const meta = useMemo(() => {
    return destinationsResponse?.meta || destinationsResponse?.data?.meta || null;
  }, [destinationsResponse]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setProvinceId("");
    setCategoryId("");
    setMinRating("");
    setIsFree("");
    setSortBy("popular");
    setPage(1);
    setMobileFilterOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch.trim()) count++;
    if (provinceId) count++;
    if (categoryId) count++;
    if (minRating) count++;
    if (isFree) count++;
    return count;
  }, [debouncedSearch, provinceId, categoryId, minRating, isFree]);

  const hasActiveFilters = activeFilterCount > 0;

  const selectedProvinceName = provinces.find((p) => String(p.id) === String(provinceId));
  const selectedCategoryName = categories.find((c) => String(c.id) === String(categoryId));

  const provinceOptions = useMemo(() => [
    { value: "", label: km ? "គ្រប់ខេត្ត-រាជធានី" : "All Provinces" },
    ...provinces.map((prov) => ({
      value: String(prov.id),
      label: km && prov.name_km ? prov.name_km : prov.name_en,
    })),
  ], [provinces, km]);

  const categoryOptions = useMemo(() => [
    { value: "", label: km ? "គ្រប់ប្រភេទទេសចរណ៍" : "All Categories" },
    ...categories.map((cat) => ({
      value: String(cat.id),
      label: km && cat.name_km ? cat.name_km : cat.name_en,
    })),
  ], [categories, km]);

  const sortOptions = useMemo(() => [
    { value: "popular", label: km ? "ពេញនិយមបំផុត" : "Most Popular" },
    { value: "top_rated", label: km ? "ពិន្ទុខ្ពស់បំផុត" : "Highest Rated" },
    { value: "newest", label: km ? "ទើបបន្ថែមថ្មី" : "Recently Added" },
    { value: "name_asc", label: km ? "តាមអក្ខរក្រម (A-Z)" : "Alphabetical (A-Z)" },
  ], [km]);

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <PageContainer className="space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "គោលដៅទេសចរណ៍" : "All Destinations" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE DESTINATIONS HERO BANNER                        */}
        {/* =================================================================== */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden"
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
            <RumduolFlower size={420} className="text-laterite-600" />
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Cultural Intro */}
            <div className="lg:col-span-7 space-y-4">


              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                {km ? "គោលដៅទេសចរណ៍នៅកម្ពុជា" : "Cambodia Destinations"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl font-sans">
                {km
                  ? "រុករកប្រាសាទបុរាណសម័យអង្គរ កោះត្រូពិក ឆ្នេរសមុទ្រធម្មជាតិ និងរតនសម្បត្តិវប្បធម៌ដែលបានចងក្រងយ៉ាងពិតប្រាកដ។"
                  : "Explore ancient Angkorian temples, tropical island retreats, and pristine nature reserves across the Kingdom with verified records."}
              </p>
            </div>

            {/* Right Column: Split Metric & View Toggle Pane */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-700">
                  <span className="text-xs uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 font-sans">
                    {km ? "ទិដ្ឋភាពបង្ហាញ" : "Display Mode"}
                  </span>

                  {/* View Mode Toggle (Grid vs Map) */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-stone-200/70 dark:bg-stone-900 border border-stone-300 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`min-h-[34px] px-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer select-none ${viewMode === "grid"
                          ? "bg-laterite-600 text-white shadow-xs"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                        }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{km ? "តារាងក្រឡា" : "Grid"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("map")}
                      className={`min-h-[34px] px-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer select-none ${viewMode === "map"
                          ? "bg-laterite-600 text-white shadow-xs"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                        }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{km ? "ផែនទី" : "Map"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-3xl sm:text-4xl font-heading font-black text-stone-900 dark:text-stone-100 block leading-none">
                      {meta?.total ? (km ? toKm(meta.total) : meta.total) : "..."}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-sans font-medium mt-1.5 block">
                      {km ? "គោលដៅទេសចរណ៍សរុប" : "Documented Attractions"}
                    </span>
                  </div>

                  {hasActiveFilters && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 border border-laterite-600/20 font-sans">
                      {km ? `${toKm(activeFilterCount)} តម្រងសកម្ម` : `${activeFilterCount} active filters`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. FILTER & SEARCH CONTROL BAR                                      */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-sm p-3.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-small"
        >
          {/* Keyword Search Field */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-laterite-600 dark:text-laterite-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={km ? "ស្វែងរកឈ្មោះរមណីយដ្ឋាន ប្រាសាទ កោះ ឆ្នេរ..." : "Search sanctuaries, temples, islands..."}
              className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm font-km rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 justify-between sm:justify-end">
            {/* Quick Province CustomSelect */}
            <div className="hidden sm:block w-44 lg:w-48">
              <CustomSelect
                value={provinceId}
                onChange={(val) => {
                  setProvinceId(val);
                  setPage(1);
                }}
                options={provinceOptions}
                icon={MapPin}
                placeholder={km ? "គ្រប់ខេត្ត-រាជធានី" : "All Provinces"}
                searchable
                searchPlaceholder={km ? "ស្វែងរកខេត្ត..." : "Search province..."}
                size="md"
              />
            </div>

            {/* Quick Category CustomSelect */}
            <div className="hidden md:block w-44 lg:w-48">
              <CustomSelect
                value={categoryId}
                onChange={(val) => {
                  setCategoryId(val);
                  setPage(1);
                }}
                options={categoryOptions}
                icon={Compass}
                placeholder={km ? "គ្រប់ប្រភេទទេសចរណ៍" : "All Categories"}
                size="md"
              />
            </div>

            {/* Filter Sheet Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className={`min-h-[44px] h-[44px] px-4 rounded-2xl border text-xs sm:text-sm font-sans font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all select-none shadow-xs ${activeFilterCount > 0
                  ? "bg-laterite-600/10 dark:bg-laterite-600/20 border-laterite-600/50 text-laterite-700 dark:text-laterite-300"
                  : "bg-stone-50 dark:bg-stone-950 border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-laterite-600/50"
                }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-laterite-600 dark:text-laterite-400 shrink-0" />
              <span>{km ? "តម្រងបន្ថែម" : "Filters"}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-laterite-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {toKm(activeFilterCount)}
                </span>
              )}
            </button>

            {/* Sort CustomSelect */}
            <div className="w-38 sm:w-44">
              <CustomSelect
                value={sortBy}
                onChange={(val) => {
                  setSortBy(val);
                  setPage(1);
                }}
                options={sortOptions}
                icon={ArrowUpDown}
                placeholder={km ? "ពេញនិយមបំផុត" : "Most Popular"}
                align="right"
                size="md"
              />
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 3. ACTIVE FILTERS AS REMOVABLE CHIPS + RESULT COUNT                 */}
        {/* =================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-600 dark:text-stone-400 font-medium font-sans">
            {meta ? (
              km ? (
                <span>បង្ហាញ {toKm(destinations.length)} នៃ {toKm(meta.total)} ទីតាំងទេសចរណ៍</span>
              ) : (
                <span>Showing {destinations.length} of {meta.total} destinations</span>
              )
            ) : null}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs">
                  <span>"{debouncedSearch}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setDebouncedSearch("");
                    }}
                    className="hover:text-laterite-600 cursor-pointer font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedProvinceName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs">
                  <span>{km && selectedProvinceName.name_km ? selectedProvinceName.name_km : selectedProvinceName.name_en}</span>
                  <button
                    type="button"
                    onClick={() => setProvinceId("")}
                    className="hover:text-laterite-600 cursor-pointer font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedCategoryName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs">
                  <span>{km && selectedCategoryName.name_km ? selectedCategoryName.name_km : selectedCategoryName.name_en}</span>
                  <button
                    type="button"
                    onClick={() => setCategoryId("")}
                    className="hover:text-laterite-600 cursor-pointer font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}

              {minRating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs font-mono">
                  <span>{km ? `ពិន្ទុ ${toKm(minRating)}+` : `Rating ${minRating}+`}</span>
                  <button
                    type="button"
                    onClick={() => setMinRating("")}
                    className="hover:text-laterite-600 cursor-pointer font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}

              {isFree === "1" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs">
                  <span>{km ? "ចូលទស្សនាឥតគិតថ្លៃ" : "Free Entry"}</span>
                  <button
                    type="button"
                    onClick={() => setIsFree("")}
                    className="hover:text-laterite-600 cursor-pointer font-bold ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-laterite-600/10 hover:bg-laterite-600/20 text-laterite-700 dark:text-laterite-400 border border-laterite-600/25 text-xs font-bold uppercase cursor-pointer transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{km ? "សម្អាតតម្រងទាំងអស់" : "Clear all"}</span>
              </button>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. RESULTS DISPLAY: GRID OR MAP VIEW                                */}
        {/* =================================================================== */}
        {viewMode === "map" ? (
          <div className="rounded-3xl overflow-hidden h-[620px] bg-stone-100 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-md">
            <MapOnDemand destinations={destinations} />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-3xl sm:rounded-[36px] p-8 sm:p-14 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm overflow-hidden"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 text-xs font-bold uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{km ? "ទិន្នន័យស្វែងរក" : "No Destinations Found"}</span>
            </div>
            <h3 className="font-heading font-black text-2xl text-stone-900 dark:text-stone-100 leading-snug">
              {km ? "រកមិនឃើញគោលដៅទេសចរណ៍ទេ" : "No Destinations Found"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-sans">
              {km
                ? "សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬសម្អាតតម្រងស្វែងរករបស់អ្នក។"
                : "Try adjusting your search keywords or clearing active filters."}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>{km ? "សម្អាតតម្រងទាំងអស់" : "Clear All Filters"}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {destinations.map((dest) => (
              <motion.div key={dest.id} variants={fadeInUp}>
                <DestinationCard
                  destination={dest}
                  onQuickView={setQuickViewDest}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* 5. PAGINATION CONTROLS                                               */}
        {/* =================================================================== */}
        {meta && meta.last_page > 1 && (
          <div className="pt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="min-h-[42px] px-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all shadow-2xs select-none flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{km ? "មុន" : "Prev"}</span>
            </button>

            <span className="text-xs font-bold px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-mono select-none">
              {km ? `${toKm(page)} / ${toKm(meta.last_page)}` : `${page} / ${meta.last_page}`}
            </span>

            <button
              type="button"
              disabled={page >= meta.last_page}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="min-h-[42px] px-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all shadow-2xs select-none flex items-center gap-1.5"
            >
              <span>{km ? "បន្ទាប់" : "Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </PageContainer>

      {/* FILTER BOTTOM SHEET */}
      <FilterSheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title={km ? "តម្រងស្វែងរកលម្អិត" : "Filter Destinations"}
        resultCount={meta?.total ?? destinations.length}
        onApply={() => setMobileFilterOpen(false)}
        onReset={handleResetFilters}
        applyLabel={km ? "អនុវត្ត" : "Apply"}
        resetLabel={km ? "កំណត់ឡើងវិញ" : "Reset"}
      >
        <div className="space-y-4">
          {/* Province Filter */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 block font-sans">
              {km ? "ខេត្ត-រាជធានី" : "Province / Territory"}
            </label>
            <CustomSelect
              value={provinceId}
              onChange={(val) => {
                setProvinceId(val);
                setPage(1);
              }}
              options={provinceOptions}
              icon={MapPin}
              placeholder={km ? "គ្រប់ខេត្ត-រាជធានី" : "All Provinces"}
              searchable
              searchPlaceholder={km ? "ស្វែងរកខេត្ត..." : "Search province..."}
              size="md"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 block font-sans">
              {km ? "ប្រភេទរមណីយដ្ឋាន" : "Category / Pursuit"}
            </label>
            <CustomSelect
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                setPage(1);
              }}
              options={categoryOptions}
              icon={Compass}
              placeholder={km ? "គ្រប់ប្រភេទ" : "All Pursuits"}
              size="md"
            />
          </div>

          {/* Minimum Rating Filter */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 block font-sans">
              {km ? "ពិន្ទុវាយតម្លៃអប្បបរមា" : "Minimum Rating"}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["", "4.5", "4.0", "3.0"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setMinRating(r);
                    setPage(1);
                  }}
                  className={`min-h-[40px] rounded-2xl border text-xs font-bold uppercase transition-all cursor-pointer ${minRating === r
                      ? "bg-laterite-600 text-white border-laterite-600 shadow-xs"
                      : "border-stone-200/90 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                    }`}
                >
                  <span>{r ? (km ? `ពិន្ទុ ${toKm(r)}+` : `${r}+`) : (km ? "ទាំងអស់" : "All")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Free Entry Toggle */}
          <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 font-sans">
              {km ? "ចូលទស្សនាឥតគិតថ្លៃតែប៉ុណ្ណោះ" : "Free Entry Only"}
            </span>
            <input
              type="checkbox"
              checked={isFree === "1"}
              onChange={(e) => {
                setIsFree(e.target.checked ? "1" : "");
                setPage(1);
              }}
              className="w-5 h-5 accent-laterite-600 cursor-pointer"
            />
          </div>
        </div>
      </FilterSheet>

      {/* Quick View Modal */}
      <DestinationQuickViewModal
        destination={quickViewDest}
        isOpen={!!quickViewDest}
        onClose={() => setQuickViewDest(null)}
      />
    </div>
  );
};

export { DestinationsPage };
export default DestinationsPage;
