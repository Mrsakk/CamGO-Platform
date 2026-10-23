import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Search, Check, Plus, X } from "lucide-react";
import { destinationsApi } from "@/lib/api/destinations";
import { toast } from "@/store/toastStore";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

export const SelectDestinationModal = ({
  isOpen,
  onClose,
  onSelect,
  dayNum = 1,
  defaultProvince = ""
}) => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(() => {
      destinationsApi
        .getAll({
          search: search.trim() || undefined,
          per_page: 25
        })
        .then((res) => {
          if (!isMounted) return;
          const items = res.data?.items || res.data || [];
          setDestinations(Array.isArray(items) ? items : []);
        })
        .catch(() => {
          if (isMounted) toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleAddDestination = (dest) => {
    onSelect(dest);
    setAddedIds((prev) => [...prev, dest.id]);
    toast.success(
      km
        ? `បានបញ្ចូល "${dest.name_km || dest.name_en}" ទៅថ្ងៃទី ${toKm(dayNum)}!`
        : `Added "${dest.name_en || dest.name_km}" to Day ${dayNum}!`
    );
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden">
        {/* Ambient Modal Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-laterite-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-laterite-600/10 text-laterite-600 dark:text-amber-400 text-xs font-bold mb-1.5 font-khmer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{km ? `កាលវិភាគថ្ងៃទី ${toKm(dayNum)}` : `Day ${dayNum} Schedule`}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-stone-950 dark:text-white tracking-tight">
              {km ? `ជ្រើសរើសទីកន្លែងសម្រាប់ ថ្ងៃទី ${toKm(dayNum)}` : `Select Sights for Day ${dayNum}`}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans mt-0.5">
              {km
                ? "ស្វែងរក និងចុច [ + ថែម ] ដើម្បីបញ្ចូលក្នុងកាលវិភាគប្រចាំថ្ងៃ"
                : "Search database and click [ + Add ] to include in itinerary"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative z-10 p-3.5 sm:p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-laterite-600 dark:text-laterite-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                km
                  ? "ស្វែងរកឈ្មោះប្រាសាទ កោះ ឆ្នេរ ទឹកធ្លាក់ (ឧ. អង្គរវត្ត, កោះរ៉ុង, បូកគោ)..."
                  : "Search temples, islands, waterfalls (e.g. Angkor, Koh Rong)..."
              }
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 w-5 h-5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Destinations List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar max-h-[55vh]">
          {loading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ) : destinations.length > 0 ? (
            destinations.map((dest) => {
              const isAdded = addedIds.includes(dest.id);
              const name = km && dest.name_km ? dest.name_km : dest.name_en;
              const secondaryName = km ? dest.name_en : dest.name_km;
              const provinceName = dest.province
                ? km && dest.province.name_km
                  ? dest.province.name_km
                  : dest.province.name_en
                : null;
              const coverImg =
                dest.cover_image ||
                dest.primary_image?.image_url ||
                "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80";

              return (
                <div
                  key={dest.id}
                  className="flex items-center justify-between gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/70 border border-stone-200/90 dark:border-stone-800 transition-all hover:border-laterite-500/50 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={coverImg}
                      alt={name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-laterite-600 dark:text-laterite-400 uppercase tracking-wider">
                        {provinceName && <span>{provinceName}</span>}
                        {dest.avg_rating > 0 && (
                          <span className="font-mono text-stone-500 dark:text-stone-400">
                            • ★ {Number(dest.avg_rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-heading font-black text-stone-950 dark:text-white tracking-tight truncate mt-0.5">
                        {name}
                      </h4>
                      {secondaryName && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-sans truncate mt-0.5">
                          {secondaryName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={() => handleAddDestination(dest)}
                    disabled={isAdded}
                    className={`h-10 px-4 rounded-xl text-xs font-sans font-bold uppercase transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isAdded
                        ? "bg-moss-700 text-white cursor-default"
                        : "bg-laterite-600 hover:bg-laterite-700 text-white shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{km ? "បានបញ្ចូល" : "Added"}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{km ? `ថែមថ្ងៃ ${toKm(dayNum)}` : `Add Day ${dayNum}`}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-stone-500">
              <p className="text-sm font-medium">
                {km ? "រកមិនឃើញរមណីយដ្ឋានត្រូវនឹងការស្វែងរកទេ" : "No sights found matching your search"}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
            {km ? `បានជ្រើសរើស ${toKm(addedIds.length)} ទីកន្លែង` : `${addedIds.length} sights added`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            {km ? "រួចរាល់" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};

export default SelectDestinationModal;
