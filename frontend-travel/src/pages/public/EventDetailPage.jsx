import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  Sparkles,
  ArrowRight,
  Compass,
  Tag
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { toast } from "@/store/toastStore";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/layout/EmptyState";
import { SEOHead } from "@/components/common/SEOHead";
import { ShareModal } from "@/components/common/ShareModal";
import { EventCard } from "@/components/events/EventCard";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const EventDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    contentApi
      .getEventBySlug(slug)
      .then((res) => {
        const item = res.data?.item || res.data;
        if (item) {
          setEvent(item);
          // Fetch related events
          contentApi.getEvents({ per_page: 4 }).then((relRes) => {
            const relItems = relRes.data?.items || relRes.data || [];
            if (Array.isArray(relItems)) {
              setRelatedEvents(relItems.filter((e) => e.slug !== slug).slice(0, 3));
            }
          });
        }
      })
      .catch(() => {
        toast.error(t("common.error_occurred", "Event not found"));
      })
      .finally(() => setIsLoading(false));
  }, [slug, t]);

  const handleShare = () => {
    setShareModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
        <PageContainer className="max-w-5xl space-y-6 sm:space-y-8 animate-pulse">
          <div className="h-6 w-52 bg-stone-200 dark:bg-stone-800 rounded-xl" />

          {/* Header block skeleton */}
          <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[36px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="h-6 w-44 bg-stone-200 dark:bg-stone-800 rounded-full" />
            <div className="h-10 w-3/4 bg-stone-300 dark:bg-stone-700 rounded-2xl" />
            <div className="h-5 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-stone-200 dark:bg-stone-800" />
              ))}
            </div>
          </div>

          {/* Event description skeleton */}
          <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[36px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-4/6 bg-stone-200 dark:bg-stone-800 rounded" />
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
        <PageContainer className="max-w-md">
          <EmptyState
            icon={Calendar}
            title={km ? "រកមិនឃើញកម្មវិធីនេះទេ" : "Event Not Found"}
            description={
              km
                ? "កម្មវិធីបុណ្យដែលអ្នកស្វែងរកប្រហែលជាត្រូវបានផ្លាស់ប្តូរ ឬផុតកំណត់។"
                : "The event you are looking for may have ended or been moved."
            }
            actionLabel={km ? "ត្រឡប់ទៅកម្មវិធីបុណ្យទាំងអស់" : "Back to All Events"}
            actionTo="/events"
          />
        </PageContainer>
      </div>
    );
  }

  const title = km && event.title_km ? event.title_km : event.title_en;
  const description = km && event.description_km ? event.description_km : event.description_en;
  const excerpt = km && event.excerpt_km ? event.excerpt_km : event.excerpt_en;

  return (
    <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={title}
        description={excerpt || description?.slice(0, 160)}
        image={event.cover_image || event.image_url}
        type="event"
        schema={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: title,
          description: excerpt || description?.slice(0, 200),
          image: event.cover_image || event.image_url,
          startDate: event.start_date,
          endDate: event.end_date,
          location: event.location
            ? {
              "@type": "Place",
              name: event.location
            }
            : undefined
        }}
      />

      <PageContainer className="space-y-6 sm:space-y-8 max-w-5xl">
        {/* 1. BREADCRUMBS */}
        <Breadcrumbs
          items={[
            { label: km ? "ពិធីបុណ្យ និងព្រឹត្តិការណ៍" : "Festivals & Events", to: "/events" },
            { label: title }
          ]}
        />

        {/* 2. ANGKOR SANDSTONE EVENT HERO BANNER */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden"
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

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Title, Metadata, Facts */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-3">


                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                  {title}
                </h1>

                {/* Location and Date Quick Details */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-medium text-stone-600 dark:text-stone-400 pt-1">
                  {event.start_date && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 font-mono text-stone-800 dark:text-stone-200 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                      <span>
                        {event.start_date} {event.end_date ? `— ${event.end_date}` : ""}
                      </span>
                    </div>
                  )}
                  {event.location && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 font-semibold text-stone-800 dark:text-stone-200">
                      <MapPin className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Quick Facts Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium leading-tight">
                    {km ? "ចាប់ផ្តើម" : "Start Date"}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 mt-1 truncate">
                    {event.start_date || (km ? "មិនទាន់កំណត់" : "TBA")}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium leading-tight">
                    {km ? "បញ្ចប់" : "End Date"}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 mt-1 truncate">
                    {event.end_date || event.start_date || (km ? "ថ្ងៃដដែល" : "Same day")}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium leading-tight">
                    {km ? "ទីតាំង" : "Venue"}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 mt-1 truncate">
                    {event.location || (km ? "ទូទាំងកម្ពុជា" : "Cambodia")}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium leading-tight">
                    {km ? "ប្រភេទ" : "Category"}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-laterite-600 dark:text-laterite-400 mt-1 truncate">
                    {event.type || (km ? "បុណ្យជាតិ" : "Traditional")}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-[44px] px-5 sm:px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  title={km ? "ចែករំលែកកម្មវិធីនេះ" : "Share this event"}
                >
                  <Share2 className="w-4 h-4" />
                  <span>{km ? "ចែករំលែកកម្មវិធី" : "Share Event"}</span>
                </button>

                <Link
                  to="/events"
                  className="min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
                  <span>{km ? "ប្រតិទិនបុណ្យ" : "Festival Calendar"}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Showcase Pane */}
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-200/90 dark:border-stone-800 relative shadow-md group">
                <img
                  src={
                    event.image_url ||
                    event.cover_image ||
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80"
                  }
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/10 text-stone-200 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {km ? "ទិដ្ឋភាពកម្មវិធីប្រពៃណី" : "Living Heritage Gathering"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. EVENT DESCRIPTION & NARRATIVE BLOCK */}
        <motion.article
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-10 lg:p-12 shadow-sm space-y-6 relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-laterite-600/5 rounded-full blur-2xl pointer-events-none" />

          {/* Excerpt Lead Box (if available) */}
          {excerpt && (
            <div className="p-5 sm:p-6 rounded-2xl bg-laterite-500/5 dark:bg-laterite-500/10 border-l-4 border-laterite-600 text-stone-800 dark:text-stone-200 italic font-medium leading-relaxed text-sm sm:text-base">
              "{excerpt}"
            </div>
          )}

          {/* Description Content */}
          <div className="text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line space-y-4 font-sans text-[15px] sm:text-[16px]">
            {description}
          </div>

          {/* Footer of Event Description */}
          <div className="pt-6 mt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-laterite-600/10 border border-laterite-600/20 text-laterite-600 flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">
                  {km ? "បេតិកភណ្ឌ និងទំនៀមទម្លាប់ខ្មែរ" : "Cambodian Cultural Living Heritage"}
                </p>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {km ? "CamGO Travel អត្លាស" : "CamGO Travel Atlas"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
              <span>{km ? "ចែករំលែកកម្មវិធីនេះ" : "Share Event"}</span>
            </button>
          </div>
        </motion.article>

        {/* 4. RELATED EVENTS SECTION */}
        {relatedEvents.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">

                <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  {km ? "ពិធីបុណ្យ និងកម្មវិធីផ្សេងទៀត" : "Other Upcoming Events"}
                </h2>
              </div>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-wider shadow-xs transition-all self-start sm:self-auto"
              >
                <span>{km ? "មើលទាំងអស់" : "View All"}</span>
                <ArrowRight className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
              </Link>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            >
              {relatedEvents.map((evt) => (
                <motion.div key={evt.id} variants={fadeInUp}>
                  <EventCard event={evt} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* 5. BACK TO EVENTS LINK */}
        <div className="text-center pt-4">
          <Link
            to="/events"
            className="min-h-[44px] px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-laterite-600 dark:text-laterite-400" />
            <span>{km ? "ត្រឡប់ទៅកម្មវិធីបុណ្យទាំងអស់" : "Back to All Events"}</span>
          </Link>
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={title}
          description={excerpt || description?.slice(0, 160)}
        />
      </PageContainer>
    </div>
  );
};

export default EventDetailPage;
