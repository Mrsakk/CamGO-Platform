export const DEFAULT_BUSINESS_IMAGE = "/images/hero-angkor-watercolor.jpg";

export const getBusinessCover = (business, size = "url") => {
  if (!business) return DEFAULT_BUSINESS_IMAGE;

  const image = business.cover_image;
  if (image && typeof image === "object") {
    return image[size] || image.url || image.url_800 || image.url_400 || null;
  }

  if (typeof image === "string") return image;

  return business.cover_url || DEFAULT_BUSINESS_IMAGE;
};
