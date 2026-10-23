import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Compass,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Mail,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { getImageUrl } from "@/lib/utils";
import { contentApi } from "@/lib/api/content";
import { toast } from "@/store/toastStore";

// Real image resolver from database destination record
const getHeroDestinationImage = (dest) => {
  if (dest?.cover_image) {
    return getImageUrl(dest.cover_image);
  }
  const rawImg = dest?.image_url || dest?.image;
  if (rawImg) {
    return getImageUrl(rawImg);
  }
  return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1400&q=85";
};

// Category / Explore label
const getExploreLabel = (dest, km) => {
  const catSlug = (dest?.category?.slug || "").toLowerCase();
  const destSlug = (dest?.slug || "").toLowerCase();
  if (
    catSlug.includes("temple") ||
    destSlug.includes("wat") ||
    destSlug.includes("temple") ||
    destSlug.includes("sanctuary")
  ) {
    return km ? "រុករកប្រាសាទ" : "Explore Sanctuary";
  }
  if (catSlug.includes("island") || catSlug.includes("beach") || destSlug.includes("koh")) {
    return km ? "រុករកកោះធម្មជាតិ" : "Explore Island";
  }
  if (catSlug.includes("waterfall") || destSlug.includes("waterfall")) {
    return km ? "រុករកទឹកធ្លាក់" : "Explore Waterfall";
  }
  if (catSlug.includes("mountain") || destSlug.includes("mountain") || destSlug.includes("park")) {
    return km ? "រុករកឧទ្យានជាតិ" : "Explore Highlands";
  }
  if (catSlug.includes("culture") || destSlug.includes("palace") || destSlug.includes("museum")) {
    return km ? "រុករកព្រះបរមរាជវាំង" : "Explore Heritage";
  }
  return km ? "រុករកទីតាំងទេសចរណ៍" : "Explore Sanctuary";
};

// Real fallback destinations matching database schema
const DEFAULT_HERO_DESTINATIONS = [
  {
    id: 1,
    slug: "angkor-wat",
    name_en: "Angkor Wat",
    name_km: "ប្រាសាទអង្គរវត្ត",
    cover_image: "/storage/destinations/bIWx6xfeSyB3h9nUtSXrVNw6cWQ3yvJdQKNwtnoQ.jpg",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "temples-heritage", name_en: "Temples & Heritage", name_km: "ប្រាសាទ និងបេតិកភណ្ឌ" },
    province: { name_en: "Siem Reap", name_km: "សៀមរាប" }
  },
  {
    id: 2,
    slug: "bayon-temple",
    name_en: "Bayon Temple",
    name_km: "ប្រាសាទបាយ័ន",
    cover_image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "temples-heritage", name_en: "Temples & Heritage", name_km: "ប្រាសាទ និងបេតិកភណ្ឌ" },
    province: { name_en: "Siem Reap", name_km: "សៀមរាប" }
  },
  {
    id: 9,
    slug: "temple-of-preah-vihear",
    name_en: "Temple of Preah Vihear",
    name_km: "ប្រាសាទព្រះវិហារ",
    cover_image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "temples-heritage", name_en: "Temples & Heritage", name_km: "ប្រាសាទ និងបេតិកភណ្ឌ" },
    province: { name_en: "Preah Vihear", name_km: "ព្រះវិហារ" }
  },
  {
    id: 12,
    slug: "phnom-kulen-national-park",
    name_en: "Phnom Kulen National Park",
    name_km: "ឧទ្យានជាតិភ្នំគូលែន",
    cover_image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "nature-waterfalls", name_en: "Nature & Waterfalls", name_km: "ធម្មជាតិ និងទឹកធ្លាក់" },
    province: { name_en: "Siem Reap", name_km: "សៀមរាប" }
  },
  {
    id: 6,
    slug: "royal-palace-silver-pagoda",
    name_en: "Royal Palace & Silver Pagoda",
    name_km: "ព្រះបរមរាជវាំង និងវត្តព្រះកែវមរកត",
    cover_image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "culture-museums", name_en: "Culture & Museums", name_km: "វប្បធម៌ និងសារមន្ទីរ" },
    province: { name_en: "Phnom Penh", name_km: "ភ្នំពេញ" }
  },
  {
    id: 7,
    slug: "bou-sraa-waterfall",
    name_en: "Bou Sraa Waterfall",
    name_km: "ទឹកធ្លាក់ប៊ូស្រា",
    cover_image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "nature-waterfalls", name_en: "Nature & Waterfalls", name_km: "ធម្មជាតិ និងទឹកធ្លាក់" },
    province: { name_en: "Mondulkiri", name_km: "មណ្ឌលគិរី" }
  },
  {
    id: 5,
    slug: "bokor-national-park-mountain",
    name_en: "Bokor National Park & Mountain",
    name_km: "ឧទ្យានជាតិព្រះមុនីវង្ស បូកគោ",
    cover_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    avg_rating: 5,
    category: { slug: "mountains-eco-tourism", name_en: "Mountains & Eco-tourism", name_km: "ភ្នំ និងអេកូទេសចរណ៍" },
    province: { name_en: "Kampot", name_km: "កំពត" }
  }
];


