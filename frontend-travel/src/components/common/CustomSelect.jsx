import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";

/**
 * CustomSelect Component — Angkor Sandstone & Khmer Architectural Style
 * - Responsive: Desktop floating menu (z-80) with smooth shadow + Mobile bottom sheet drawer
 * - Sizes: "sm" (40px), "md" (44px), "lg" (48px)
 * - Visual states: Carved sandstone look, active filter highlight (amber/laterite), focus rings
 * - Features: Optional icon, optional search, keyboard escape, outside click handling
 */
export const CustomSelect = ({
  value,
  onChange,
  options = [],
  icon: Icon,
  placeholder = "Select...",
  searchable = false,
  searchPlaceholder = "ស្វែងរក...",
  align = "left",
  size = "md", // "sm" | "md" | "lg"
  className = "",
  triggerClassName = "",
  menuClassName = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const dropdownRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
        return;
      }
      if (mobileDrawerRef.current && mobileDrawerRef.current.contains(e.target)) {
        return;
      }
      setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const isSelected = Boolean(value && value !== "" && value !== "all");
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = searchable && filterText.trim()
    ? options.filter((opt) => String(opt.label).toLowerCase().includes(filterText.toLowerCase()))
    : options;

  const sizeClasses = {
    sm: "min-h-[38px] h-[38px] text-xs px-3",
    md: "min-h-[44px] h-[44px] text-xs sm:text-sm px-3.5",
    lg: "min-h-[48px] h-[48px] text-sm sm:text-base px-4"
  }[size] || "min-h-[44px] h-[44px] text-xs sm:text-sm px-3.5";

  return (
    <div ref={dropdownRef} className={`relative min-w-0 ${isOpen ? "z-50" : "z-10"} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setFilterText("");
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-xl text-left cursor-pointer select-none font-km transition-all shadow-xs border ${
          isSelected
            ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-600/50 dark:border-amber-500/50 text-stone-900 dark:text-stone-100 font-semibold shadow-amber-500/5"
            : "bg-white dark:bg-stone-950/90 border-stone-300 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 hover:border-amber-600/50 dark:hover:border-amber-500/50 hover:bg-stone-50 dark:hover:bg-stone-900"
        } ${sizeClasses} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isSelected
                  ? "text-laterite-600 dark:text-laterite-400"
                  : "text-stone-500 dark:text-stone-400 group-hover:text-stone-800"
              }`}
            />
          )}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-600 dark:text-amber-400" : ""
          }`}
        />
      </button>

      {/* Mobile: Bottom Sheet Drawer */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="sm:hidden fixed inset-0 z-[110] flex flex-col justify-end pointer-events-auto">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={mobileDrawerRef}
            className="relative z-10 w-full max-h-[82dvh] flex flex-col bg-stone-50 dark:bg-stone-900 border-t border-stone-300 dark:border-stone-800 rounded-t-3xl shadow-2xl p-4 sm:p-5 space-y-3 overscroll-contain pb-[calc(24px+env(safe-area-inset-bottom,0px))] animate-slide-up"
          >
            {/* Drawer Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />}
                <span className="font-heading font-bold text-base text-stone-900 dark:text-stone-100 font-km">
                  {placeholder}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Search */}
            {searchable && options.length > 5 && (
              <div className="px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-950 flex items-center gap-2 focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/15 transition-all">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 border-none outline-none ring-0 focus:outline-none focus:ring-0 font-km no-focus-outline p-0"
                />
                {filterText && (
                  <button
                    type="button"
                    onClick={() => setFilterText("")}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto max-h-[55dvh] space-y-1.5 overscroll-contain pr-1 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 font-km">
                  រកមិនឃើញជម្រើសទេ / No options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isItemActive = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl text-left text-sm transition-all cursor-pointer min-h-[46px] ${
                        isItemActive
                          ? "bg-amber-500/15 dark:bg-amber-500/25 text-stone-900 dark:text-stone-100 font-bold border border-amber-600/40 dark:border-amber-500/50 shadow-xs"
                          : "text-stone-800 dark:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800/80 border border-transparent"
                      }`}
                    >
                      <span className="truncate font-km">{opt.label}</span>
                      {isItemActive && (
                        <Check className="w-4 h-4 text-laterite-600 dark:text-laterite-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Desktop / Tablet: Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`hidden sm:block absolute ${
            align === "right" ? "right-0 left-auto" : "left-0 right-auto"
          } top-full mt-2 z-[100] w-72 max-w-[calc(100vw-32px)] bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-700/90 rounded-2xl shadow-2xl backdrop-blur-md p-1.5 animate-fadeIn ${menuClassName}`}
        >
          {/* Desktop Search inside dropdown */}
          {searchable && options.length > 7 && (
            <div className="p-1.5 pb-2 mb-1 border-b border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-100/90 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/15 focus-within:bg-white dark:focus-within:bg-stone-950 transition-all">
                <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 border-none outline-none ring-0 focus:outline-none focus:ring-0 font-km no-focus-outline p-0"
                  autoFocus
                />
                {filterText && (
                  <button
                    type="button"
                    onClick={() => setFilterText("")}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto py-1 space-y-1 overscroll-contain pr-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500 font-km">
                រកមិនឃើញជម្រើសទេ
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isItemActive = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    role="option"
                    aria-selected={isItemActive}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-all cursor-pointer min-h-[40px] ${
                      isItemActive
                        ? "bg-amber-500/15 dark:bg-amber-500/25 text-stone-900 dark:text-stone-100 font-bold border border-amber-600/40 dark:border-amber-500/50 shadow-2xs"
                        : "text-stone-800 dark:text-stone-200 hover:bg-amber-500/10 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent"
                    }`}
                  >
                    <span className="truncate font-km">{opt.label}</span>
                    {isItemActive && (
                      <Check className="w-4 h-4 text-laterite-600 dark:text-laterite-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
