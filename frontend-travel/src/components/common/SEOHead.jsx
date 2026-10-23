import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

/**
 * Dynamic SEO Head Component
 * Supports OpenGraph (Telegram, Facebook), Twitter Cards, and Schema.org JSON-LD
 */
export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = "website",
  schema,
  keywords = []
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "km";
  const defaultSiteName = "CamGO Travel";

  const fullTitle = title 
    ? `${title} — ${defaultSiteName}` 
    : defaultSiteName;

  const defaultDescription = currentLang === "km"
    ? "ស្វែងយល់ពីព្រះរាជាណាចក្រអច្ឆរិយៈ៖ ប្រាសាទបុរាណអង្គរវត្ត កោះត្រូពិក ទឹកធ្លាក់ធម្មជាតិ និងវប្បធម៌ខ្មែរដ៏សម្បូរបែបនៅទូទាំង 25 ខេត្ត-រាជធានី។"
    : "Discover Cambodia's ancient Angkorian temples, tropical pristine islands, lush waterfalls, and rich Khmer heritage across all 25 provinces.";

  const metaDesc = description || defaultDescription;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const defaultImage = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
  const metaImage = image || defaultImage;

  const defaultKeywords = [
    "Cambodia Tourism",
    "ទេសចរណ៍កម្ពុជា",
    "Angkor Wat",
    "Siem Reap",
    "Koh Rong",
    "Phnom Penh",
    "Khmer Heritage",
    "Travel Guide Cambodia",
    ...keywords
  ].join(", ");

  return (
    <Helmet>
      {/* Basic HTML Meta */}
      <html lang={currentLang} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={defaultKeywords} />
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph (Facebook, Telegram, LinkedIn) */}
      <meta property="og:site_name" content={defaultSiteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {currentUrl && <meta property="og:url" content={currentUrl} />}
      <meta property="og:locale" content={currentLang === "km" ? "km_KH" : "en_US"} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* Structured Data (JSON-LD) for Search Engine Rich Snippets */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
export default SEOHead;
