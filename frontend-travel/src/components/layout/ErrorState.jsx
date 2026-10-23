import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * ErrorState Component - Angkor Sandstone & Bas-Relief
 * Raised stone panel: "what happened" + single "Try again" button.
 */
export const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an issue loading this information. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className = ""
}) => {
  return (
    <div
      className={`panel-raised rounded-card p-8 sm:p-10 text-center space-y-4 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-control bg-danger-600/10 border border-danger-600/20 flex items-center justify-center mx-auto text-danger-600">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold text-heading text-stone-900 dark:text-stone-100">
          {title}
        </h3>
        <p className="text-body text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary min-h-[44px] px-6 text-body font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{retryLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
