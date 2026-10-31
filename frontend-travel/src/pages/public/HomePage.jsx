import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin, Calendar, Sparkles, ArrowRight,
  Compass, Star, Send, CheckCircle2, ChevronRight, ChevronLeft,
  Route, Map, Bookmark, Flame, Award, Eye, LayoutGrid, SlidersHorizontal,
  Landmark, Trees, Waves, Mountain, ShieldCheck, Clock, Users, Heart, Quote
} from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationQuickViewModal } from "@/components/destinations/DestinationQuickViewModal";
import { DestinationCardSkeleton } from "@/components/common/ShimmerSkeleton";
import { EventCard } from "@/components/events/EventCard";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { Frieze } from "@/components/sandstone";
import { PageContainer } from "@/components/layout/PageContainer";
import { SwipeRow } from "@/components/layout/SwipeRow";
import { destinationsApi } from "@/lib/api/destinations";
import { provincesApi } from "@/lib/api/provinces";
import { categoriesApi } from "@/lib/api/categories";
import { contentApi } from "@/lib/api/content";
import { toast } from "@/store/toastStore";
import { getImageUrl } from "@/lib/utils";
import { WebsiteReviewModal } from "@/components/reviews/WebsiteReviewModal";
import { FloatingReviewButton } from "@/components/common/FloatingReviewButton";
import { useQuery } from "@tanstack/react-query";
import { homeQuery } from "@/lib/api/home";
import { useRotatedHome } from "@/lib/rotate";
import { queryClient } from "@/lib/queryClient";
import { SplitHeroSection } from "@/components/hero/SplitHeroSection";

const extractItems = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (Array.isArray(res.items)) return res.items;
  return [];
};

const toKm = (n) => String(n ?? 0);

// Curated authentic visual overrides to avoid generic modern house photos
const getCategoryCuratedImage = (cat) => {
  const slug = (cat?.slug || "").toLowerCase();
  const name = ((cat?.name_en || "") + " " + (cat?.name_km || "")).toLowerCase();
  const rawImg = cat?.image || cat?.image_url;
  const isGenericHouse = typeof rawImg === "string" && rawImg.includes("photo-1600585154340-be6161a56a0c");

  if (!rawImg || isGenericHouse) {
    if (slug.includes("temple") || name.includes("temple") || name.includes("ប្រាសាទ")) {
      return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"; // Angkor Wat
    }
    if (slug.includes("nature") || slug.includes("waterfall") || name.includes("ធម្មជាតិ") || name.includes("ទឹកធ្លាក់")) {
      return "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80"; // Lush waterfall
    }
    if (slug.includes("island") || slug.includes("beach") || name.includes("កោះ") || name.includes("ឆ្នេរ")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"; // Tropical beach
    }
    if (slug.includes("mountain") || slug.includes("eco") || name.includes("ភ្នំ") || name.includes("អេកូ")) {
      return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"; // Mountain peak
    }
    if (slug.includes("culture") || slug.includes("museum") || name.includes("វប្បធម៌") || name.includes("សារមន្ទីរ")) {
      return "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1000&q=80"; // Royal palace
    }
    if (slug.includes("adventure") || name.includes("ផ្សងព្រេង")) {
      return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80";
    }
  }
  return getImageUrl(rawImg, "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80");
};

const getProvinceCuratedImage = (prov) => {
  const code = (prov?.code || "").toUpperCase();
  const slug = (prov?.slug || "").toLowerCase();
  const rawImg = prov?.image_url || prov?.image;
  const isGenericHouse = typeof rawImg === "string" && rawImg.includes("photo-1600585154340-be6161a56a0c");

  if (!rawImg || isGenericHouse) {
    if (code === "SRP" || slug.includes("siem-reap")) {
      return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"; // Angkor Wat
    }
    if (code === "PNH" || slug.includes("phnom-penh")) {
      return "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80"; // Phnom Penh Royal Palace
    }
    if (code === "KOS" || slug.includes("sihanouk")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"; // Koh Rong Beach
    }
    if (code === "KPT" || slug.includes("kampot")) {
      return "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"; // Bokor & Kampot River
    }
    if (code === "BAT" || slug.includes("battambang")) {
      return "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"; // Battambang Heritage
    }
    if (code === "MKR" || slug.includes("mondul")) {
      return "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"; // Bou Sra Pine Valleys
    }
    if (code === "KEP" || slug.includes("kep")) {
      return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"; // Kep Seaside
    }
    if (code === "KKG" || slug.includes("koh-kong")) {
      return "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80"; // Cardamom Mangroves
    }
    if (code === "RAT" || code === "RKR" || slug.includes("ratanak")) {
      return "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80"; // Yeak Laom Volcanic Lake
    }
    if (slug.includes("pursat")) {
      return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80";
    }
  }
  return getImageUrl(rawImg, "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80");
};

// Curated hero landmark cards with fixed floating-stage positions (folk-tilt collage)
const landmarkCards = [
  {
    key: "angkor-wat",
    href: "/destinations?search=Angkor%20Wat",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80",
    name_km: "អង្គរវត្ត",
    name_en: "Angkor Wat",
    sub_km: "សៀមរាប",
    sub_en: "Siem Reap",
    badge_km: "បេតិកភណ្ឌពិភពលោក",
    badge_en: "World Heritage",
    rating: "5.0",
    fee: "$37",
    free: false,
    tilt: -7,
    floatDuration: 7,
    floatDelay: 0,
    width: "58%",
    pos: "left-[1%] top-[4%]",
    z: 20,
  },
  {
    key: "koh-rong",
    href: "/destinations?search=Koh%20Rong",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    name_km: "កោះរ៉ុង",
    name_en: "Koh Rong",
    sub_km: "ព្រះសីហនុ",
    sub_en: "Preah Sihanouk",
    badge_km: "កោះសមុទ្រ",
    badge_en: "Tropical Island",
    rating: "4.9",
    fee: "",
    free: true,
    tilt: 6,
    floatDuration: 8,
    floatDelay: 0.6,
    width: "46%",
    pos: "right-[1%] top-[0%]",
    z: 10,
  },
  {
    key: "mondulkiri",
    href: "/destinations?search=Mondulkiri",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
    name_km: "ភ្នំមណ្ឌលគិរី",
    name_en: "Mondulkiri Mountains",
    sub_km: "មណ្ឌលគិរី",
    sub_en: "Mondulkiri",
    badge_km: "អេកូទេសចរណ៍",
    badge_en: "Eco Reserve",
    rating: "4.8",
    fee: "",
    free: true,
    tilt: -4,
    floatDuration: 9,
    floatDelay: 1.1,
    width: "52%",
    pos: "left-[24%] bottom-[2%]",
    z: 30,
  },
];

// Reusable Framer Motion animation presets
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  }
};

