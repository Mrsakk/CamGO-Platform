const publicBusinessBase = (import.meta.env.VITE_PUBLIC_BUSINESS_URL || "http://localhost:5175").replace(/\/$/, "");

export const getPublicBusinessUrl = (slug) =>
  slug ? `${publicBusinessBase}/b/${slug}` : null;
