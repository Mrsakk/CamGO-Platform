import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

/**
 * EmptyState Component - Angkor Sandstone & Bas-Relief
 * Raised stone panel: icon + short title + description + single clear action button.
 */
export const EmptyState = ({
  icon: Icon = Compass,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  className = ""
}) => {
  return (
    <div
      className={`panel-raised rounded-card p-8 sm:p-10 text-center space-y-4 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-control bg-stone-200/80 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-600 dark:text-stone-300">
        <Icon className="w-6 h-6 text-stone-500 dark:text-stone-400" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold text-heading text-stone-900 dark:text-stone-100">
          {title}
        </h3>
        {description && (
          <p className="text-body text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && (actionTo || onAction) && (
        <div className="pt-2">
          {actionTo ? (
            <Link to={actionTo} className="btn-primary min-h-[44px] px-6 text-body">
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button type="button" onClick={onAction} className="btn-primary min-h-[44px] px-6 text-body">
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
