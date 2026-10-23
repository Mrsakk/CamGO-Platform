import React from "react";
import CornerOrnament from "./CornerOrnament";

/**
 * LintelFrame - Temple frame moulding with stepped double border
 * (outer thin line, 4px gap, inner thin line) inspired by Angkor temple lintels.
 * Used on key focal panels: Hero photo, Destination detail hero, or Modals.
 */
export default function LintelFrame({
  children,
  className = "",
  innerClassName = "",
  withCorners = false,
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`relative p-1 rounded-card bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 shadow-raise ${className}`}
      {...props}
    >
      {/* Corner Ornaments if requested (Hero and Modal only) */}
      {withCorners && (
        <>
          <CornerOrnament position="top-left" />
          <CornerOrnament position="top-right" />
          <CornerOrnament position="bottom-left" />
          <CornerOrnament position="bottom-right" />
        </>
      )}

      {/* Stepped inner border frame */}
      <div
        className={`relative w-full h-full rounded-[12px] border border-stone-300/80 dark:border-stone-800 overflow-hidden ${innerClassName}`}
      >
        {children}
      </div>
    </Component>
  );
}

export { LintelFrame };
