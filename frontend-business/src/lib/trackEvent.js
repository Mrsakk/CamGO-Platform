/**
 * Tracks a business contact event without blocking the user interaction.
 * Uses navigator.sendBeacon when available with JSON blob, falls back to non-blocking fetch.
 * 
 * @param {string} slug - Business slug
 * @param {string} channel - 'phone' | 'telegram' | 'whatsapp' | 'messenger' | 'email' | 'website' | 'directions'
 * @param {string} source - 'list' | 'profile' | 'nearby'
 */
export const trackContactEvent = (slug, channel, source = "profile") => {
  if (!slug || !channel) return;

  const endpoint = `/api/v1/business/public/businesses/${slug}/events`;
  const payload = JSON.stringify({
    channel,
    source,
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }
  } catch (e) {
    // Silent catch, fallback below
  }

  // Non-blocking fetch fallback
  try {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Never block on tracking failure
    });
  } catch (err) {
    // Ignore error
  }
};
