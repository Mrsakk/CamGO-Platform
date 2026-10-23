import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

export const Breadcrumbs = ({ items = [], showBack = true }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-small text-stone-500 dark:text-stone-400 py-2.5 px-4 rounded-2xl silk-glass border border-amber-500/20 w-fit max-w-full shadow-sm"
    >
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="mr-1 p-1 rounded-lg hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors cursor-pointer flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {i18n.language === "km" ? "ថយក្រោយ" : "Back"}
          </span>
        </button>
      )}

      {showBack && items.length > 0 && (
        <span className="text-amber-500/40">|</span>
      )}

      <Link
        to="/"
        className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-amber-500/40 shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-stone-900 dark:text-amber-300 truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
