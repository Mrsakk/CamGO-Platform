const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const TRAVEL_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_TRAVEL_BASE_URL || "http://localhost:5173"
);

export const ADMIN_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_ADMIN_BASE_URL || "http://localhost:5176"
);

export const getTravelUrl = (path = "") => {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${TRAVEL_BASE_URL}${normalizedPath}`;
};
