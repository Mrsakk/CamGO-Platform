import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a fast-changing value (e.g. search input).
 * Reduces unneeded API calls and re-renders while typing.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
