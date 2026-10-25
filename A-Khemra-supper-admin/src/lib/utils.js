import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatPrice(usdVal, lang = "km") {
  const usd = Number(usdVal) || 0;
  if (usd === 0) {
    return lang === "km" ? "\u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3" : "Free";
  }
  if (lang === "km") {
    const riel = Math.round(usd * 4100).toLocaleString("en-US");
    return `$${usd.toFixed(0)} (${riel} \u179A\u17C0\u179B)`;
  }
  return `$${usd.toFixed(0)} USD`;
}
function getImageUrl(path, fallback = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80") {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const storageBase =
    import.meta.env.VITE_STORAGE_URL ||
    (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "") : "") ||
    "https://backend-api-two-theta.vercel.app";
  return `${storageBase}${path.startsWith("/") ? path : "/" + path}`;
}
function truncate(text, length = 100) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + "...";
}
export {
  cn,
  formatPrice,
  getImageUrl,
  truncate
};