// Real User Avatar Component with automatic image fallback and Khmer harmonic accents
const UserAvatar = ({ user, size = "w-8 h-8", textSize = "text-xs", className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = user?.avatar && !hasError && (user.avatar.startsWith("http") || user.avatar.startsWith("/"))
    ? getImageUrl(user.avatar)
    : null;
  const initials = (user?.name || user?.initials || "EX")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950",
    "bg-gradient-to-tr from-laterite-600 to-laterite-700 text-white",
    "bg-gradient-to-tr from-river-600 to-river-700 text-white",
    "bg-gradient-to-tr from-moss-600 to-moss-700 text-white",
    "bg-gradient-to-tr from-stone-800 to-stone-900 text-amber-400"
  ];
  const color = colors[(user?.id || 0) % colors.length];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user.name || "Explorer"}
        title={user.name}
        onError={() => setHasError(true)}
        className={`${size} rounded-full object-cover border-2 border-white dark:border-stone-900 shadow-sm shrink-0 ring-1 ring-stone-900/5 ${className}`}
      />
    );
  }

  return (
    <span
      title={user.name}
      className={`${size} rounded-full ${color} font-black ${textSize} flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm shrink-0 ring-1 ring-stone-900/5 ${className}`}
    >
      {initials}
    </span>
  );
};

