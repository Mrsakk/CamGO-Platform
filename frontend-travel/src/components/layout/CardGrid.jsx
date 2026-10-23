/**
 * CardGrid Component
 * Consistent responsive grid adhering to layout rules:
 * - 4 columns desktop / 2 tablet / 1 mobile for destinations, categories, provinces
 * - 3 columns desktop / 2 tablet / 1 mobile for blog, events, and reviews
 * - 8px scale gap: 24px (gap-6)
 */
export const CardGrid = ({
  children,
  cols = 4,
  className = ""
}) => {
  const colClass =
    cols === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : cols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${colClass} gap-6 ${className}`}>
      {children}
    </div>
  );
};
