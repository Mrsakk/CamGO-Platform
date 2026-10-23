import React from "react";

/**
 * CornerOrnament - Tiny carved stone corner details only on the hero image and modal.
 * Subtle, low-relief geometric right-angle stepped carving.
 */
export default function CornerOrnament({
  position = "top-left", // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className = "",
  size = 14,
}) {
  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-1 right-1 rotate-90";
      case "bottom-right":
        return "bottom-1 right-1 rotate-180";
      case "bottom-left":
        return "bottom-1 left-1 -rotate-90";
      case "top-left":
      default:
        return "top-1 left-1";
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none z-10 text-stone-500/80 dark:text-stone-400/80 ${getPositionClasses()} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stepped carved temple bracket */}
        <path
          d="M 1 15 V 1 H 15 M 5 11 V 5 H 11"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="square"
          fill="none"
        />
        <rect x="2" y="2" width="2" height="2" fill="currentColor" />
      </svg>
    </div>
  );
}

export { CornerOrnament };
