import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Tag, ArrowRight, X } from "lucide-react";
import { CustomSelect } from "@/components/common/CustomSelect";
import { provincesApi } from "@/lib/api/provinces";
import { categoriesApi } from "@/lib/api/categories";

/**
 * SearchBar - Angkor Sandstone & Bas-Relief
 * - Carved-in fields (48px height, 16px text)
 * - Single primary laterite action button (48px min-height, white text AA)
 * - Clean tactile raised stone panel container
 */
const SearchBar = ({
  initialSearch = "",
  initialProvince = "",
  initialCategory = "",
  className = ""
}) => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const navigate = useNavigate();
  const [search, setSearch] = useState(initialSearch);
  const [provinceId, setProvinceId] = useState(initialProvince ? String(initialProvince) : "");
  const [categoryId, setCategoryId] = useState(initialCategory ? String(initialCategory) : "");
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    provincesApi.getAll().then((res) => {
      if (res.data) setProvinces(res.data);
    });
    categoriesApi.getAll().then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  const provinceOptions = useMemo(
    () => [
      { value: "", label: km ? "គ្រប់ខេត្ត-រាជធានី" : "All Provinces" },
      ...provinces.map((prov) => ({
        value: String(prov.id),
        label: km && prov.name_km ? prov.name_km : prov.name_en
      }))
    ],
    [provinces, km]
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: km ? "គ្រប់ប្រភេទ" : "All Pursuits" },
      ...categories.map((cat) => ({
        value: String(cat.id),
        label: km && cat.name_km ? cat.name_km : cat.name_en
      }))
    ],
    [categories, km]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (provinceId) params.set("province_id", provinceId);
    if (categoryId) params.set("category_id", categoryId);
    navigate(`/destinations?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`panel-raised relative z-30 w-full max-w-4xl mx-auto p-2 sm:p-2.5 rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-raise ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        {/* 1. Keyword Field */}
        <div className="flex-1 relative flex items-center min-w-0">
          <Search className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute left-3.5 pointer-events-none" />
          <input
            id="search-keyword"
            aria-label={km ? "គោលដៅ ឬពាក្យគន្លឹះ" : "Destination or keyword"}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={km ? "ស្វែងរកប្រាសាទ កោះ ឆ្នេរ ទឹកធ្លាក់..." : "Search temples, islands, waterfalls..."}
            className="w-full h-12 !pl-11 !pr-9 rounded-control input-carved text-body text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-km"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2 & 3: Mobile 2-Columns / Desktop Row */}
        <div className="grid grid-cols-2 md:flex md:items-center gap-2">
          {/* Province */}
          <div className="md:w-48 lg:w-52">
            <CustomSelect
              value={provinceId}
              onChange={setProvinceId}
              options={provinceOptions}
              icon={MapPin}
              placeholder={km ? "ខេត្ត-រាជធានី" : "Province"}
              searchable={true}
              searchPlaceholder={km ? "ស្វែងរកខេត្ត..." : "Search..."}
            />
          </div>

          {/* Category */}
          <div className="md:w-44 lg:w-48">
            <CustomSelect
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              icon={Tag}
              placeholder={km ? "ប្រភេទ" : "Category"}
              searchable={false}
              align="right"
            />
          </div>
        </div>

        {/* 4. Single Primary Laterite Button */}
        <button
          type="submit"
          className="btn-primary min-h-[48px] px-6 text-body font-semibold w-full md:w-auto shrink-0 cursor-pointer"
        >
          <span>{km ? "ស្វែងរក" : "Search"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export { SearchBar };