// User Avatar Component with image fallback
const UserAvatar = ({ user, size = "w-7 h-7 sm:w-8 sm:h-8", textSize = "text-[9px]", className = "" }) => {
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
        className={`${size} rounded-full object-cover border-2 border-white dark:border-stone-900 shadow-sm shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      title={user.name}
      className={`${size} rounded-full ${color} font-black ${textSize} flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm shrink-0 ${className}`}
    >
      {initials}
    </span>
  );
};

export const SplitHeroSection = ({
  featured = [],
  totalDestinations = 23,
  totalUsersCount = 85,
  communityUsers = [],
  km = false,
  L = (kmText, enText) => (km ? kmText : enText),
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Email capture state & handler
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      toast.error(
        L(
          "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ",
          "Please enter a valid email address"
        )
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await contentApi.subscribe(cleanEmail);
      setIsSubscribed(true);
      setEmail("");
      toast.success(
        L(
          "អរគុណសម្រាប់ការជាវ! យើងនឹងផ្ញើមគ្គុទ្ទេសក៍ទេសចរណ៍ល្អៗជូនលោកអ្នក។",
          "Thank you for subscribing! You will receive our curated heritage travel guides."
        )
      );
    } catch {
      setIsSubscribed(true);
      setEmail("");
      toast.success(
        L(
          "អរគុណសម្រាប់ការជាវ! យើងនឹងផ្ញើមគ្គុទ្ទេសក៍ទេសចរណ៍ល្អៗជូនលោកអ្នក។",
          "Thank you for subscribing! You will receive our curated heritage travel guides."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Curate 7 real destinations from the database, prioritizing Angkor Wat first to match the reference style 100%
  const slides = useMemo(() => {
    const rawList = Array.isArray(featured)
      ? featured
      : (featured && typeof featured === "object" ? Object.values(featured) : []);
    const list = rawList.length > 0 ? rawList : DEFAULT_HERO_DESTINATIONS;

    // Filter to premier destinations where is_featured is true, or top rated
    const featuredOnly = list.filter((d) => d && (d.is_featured === true || d.is_featured === 1));
    const pool = featuredOnly.length >= 5 ? featuredOnly : list;

    // Prioritize Angkor Wat first
    const angkor = pool.find((d) => (d?.slug || "").includes("angkor-wat") || (d?.name_en || "").includes("Angkor"));
    const others = pool.filter((d) => d !== angkor && d?.id !== angkor?.id);

    const ordered = angkor ? [angkor, ...others] : pool;
    return ordered.slice(0, 7);
  }, [featured]);

  // Auto-advance slides every 6 seconds, pausing on hover
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const currentDest = slides[activeIndex] || slides[0] || DEFAULT_HERO_DESTINATIONS[0];
  const currentName = km && currentDest?.name_km ? currentDest.name_km : currentDest?.name_en || "Angkor Wat";
  const currentImg = getHeroDestinationImage(currentDest);
  const currentExploreLabel = getExploreLabel(currentDest, km);
  const currentLink = `/destinations/${currentDest.slug || "angkor-wat"}`;

  return (
    <section className="relative w-full pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 overflow-hidden">
      {/* Soft Ambient Radiance Glows */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.22, 0.12]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[460px] h-[460px] bg-amber-500/20 dark:bg-amber-500/25 rounded-full blur-3xl"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.18, 0.08]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -right-32 w-[540px] h-[540px] bg-laterite-600/15 dark:bg-laterite-600/20 rounded-full blur-3xl"
        />
      </div>

      <PageContainer className="relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          {/* =================================================================== */}
          {/* LEFT COLUMN: Grand Bold Editorial Narrative & Live Stat Cards       */}
          {/* =================================================================== */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col space-y-6">
            {/* Grand Bold Editorial Headline */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              {km ? (
                <h1
                  className="font-heading font-black text-stone-950 dark:text-white tracking-tight font-khmer"
                  style={{ fontSize: "40px", lineHeight: "1.35" }}
                >
                  «សច្ចារក្សាដី ភក្តីការពារជាតិ{" "}
                  <span className="text-laterite-600 dark:text-laterite-400">
                    រក្សាវប្បធម៌ឲ្យនៅរស់រវើក ជាតិមិនសាបសូន្យ»
                  </span>
                </h1>
              ) : (
                <h1
                  className="font-heading font-black text-stone-950 dark:text-white tracking-tight font-khmer"
                  style={{ fontSize: "30px", lineHeight: "1.35" }}
                >
                  &ldquo;Committed to the land, loyal to the nation;{" "}
                  <span className="text-laterite-600 dark:text-laterite-400">
                    Preserve the culture, guard against its loss.&rdquo;
                  </span>
                </h1>
              )}

              {/* Subheading Narrative */}
              <p className="text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed font-sans text-sm sm:text-base font-normal">
                {L(
                  "បុព្វបុរសបានកសាងមហាអរិយធម៌ដោយញើសឈាម បញ្ញា និងជំនឿមុតមាំ។ ក្នុងនាមជាកូនចៅជំនាន់ក្រោយ ការថែរក្សា និងលើកស្ទួយអត្តសញ្ញាណជាតិ មិនមែនជាជម្រើសនោះទេ តែជាកាតព្វកិច្ចពិសិដ្ឋដែលត្រូវបន្តដុតបំភ្លឺកុំឱ្យរលត់ជាដាច់ខាត។",
                  "Our ancestors forged a great civilization through sweat, blood, profound wisdom, and unyielding faith. As the inheritors of this legacy, safeguarding and elevating our national identity is not merely a choice—it is a sacred duty to keep this flame burning eternally."
                )}
              </p>
            </motion.div>



            {/* Live Editorial Metrics Row (Elevated Khmer-Crafted Modern Stat Dock) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5"
            >
              {/* 1. Destinations Metric Card */}
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="group relative p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:shadow-laterite-600/5 hover:border-laterite-500/40 dark:hover:border-laterite-500/40 transition-all cursor-default overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-laterite-500/10 dark:bg-laterite-500/15 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span className="text-2xl sm:text-3xl font-heading font-black text-stone-950 dark:text-white tracking-tight leading-none">
                    {totalDestinations}+
                  </span>
                  <div className="w-8.5 h-8.5 rounded-xl bg-laterite-50 dark:bg-laterite-950/60 border border-laterite-200/60 dark:border-laterite-800/60 flex items-center justify-center text-laterite-600 dark:text-amber-400 shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0">
                    <Compass className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 font-khmer truncate">
                    {L("ទីតាំងទេសចរណ៍", "Curated Places")}
                  </span>
                  <span className="text-[10px] font-bold text-laterite-600 dark:text-amber-400 bg-laterite-50 dark:bg-laterite-950/80 px-2 py-0.5 rounded-full border border-laterite-200/50 dark:border-laterite-800/50 shrink-0">
                    {L("២៥ ខេត្ត", "25 Provinces")}
                  </span>
                </div>
              </motion.div>

              {/* 2. 100% Free & Verified Metric Card */}
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="group relative p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:shadow-emerald-600/5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-default overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                    100%
                  </span>
                  <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 font-khmer truncate">
                    {L("ឥតគិតថ្លៃ & ផ្ទៀងផ្ទាត់", "Free & Verified")}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{L("ពិតប្រាកដ", "Official")}</span>
                  </span>
                </div>
              </motion.div>

              {/* 3. Community Explorers (Real Database Users) */}
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="group relative p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-xl hover:shadow-amber-600/5 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all cursor-default overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex -space-x-2 items-center shrink-0">
                    {communityUsers.slice(0, 3).map((u, idx) => (
                      <UserAvatar
                        key={u.id || idx}
                        user={u}
                        size="w-8 h-8"
                        textSize="text-[10px]"
                        className="ring-2 ring-white dark:ring-stone-900 shadow-sm transition-transform group-hover:translate-x-0.5"
                      />
                    ))}
                    {totalUsersCount > 3 && (
                      <span
                        title={`${totalUsersCount} Explorers`}
                        className="w-8 h-8 rounded-full bg-stone-950 text-amber-400 font-extrabold text-[10px] flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm shrink-0 ring-2 ring-amber-500/30"
                      >
                        +{totalUsersCount - 3}
                      </span>
                    )}
                  </div>

                  <span className="text-xl sm:text-2xl font-heading font-black text-stone-950 dark:text-white leading-none">
                    {totalUsersCount}+
                  </span>
                </div>

                <div className="relative z-10 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 font-khmer truncate">
                    {L("សហគមន៍ទេសចរណ៍", "Community Explorers")}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-0.5 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </span>
                </div>
              </motion.div>
            </motion.div>

          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: Browser Mockup Showcase with Real Destination Data    */}
          {/* =================================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="lg:col-span-5 xl:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Ambient Background Glow Behind the Browser Window */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/15 via-laterite-600/10 to-transparent rounded-[40px] blur-2xl pointer-events-none -z-10" />

            {/* Browser Mockup Window Container */}
            <div
              className="relative w-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xl shadow-stone-900/12 dark:shadow-black/60 group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Top Browser Header Bar */}
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-start">
                {/* Domain / URL Address Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/60 text-xs font-mono text-stone-600 dark:text-stone-300 shadow-2xs select-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.2]" />
                  <span>camgo.com.kh</span>
                </div>
              </div>

              {/* Main Visual Image & Interactive Overlay Stage */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] xl:aspect-[16/11] overflow-hidden bg-stone-950 select-none">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentDest.slug || activeIndex}
                    src={currentImg}
                    alt={currentName}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Subtle Cinematic Vignette for Depth & Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/10 pointer-events-none" />

                {/* Left / Right Chevron Controls (Subtle, Appearing on Hover) */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous destination"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next destination"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Floating Glassmorphism Overlay Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-stone-950/85 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 sm:p-4.5 flex items-end justify-between gap-4 z-20 shadow-xl">
                  {/* Destination Title & Dynamic CTA Link */}
                  <div className="flex flex-col text-left space-y-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide leading-tight drop-shadow-sm truncate">
                      {currentName}
                    </h3>
                    <Link
                      to={currentLink}
                      className="text-amber-400 hover:text-amber-300 font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors group/cta cursor-pointer"
                    >
                      <span>{currentExploreLabel}</span>
                      <span className="transition-transform duration-200 group-hover/cta:translate-x-1 font-bold">
                        →
                      </span>
                    </Link>
                  </div>

                  {/* Slide Indicators / Pagination Dots */}
                  <div className="flex items-center gap-1.5 shrink-0 pb-1" role="tablist" aria-label="Destinations">
                    {slides.map((s, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={s.slug || idx}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`Go to slide ${idx + 1}`}
                          onClick={() => setActiveIndex(idx)}
                          className={`transition-all duration-300 cursor-pointer rounded-full ${isActive
                              ? "w-6 h-1.5 bg-amber-400 shadow-xs"
                              : "w-1.5 h-1.5 bg-white/40 hover:bg-white/80"
                            }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
};

export default SplitHeroSection;
