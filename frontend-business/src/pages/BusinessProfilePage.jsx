import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import {
  Star,
  MapPin,
  CheckCircle,
  Phone,
  Send,
  Mail,
  Globe,
  Share2,
  Clock,
  Compass,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import api from "@/lib/axios";
import { trackContactEvent } from "@/lib/trackEvent";
import { getTravelUrl } from "@/lib/urls";
import { getBusinessCover } from "@/lib/businessMedia";
import { LazyMap } from "@/components/common/LazyMap";

const formatServicePrice = (price, isKm) => {
  if (price === null || price === undefined) {
    return isKm ? "តម្លៃសាកសួរ" : "Price on request";
  }
  if (Number(price) === 0) {
    return isKm ? "ឥតគិតថ្លៃ" : "Free";
  }
  return `$${Number(price).toFixed(2)}`;
};

const formatServiceDuration = (minutes, isKm) => {
  if (!minutes) return null;
  if (minutes < 60) return isKm ? `${minutes} នាទី` : `${minutes} min`;
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!rest) return isKm ? `${hours} ម៉ោង` : `${hours} hr`;
    return isKm ? `${hours} ម៉ោង ${rest} នាទី` : `${hours} hr ${rest} min`;
  }
  const days = Math.floor(minutes / 1440);
  const restHours = Math.floor((minutes % 1440) / 60);
  if (!restHours) return isKm ? `${days} ថ្ងៃ` : `${days} day`;
  return isKm ? `${days} ថ្ងៃ ${restHours} ម៉ោង` : `${days} day ${restHours} hr`;
};

