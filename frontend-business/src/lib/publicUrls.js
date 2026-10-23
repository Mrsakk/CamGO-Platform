const fallbackBase =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5175";
const publicBusinessBase = (
  import.meta.env.VITE_PUBLIC_BUSINESS_URL || fallbackBase
).replace(/\/$/, "");

export const getPublicBusinessUrl = (slug) =>
  slug ? `${publicBusinessBase}/b/${slug}` : null;
