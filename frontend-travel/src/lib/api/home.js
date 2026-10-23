/**
 * home.js – Home aggregated query definition using native fetch().
 *
 * Uses fetch() with the same URL so it can reuse the resource loaded via:
 * <link rel="preload" href="/api/v1/home" as="fetch" crossorigin="anonymous">
 */

export const HOME_QUERY_KEY = ["home", "v1"];

/**
 * Native fetch handler for the aggregated home payload.
 * Runs against same-origin /api/v1/home (proxied by Nginx/Vite).
 */
export async function fetchHome() {
  const response = await fetch("/api/v1/home", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch home payload: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.data;
}

export const homeQuery = {
  queryKey: HOME_QUERY_KEY,
  queryFn: fetchHome,
};

export default homeQuery;
