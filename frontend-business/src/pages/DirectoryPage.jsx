import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Map as MapIcon,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { BusinessCard } from "@/components/common/BusinessCard";
import { LazyMap } from "@/components/common/LazyMap";

const formatSlugLabel = (value) =>
  String(value || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const DirectoryPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isKm = i18n.language === "km";

  // URL state synchronization
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";
  const provinceId = searchParams.get("province") || "";
  const destination = searchParams.get("destination") || "";
  const verified = searchParams.get("verified") === "1";
  const openNow = searchParams.get("open_now") === "1";
  const priceLevel = searchParams.get("price_level") || "";
  const sort = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [searchInput, setSearchInput] = useState(q);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    if (!filterDrawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFilterDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterDrawerOpen]);

  // Update URL helper
  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "" || val === false) {
        updated.delete(key);
      } else {
        updated.set(key, val === true ? "1" : String(val));
      }
    });
    // Reset page to 1 when changing filters (unless specifically changing page)
    if (!newParams.page) {
      updated.delete("page");
    }
    setSearchParams(updated);
  };

  // Fetch categories & provinces
  const { data: categoriesData } = useQuery({
    queryKey: ["public", "categories"],
    queryFn: async () => {
      const res = await api.get("/business/public/categories");
      return res.data;
    },
  });

  const { data: provincesData } = useQuery({
    queryKey: ["public", "provinces"],
    queryFn: async () => {
      const res = await api.get("/business/public/provinces");
      return res.data;
    },
  });

  // Fetch businesses with current URL filters
  const {
    data: listData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "public",
      "businesses",
      q,
      categoryId,
      provinceId,
      destination,
      verified,
      openNow,
      priceLevel,
      sort,
      page,
    ],
    queryFn: async () => {
      const params = {
        per_page: 12,
        page,
        sort,
      };
      if (q) params.q = q;
      if (categoryId) params.category = categoryId;
      if (provinceId) params.province = provinceId;
      if (destination) params.destination = destination;
      if (verified) params.verified = 1;
      if (openNow) params.open_now = 1;
      if (priceLevel) params.price_level = priceLevel;

      const res = await api.get("/business/public/businesses", { params });
      return res.data;
    },
  });

  const rawBusinesses =
    listData?.data?.items ||
    listData?.items ||
    (Array.isArray(listData?.data) ? listData?.data : []);
  const businesses = Array.isArray(rawBusinesses) ? rawBusinesses : [];
  const meta = listData?.data?.meta || listData?.meta || {};
  const categories = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
      ? categoriesData
      : [];
  const provinces = Array.isArray(provincesData?.data)
    ? provincesData.data
    : Array.isArray(provincesData)
      ? provincesData
      : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() });
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSearchInput("");
  };

  const goToPage = (nextPage) => {
    updateParams({ page: nextPage });
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const sortLabels = {
    relevance: t("search.sort_relevance"),
    rating: t("search.sort_rating"),
    newest: t("search.sort_newest"),
    distance: t("search.sort_distance"),
  };

  const selectedCategory = categories.find(
    (category) => String(category.id) === String(categoryId)
  );
  const selectedProvince = provinces.find(
    (province) => String(province.id) === String(provinceId)
  );

  const activeFilters = [];

  if (q) {
    activeFilters.push({
      key: "q",
      label: `${isKm ? "ស្វែងរក" : "Search"}: ${q}`,
      remove: () => {
        setSearchInput("");
        updateParams({ q: "" });
      },
    });
  }

  if (categoryId) {
    const categoryLabel = selectedCategory
      ? isKm
        ? selectedCategory.name_km || selectedCategory.name_en
        : selectedCategory.name_en || selectedCategory.name_km
      : `${isKm ? "ប្រភេទ" : "Category"} ${categoryId}`;
    activeFilters.push({
      key: "category",
      label: categoryLabel,
      remove: () => updateParams({ category: "" }),
    });
  }

  if (provinceId) {
    const provinceLabel = selectedProvince
      ? isKm
        ? selectedProvince.name_km || selectedProvince.name_en
        : selectedProvince.name_en || selectedProvince.name_km
      : `${isKm ? "ខេត្ត" : "Province"} ${provinceId}`;
    activeFilters.push({
      key: "province",
      label: provinceLabel,
      remove: () => updateParams({ province: "" }),
    });
  }

  if (destination) {
    activeFilters.push({
      key: "destination",
      label: `${isKm ? "គោលដៅ" : "Destination"}: ${formatSlugLabel(destination)}`,
      remove: () => updateParams({ destination: "" }),
    });
  }

  if (verified) {
    activeFilters.push({
      key: "verified",
      label: t("search.verified_only"),
      remove: () => updateParams({ verified: false }),
    });
  }

  if (openNow) {
    activeFilters.push({
      key: "open_now",
      label: t("search.open_now_only"),
      remove: () => updateParams({ open_now: false }),
    });
  }

  if (priceLevel) {
    activeFilters.push({
      key: "price_level",
      label: `${t("search.price_level")}: ${"$".repeat(Number(priceLevel) || 0)}`,
      remove: () => updateParams({ price_level: "" }),
    });
  }

  if (sort !== "relevance") {
    activeFilters.push({
      key: "sort",
      label: `${t("search.sort_by")}: ${sortLabels[sort] || sort}`,
      remove: () => updateParams({ sort: "" }),
    });
  }

  const activeFilterCount = activeFilters.length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-card border border-line bg-cream px-6 py-8 shadow-premium dark:border-white/10 dark:bg-stone-850 md:px-8">
        <div className="relative">
          <p className="eyebrow">{isKm ? "ថតឯកសារអាជីវកម្ម" : "Business directory"}</p>
          <h1 className="mt-2 text-forest dark:text-cream">{t("nav.directory")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted dark:text-white/55">
            {t("app_tagline")}
          </p>

          <div className="mt-6 flex flex-col gap-2 lg:flex-row">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="field bg-sage pl-11 text-ink dark:bg-stone-900"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ q: "" });
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-forest"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary">
                {t("search.button")}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={
                  showMap
                    ? "btn-primary"
                    : "btn-secondary"
                }
              >
                <MapIcon className="h-4 w-4" />
                <span>{showMap ? t("search.hide_map") : t("search.show_map")}</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className="btn-secondary lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t("search.filter_drawer_title")}</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-forest-dark">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map view on demand */}
      {showMap && (
        <div className="mt-8 animate-in fade-in duration-300">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className="text-muted dark:text-slate-400">
              {isKm
                ? `${businesses.length} អាជីវកម្មនៅលើទំព័រនេះ`
                : `${businesses.length} businesses on this page`}
            </p>
            {meta.total > businesses.length && (
              <p className="font-medium text-brand-700 dark:text-brand-300">
                {isKm
                  ? `ផែនទីបង្ហាញតែទំព័រនេះ (${businesses.length}/${meta.total})`
                  : `Map shows this page only (${businesses.length}/${meta.total})`}
              </p>
            )}
          </div>
          <LazyMap businesses={businesses} height="400px" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="surface sticky top-20 hidden self-start space-y-6 p-6 lg:col-span-1 lg:block">
          <div className="flex items-center justify-between border-b border-brand-100 pb-4 dark:border-white/10">
            <span className="flex items-center gap-2 font-serif text-lg font-semibold text-forest dark:text-white">
              <Filter className="h-4 w-4 text-brand-600" />
              {t("search.filter_drawer_title")}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline dark:text-brand-400"
              >
                <RotateCcw className="h-3 w-3" />
                {t("search.clear_filters")}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="eyebrow block">{t("search.all_categories")}</label>
            <select
              value={categoryId}
              onChange={(e) => updateParams({ category: e.target.value })}
              className="field"
            >
              <option value="">{t("search.all_categories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isKm ? c.name_km : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="eyebrow block">{t("search.all_provinces")}</label>
            <select
              value={provinceId}
              onChange={(e) => updateParams({ province: e.target.value })}
              className="field"
            >
              <option value="">{t("search.all_provinces")}</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {isKm ? p.name_km : p.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="eyebrow block">{t("search.price_level")}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    updateParams({
                      price_level: priceLevel === String(level) ? "" : String(level),
                    })
                  }
                  className={`rounded-full border py-2 text-xs font-semibold transition ${priceLevel === String(level)
                      ? "border-forest bg-forest text-cream shadow-premium dark:border-brand-500 dark:bg-brand-500 dark:text-forest"
                      : "border-brand-200 bg-cream text-muted hover:border-brand-400 hover:bg-brand-50 dark:border-white/15 dark:bg-transparent dark:text-white/50 dark:hover:bg-white/5"
                    }`}
                >
                  {"$".repeat(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-line pt-4 dark:border-stone-800">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => updateParams({ verified: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {t("search.verified_only")}
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => updateParams({ open_now: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {t("search.open_now_only")}
              </span>
            </label>
          </div>

          <div className="space-y-2 border-t border-line pt-4 dark:border-stone-800">
            <label className="eyebrow block">{t("search.sort_by")}</label>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="field"
            >
              <option value="relevance">{t("search.sort_relevance")}</option>
              <option value="rating">{t("search.sort_rating")}</option>
              <option value="newest">{t("search.sort_newest")}</option>
              <option value="distance">{t("search.sort_distance")}</option>
            </select>
          </div>
        </aside>

        {/* Results Area */}
        <main
          ref={resultsRef}
          className="scroll-mt-24 space-y-6 lg:col-span-3"
          aria-busy={isFetching}
        >
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-slate-400">
                {t("search.active_filters")}
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.remove}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 transition hover:border-brand-500 dark:border-white/10 dark:bg-white/5 dark:text-brand-200"
                  aria-label={
                    isKm
                      ? `ដកតម្រង ${filter.label}`
                      : `Remove ${filter.label} filter`
                  }
                >
                  <span className="max-w-[220px] truncate">{filter.label}</span>
                  <X className="h-3 w-3 shrink-0" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400"
              >
                <RotateCcw className="h-3 w-3" />
                {t("search.clear_filters")}
              </button>
            </div>
          )}

          <div
            className="flex flex-wrap items-center justify-between gap-3 text-xs"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 font-semibold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
                {t("search.results_count", { count: meta.total ?? businesses.length })}
              </div>
              {isFetching && !isLoading && (
                <span className="inline-flex items-center gap-1.5 text-muted dark:text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("search.updating_results")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-muted dark:text-slate-400">{t("search.sort_by")}:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="rounded-full border border-brand-200 bg-cream px-3 py-1.5 font-medium text-forest dark:border-white/15 dark:bg-stone-850 dark:text-cream"
              >
                <option value="relevance">{t("search.sort_relevance")}</option>
                <option value="rating">{t("search.sort_rating")}</option>
                <option value="newest">{t("search.sort_newest")}</option>
                <option value="distance">{t("search.sort_distance")}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="skeleton h-80"
                />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="surface space-y-4 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest dark:text-white">
                  {isKm ? "រកមិនឃើញអាជីវកម្មតាមតម្រូវការទេ" : "No businesses found"}
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted dark:text-slate-400">
                  {isKm
                    ? "សូមសាកល្បងសម្អាតតម្រង ឬស្វែងរកដោយពាក្យគន្លឹះផ្សេងទៀត។"
                    : "Try clearing some filters or searching with different keywords."}
                </p>
              </div>
              <button type="button" onClick={handleClearFilters} className="btn-secondary">
                {t("search.clear_filters")}
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching && !isLoading ? "opacity-60" : "opacity-100"
                }`}
            >
              {businesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} source="list" />
              ))}
            </div>
          )}

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-line pt-4 text-xs dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">
                {isKm
                  ? `ទំព័រ ${meta.current_page} នៃ ${meta.last_page}`
                  : `Page ${meta.current_page} of ${meta.last_page}`}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => goToPage(page - 1)}
                  className="btn-secondary !min-h-0 !px-3 !py-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{isKm ? "ថយក្រោយ" : "Previous"}</span>
                </button>
                <button
                  disabled={page >= meta.last_page || isFetching}
                  onClick={() => goToPage(page + 1)}
                  className="btn-secondary !min-h-0 !px-3 !py-2"
                >
                  <span>{isKm ? "បន្ទាប់" : "Next"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {filterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setFilterDrawerOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="flex h-full w-full max-w-sm flex-col justify-between overflow-y-auto overscroll-contain bg-paper p-6 dark:bg-stone-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-brand-100 pb-4 dark:border-white/10">
                <span
                  id="mobile-filter-title"
                  className="flex items-center gap-2 font-serif text-lg font-semibold text-forest dark:text-white"
                >
                  <SlidersHorizontal className="h-4 w-4 text-brand-600" />
                  {t("search.filter_drawer_title")}
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-forest dark:bg-brand-950/40 dark:text-brand-300">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 text-stone-400 transition hover:text-ink dark:hover:text-white"
                  aria-label={isKm ? "បិទតម្រង" : "Close filters"}
                  autoFocus
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="eyebrow block">{t("search.all_categories")}</label>
                <select
                  value={categoryId}
                  onChange={(e) => updateParams({ category: e.target.value })}
                  className="field"
                >
                  <option value="">{t("search.all_categories")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isKm ? c.name_km : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="eyebrow block">{t("search.all_provinces")}</label>
                <select
                  value={provinceId}
                  onChange={(e) => updateParams({ province: e.target.value })}
                  className="field"
                >
                  <option value="">{t("search.all_provinces")}</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isKm ? p.name_km : p.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="eyebrow block">{t("search.price_level")}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        updateParams({
                          price_level:
                            priceLevel === String(level) ? "" : String(level),
                        })
                      }
                      className={`rounded-full border py-2 text-xs font-semibold transition ${priceLevel === String(level)
                          ? "border-forest bg-forest text-cream shadow-premium dark:border-brand-500 dark:bg-brand-500 dark:text-forest"
                          : "border-brand-200 bg-cream text-muted hover:border-brand-400 hover:bg-brand-50 dark:border-white/15 dark:bg-transparent dark:text-white/50 dark:hover:bg-white/5"
                        }`}
                    >
                      {"$".repeat(level)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-line pt-4 dark:border-stone-800">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => updateParams({ verified: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {t("search.verified_only")}
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={openNow}
                    onChange={(e) => updateParams({ open_now: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {t("search.open_now_only")}
                  </span>
                </label>
              </div>

              <div className="space-y-1.5 border-t border-line pt-4 dark:border-stone-800">
                <label className="eyebrow block">{t("search.sort_by")}</label>
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="field"
                >
                  <option value="relevance">{t("search.sort_relevance")}</option>
                  <option value="rating">{t("search.sort_rating")}</option>
                  <option value="newest">{t("search.sort_newest")}</option>
                  <option value="distance">{t("search.sort_distance")}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 border-t border-line pt-6 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="btn-primary w-full"
              >
                {t("search.apply_filters")}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearFilters();
                    setFilterDrawerOpen(false);
                  }}
                  className="btn-secondary w-full"
                >
                  {t("search.clear_filters")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
