import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useRotation, pickRotated } from "@/lib/rotate";
import {
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Share2,
  Heart,
  Navigation,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Camera,
  X,
  Compass,
  Star,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Shirt,
  Coins,
  Sun,
  Eye,
  ArrowUpRight,
  BookOpen
} from "lucide-react";
import { RatingStars } from "@/components/common/RatingStars";
import { MapOnDemand } from "@/components/common/MapOnDemand";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationQuickViewModal } from "@/components/destinations/DestinationQuickViewModal";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { SwipeRow } from "@/components/layout/SwipeRow";
import { SectionHead } from "@/components/layout/Section";
import { LintelFrame } from "@/components/sandstone";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { destinationsApi } from "@/lib/api/destinations";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { SEOHead } from "@/components/common/SEOHead";
import { AddToPlanModal } from "@/components/planner/AddToPlanModal";
import { getImageUrl } from "@/lib/utils";
import { ShareModal } from "@/components/common/ShareModal";

const toKm = (n) => String(n ?? 0);

const DestinationDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const [destination, setDestination] = useState(null);
  const [relatedDestinations, setRelatedDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [quickViewDest, setQuickViewDest] = useState(null);
  const [addToPlanModalOpen, setAddToPlanModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Rotation engine per-navigation for nearby/related places
  const { seed, seen } = useRotation();

  // Pick 4 rotated nearby places excluding current destination
  const rotatedRelatedPlaces = useMemo(() => {
    if (!relatedDestinations || relatedDestinations.length === 0) return [];
    return pickRotated(relatedDestinations, 4, {
      seed,
      seen,
      kind: "dest",
      exclude: new Set([destination?.id].filter(Boolean)),
    });
  }, [relatedDestinations, destination?.id, seed, seen]);

  const fetchDestination = async () => {
    if (!slug) return;
    try {
      setIsLoading(true);
      const res = await destinationsApi.getBySlug(slug);
      const destData = res.data?.destination || res.data?.item || res.data;
      if (destData) {
        setDestination(destData);
        if (destData.province_id) {
          destinationsApi.getAll({ province_id: destData.province_id, per_page: 6 }).then((relRes) => {
            const relItems = relRes.data?.items || relRes.data || [];
            if (Array.isArray(relItems)) {
              setRelatedDestinations(relItems.filter((d) => d.id !== destData.id));
            }
          });
        }
      }
    } catch {
      toast.error(t("common.error_occurred", "Failed to load destination"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (isLoading || !destination) {
    return (
      <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-6 w-56 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-12 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="aspect-[16/9] sm:aspect-[21/9] bg-stone-200 dark:bg-stone-800 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-stone-200 dark:bg-stone-800 rounded-3xl" />
      </div>
    );
  }

  const name = km && destination.name_km ? destination.name_km : destination.name_en;
  const secondaryName = km ? destination.name_en : destination.name_km;
  const description = km && destination.description_km ? destination.description_km : destination.description_en;
  const excerpt = km && destination.excerpt_km ? destination.excerpt_km : destination.excerpt_en;

  const provinceName = destination.province
    ? km && destination.province.name_km
      ? destination.province.name_km
      : destination.province.name_en
    : null;

  const categoryName = destination.category
    ? km && destination.category.name_km
      ? destination.category.name_km
      : destination.category.name_en
    : null;

  const isFav = isFavorite(destination.id);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast.info(t("auth.login_required", "Please log in to save favorites"));
      navigate("/login");
      return;
    }
    await toggleFavorite(destination.id);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  // Compile rich images gallery
  const allImages = [];
  if (destination.cover_image) allImages.push(getImageUrl(destination.cover_image));
  if (Array.isArray(destination.images) && destination.images.length > 0) {
    destination.images.forEach((img) => {
      const url = typeof img === "string" ? img : (img.image_url || img.image_path);
      if (url) {
        const resolved = getImageUrl(url);
        if (!allImages.includes(resolved)) allImages.push(resolved);
      }
    });
  }
  if (allImages.length === 0) {
    allImages.push("https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80");
  }

  // Bilingual Field Resolvers
  const openingHours = km && destination.opening_hours_km
    ? destination.opening_hours_km
    : (destination.opening_hours_en || destination.opening_hours || (km ? "7:00 ព្រឹក - 5:30 ល្ងាច" : "7:00 AM - 5:30 PM"));

  const entryFee = destination.is_free
    ? (km ? "ឥតគិតថ្លៃ" : "Free Admission")
    : (km && destination.entrance_fee_km
      ? destination.entrance_fee_km
      : (destination.entrance_fee_en || (destination.entrance_fee_usd ? `$${destination.entrance_fee_usd} USD` : (km ? "សំបុត្រទស្សនាអង្គរ" : "Angkor Pass Required"))));

  const bestTime = km && destination.best_time_km
    ? destination.best_time_km
    : (destination.best_time_en || destination.best_time_to_visit || (km ? "វិច្ឆិកា ដល់ កុម្ភៈ (រដូវរំហើយ)" : "Nov - Feb (Dry Season)"));

  const address = km && destination.address_km
    ? destination.address_km
    : (destination.address_en || provinceName);

  const howToGetThere = km && destination.how_to_get_there_km
    ? destination.how_to_get_there_km
    : destination.how_to_get_there_en;

  // Highlights resolution
  const rawHighlights = km
    ? (destination.highlights_km?.length ? destination.highlights_km : destination.highlights_en)
    : (destination.highlights_en?.length ? destination.highlights_en : destination.highlights_km);
  const highlights = Array.isArray(rawHighlights) && rawHighlights.length > 0
    ? rawHighlights
    : (Array.isArray(destination.features) ? destination.features : []);

  const myReview = destination.reviews?.find((r) => r.user_id === user?.id);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude || 13.4125},${destination.longitude || 103.867}`;
  const ratingScore = Number(destination.avg_rating > 0 ? destination.avg_rating : 5.0).toFixed(1);
  const reviewsCount = destination.reviews_count || (destination.reviews ? destination.reviews.length : 4);
  const viewCount = destination.view_count || 1280;

  return (
    <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-[calc(120px+env(safe-area-inset-bottom,0px))] lg:pb-24">
      <SEOHead
        title={`${name} | ${provinceName || "Cambodia"}`}
        description={excerpt || description?.slice(0, 160)}
        image={allImages[0]}
        type="place"
      />

      <PageContainer className="space-y-8">
        {/* =================================================================== */}
        {/* 1. BREADCRUMBS & TOP STATUS ROW                                     */}
        {/* =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80 dark:border-stone-800">
          <Breadcrumbs
            items={[
              { label: km ? "ទំព័រដើម" : "Home", to: "/" },
              { label: t("nav.destinations", "Destinations"), to: "/destinations" },
              ...(destination.province
                ? [{ label: provinceName, to: `/provinces/${destination.province.slug}` }]
                : []),
              { label: name }
            ]}
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {destination.is_featured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-bold font-sans uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{km ? "គោលដៅពិសេស" : "Featured Landmark"}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 text-xs font-mono font-bold border border-stone-200 dark:border-stone-700">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>{toKm(viewCount)} {km ? "ទស្សនា" : "views"}</span>
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. ANGKOR SANDSTONE DESTINATION HERO BANNER                         */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden space-y-4"
        >
          {/* Layered Ambient Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-laterite-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Rotating Rumduol Flower Watermark */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute -right-16 -top-16 opacity-[0.035] dark:opacity-[0.025] pointer-events-none select-none"
          >
            <RumduolFlower size={420} className="text-laterite-600" />
          </motion.div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">


              {categoryName && (
                <Link
                  to={`/categories/${destination.category?.slug}`}
                  className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-sans font-bold hover:border-laterite-600 transition-colors"
                >
                  {categoryName}
                </Link>
              )}

              {provinceName && (
                <Link
                  to={`/provinces/${destination.province?.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-sans font-bold hover:border-laterite-600 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-laterite-600" />
                  <span>{provinceName}</span>
                </Link>
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
              <div className="space-y-1 max-w-3xl">
                <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
                  {name}
                </h1>
                {secondaryName && (
                  <p className="font-sans text-base sm:text-lg text-stone-500 dark:text-stone-400">
                    {secondaryName}
                  </p>
                )}
              </div>

              {/* Quick Ratings & Review Count Pill */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="font-mono font-bold text-lg text-stone-900 dark:text-stone-100">
                    {ratingScore}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                    / 5.0 ({toKm(reviewsCount)} {km ? "ការវាយតម្លៃ" : "reviews"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 3. LUXURY EDITORIAL PHOTO MOSAIC GALLERY                            */}
        {/* =================================================================== */}
        <div className="w-full bg-stone-950 overflow-hidden rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 shadow-md">
          {allImages.length === 1 ? (
            // Single Hero View
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden group">
              <img
                src={allImages[0]}
                alt={name}
                loading="eager"
                fetchPriority="high"
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
                }}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-sans font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Maximize2 className="w-4 h-4" />
                <span>{km ? "ពង្រីកពេញអេក្រង់" : "View Fullscreen"}</span>
              </button>
            </div>
          ) : (
            // Multi-Photo Magazine Mosaic
            <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 sm:gap-2 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
              {/* Main Hero Photo (Left 8 Cols) */}
              <div
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="md:col-span-8 relative h-full overflow-hidden group cursor-pointer"
              >
                <img
                  src={allImages[0]}
                  alt={name}
                  loading="eager"
                  fetchPriority="high"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
                  }}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-stone-950/70 backdrop-blur-md text-white text-xs font-sans uppercase font-bold border border-white/10">
                  {km ? "រូបភាពចម្បង" : "Feature Vantage"}
                </div>
              </div>

              {/* Secondary Photo Stack (Right 4 Cols) */}
              <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-1.5 sm:gap-2 h-full">
                <div
                  onClick={() => {
                    setLightboxIndex(1);
                    setLightboxOpen(true);
                  }}
                  className="relative overflow-hidden group cursor-pointer"
                >
                  <img
                    src={allImages[1]}
                    alt={`${name} secondary view`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors" />
                </div>

                <div
                  onClick={() => {
                    setLightboxIndex(allImages.length > 2 ? 2 : 0);
                    setLightboxOpen(true);
                  }}
                  className="relative overflow-hidden group cursor-pointer"
                >
                  <img
                    src={allImages.length > 2 ? allImages[2] : allImages[0]}
                    alt={`${name} gallery view`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-stone-950/30 group-hover:bg-transparent transition-colors" />

                  {/* All Photos Trigger Button */}
                  <div className="absolute inset-0 flex items-center justify-center p-3 bg-stone-950/40 group-hover:bg-stone-950/55 transition-colors">
                    <div className="px-4 py-2.5 rounded-2xl bg-stone-900/90 text-white border border-white/25 flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider backdrop-blur-md shadow-lg group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>{km ? `មើលទាំងអស់ (${toKm(allImages.length)} រូប)` : `All ${allImages.length} Photos`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. SANCTUARY CODEX: QUICK TRAVEL MATRIX CARDS                       */}
        {/* =================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Opening Hours */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                <span>{km ? "ម៉ោងទស្សនា" : "Hours"}</span>
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {openingHours}
              </p>
            </div>

            {/* 2. Admission Fee */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                <span>{km ? "តម្លៃសំបុត្រ" : "Admission"}</span>
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {entryFee}
              </p>
            </div>

            {/* 3. Best Season */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                <span>{km ? "រដូវកាលល្អ" : "Best Season"}</span>
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {bestTime}
              </p>
            </div>

            {/* 4. Rating & Reviews */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{km ? "ការវាយតម្លៃ" : "Score"}</span>
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug font-mono">
                {ratingScore} <span className="text-xs text-stone-500">({toKm(reviewsCount)})</span>
              </p>
            </div>

            {/* 5. Dress Code */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-emerald-600" />
                <span>{km ? "ការស្លៀកពាក់" : "Dress Code"}</span>
              </span>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {km ? "គ្របស្មា និងជង្គង់" : "Modest / Shoulders Covered"}
              </p>
            </div>

            {/* 6. Payment & Currency */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-2">
              <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{km ? "ការទូទាត់" : "Payment"}</span>
              </span>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                KHQR, Bakong & USD
              </p>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 5. MAIN CONTENT (8 COLS) + STICKY DOSSIER SIDEBAR (4 COLS)          */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Deep Storytelling, Features, Map & Reviews */}
          <div className="lg:col-span-8 space-y-8">
            {/* 5.1 About Destination Story */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-1">
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
                    {km ? "អំពីទីតាំងទេសចរណ៍នេះ" : "About this Sanctuary"}
                  </h2>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-laterite-600 animate-pulse" />
              </div>

              {excerpt && (
                <div className="p-4 sm:p-5 rounded-2xl bg-laterite-600/5 dark:bg-laterite-600/10 border-l-4 border-laterite-600 text-stone-800 dark:text-stone-200 text-sm sm:text-base font-sans leading-relaxed">
                  "{excerpt}"
                </div>
              )}

              <div className="text-sm sm:text-base text-stone-700 dark:text-stone-300 font-sans leading-relaxed space-y-4">
                {description ? (
                  description.split("\n\n").map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-stone-500">
                    {km
                      ? "ព័ត៌មានលម្អិតអំពីទីតាំងនេះកំពុងត្រូវបានរៀបចំ និងផ្ទៀងផ្ទាត់ដោយក្រុមការងារCamGO។"
                      : "Detailed historical and logistical narrative is being curated by CamGO historians."}
                  </p>
                )}
              </div>
            </section>



            {/* 5.3 How to Get There Section */}
            {howToGetThere && (
              <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">

                <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
                  {km ? "របៀបធ្វើដំណើរមកកាន់ទីតាំងនេះ" : "How to Reach this Sanctuary"}
                </h3>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans whitespace-pre-line">
                  {howToGetThere}
                </p>
              </section>
            )}

            {/* 5.4 Geographical Map on Demand */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-1">

                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
                    {km ? "ផែនទីទីតាំងជាក់ស្តែង" : "Location Map & Coordinates"}
                  </h2>
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] px-5 py-2 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{km ? "បើក Google Maps" : "Open Navigation"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {address && (
                <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans">
                  <MapPin className="w-4 h-4 text-laterite-600 shrink-0 mt-0.5" />
                  <span>{address}</span>
                  {destination.latitude && destination.longitude && (
                    <span className="font-mono text-stone-500 ml-1">
                      ({Number(destination.latitude).toFixed(4)}°, {Number(destination.longitude).toFixed(4)}°)
                    </span>
                  )}
                </div>
              )}

              {/* Map container */}
              <div className="rounded-3xl overflow-hidden border border-stone-200/90 dark:border-stone-800 shadow-sm">
                <MapOnDemand
                  singleDestination={destination}
                  destinations={[destination]}
                  initialLoad={true}
                  height="420px"
                />
              </div>
            </section>

            {/* 5.5 Traveler Reviews & Ratings */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-1">

                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
                    {km ? "ការវាយតម្លៃ និងមតិយោបល់" : "Reviews & Ratings"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.info(t("auth.login_required", "Please log in to write a review"));
                      navigate("/login");
                      return;
                    }
                    setEditingReview(myReview || null);
                    setReviewModalOpen(true);
                  }}
                  className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {myReview
                      ? (km ? "កែសម្រួលមតិរបស់អ្នក" : "Edit Your Review")
                      : (km ? "សរសេរមតិថ្មី" : "Write a Review")}
                  </span>
                </button>
              </div>

              {/* Rating Summary Dossier */}
              <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="text-4xl sm:text-5xl font-heading font-black text-stone-900 dark:text-stone-100">
                    {ratingScore}
                  </div>
                  <div className="space-y-1">
                    <RatingStars rating={Number(ratingScore)} size="md" />
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                      {km
                        ? `ផ្អែកលើការវាយតម្លៃផ្លូវការពីអ្នកដំណើរចំនួន ${toKm(reviewsCount)} នាក់`
                        : `Based on ${reviewsCount} verified traveler reviews`}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-sans font-bold text-laterite-700 dark:text-laterite-400 uppercase px-4 py-2 rounded-full bg-laterite-600/10 border border-laterite-600/20">
                  {Number(ratingScore) >= 4.7
                    ? (km ? "★ គោលដៅទេសចរណ៍ល្អឥតខ្ចោះ" : "★ Exceptional Destination")
                    : (km ? "★ គោលដៅទេសចរណ៍ពេញនិយម" : "★ Highly Recommended")}
                </div>
              </div>

              {/* Review Cards List */}
              {destination.reviews && destination.reviews.length > 0 ? (
                <div className="space-y-3.5">
                  {destination.reviews.map((rev) => {
                    const reviewerName = rev.user?.name || (km ? "អ្នកធ្វើដំណើរ" : "Traveler");
                    const initial = reviewerName.charAt(0).toUpperCase();
                    const dateFormatted = rev.created_at
                      ? new Date(rev.created_at).toLocaleDateString(km ? "km-KH" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })
                      : (km ? "ថ្មីៗនេះ" : "Recent");

                    return (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-laterite-600/15 text-laterite-700 dark:text-laterite-400 border border-laterite-600/30 flex items-center justify-center font-bold font-sans text-sm">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900 dark:text-stone-100 font-sans">
                                  {reviewerName}
                                </span>
                                <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                                  {km ? "បានផ្ទៀងផ្ទាត់" : "Verified"}
                                </span>
                              </div>
                              <span className="text-xs text-stone-400 font-sans block">
                                {dateFormatted}
                              </span>
                            </div>
                          </div>

                          <RatingStars rating={rev.rating} size="sm" />
                        </div>

                        {rev.comment && (
                          <p className="text-sm text-stone-700 dark:text-stone-300 font-sans leading-relaxed pt-1">
                            {rev.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-laterite-600/10 text-laterite-600 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">
                    {km ? "មិនទាន់មានការវាយតម្លៃនៅឡើយទេ" : "No Traveler Reviews Yet"}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto font-sans">
                    {km
                      ? "តើអ្នកធ្លាប់បានមកទស្សនាទីតាំងនេះទេ? ចែករំលែកបទពិសោធន៍របស់អ្នកដើម្បីជួយអ្នកដទៃ!"
                      : "Have you explored this sanctuary? Share your thoughts to help future travelers!"}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Luxury Travel Dossier (4 Cols Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-5 sticky top-24">
            {/* 1. Travel Planning Console Card */}
            <div className="p-6 sm:p-7 rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5">
              <div className="space-y-1">

                <h3 className="font-heading font-black text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                  {km ? "រៀបចំដំណើរកម្សាន្ត" : "Plan Your Visit"}
                </h3>
              </div>

              {/* Primary Action Button: Add to Plan */}
              <button
                type="button"
                onClick={() => setAddToPlanModalOpen(true)}
                className="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white font-sans font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{km ? "+ បញ្ចូលក្នុងកាលវិភាគធ្វើដំណើរ" : "+ Add to Trip Itinerary"}</span>
              </button>

              {/* Secondary Action Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${isFav
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-2xs"
                    : "bg-stone-50 dark:bg-stone-950 border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-rose-400 hover:text-rose-500"
                    }`}
                >
                  <Heart className={`w-4 h-4 transition-transform duration-200 ${isFav ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                  <span>{isFav ? (km ? "បានរក្សាទុក" : "Saved") : (km ? "រក្សាទុក" : "Save")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-laterite-600 text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{km ? "ចែករំលែក" : "Share"}</span>
                </button>
              </div>

              {/* Directions Button */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 hover:border-laterite-600 text-stone-700 dark:text-stone-300 text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4 text-laterite-600" />
                <span>{km ? "ទិសដៅធ្វើដំណើរ Google Maps" : "Get Google Maps Route"}</span>
              </a>
            </div>

            {/* 2. Cultural Etiquette & Travel Advisory Card */}
            <div className="p-6 sm:p-7 rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">


              <h4 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">
                {km ? "ក្រមសីលធម៌នៃការទស្សនា" : "Sanctuary Etiquette"}
              </h4>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-sans leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-laterite-600 shrink-0 mt-1.5" />
                  <span>{km ? "ស្លៀកពាក់សមរម្យ បិទបាំងស្មា និងជង្គង់ជាកាតព្វកិច្ច" : "Modest attire covering shoulders and knees is mandatory"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-laterite-600 shrink-0 mt-1.5" />
                  <span>{km ? "ហាមប៉ះពាល់ផ្ទាំងចម្លាក់បុរាណ និងហាមជក់បារីដាច់ខាត" : "Do not touch ancient bas-relief carvings; smoking is strictly prohibited"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-laterite-600 shrink-0 mt-1.5" />
                  <span>{km ? "បង្ហាញការគោរពចំពោះព្រះសង្ឃ និងទីសក្ការបូជា" : "Show utmost respect toward Buddhist monks and active shrines"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-laterite-600 shrink-0 mt-1.5" />
                  <span>{km ? "ពេលវេលាផ្តិតរូបភាពល្អបំផុតគឺពេលព្រឹកព្រលឹម ឬរសៀល" : "Best photography light: early sunrise or late golden hour"}</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <span>{km ? "មានចម្ងល់បន្ថែម?" : "Need assistance?"}</span>
                <Link to="/faq" className="text-laterite-600 dark:text-laterite-400 font-sans font-bold uppercase hover:underline">
                  {km ? "មើលសំណួរ-ចម្លើយ →" : "View FAQs →"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. RELATED PLACES (Rotated per navigation, excluding current destination) */}
        {/* ========================================================================= */}
        {rotatedRelatedPlaces.length > 0 && (
          <section className="pt-8 space-y-4 content-visibility-auto">
            <SectionHead
              title={km ? "ទីតាំងទេសចរណ៍ក្បែរនេះ" : "Nearby Sanctuaries & Wonders"}
              subtitle={km ? `ទីតាំងផ្សេងទៀតក្នុងខេត្ត ${provinceName}` : `More places in ${provinceName}`}
              linkTo="/destinations"
              linkLabel={km ? "មើលទាំងអស់ →" : "View all →"}
            />
            <SwipeRow ariaLabel="Related Destinations">
              {rotatedRelatedPlaces.map((d) => (
                <DestinationCard key={d.id} destination={d} onQuickView={setQuickViewDest} />
              ))}
            </SwipeRow>
          </section>
        )}
      </PageContainer>

      {/* =================================================================== */}
      {/* 7. MOBILE STICKY ACTION BAR IN THUMB ZONE                           */}
      {/* =================================================================== */}
      <StickyActionBar
        isSaved={isFav}
        onSave={handleFavoriteClick}
        saveLabel={km ? "រក្សាទុក" : "Save"}
        savedLabel={km ? "បានរក្សាទុក" : "Saved"}
        onShare={handleShare}
        shareLabel={km ? "ចែករំលែក" : "Share"}
        onAddToPlan={() => setAddToPlanModalOpen(true)}
        planLabel={km ? "កាលវិភាគ" : "Plan"}
        directionsUrl={directionsUrl}
        directionsLabel={km ? "ផ្លូវ" : "Route"}
      />

      {/* =================================================================== */}
      {/* 8. LIGHTBOX FULLSCREEN MODAL                                        */}
      {/* =================================================================== */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 sm:p-4 overscroll-contain select-none backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar with Safe-Area Inset: Photo Counter + 44px Close Button */}
          <div className="absolute top-[calc(env(safe-area-inset-top,12px)+8px)] left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full bg-stone-900/90 text-white text-xs font-mono font-bold pointer-events-auto border border-white/20">
              {toKm(lightboxIndex + 1)} / {toKm(allImages.length)}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-white flex items-center justify-center cursor-pointer pointer-events-auto shadow-raise border border-white/20"
              aria-label="Close photo gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Left Arrow (44px) */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-white flex items-center justify-center cursor-pointer shadow-raise border border-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Photo */}
          <img
            src={allImages[lightboxIndex]}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] max-w-[95vw] object-contain rounded-2xl shadow-2xl"
          />

          {/* Right Arrow (44px) */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-white flex items-center justify-center cursor-pointer shadow-raise border border-white/20"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {reviewModalOpen && (
        <ReviewModal
          destination={destination}
          isOpen={reviewModalOpen}
          initialReview={editingReview}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            setReviewModalOpen(false);
            fetchDestination();
          }}
        />
      )}

      {addToPlanModalOpen && (
        <AddToPlanModal
          destination={destination}
          isOpen={addToPlanModalOpen}
          onClose={() => setAddToPlanModalOpen(false)}
        />
      )}

      <DestinationQuickViewModal
        destination={quickViewDest}
        isOpen={!!quickViewDest}
        onClose={() => setQuickViewDest(null)}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={name}
        description={excerpt || description?.slice(0, 160)}
      />
    </div>
  );
};

export { DestinationDetailPage };
export default DestinationDetailPage;
