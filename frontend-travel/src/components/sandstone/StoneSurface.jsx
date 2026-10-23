import React from "react";

/**
 * StoneSurface - Surface component for Angkor Sandstone.
 * Can serve as a page container with faint stone grain (SVG noise <= 4%)
 * or as a raised carved panel.
 */
export default function StoneSurface({
  children,
  variant = "panel", // 'page' | 'panel' | 'card' | 'recessed'
  className = "",
  as: Component = "div",
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "page":
        return "stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100";
      case "card":
        return "panel-raised panel-raised-hover bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100";
      case "recessed":
        return "input-carved bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100";
      case "panel":
      default:
        return "panel-raised bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100";
    }
  };

  return (
    <Component className={`${getVariantStyles()} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export { StoneSurface };
