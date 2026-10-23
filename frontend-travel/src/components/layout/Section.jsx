import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Section Component - Angkor Sandstone & Bas-Relief
 * Standard layout section with 8px-scale vertical rhythm.
 * Gap: 48px mobile (my-12), 80-96px desktop (lg:my-20)
 */
export const Section = ({
  children,
  className = "",
  id,
  as: Component = "section"
}) => {
  return (
    <Component id={id} className={`w-full space-y-4 sm:space-y-6 my-12 lg:my-20 ${className}`}>
      {children}
    </Component>
  );
};

/**
 * SectionHead Component
 * Standard section title with single clear "View all" stone tablet link.
 */
export const SectionHead = ({
  title,
  subtitle,
  linkTo,
  linkLabel,
  children,
  className = ""
}) => {
  return (
    <div className={`relative pb-3 sm:pb-4 border-b border-stone-200 dark:border-stone-800 ${className}`}>
      <div className="flex items-end justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h2 className="text-heading font-bold text-stone-900 dark:text-stone-100 truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-small text-stone-600 dark:text-stone-400 max-w-prose truncate sm:whitespace-normal">
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="hidden sm:block flex-1 sm:px-4">
            {children}
          </div>
        )}

        {linkTo && (
          <Link
            to={linkTo}
            className="chip-tablet shrink-0 text-small font-semibold hover:border-laterite-600 hover:text-laterite-600"
          >
            <span>{linkLabel || "View all"}</span>
            <ArrowRight className="hidden sm:inline w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