const HomePage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const navigate = useNavigate();
  const L = (khmerText, englishText) => (km ? khmerText : englishText);
  const shouldReduceMotion = useReducedMotion();

  // 1. Single aggregated home query (instant repeat-visit hydration from PersistQueryClientProvider)
  const { data: homeData, isLoading: isQueryLoading } = useQuery(homeQuery);

  // 2. Deterministic rotation engine per session / navigation
  const {
    featured,
    provinces,
    events,
    posts,
    byCategory,
  } = useRotatedHome(homeData);

  // Categories from aggregated home payload
  const categories = homeData?.categories || [];

  // Show skeletons ONLY when there is no cached data at all (first visit network wait)
  const isLoading = isQueryLoading && !homeData;

  // Total destination count from backend
  const totalDestinations = useMemo(() => {
    const provs = Array.isArray(homeData?.provinces)
      ? homeData.provinces
      : (homeData?.provinces && typeof homeData.provinces === "object" ? Object.values(homeData.provinces) : []);
    if (provs.length > 0) {
      return provs.reduce((acc, p) => acc + (p.destinations_count || 0), 0);
    }
    const feats = Array.isArray(homeData?.featured)
      ? homeData.featured
      : (homeData?.featured && typeof homeData.featured === "object" ? Object.values(homeData.featured) : []);
    return feats.length || 24;
  }, [homeData]);

  // Destination detail prefetcher on link hover/touch
  const prefetchDestination = (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: ["destination", slug],
      queryFn: () => destinationsApi.getBySlug(slug),
      staleTime: 1000 * 60 * 5,
    });
  };

  // Quick View Modal
  const [quickViewDest, setQuickViewDest] = useState(null);

  // Featured Section Interactive States
  const [featuredCategory, setFeaturedCategory] = useState("all");
  const [featuredViewMode, setFeaturedViewMode] = useState("slider"); // "slider" | "grid"

  // Active Trip Planner Day
  const [activePlannerDay, setActivePlannerDay] = useState(1);

  // Atlas Interactive Province Selection
  const [activeAtlasProvId, setActiveAtlasProvId] = useState(null);

  // Newsletter State
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Website Review / Testimonial State
  const [isWebsiteReviewModalOpen, setIsWebsiteReviewModalOpen] = useState(false);
  const [apiTestimonials, setApiTestimonials] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    total_users: 0,
    sample_users: []
  });

  const loadTestimonials = () => {
    contentApi.getTestimonials().then((res) => {
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : null) || res?.items || extractItems(res) || [];
      if (Array.isArray(items)) {
        setApiTestimonials(items);
      }
    }).catch(() => { });
  };

  useEffect(() => {
    loadTestimonials();
    contentApi.getCommunityStats().then((res) => {
      if (res?.data) {
        const stats = res.data.data || res.data;
        setCommunityStats(stats);
      }
    }).catch(() => { });
  }, []);

  // Live real events from database (identical to Events page)
  const { data: eventsData } = useQuery({
    queryKey: ["home-events-live"],
    queryFn: () => contentApi.getEvents({ per_page: 24 }),
    staleTime: 1000 * 60 * 5,
  });

  const liveEvents = useMemo(() => {
    const items = eventsData?.data?.items || (Array.isArray(eventsData?.data) ? eventsData.data : null);
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }
    if (homeData?.events && homeData.events.length > 0) {
      return homeData.events;
    }
    return events || [];
  }, [eventsData, homeData?.events, events]);

  const nameOf = (item) => {
    if (!item) return "";
    return km && item.name_km ? item.name_km : item.name_en || item.title_en || item.name || item.title || "";
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(L("សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ", "Please enter a valid email"));
      return;
    }
    try {
      setSubscribing(true);
      await contentApi.subscribe(email);
      setSubscribed(true);
      setEmail("");
      toast.success(L("បានជាវព្រឹត្តិបត្រជោគជ័យ", "Subscribed successfully"));
    } catch {
      setSubscribed(true);
      setEmail("");
    } finally {
      setSubscribing(false);
    }
  };

  // Real Database Average Rating
  const averageRating = useMemo(() => {
    if (!featured || featured.length === 0) return "5.0";
    const sum = featured.reduce((acc, f) => acc + Number(f.avg_rating ?? f.rating_avg ?? f.rating ?? 5.0), 0);
    return (sum / featured.length).toFixed(1);
  }, [featured]);

  // Real Community Users from database (with fallback to approved website reviewers)
  const communityUsers = useMemo(() => {
    if (communityStats?.sample_users && communityStats.sample_users.length > 0) {
      return communityStats.sample_users;
    }
    if (apiTestimonials && apiTestimonials.length > 0) {
      return apiTestimonials.map((t) => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar && (t.avatar.startsWith("http") || t.avatar.startsWith("/")) ? t.avatar : null,
        initials: t.avatar && t.avatar.length <= 3 ? t.avatar : (t.name ? t.name.slice(0, 2).toUpperCase() : "EX")
      }));
    }
    return [];
  }, [communityStats, apiTestimonials]);

  const totalUsersCount = communityStats?.total_users || 85;

  // Dynamic Filtered Destinations List from Database & Rotated Pools
  const filteredFeatured = useMemo(() => {
    if (!featured || featured.length === 0) return [];
    if (featuredCategory === "all") return featured;
    if (byCategory && byCategory[featuredCategory]) {
      return byCategory[featuredCategory];
    }
    return featured.filter((item) => {
      const catSlug = (item.category?.slug || "").toLowerCase();
      const catId = item.category_id || item.category?.id;
      return (
        catSlug === String(featuredCategory).toLowerCase() ||
        String(catId) === String(featuredCategory)
      );
    });
  }, [featured, byCategory, featuredCategory]);

  // Geographic Atlas: 4 Curated Real Provinces with Highest Number of Destinations for Floating Stage
  const atlasShowcaseCards = useMemo(() => {
    if (!provinces || provinces.length === 0) return [];

    const slotConfigs = [
      { tilt: "-rotate-6", mobileTilt: "-rotate-2", floatClass: "animate-float-1" },
      { tilt: "rotate-6", mobileTilt: "rotate-2", floatClass: "animate-float-2" },
      { tilt: "rotate-4", mobileTilt: "rotate-1", floatClass: "animate-float-2" },
      { tilt: "-rotate-4", mobileTilt: "-rotate-2", floatClass: "animate-float-3" }
    ];

    // Strictly sort by highest destinations_count descending
    const sortedByDestinations = [...provinces].sort((a, b) => {
      const countA = Number(a.destinations_count ?? 0);
      const countB = Number(b.destinations_count ?? 0);
      return countB - countA;
    });

    return sortedByDestinations.slice(0, 4).map((p, idx) => {
      const config = slotConfigs[idx % slotConfigs.length];
      return {
        ...p,
        ...config,
        image: getProvinceCuratedImage(p) || getImageUrl(p.image_url || p.image)
      };
    });
  }, [provinces]);

  // Real 3-Day Sample Trip Planner from Database Destinations
  const sampleTripDays = useMemo(() => {
    if (!featured || featured.length === 0) return [];
    const colors = [
      "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      "bg-river-600/15 text-river-600 dark:text-river-400",
      "bg-laterite-600/15 text-laterite-600 dark:text-laterite-400"
    ];
    return featured.slice(0, 3).map((item, idx) => {
      const provName = item.province ? nameOf(item.province) : "";
      const catName = item.category ? nameOf(item.category) : "";
      const fee = item.is_free
        ? (km ? "ចូលទស្សនាឥតគិតថ្លៃ" : "Free Admission")
        : (item.entrance_fee_usd ? `$${item.entrance_fee_usd} ${km ? "ថ្លៃសំបុត្រ" : "Entry Fee"}` : "");
      const details = [provName, catName, fee].filter(Boolean).join(" • ");

      return {
        day: idx + 1,
        slug: item.slug,
        title_km: `ថ្ងៃទី ${toKm(idx + 1)}៖ ទស្សនា ${item.name_km || item.name_en}`,
        title_en: `Day ${idx + 1}: Explore ${item.name_en || item.name_km}`,
        detail_km: details || (item.province?.name_km || "កម្ពុជា"),
        detail_en: details || (item.province?.name_en || "Cambodia"),
        color: colors[idx % colors.length]
      };
    });
  }, [featured, km]);

  // Real Website Reviews from database ("Loved by Explorers Worldwide")
  const testimonials = useMemo(() => {
    if (!apiTestimonials || apiTestimonials.length === 0) return [];
    return apiTestimonials.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role || (km ? "អ្នករុករក" : "Explorer"),
      location: t.location || (km ? "កម្ពុជា" : "Cambodia"),
      rating: Number(t.rating) || 5,
      avatar: t.avatar || (t.name ? t.name.slice(0, 2).toUpperCase() : "EX"),
      avatarBg: t.avatar_bg || "bg-laterite-600",
      quote_km: t.quote_km || t.quote_en || t.quote || "",
      quote_en: t.quote_en || t.quote_km || t.quote || ""
    }));
  }, [apiTestimonials, km]);

  // Seamless looping pool for marquee auto-scroll
  const marqueeTestimonials = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    let pool = testimonials;
    while (pool.length < 8) {
      pool = [...pool, ...testimonials];
    }
    return [...pool, ...pool];
  }, [testimonials]);

  return (
    <div className="stone-grain min-h-screen bg-transparent text-stone-900 dark:text-stone-100 pb-20 selection:bg-amber-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. SPLIT HERO SECTION: EDITORIAL NARRATIVE & PRODUCT MOCKUP VISUAL       */}
      {/* ========================================================================= */}
      <SplitHeroSection
        featured={homeData?.featured || featured}
        totalDestinations={totalDestinations}
        totalUsersCount={totalUsersCount}
        communityUsers={communityUsers}
        km={km}
        L={L}
      />



      {/* ========================================================================= */}
      {/* 2. PREMIER DESTINATIONS OF THE MONTH: ALTERNATING ZIGZAG SHOWCASE         */}
      {/* ========================================================================= */}
      {featured.length > 0 && (
        <section
          id="premier-destinations"
          className="my-12 sm:my-16 lg:my-20 content-visibility-auto"
        >
          <PageContainer className="space-y-8 sm:space-y-12">


            {/* Alternating Zigzag Rows */}
            <div className="space-y-10 sm:space-y-14 lg:space-y-16">
              {featured.slice(0, 2).map((item, idx) => {
                const isEven = idx % 2 === 1;
                const name = nameOf(item);
                const secondaryName = km ? item.name_en : item.name_km;
                const provinceName = item.province ? nameOf(item.province) : null;
                const categoryName = item.category ? nameOf(item.category) : null;
                const image = getImageUrl(
                  item.cover_image || item.image_url,
                  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
                );
                const rating = Number(item.avg_rating ?? item.rating_avg ?? item.rating ?? 5.0).toFixed(1);

                // Excerpt extraction
                let excerpt = km && item.excerpt_km ? item.excerpt_km : (!km && item.excerpt_en ? item.excerpt_en : "");
                if (!excerpt) {
                  const rawDesc = km && item.description_km ? item.description_km : (item.description_en || item.description_km || "");
                  excerpt = rawDesc ? (rawDesc.length > 170 ? rawDesc.slice(0, 170) + "..." : rawDesc) : "";
                }
                if (!excerpt) {
                  excerpt = km
                    ? "រមណីយដ្ឋានទេសចរណ៍ដ៏ល្បីល្បាញប្រចាំប្រទេសកម្ពុជា ដែលមានប្រវត្តិសាស្ត្រយូរលង់ និងសម្រស់ធម្មជាតិស្រស់បំព្រង។"
                    : "A premier sanctuary and celebrated Cambodian wonder featuring authentic cultural heritage and timeless natural beauty.";
                }

                // Feature Highlights tags
                const highlights = [];
                const rawHighlights = km ? item.highlights_km || item.highlights_en : item.highlights_en || item.highlights_km;
                if (Array.isArray(rawHighlights) && rawHighlights.length > 0) {
                  highlights.push(...rawHighlights.slice(0, 2));
                } else {
                  if (item.is_free) {
                    highlights.push(km ? "ចូលទស្សនាឥតគិតថ្លៃ" : "Free Admission");
                  }
                  if (item.best_time_km || item.best_time_en) {
                    highlights.push(km ? item.best_time_km || item.best_time_en : item.best_time_en || item.best_time_km);
                  }
                }

                // Accent palette per row
                const accentPalettes = [
                  { num: "text-laterite-600 dark:text-laterite-400", glow: "from-laterite-600/20" },
                  { num: "text-amber-600 dark:text-amber-400", glow: "from-amber-500/20" },
                  { num: "text-moss-600 dark:text-moss-400", glow: "from-moss-600/20" },
                  { num: "text-river-600 dark:text-river-400", glow: "from-river-600/20" },
                ];
                const accent = accentPalettes[idx % accentPalettes.length];

                return (
                  <motion.div
                    key={item.id || item.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center py-4"
                  >


                    {/* Visual / Screenshot Side */}
                    <div className={`lg:col-span-6 relative ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                      {/* Subtle Ambient Radial Glow */}
                      <div className={`absolute -inset-4 bg-gradient-to-tr ${accent.glow} to-transparent rounded-3xl blur-2xl opacity-40 pointer-events-none`} />

                      {/* Elevated Visual Frame */}
                      <div
                        onClick={() => navigate(`/destinations/${item.slug}`)}
                        onPointerEnter={() => prefetchDestination(item.slug)}
                        onTouchStart={() => prefetchDestination(item.slug)}
                        className="relative rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 dark:border-stone-800 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer aspect-[16/10] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/10] w-full select-none"
                      >
                        <img
                          src={image}
                          alt={name}
                          loading="lazy"
                          decoding="async"
                          width="800"
                          height="500"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80";
                          }}
                        />

                        {/* Cinematic Gradient Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent pointer-events-none" />

                        {/* Top Floating Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                          {categoryName && (
                            <span className="px-3 py-1 rounded-full bg-stone-950/70 dark:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xs font-khmer">
                              {categoryName}
                            </span>
                          )}
                          {/* <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xs ml-auto">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{rating}</span>
                          </div> */}
                        </div>

                        {/* Bottom Floating Province Badge */}
                        {provinceName && (
                          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold font-khmer shadow-xs">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>{provinceName}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text Side */}
                    <div className={`lg:col-span-6 flex flex-col space-y-4 sm:space-y-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>


                      {/* Destination Title & Secondary Name */}
                      <div className="space-y-1">
                        <h3
                          onClick={() => navigate(`/destinations/${item.slug}`)}
                          onPointerEnter={() => prefetchDestination(item.slug)}
                          onTouchStart={() => prefetchDestination(item.slug)}
                          className="text-heading font-heading font-black text-stone-950 dark:text-white leading-tight hover:text-laterite-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {name}
                        </h3>
                        {secondaryName && secondaryName !== name && (
                          <p className="text-xs sm:text-sm font-semibold text-stone-500 dark:text-stone-400 font-khmer">
                            {secondaryName}
                          </p>
                        )}
                      </div>

                      {/* Excerpt Story */}
                      <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-sans font-medium line-clamp-3 sm:line-clamp-4">
                        {excerpt}
                      </p>

                      {/* Highlight feature pills */}
                      {highlights.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          {highlights.map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-moss-600 shrink-0" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <Link
                          to={`/destinations/${item.slug}`}
                          onPointerEnter={() => prefetchDestination(item.slug)}
                          onTouchStart={() => prefetchDestination(item.slug)}
                          className="btn-primary min-h-[44px] px-5 sm:px-6 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform group"
                        >
                          <span>{L("មើលព័ត៌មានលម្អិត", "Explore Sanctuary")}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setQuickViewDest(item)}
                          className="btn-secondary min-h-[44px] px-4 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                          aria-label="Quick View Destination"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{L("មើលរហ័ស", "Quick View")}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </PageContainer>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. FEATURED DESTINATIONS SHOWCASE (With Filter Tabs & View Mode Switch)   */}
      {/* ========================================================================= */}
      <motion.section
        id="featured-destinations"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeInUp}
        className="py-12 sm:py-16 lg:py-20 content-visibility-auto"
      >
        <PageContainer className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
            <div>
              <span className="text-xs font-bold text-laterite-600 dark:text-laterite-400 uppercase tracking-widest block mb-1">
                {L("រុករកគោលដៅ", "Discover Places")}
              </span>
              <h2 className="text-heading font-heading font-black text-stone-950 dark:text-white leading-tight">
                {L("គោលដៅទេសចរណ៍សំខាន់ៗ", "Popular Destinations")}
              </h2>
            </div>

            {/* View Mode & View All Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setFeaturedViewMode("slider")}
                  aria-label="Slider View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${featuredViewMode === "slider"
                    ? "bg-laterite-600 text-white"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                    }`}
                  title={L("ទិដ្ឋភាពរំកិល", "Slider View")}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedViewMode("grid")}
                  aria-label="Grid View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${featuredViewMode === "grid"
                    ? "bg-laterite-600 text-white"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                    }`}
                  title={L("ទិដ្ឋភាពក្រឡាចត្រង្គ", "Grid View")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <Link
                to="/destinations"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-laterite-600 dark:text-laterite-400 hover:text-laterite-700 dark:hover:text-laterite-300 transition-colors shrink-0"
              >
                <span>{L("មើលទាំងអស់", "View all")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>



          {/* Cards Presentation */}
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[80vw] max-w-[320px] sm:w-[380px] shrink-0">
                  <DestinationCardSkeleton layout="vertical" />
                </div>
              ))}
            </div>
          ) : filteredFeatured.length === 0 ? (
            <div className="panel-raised p-8 rounded-3xl text-center space-y-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <Compass className="w-16 h-16 mx-auto text-stone-500" />
              <h3 className="text-subheading font-bold text-stone-900 dark:text-white">
                {L("មិនទាន់មានទីតាំងក្នុងប្រភេទនេះទេ", "No destinations found in this category")}
              </h3>
              <button
                type="button"
                onClick={() => setFeaturedCategory("all")}
                className="btn-secondary min-h-[36px] px-4 rounded-xl text-xs font-semibold mt-2 cursor-pointer"
              >
                {L("ត្រឡប់ទៅមើលទាំងអស់", "Reset to All")}
              </button>
            </div>
          ) : featuredViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredFeatured.slice(0, 8).map((d) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  onQuickView={setQuickViewDest}
                  layout="vertical"
                  className="h-full"
                />
              ))}
            </div>
          ) : (
            <SwipeRow ariaLabel="Featured Destinations">
              {filteredFeatured.slice(0, 10).map((d) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  onQuickView={setQuickViewDest}
                  layout="vertical"
                />
              ))}
            </SwipeRow>
          )}
        </PageContainer>
      </motion.section>



      {/* ========================================================================= */}
      {/* 5. THE 25 PROVINCES ATLAS: FLOATING & TILTED TERRITORIAL SHOWCASE         */}
      {/* ========================================================================= */}
      {provinces.length > 0 && (
        <motion.section
          id="provinces"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
          className="my-10 sm:my-16 content-visibility-auto"
        >
          <PageContainer className="space-y-6 sm:space-y-8">
            {/* The Floating Atlas Stage Canvas */}
            <div className="relative rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden shadow-sm">
              {/* Layered Ambient Glow Orbs with Continuous Organic Breathing Motion */}
              <motion.div
                animate={shouldReduceMotion ? {} : {
                  scale: [1, 1.25, 0.95, 1],
                  opacity: [0.12, 0.22, 0.15, 0.12],
                  x: [0, 20, -10, 0],
                  y: [0, -20, 10, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-laterite-600/15 rounded-full blur-3xl pointer-events-none"
              />
              <motion.div
                animate={shouldReduceMotion ? {} : {
                  scale: [1, 1.28, 0.92, 1],
                  opacity: [0.10, 0.20, 0.12, 0.10],
                  x: [0, -20, 15, 0],
                  y: [0, 20, -15, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"
              />

              {/* Watermark Motif with Smooth Continuous 360 Rotation */}
              <motion.div
                animate={shouldReduceMotion ? {} : { rotate: 360 }}
                transition={{ duration: 220, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] dark:opacity-[0.03] pointer-events-none select-none"
              >
                <RumduolFlower size={460} className="text-laterite-600" />
              </motion.div>

              {/* 3-Column Spatial Grid: Flank Left Cards + Central Core + Flank Right Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center relative z-10">
                {/* 1. LEFT FLANK: Floating & Tilted Province UI Cards (Desktop) */}
                <div className="lg:col-span-3 hidden lg:flex flex-col gap-6 justify-center items-center xl:items-start">
                  {/* Card 1: Top Left (Tilted -6deg, Float 1, Staggered Entrance) */}
                  {atlasShowcaseCards[0] && (
                    <motion.div
                      initial={{ opacity: 0, x: -35, rotate: -6 }}
                      whileInView={{ opacity: 1, x: 0, rotate: -6 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-[270px] select-none"
                    >
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [-8, 8, -8] }}
                        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <motion.div
                          whileHover={shouldReduceMotion ? { scale: 1.02 } : {
                            rotate: 0,
                            scale: 1.06,
                            y: -8,
                            transition: { type: "spring", stiffness: 350, damping: 20 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="transform-gpu relative z-10"
                        >
                          <Link
                            to={`/provinces/${atlasShowcaseCards[0].slug}`}
                            className={`block rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-amber-400/50 group h-[290px] xl:h-[310px] relative transition-all duration-300 ${activeAtlasProvId === atlasShowcaseCards[0].id ? "ring-4 ring-amber-400/80 shadow-amber-400/30" : ""
                              }`}
                          >
                            <img
                              src={atlasShowcaseCards[0].image}
                              alt={nameOf(atlasShowcaseCards[0])}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 group-hover:from-stone-950/90 transition-colors pointer-events-none" />

                            {/* Shimmer Light Beam on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                            {/* Province Code Watermark */}
                            <div className="absolute top-6 right-3 font-mono font-black text-6xl text-white/5 group-hover:text-white/10 group-hover:-translate-y-1 transition-all duration-500 pointer-events-none select-none tracking-tighter">
                              {atlasShowcaseCards[0].code}
                            </div>

                            {/* Top Badges */}
                            <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold font-khmer flex items-center gap-1.5 shadow-sm group-hover:border-amber-400/40 transition-colors">
                                <MapPin className="w-3 h-3 text-amber-400 group-hover:animate-bounce" />
                                <span>{toKm(atlasShowcaseCards[0].destinations_count || 0)} {L("ទីតាំង", "destinations")}</span>
                              </span>
                            </div>

                            {/* Bottom Info Dock */}
                            <div className="absolute bottom-0 inset-x-0 p-4 space-y-1.5 z-10">
                              <div className="flex items-end justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-subheading font-heading font-black text-white group-hover:text-amber-300 transition-colors leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {nameOf(atlasShowcaseCards[0])}
                                  </h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-md group-hover:rotate-[-45deg]">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Card 2: Bottom Left (Tilted +4deg, Float 2, Staggered Entrance) */}
                  {atlasShowcaseCards[2] && (
                    <motion.div
                      initial={{ opacity: 0, x: -35, rotate: 4 }}
                      whileInView={{ opacity: 1, x: 0, rotate: 4 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-[270px] select-none"
                    >
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [8, -8, 8] }}
                        transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <motion.div
                          whileHover={shouldReduceMotion ? { scale: 1.02 } : {
                            rotate: 0,
                            scale: 1.06,
                            y: -8,
                            transition: { type: "spring", stiffness: 350, damping: 20 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="transform-gpu relative z-10"
                        >
                          <Link
                            to={`/provinces/${atlasShowcaseCards[2].slug}`}
                            className={`block rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-river-400/50 group h-[270px] xl:h-[290px] relative transition-all duration-300 ${activeAtlasProvId === atlasShowcaseCards[2].id ? "ring-4 ring-river-400/80 shadow-river-400/30" : ""
                              }`}
                          >
                            <img
                              src={atlasShowcaseCards[2].image}
                              alt={nameOf(atlasShowcaseCards[2])}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 group-hover:from-stone-950/90 transition-colors pointer-events-none" />

                            {/* Shimmer Light Beam on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                            <div className="absolute top-6 right-3 font-mono font-black text-6xl text-white/5 group-hover:text-white/10 group-hover:-translate-y-1 transition-all duration-500 pointer-events-none select-none tracking-tighter">
                              {atlasShowcaseCards[2].code}
                            </div>

                            <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md border border-white/20 text-river-300 text-xs font-bold font-khmer flex items-center gap-1.5 shadow-sm group-hover:border-river-400/40 transition-colors">
                                <MapPin className="w-3 h-3 text-river-400 group-hover:animate-bounce" />
                                <span>{toKm(atlasShowcaseCards[2].destinations_count || 0)} {L("ទីតាំង", "destinations")}</span>
                              </span>
                            </div>

                            <div className="absolute bottom-0 inset-x-0 p-4 space-y-1.5 z-10">
                              <div className="flex items-end justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-subheading font-heading font-black text-white group-hover:text-amber-300 transition-colors leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {nameOf(atlasShowcaseCards[2])}
                                  </h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-md group-hover:rotate-[-45deg]">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                {/* 2. CENTER CORE: Headline, Narrative & Primary CTAs */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="lg:col-span-6 flex flex-col items-center justify-center text-center px-2 sm:px-4 lg:px-6 relative z-20 space-y-4 sm:space-y-5"
                >
                  {/* Interactive Kicker Badge with Animated Compass */}
                  <motion.div
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-600/20 border border-laterite-600/20 dark:border-laterite-600/30 text-laterite-700 dark:text-laterite-300 text-xs font-bold font-khmer shadow-2xs"
                  >
                    <motion.span
                      animate={shouldReduceMotion ? {} : { rotate: [0, 20, -20, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex"
                    >
                      <Compass className="w-3.5 h-3.5 text-laterite-600 dark:text-amber-400" />
                    </motion.span>
                    <span>{L("រុករកទូទាំង ២៥ ខេត្ត-រាជធានី", "Explore All 25 Provinces")}</span>
                  </motion.div>

                  <motion.h2
                    variants={fadeInUp}
                    className="text-heading font-heading font-black text-stone-950 dark:text-white leading-[1.12] tracking-tight"
                  >
                    {L("រាជធានី និង ខេត្តទាំង ២៥", "The 25 Provinces Atlas")}
                  </motion.h2>

                  <motion.p
                    variants={fadeInUp}
                    className="text-xs sm:text-sm lg:text-base text-stone-700 dark:text-stone-300 font-medium leading-relaxed max-w-lg mx-auto font-sans"
                  >
                    {L(
                      "ស្វែងយល់ពីរតនសម្បត្តិវប្បធម៌ បេតិកភណ្ឌប្រវត្តិសាស្ត្រ និងរមណីយដ្ឋានធម្មជាតិសម្បូរបែបដែលលាតសន្ធឹងលើគ្រប់រាជធានី-ខេត្តទាំង ២៥ នៃព្រះរាជាណាចក្រកម្ពុជា។",
                      "Explore ancient sanctuary ruins, virgin rainforest eco-reserves, pristine coastal archipelagos, and living cultural traditions across all 25 provinces of Cambodia."
                    )}
                  </motion.p>

                  {/* Central Dual CTAs with Spring Press & Hover Motion */}
                  <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
                    <motion.div
                      whileHover={shouldReduceMotion ? { scale: 1.02 } : { scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Link
                        to="/provinces"
                        className="btn-primary min-h-[48px] px-6 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2.5 shadow-md shadow-laterite-600/15 group"
                      >
                        <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                        <span>{L("រាជធានី និង ខេត្តទាំង ២៥", "The 25 Provinces Atlas")}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                      </Link>
                    </motion.div>
                  </motion.div>

                  {/* Territorial Key Metrics Dock with Interactive Badges & Pulse Dots */}
                  <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 sm:gap-3 pt-2 flex-wrap">
                    <motion.div
                      whileHover={{ y: -3, scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-[11px] font-bold text-stone-800 dark:text-stone-200 font-khmer shadow-2xs cursor-default"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-laterite-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-laterite-600" />
                      </span>
                      <span>{km ? `${toKm(provinces.length || 25)} រាជធានី-ខេត្ត` : `${provinces.length || 25} National Territories`}</span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-[11px] font-bold text-stone-800 dark:text-stone-200 font-khmer shadow-2xs cursor-default"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-moss-600" />
                      </span>
                      <span>{L("៤ តំបន់ភូមិសាស្ត្រធំៗ", "4 Geographic Zones")}</span>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 text-[11px] font-bold text-stone-800 dark:text-stone-200 font-khmer shadow-2xs cursor-default"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span>{L("ទិន្នន័យផ្ទៀងផ្ទាត់ផ្លូវការ", "100% Verified Registry")}</span>
                    </motion.div>
                  </motion.div>

                  {/* Mobile & Tablet Interactive Tilted Showcase (< lg) */}
                  <div className="lg:hidden w-full pt-4">
                    <SwipeRow ariaLabel="Showcase Provinces" itemClassName="w-[250px] sm:w-[280px]">
                      {atlasShowcaseCards.slice(0, 4).map((card, idx) => (
                        <motion.div
                          key={card.id || card.code}
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 350, damping: 20 }}
                          className="p-1 select-none"
                        >
                          <Link
                            to={`/provinces/${card.slug}`}
                            className={`group relative block rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 dark:border-white/10 shadow-lg h-[270px] w-full transition-all duration-300 ${idx % 2 === 0 ? "-rotate-2" : "rotate-2"
                              } ${activeAtlasProvId === card.id ? "ring-4 ring-amber-400/80 shadow-amber-400/30" : ""}`}
                          >
                            <img
                              src={card.image}
                              alt={nameOf(card)}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 pointer-events-none" />

                            {/* Shimmer Light Beam on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                            <div className="relative z-10 p-3.5 flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold uppercase">
                                KH-{card.code}
                              </span>
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-bold font-khmer">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                <span>{toKm(card.destinations_count || 0)} {L("ទីតាំង", "places")}</span>
                              </span>
                            </div>

                            <div className="absolute bottom-0 inset-x-0 p-3.5 space-y-1 z-10 text-left">
                              <div className="flex items-end justify-between gap-1.5">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-subheading font-heading font-black text-white truncate">
                                    {nameOf(card)}
                                  </h3>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </SwipeRow>
                  </div>
                </motion.div>

                {/* 3. RIGHT FLANK: Floating & Tilted Province UI Cards (Desktop) */}
                <div className="lg:col-span-3 hidden lg:flex flex-col gap-6 justify-center items-center xl:items-end">
                  {/* Card 3: Top Right (Tilted +6deg, Float 2, Staggered Entrance) */}
                  {atlasShowcaseCards[1] && (
                    <motion.div
                      initial={{ opacity: 0, x: 35, rotate: 6 }}
                      whileInView={{ opacity: 1, x: 0, rotate: 6 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-[270px] select-none"
                    >
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [7, -7, 7] }}
                        transition={{ duration: 7.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <motion.div
                          whileHover={shouldReduceMotion ? { scale: 1.02 } : {
                            rotate: 0,
                            scale: 1.06,
                            y: -8,
                            transition: { type: "spring", stiffness: 350, damping: 20 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="transform-gpu relative z-10"
                        >
                          <Link
                            to={`/provinces/${atlasShowcaseCards[1].slug}`}
                            className={`block rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-laterite-400/50 group h-[290px] xl:h-[310px] relative transition-all duration-300 ${activeAtlasProvId === atlasShowcaseCards[1].id ? "ring-4 ring-laterite-400/80 shadow-laterite-400/30" : ""
                              }`}
                          >
                            <img
                              src={atlasShowcaseCards[1].image}
                              alt={nameOf(atlasShowcaseCards[1])}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 group-hover:from-stone-950/90 transition-colors pointer-events-none" />

                            {/* Shimmer Light Beam on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                            <div className="absolute top-6 right-3 font-mono font-black text-6xl text-white/5 group-hover:text-white/10 group-hover:-translate-y-1 transition-all duration-500 pointer-events-none select-none tracking-tighter">
                              {atlasShowcaseCards[1].code}
                            </div>

                            <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md border border-white/20 text-laterite-300 text-xs font-bold font-khmer flex items-center gap-1.5 shadow-sm group-hover:border-laterite-400/40 transition-colors">
                                <MapPin className="w-3 h-3 text-laterite-400 group-hover:animate-bounce" />
                                <span>{toKm(atlasShowcaseCards[1].destinations_count || 0)} {L("ទីតាំង", "destinations")}</span>
                              </span>
                            </div>

                            <div className="absolute bottom-0 inset-x-0 p-4 space-y-1.5 z-10">
                              <div className="flex items-end justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-subheading font-heading font-black text-white group-hover:text-amber-300 transition-colors leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {nameOf(atlasShowcaseCards[1])}
                                  </h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-md group-hover:rotate-[-45deg]">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Card 4: Bottom Right (Tilted -4deg, Float 3, Staggered Entrance) */}
                  {atlasShowcaseCards[3] && (
                    <motion.div
                      initial={{ opacity: 0, x: 35, rotate: -4 }}
                      whileInView={{ opacity: 1, x: 0, rotate: -4 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-[270px] select-none"
                    >
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [-7, 7, -7] }}
                        transition={{ duration: 8.2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <motion.div
                          whileHover={shouldReduceMotion ? { scale: 1.02 } : {
                            rotate: 0,
                            scale: 1.06,
                            y: -8,
                            transition: { type: "spring", stiffness: 350, damping: 20 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="transform-gpu relative z-10"
                        >
                          <Link
                            to={`/provinces/${atlasShowcaseCards[3].slug}`}
                            className={`block rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 dark:border-white/10 shadow-xl hover:shadow-2xl hover:border-moss-400/50 group h-[270px] xl:h-[290px] relative transition-all duration-300 ${activeAtlasProvId === atlasShowcaseCards[3].id ? "ring-4 ring-moss-400/80 shadow-moss-400/30" : ""
                              }`}
                          >
                            <img
                              src={atlasShowcaseCards[3].image}
                              alt={nameOf(atlasShowcaseCards[3])}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 group-hover:from-stone-950/90 transition-colors pointer-events-none" />

                            {/* Shimmer Light Beam on Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                            <div className="absolute top-6 right-3 font-mono font-black text-6xl text-white/5 group-hover:text-white/10 group-hover:-translate-y-1 transition-all duration-500 pointer-events-none select-none tracking-tighter">
                              {atlasShowcaseCards[3].code}
                            </div>

                            <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md border border-white/20 text-moss-300 text-xs font-bold font-khmer flex items-center gap-1.5 shadow-sm group-hover:border-moss-400/40 transition-colors">
                                <MapPin className="w-3 h-3 text-moss-400 group-hover:animate-bounce" />
                                <span>{toKm(atlasShowcaseCards[3].destinations_count || 0)} {L("ទីតាំង", "destinations")}</span>
                              </span>
                            </div>

                            <div className="absolute bottom-0 inset-x-0 p-4 space-y-1.5 z-10">
                              <div className="flex items-end justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-subheading font-heading font-black text-white group-hover:text-amber-300 transition-colors leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {nameOf(atlasShowcaseCards[3])}
                                  </h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-md group-hover:rotate-[-45deg]">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* All 25 Provinces Quick Atlas Ribbon */}
            <div className="space-y-3 pt-2">
              <SwipeRow ariaLabel="All 25 Provinces" itemClassName="w-[140px] sm:w-[160px]">
                {(homeData?.provinces?.length ? homeData.provinces : provinces).map((p) => {
                  const isCurrentHero = activeAtlasProvId === p.id;
                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -5, scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="h-full select-none"
                    >
                      <Link
                        to={`/provinces/${p.slug}`}
                        onClick={() => setActiveAtlasProvId(p.id)}
                        className={`group p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[96px] select-none relative overflow-hidden ${isCurrentHero
                          ? "bg-laterite-50 dark:bg-laterite-950/40 border-laterite-500 text-stone-950 dark:text-white shadow-md ring-2 ring-laterite-500/30"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-laterite-400 hover:shadow-md"
                          }`}
                        title={L(`ស្វែងយល់ពី ${nameOf(p)}`, `Explore ${nameOf(p)}`)}
                      >
                        {/* Shimmer on ribbon card hover */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-laterite-500/10 to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between relative z-10">
                          <span
                            className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded transition-colors ${isCurrentHero
                              ? "bg-laterite-600 text-white"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-laterite-600 group-hover:text-white"
                              }`}
                          >
                            {p.code || "KH"}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 font-khmer flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 opacity-60" />
                            {toKm(p.destinations_count || 0)}
                          </span>
                        </div>

                        <div className="pt-1 relative z-10">
                          <h5 className="font-heading font-black text-xs sm:text-sm line-clamp-1 group-hover:text-laterite-600 dark:group-hover:text-laterite-400 transition-colors">
                            {nameOf(p)}
                          </h5>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 block line-clamp-1">
                            {km ? p.name_en : p.name_km}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </SwipeRow>
            </div>
          </PageContainer>
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* 6. UPCOMING FESTIVALS & CULTURAL EVENTS                                   */}
      {/* ========================================================================= */}
      {liveEvents.length > 0 && (
        <motion.section
          id="events"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
          className="my-10 sm:my-16 content-visibility-auto"
        >
          <PageContainer className="space-y-6">
            <div className="flex items-center justify-between gap-3 pb-1">
              <div>
                <span className="text-xs font-bold text-laterite-600 dark:text-laterite-400 uppercase tracking-widest block mb-1">
                  {L("ព្រឹត្តិការណ៍", "Happenings")}
                </span>
                <h2 className="text-heading font-heading font-black text-stone-950 dark:text-white">
                  {L("ពិធីបុណ្យ & ព្រឹត្តិការណ៍វប្បធម៌", "Upcoming Cultural Events")}
                </h2>
              </div>
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-laterite-600 dark:text-laterite-400 hover:text-laterite-700 dark:hover:text-laterite-300 transition-colors shrink-0"
              >
                <span>{L("មើលទាំងអស់", "See all")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <SwipeRow ariaLabel="Events" itemClassName="w-[280px] sm:w-[320px] lg:w-[340px]">
              {liveEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} layout="vertical" className="h-full" />
              ))}
            </SwipeRow>
          </PageContainer>
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* 7. INTERACTIVE TRIP PLANNER SHOWCASE                                      */}
      {/* ========================================================================= */}
      <motion.section
        id="trip-planner-spotlight"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="my-10 sm:my-16 content-visibility-auto"
      >
        <PageContainer>
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md relative overflow-hidden">
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
              className="absolute -right-12 -bottom-12 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
            >
              <RumduolFlower size={340} className="text-laterite-600" />
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              {/* Left Column: Narrative & Action */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-laterite-600/10 border border-laterite-600/20 text-xs font-bold text-laterite-600 dark:text-amber-400">
                  <Route className="w-4 h-4" />
                  <span>{L("ឧបករណ៍រៀបចំដំណើរកម្សាន្តឆ្លាតវៃ", "Smart Travel Itinerary Builder")}</span>
                </div>

                <h2 className="text-heading font-heading font-black text-stone-950 dark:text-white leading-tight">
                  {L(
                    "រៀបចំកាលវិភាគធ្វើដំណើរដោយខ្លួនឯង តាមបំណងប្រាថ្នា",
                    "Design Your Custom Itinerary Day-By-Day"
                  )}
                </h2>

                <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl font-medium">
                  {L(
                    "ជ្រើសរើសទីតាំងដែលអ្នកចូលចិត្ត រៀបចំកាលវិភាគពីមួយថ្ងៃទៅមួយថ្ងៃ និងមើលផែនទីបង្ហាញផ្លូវដោយឥតគិតថ្លៃ ១០០%។",
                    "Add destinations, optimize day-by-day routes, check travel distances, and build personalized journey memories."
                  )}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/trip-planner"
                    className="btn-primary min-h-[46px] px-6 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{L("ចាប់ផ្ដើមឥឡូវនេះ", "Start Now")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/destinations"
                    className="btn-secondary min-h-[46px] px-5 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <span>{L("រុករកទីតាំងជាមុន", "Browse Destinations")}</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Interactive 3-Day Sample Route from Real Destinations */}
              <div className="lg:col-span-5 space-y-3">
                {sampleTripDays.map((item) => (
                  <motion.div
                    key={item.day}
                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onPointerEnter={() => prefetchDestination(item.slug)}
                    onTouchStart={() => prefetchDestination(item.slug)}
                    onClick={() => {
                      setActivePlannerDay(item.day);
                      if (item.slug) navigate(`/destinations/${item.slug}`);
                    }}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 ${activePlannerDay === item.day
                      ? "bg-stone-50 dark:bg-stone-800 border-laterite-600 dark:border-laterite-400 shadow-sm"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${item.color} font-black flex items-center justify-center shrink-0 text-base`}>
                      0{item.day}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-black text-sm text-stone-950 dark:text-white truncate">
                        {km ? item.title_km : item.title_en}
                      </h4>
                      <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 font-khmer mt-0.5 truncate">
                        {km ? item.detail_km : item.detail_en}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-moss-600 shrink-0" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </PageContainer>
      </motion.section>

      {/* ========================================================================= */}
      {/* 8. WEBSITE REVIEWS & COMMUNITY TRUST (INFINITE MARQUEE)                   */}
      {/* ========================================================================= */}
      <section
        id="community-trust"
        className="my-14 sm:my-20 relative overflow-hidden content-visibility-auto"
      >
        <PageContainer className="space-y-3 mb-8 sm:mb-12 text-center">


          <h2 className="text-heading font-heading font-black text-stone-950 dark:text-white">
            {L("បទពិសោធន៍ពិតពីអ្នកទេសចរ", "Loved by Explorers Worldwide")}
          </h2>

          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium max-w-xl mx-auto">
            {L(
              "មតិយោបល់ និងការវាយតម្លៃពិតប្រាកដពីអ្នកប្រើប្រាស់ជុំវិញពិភពលោក អំពីបទពិសោធន៍ប្រើប្រាស់គេហទំព័រCamGO។",
              "Genuine feedback and verified reviews from global explorers about their experience using the CamGO platform."
            )}
          </p>

          {/* User Review Action Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setIsWebsiteReviewModalOpen(true)}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-laterite-600/10 hover:bg-laterite-600 hover:text-white dark:bg-laterite-500/15 dark:hover:bg-laterite-600 dark:hover:text-white text-laterite-700 dark:text-laterite-300 border border-laterite-600/25 text-xs font-bold font-sans uppercase tracking-wider transition-all duration-300 shadow-xs active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-laterite-600 dark:text-amber-400 group-hover:text-white" />
              <span>{L("វាយតម្លៃគេហទំព័រ", "Review Website")}</span>
            </button>
          </div>
        </PageContainer>

        {/* Infinite Scrolling Marquee Track with Edge Gradient Fade Masks */}
        {testimonials.length > 0 ? (
          <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] group">
            <div
              className="animate-marquee-left flex items-stretch gap-5 sm:gap-6 w-max select-none group-hover:[animation-play-state:paused]"
              style={{
                animation: "marqueeLeft 30s linear infinite",
                willChange: "transform",
              }}
            >
              {/* Seamless Infinite Loop */}
              {marqueeTestimonials.map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="w-[300px] sm:w-[360px] lg:w-[380px] p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-laterite-600/40 dark:hover:border-laterite-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-default shrink-0 hover:-translate-y-1.5"
                >
                  <div className="space-y-3">
                    {/* Top Bar: Stars & Website Review Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 text-laterite-700 dark:text-laterite-300 border border-laterite-600/20 dark:border-laterite-500/25 flex items-center gap-1 font-khmer">
                        <Sparkles className="w-2.5 h-2.5 text-laterite-600 dark:text-amber-400" />
                        {L("ការវាយតម្លៃគេហទំព័រ", "Website Review")}
                      </span>
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-sans leading-relaxed font-medium line-clamp-4">
                      "{km ? t.quote_km : t.quote_en}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-3.5 border-t border-stone-200/80 dark:border-stone-800/80">
                    {t.avatar && (t.avatar.startsWith("http") || t.avatar.startsWith("/")) ? (
                      <img
                        src={getImageUrl(t.avatar)}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ring-2 ring-white dark:ring-stone-900"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${t.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ring-2 ring-white dark:ring-stone-900`}>
                        {t.avatar}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading font-black text-sm text-stone-950 dark:text-white truncate">
                          {t.name}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-moss-600 shrink-0" />
                      </div>
                      <p className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 font-khmer truncate">
                        {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-stone-400 dark:text-stone-500 text-xs font-medium">
            {L(
              "មិនទាន់មានការវាយតម្លៃគេហទំព័រនៅឡើយទេ។ សូមចែករំលែកមតិយោបល់របស់អ្នកជាមុនគេ!",
              "No approved website reviews yet. Be the first to share your experience!"
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 9. REGISTER COMMUNITY CALL-TO-ACTION                                      */}
      {/* ========================================================================= */}
      <motion.section
        id="register-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="my-10 sm:my-14 content-visibility-auto"
      >
        <PageContainer>
          <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md">
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <h2 className="text-heading font-heading font-black text-stone-950 dark:text-white leading-snug">
                  {L("ចុះឈ្មោះឥតគិតថ្លៃ ដើម្បីរៀបចំដំណើរកម្សាន្តរបស់អ្នក", "Create a Free Account & Plan Your Journeys")}
                </h2>
                <ul className="space-y-1.5 text-stone-800 dark:text-stone-200 font-khmer text-sm font-semibold">
                  {(km
                    ? ["រក្សាទុកទីតាំងទេសចរណ៍ដែលអ្នកចូលចិត្ត (Favorites)", "សរសេរការវាយតម្លៃ និងចែករំលែកបទពិសោធន៍ (Reviews)", "រៀបចំកាលវិភាគធ្វើដំណើរដោយងាយស្រួល (Trip Planner)"]
                    : ["Save your favorite destinations", "Write reviews and share travel notes", "Build day-by-day trip itineraries"]
                  ).map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-moss-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <Link
                  to="/register"
                  className="btn-primary min-h-[46px] rounded-xl text-center font-bold text-sm shadow-xs"
                >
                  {L("ចុះឈ្មោះឥតគិតថ្លៃ", "Create Free Account")}
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary min-h-[46px] rounded-xl text-center font-bold text-sm"
                >
                  {L("ចូលគណនី", "Sign In")}
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </motion.section>



      {/* Quick View Modal */}
      <DestinationQuickViewModal
        destination={quickViewDest}
        isOpen={!!quickViewDest}
        onClose={() => setQuickViewDest(null)}
      />

      {/* Floating Action Button for Website Review */}
      <FloatingReviewButton onClick={() => setIsWebsiteReviewModalOpen(true)} />

      {/* Website Review Modal */}
      <WebsiteReviewModal
        isOpen={isWebsiteReviewModalOpen}
        onClose={() => setIsWebsiteReviewModalOpen(false)}
        onSuccess={loadTestimonials}
      />
    </div>
  );
};

export { HomePage };
export default HomePage;
