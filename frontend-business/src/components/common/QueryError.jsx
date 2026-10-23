import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export const QueryError = ({ onRetry, isRetrying = false, className = "" }) => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";

  return (
    <div
      role="alert"
      className={`rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-8 text-center ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="mt-4 font-extrabold text-stone-900 dark:text-white">
        {isKm ? "មិនអាចទាញយកទិន្នន័យបានទេ" : "Could not load this data"}
      </h3>
      <p className="mt-1.5 text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
        {isKm
          ? "សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។"
          : "Check your connection and try again."}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:text-forest"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
          {isKm ? "ព្យាយាមម្តងទៀត" : "Try again"}
        </button>
      ) : null}
    </div>
  );
};
