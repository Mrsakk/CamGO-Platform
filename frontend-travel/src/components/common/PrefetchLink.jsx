import React, { useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

// Max 3 concurrent network prefetches to preserve bandwidth
let activePrefetches = 0;
const MAX_CONCURRENT = 3;

/**
 * Checks if the user has data saver enabled or is on a 2G connection
 */
function shouldSkipPrefetch() {
  if (typeof navigator === "undefined") return false;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return false;
  return conn.saveData === true || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g";
}

/**
 * Facebook-style smart prefetch link.
 * Starts downloading both the target route's JS code chunk and its API query
 * the moment the user hovers (desktop) or touches (mobile).
 */
export function PrefetchLink({
  to,
  prefetchData,
  prefetchChunk,
  prefetchOnView = false,
  className = "",
  children,
  ...props
}) {
  const linkRef = useRef(null);
  const hasPrefetched = useRef(false);
  const timerRef = useRef(null);

  const triggerPrefetch = useCallback(() => {
    if (hasPrefetched.current || shouldSkipPrefetch()) return;
    if (activePrefetches >= MAX_CONCURRENT) return;

    hasPrefetched.current = true;
    activePrefetches++;

    const promises = [];
    if (typeof prefetchChunk === "function") {
      try {
        promises.push(prefetchChunk());
      } catch (e) {
        // silent
      }
    }
    if (typeof prefetchData === "function") {
      try {
        promises.push(prefetchData());
      } catch (e) {
        // silent
      }
    }

    Promise.allSettled(promises).finally(() => {
      activePrefetches = Math.max(0, activePrefetches - 1);
    });
  }, [prefetchChunk, prefetchData]);

  // Viewport-based prefetching for mobile feeds (triggered after resting 300ms in view)
  useEffect(() => {
    if (!prefetchOnView || hasPrefetched.current || shouldSkipPrefetch()) return;
    const el = linkRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          timerRef.current = setTimeout(() => {
            triggerPrefetch();
          }, 300);
        } else {
          if (timerRef.current) clearTimeout(timerRef.current);
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [prefetchOnView, triggerPrefetch]);

  return (
    <Link
      ref={linkRef}
      to={to}
      className={className}
      onPointerEnter={triggerPrefetch}
      onTouchStart={triggerPrefetch}
      {...props}
    >
      {children}
    </Link>
  );
}

export default PrefetchLink;