export const BusinessProfilePage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const isKm = i18n.language === "km";

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot detection
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Fetch business profile
  const {
    data: business,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public", "business", slug],
    queryFn: async () => {
      const res = await api.get(`/business/public/businesses/${slug}`);
      return res.data?.data || res.data;
    },
  });

  // Track page view event once loaded
  useQuery({
    queryKey: ["track", "profile_view", slug],
    queryFn: async () => {
      trackContactEvent(slug, "profile_view", "profile");
      return true;
    },
    enabled: Boolean(business?.slug),
    staleTime: Infinity,
  });

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post(`/business/public/businesses/${slug}/reviews`, payload);
    },
    onSuccess: () => {
      setReviewSubmitted(true);
      setReviewComment("");
      setReviewName("");
      setReviewError("");
    },
    onError: (err) => {
      setReviewError(
        err.response?.data?.message || (isKm ? "ការបញ្ជូនមតិបានបរាជ័យ" : "Failed to submit review")
      );
    },
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (reviewComment.trim().length < 10) {
      setReviewError(isKm ? "មតិយោបល់ត្រូវមានយ៉ាងតិច ១០ តួអក្សរ" : "Review must be at least 10 characters");
      return;
    }
    reviewMutation.mutate({
      display_name: reviewName.trim() || (isKm ? "ភ្ញៀវទេសចរ" : "Visitor"),
      rating: reviewRating,
      comment: reviewComment.trim(),
      locale: i18n.language,
      website_url: honeypot, // Honeypot
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {isKm ? "កំពុងផ្ទុកទិន្នន័យអាជីវកម្ម..." : "Loading business details..."}
        </p>
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-24 text-center">
        <Building className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600" />
        <h2 className="text-2xl font-bold text-ink dark:text-white">
          {isKm ? "រកមិនឃើញអាជីវកម្មនេះទេ" : "Business not found"}
        </h2>
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {isKm
            ? "អាជីវកម្មនេះប្រហែលជាត្រូវបានផ្អាក ឬផ្លាស់ប្តូរអាសយដ្ឋាន។"
            : "This business may have been suspended or the URL is incorrect."}
        </p>
        <Link to="/businesses" className="btn-primary">
          {t("nav.directory")}
        </Link>
      </div>
    );
  }

  const name = isKm ? business.name_km || business.name_en : business.name_en || business.name_km;
  const description = isKm ? business.description_km || business.description_en : business.description_en || business.description_km;
  const address = isKm ? business.address_km || business.address_en : business.address_en || business.address_km;
  const categoryName = isKm ? business.category?.name_km : business.category?.name_en;
  const provinceName = isKm ? business.province?.name_km : business.province?.name_en;

  const mediaList = Array.isArray(business.media) ? business.media : [];
  const contacts = Array.isArray(business.contacts) ? business.contacts : [];
  const services = Array.isArray(business.services) ? business.services : [];
  const servicePresetLabel = isKm
    ? business.category?.service_presets?.label_km
    : business.category?.service_presets?.label_en;
  const hours = Array.isArray(business.hours) ? business.hours : [];
  const reviews = Array.isArray(business.reviews)
    ? business.reviews
    : (Array.isArray(business.approved_reviews) ? business.approved_reviews : []);
  const nearbyDestinations = Array.isArray(business.nearby_destinations) ? business.nearby_destinations : [];

  // Primary contact
  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0] || null;
  const secondaryContacts = contacts.filter((c) => c !== primaryContact);

  const leadMessage = isKm
    ? `សួស្តី ${name}! ខ្ញុំបានឃើញព័ត៌មាន និងសេវាកម្មរបស់អ្នកនៅលើ CamGO ហើយចង់សាកសួរព័ត៌មានបន្ថែម។`
    : `Hello ${name}! I found your listing on CamGO and would like to inquire about your services.`;
  const encodedLead = encodeURIComponent(leadMessage);

  const getContactUrl = (contact) => {
    if (contact.type === "phone") return `tel:${contact.value}`;
    if (contact.type === "telegram") {
      const val = contact.value.replace("@", "");
      if (val.startsWith("http")) {
        return val.includes("?") ? `${val}&text=${encodedLead}` : `${val}?text=${encodedLead}`;
      }
      return `https://t.me/${val}?text=${encodedLead}`;
    }
    if (contact.type === "whatsapp") {
      const clean = contact.value.replace(/[^0-9]/g, "");
      return `https://wa.me/${clean}?text=${encodedLead}`;
    }
    if (contact.type === "email") return `mailto:${contact.value}`;
    if (contact.type === "messenger") {
      return contact.value.startsWith("http") ? contact.value : `https://m.me/${contact.value}`;
    }
    return contact.value;
  };

  const handleContactClick = (channel) => {
    trackContactEvent(business.slug, channel, "profile");
  };

  const currentWeekday = new Date().getDay(); // 0 is Sunday

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: name,
    description: description,
    image: getBusinessCover(business),
    telephone: primaryContact?.type === "phone" ? primaryContact.value : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressRegion: provinceName,
      addressCountry: "KH",
    },
    geo: business.lat && business.lng ? {
      "@type": "GeoCoordinates",
      latitude: business.lat,
      longitude: business.lng,
    } : undefined,
    priceRange: business.price_level ? "$".repeat(business.price_level) : "$$",
    aggregateRating: business.rating_avg ? {
      "@type": "AggregateRating",
      ratingValue: business.rating_avg,
      reviewCount: business.rating_count || 1,
    } : undefined,
  };

  return (
    <div className="mx-auto max-w-content space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Helmet SEO */}
      <Helmet>
        <title>{`${name} | CamGO Business`}</title>
        <meta name="description" content={description ? description.slice(0, 160) : name} />
        <meta property="og:title" content={`${name} - CamGO Business`} />
        <meta property="og:description" content={description ? description.slice(0, 160) : name} />
        <meta property="og:image" content={getBusinessCover(business, "url_800")} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted">
        <Link to="/" className="transition hover:text-forest dark:hover:text-white">{t("nav.home")}</Link>
        <span className="text-sage-deep">/</span>
        <Link to="/businesses" className="transition hover:text-forest dark:hover:text-white">{t("nav.directory")}</Link>
        <span className="text-sage-deep">/</span>
        <span className="max-w-xs truncate font-medium text-forest dark:text-slate-300">{name}</span>
      </nav>

      {/* Main Business Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {categoryName && (
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
              {categoryName}
            </span>
          )}
          {Boolean(business.is_featured || business.tier === "featured") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-white">
              <Sparkles className="h-3 w-3" />
              {isKm ? "ពិសេស" : "Featured"}
            </span>
          )}
          {business.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-forest-dark shadow-gold">
              <CheckCircle className="h-3 w-3" />
              {t("business.verified")}
            </span>
          )}
          {business.open_now !== undefined && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                business.open_now
                  ? "border border-brand-200 bg-cream text-forest dark:border-white/10 dark:bg-white/5 dark:text-brand-300"
                  : "border border-line bg-stone-200 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${business.open_now ? "bg-brand-600" : "bg-stone-400"}`} />
              {business.open_now ? t("business.open_now") : t("business.closed_now")}
            </span>
          )}
        </div>

        <h1 className="max-w-4xl text-forest dark:text-white">
          {name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted dark:text-slate-400 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
            <span className="font-semibold text-forest dark:text-white">
              {business.rating_avg
                ? Number(business.rating_avg).toFixed(1)
                : isKm
                ? "ថ្មី"
                : "New"}
            </span>
            <span>({t("business.reviews_count", { count: business.rating_count || 0 })})</span>
          </div>

          <span className="text-stone-300 dark:text-stone-700">•</span>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand-600" />
            <span>{provinceName}</span>
          </div>

          {business.price_level && (
            <>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {"$".repeat(business.price_level)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-stone-100 shadow-premium dark:border-white/10 dark:bg-stone-800 sm:aspect-[16/9] lg:aspect-[21/9]">
          <img
            src={mediaList[activeImageIndex]?.url || getBusinessCover(business)}
            alt={
              isKm
                ? business.cover_image?.alt_km || name
                : business.cover_image?.alt_en || name
            }
            className="w-full h-full object-cover"
          />

          {mediaList.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1))
                }
                className="pointer-events-auto rounded-full bg-black/45 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/65"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0))
                }
                className="pointer-events-auto rounded-full bg-black/45 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/65"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {mediaList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {mediaList.map((m, idx) => (
              <button
                key={m.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-control border-2 transition ${
                  activeImageIndex === idx
                    ? "border-brand-600 dark:border-brand-400"
                    : "border-transparent opacity-55 hover:opacity-100"
                }`}
              >
                <img src={m.thumb_url || m.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout: Main Details vs Direct Contact Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description, Hours, Map, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {description && (
            <div className="surface space-y-4 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-forest dark:text-white">
                {isKm ? "ព័ត៌មានលម្អិត" : "About This Place"}
              </h2>
              <p className="text-sm leading-relaxed text-muted dark:text-stone-300 whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Services & Pricing */}
          {services.length > 0 && (
            <div className="surface space-y-5 p-6 sm:p-8">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest dark:text-white">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  {isKm ? "សេវាកម្ម និងតម្លៃ" : "Services & pricing"}
                </h2>
                {servicePresetLabel && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted dark:text-slate-400">
                    {servicePresetLabel}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const serviceName = isKm
                    ? service.name_km || service.name_en
                    : service.name_en || service.name_km;
                  const serviceDescription = isKm
                    ? service.description_km || service.description_en
                    : service.description_en || service.description_km;
                  const duration = formatServiceDuration(
                    service.duration_minutes,
                    isKm
                  );

                  return (
                    <div
                      key={service.id}
                      className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-cream p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-forest dark:text-white">
                          {serviceName}
                        </h3>
                        <span className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
                          {formatServicePrice(service.price_usd, isKm)}
                        </span>
                      </div>

                      {serviceDescription && (
                        <p className="text-xs leading-relaxed text-muted dark:text-slate-400 whitespace-pre-line">
                          {serviceDescription}
                        </p>
                      )}

                      {duration && (
                        <div className="mt-auto flex items-center gap-1.5 text-[11px] font-medium text-muted dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {duration}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Opening Hours Schedule */}
          {hours.length > 0 && (
            <div className="surface space-y-5 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest dark:text-white">
                <Clock className="w-5 h-5 text-brand-600" />
                {t("business.opening_hours")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {[
                  { day: 1, name: isKm ? "ច័ន្ទ" : "Monday" },
                  { day: 2, name: isKm ? "អង្គារ" : "Tuesday" },
                  { day: 3, name: isKm ? "ពុធ" : "Wednesday" },
                  { day: 4, name: isKm ? "ព្រហស្បតិ៍" : "Thursday" },
                  { day: 5, name: isKm ? "សុក្រ" : "Friday" },
                  { day: 6, name: isKm ? "សៅរ៍" : "Saturday" },
                  { day: 0, name: isKm ? "អាទិត្យ" : "Sunday" },
                ].map((item) => {
                  const dayHours = hours.filter((h) => h.weekday === item.day);
                  const isToday = currentWeekday === item.day;

                  return (
                    <div
                      key={item.day}
                      className={`flex items-center justify-between rounded-full px-4 py-2.5 ${
                        isToday
                          ? "border border-brand-200 bg-brand-50 font-semibold text-forest dark:border-white/10 dark:bg-white/5 dark:text-white"
                          : "text-muted dark:text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {item.name}
                        {isToday && (
                          <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400">
                            ({t("business.today")})
                          </span>
                        )}
                      </span>

                      <span>
                        {dayHours.length === 0 || dayHours[0].is_closed
                          ? (isKm ? "បិទ" : "Closed")
                          : dayHours
                              .map((h) => `${h.opens_at?.slice(0, 5)} - ${h.closes_at?.slice(0, 5)}`)
                              .join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location & On-demand Map */}
          <div className="surface space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest dark:text-white">
                <MapPin className="w-5 h-5 text-brand-600" />
                {t("business.location")}
              </h2>

              {business.lat && business.lng && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleContactClick("directions")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>{t("business.get_directions")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <p className="text-sm text-muted dark:text-stone-300">
              {address}
            </p>

            {/* On demand map */}
            {business.lat && business.lng && (
              <div>
                {!showMap ? (
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="btn-secondary w-full"
                  >
                    <Compass className="h-4 w-4" />
                    <span>{isKm ? "បង្ហាញផែនទីទីតាំង" : "Show Location on Map"}</span>
                  </button>
                ) : (
                  <LazyMap
                    businesses={[business]}
                    center={[parseFloat(business.lat), parseFloat(business.lng)]}
                    zoom={15}
                    height="320px"
                  />
                )}
              </div>
            )}
          </div>

          {/* Nearby Destinations Section */}
          {nearbyDestinations.length > 0 && (
            <div className="surface space-y-5 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest dark:text-white">
                <Compass className="w-5 h-5 text-brand-600" />
                {t("business.nearby_destinations")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyDestinations.map((dest) => (
                  <a
                    key={dest.id}
                    href={getTravelUrl(`/destinations/${dest.slug}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-brand-100 bg-cream p-4 transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/5"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-forest transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                        {isKm ? dest.name_km : dest.name_en}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {t("business.km_away", { distance: dest.distance_km || 1 })}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-brand-500 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reviews List & Submission Form */}
          <div className="surface space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-brand-100 pb-4 dark:border-white/10">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-forest dark:text-white">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                {t("business.reviews_title")}
              </h2>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
                {reviews.length} {isKm ? "ការវាយតម្លៃ" : "reviews"}
              </span>
            </div>

            {/* Existing Reviews */}
            {reviews.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted dark:text-slate-400">
                {t("business.empty_reviews")}
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="space-y-2 border-b border-brand-100 pb-4 last:border-0 last:pb-0 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-forest dark:text-white">
                        {rev.display_name}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? "fill-yellow-500 text-yellow-500" : "text-stone-300 dark:text-stone-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted dark:text-stone-300 whitespace-pre-wrap">
                      {rev.comment}
                    </p>
                    <div className="text-[11px] text-muted dark:text-slate-500">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Review Submission Form */}
            <div className="space-y-4 border-t border-brand-100 pt-6 dark:border-white/10">
              <h3 className="text-base font-semibold text-forest dark:text-white">
                {t("business.review_form.title")}
              </h3>

              {reviewSubmitted ? (
                <div className="flex items-start gap-2 rounded-2xl border border-brand-300/40 bg-brand-50 p-4 text-xs text-brand-800 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t("business.review_form.success")}</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                      {reviewError}
                    </div>
                  )}

                  {/* Honeypot hidden input for spam protection */}
                  <div style={{ display: "none" }} aria-hidden="true">
                    <input
                      type="text"
                      name="website_url"
                      tabIndex="-1"
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-forest dark:text-slate-300">
                        {t("business.review_form.name_label")}
                      </label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="John Doe"
                        className="field"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-forest dark:text-slate-300">
                        {t("business.review_form.rating_label")}
                      </label>
                      <div className="flex items-center gap-1.5 h-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-stone-300 hover:text-yellow-500 transition"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewRating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-stone-300 dark:text-stone-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-forest dark:text-slate-300">
                      {t("business.review_form.comment_label")}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={isKm ? "សូមចែករំលែកបទពិសោធន៍ផ្ទាល់របស់អ្នក..." : "Share your experience..."}
                      className="field"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewMutation.isPending}
                    className="btn-primary"
                  >
                    {reviewMutation.isPending ? "Submitting..." : t("business.review_form.submit")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Direct Contact Channels Card (Sticky on desktop) */}
        <div className="space-y-6">
          <div className="surface sticky top-20 space-y-6 p-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-sage px-3 py-1 text-xs font-semibold text-forest dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isKm ? "ទំនាក់ទំនងផ្ទាល់ ០%" : "Direct contact · 0% fee"}</span>
              </div>
              <h2 className="text-2xl font-semibold text-forest dark:text-white">
                {t("business.contact_info")}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted dark:text-slate-400">
                {isKm
                  ? "ទាក់ទងផ្ទាល់ជាមួយម្ចាស់អាជីវកម្មដើម្បីសាកសួរព័ត៌មាន ឬកក់បន្ទប់ដោយគ្មានឈ្មួញកណ្តាល។"
                  : "Connect directly with this business via call or chat with zero commission."}
              </p>
            </div>

            {primaryContact && (
              <a
                href={getContactUrl(primaryContact)}
                target={primaryContact.type === "phone" ? "_self" : "_blank"}
                rel="noopener noreferrer"
                onClick={() => handleContactClick(primaryContact.type)}
                className="btn-primary w-full !min-h-[50px] !text-sm"
              >
                {primaryContact.type === "telegram" ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                <span>
                  {primaryContact.type === "telegram"
                    ? "Chat on Telegram"
                    : primaryContact.type === "phone"
                    ? (isKm ? "ហៅទូរស័ព្ទផ្ទាល់" : "Call Business Directly")
                    : primaryContact.label || "Contact"}
                </span>
              </a>
            )}

            {/* Secondary Contact Buttons */}
            {secondaryContacts.length > 0 && (
              <div className="space-y-2 border-t border-brand-100 pt-5 dark:border-white/10">
                <p className="eyebrow">
                  {isKm ? "បណ្តាញផ្សេងទៀត" : "Other channels"}
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {secondaryContacts.map((contact) => (
                    <a
                      key={contact.id}
                      href={getContactUrl(contact)}
                      target={contact.type === "phone" ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      onClick={() => handleContactClick(contact.type)}
                      className="flex items-center justify-between rounded-control border border-line bg-cream px-4 py-3 text-sm font-medium text-forest transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      <span className="flex items-center gap-2">
                        {contact.type === "telegram" && <Send className="w-4 h-4 text-sky-500" />}
                        {contact.type === "phone" && <Phone className="w-4 h-4 text-emerald-500" />}
                        {contact.type === "whatsapp" && <Phone className="w-4 h-4 text-emerald-500" />}
                        {contact.type === "email" && <Mail className="w-4 h-4 text-rose-500" />}
                        {contact.type === "messenger" && <Send className="w-4 h-4 text-blue-500" />}
                        {contact.type === "website" && <Globe className="w-4 h-4 text-brand-500" />}
                        <span className="capitalize">{contact.label || contact.type}</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Zero booking disclaimer */}
            <div className="border-l-2 border-brand-500 pl-3 text-xs leading-relaxed text-muted dark:text-slate-400">
              <span className="font-semibold text-forest dark:text-slate-300">
                {isKm ? "គ្មានការកក់លុយតាមប្រព័ន្ធ៖ " : "Direct interaction only: "}
              </span>
              {t("footer.no_booking_notice")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
