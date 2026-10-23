import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Share2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Clock
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { toast } from "@/store/toastStore";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/layout/EmptyState";
import { SEOHead } from "@/components/common/SEOHead";
import { ShareModal } from "@/components/common/ShareModal";
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

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    contentApi
      .getBlogPostBySlug(slug)
      .then((res) => {
        const item = res.data?.item || res.data;
        if (item) {
          setPost(item);
          // Fetch related articles
          contentApi.getBlogPosts({ per_page: 4 }).then((relRes) => {
            const relItems = relRes.data?.items || relRes.data || [];
            if (Array.isArray(relItems)) {
              setRelatedPosts(relItems.filter((p) => p.slug !== slug).slice(0, 3));
            }
          });
        }
      })
      .catch(() => {
        toast.error(t("common.error_occurred", "Article not found"));
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
          </div>

          {/* Hero image skeleton */}
          <div className="aspect-[16/9] sm:aspect-[21/9] rounded-3xl bg-stone-200 dark:bg-stone-800" />

          {/* Article content skeleton */}
          <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[36px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-4/6 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded" />
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
        <PageContainer className="max-w-md">
          <EmptyState
            icon={BookOpen}
            title={km ? "រកមិនឃើញអត្ថបទនេះទេ" : "Article Not Found"}
            description={
              km
                ? "អត្ថបទដែលអ្នកស្វែងរកប្រហែលជាត្រូវបានផ្លាស់ប្តូរ ឬលុបចេញពីប្រព័ន្ធ។"
                : "The article you are looking for may have been moved or removed."
            }
            actionLabel={km ? "ត្រឡប់ទៅអត្ថបទទាំងអស់" : "Back to All Articles"}
            actionTo="/blog"
          />
        </PageContainer>
      </div>
    );
  }

  const title = km && post.title_km ? post.title_km : post.title_en;
  const content = km && post.content_km ? post.content_km : post.content_en;
  const excerpt = km && post.excerpt_km ? post.excerpt_km : post.excerpt_en;
  const authorName =
    post.author?.name ||
    (typeof post.author === "string" ? post.author : "") ||
    post.user?.name ||
    (km ? "អ្នករៀបរៀងCamGO" : "CamGO Curator");

  return (
    <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={title}
        description={excerpt || content?.slice(0, 160)}
        image={post.cover_image || post.image_url}
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: excerpt || content?.slice(0, 200),
          image: post.cover_image || post.image_url,
          author: {
            "@type": "Person",
            name: authorName
          },
          datePublished: post.published_at || post.created_at
        }}
      />

      <PageContainer className="space-y-6 sm:space-y-8 max-w-5xl">
        {/* 1. BREADCRUMBS */}
        <Breadcrumbs
          items={[
            { label: km ? "អត្ថបទ និងព័ត៌មាន" : "Journal & Articles", to: "/blog" },
            { label: title }
          ]}
        />

        {/* 2. ANGKOR SANDSTONE JOURNAL HERO BANNER */}
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
            {/* Left Column: Title, Metadata, Excerpt */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-3">


                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                  {title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-medium text-stone-600 dark:text-stone-400 pt-1">
                  {post.published_at && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 font-mono text-stone-800 dark:text-stone-200 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                      <span>{post.published_at.substring(0, 10)}</span>
                    </div>
                  )}
                  {authorName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 font-semibold text-stone-800 dark:text-stone-200">
                      <User className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                      <span>{authorName}</span>
                    </div>
                  )}
                </div>
              </div>

              {excerpt && (
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed italic border-l-2 border-laterite-600 pl-4 py-1">
                  "{excerpt}"
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-[44px] px-5 sm:px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  title={km ? "ចែករំលែកអត្ថបទនេះ" : "Share this article"}
                >
                  <Share2 className="w-4 h-4" />
                  <span>{km ? "ចែករំលែកអត្ថបទ" : "Share Article"}</span>
                </button>

                <Link
                  to="/blog"
                  className="min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
                  <span>{km ? "អត្ថបទទាំងអស់" : "All Articles"}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Showcase Pane */}
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-200/90 dark:border-stone-800 relative shadow-md group">
                <img
                  src={
                    post.image_url ||
                    post.cover_image ||
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80"
                  }
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/10 text-stone-200 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {km ? "រូបភាពអត្ថបទស្រាវជ្រាវ" : "Heritage Editorial"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. ESSAY & ARTICLE CONTENT PANEL */}
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

          {/* Article Essay Body */}
          <div className="text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line space-y-4 font-sans text-[15px] sm:text-[16px]">
            {content}
          </div>

          {/* Author attribution / Curator note footer */}
          <div className="pt-6 mt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-laterite-600/10 border border-laterite-600/20 text-laterite-600 flex items-center justify-center font-bold shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">
                  {km ? "អ្នកនិពន្ធ / រៀបរៀង" : "Curated By"}
                </p>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {authorName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4 text-laterite-600 dark:text-laterite-400" />
              <span>{km ? "ចែករំលែកអត្ថបទនេះ" : "Share Article"}</span>
            </button>
          </div>
        </motion.article>

        {/* 4. RELATED ARTICLES CARDS */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">

                <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  {km ? "អត្ថបទដែលពាក់ព័ន្ធ" : "Related Articles"}
                </h2>
              </div>
              <Link
                to="/blog"
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
              {relatedPosts.map((rel) => {
                const relTitle = km && rel.title_km ? rel.title_km : rel.title_en;
                const relExcerpt = km && rel.excerpt_km ? rel.excerpt_km : rel.excerpt_en;
                return (
                  <motion.div key={rel.id} variants={fadeInUp}>
                    <Link
                      to={`/blog/${rel.slug}`}
                      className="rounded-3xl overflow-hidden flex flex-col justify-between group bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition-all select-none h-full"
                    >
                      <div>
                        {rel.image_url && (
                          <div className="aspect-[16/10] overflow-hidden bg-stone-200 dark:bg-stone-800">
                            <img
                              src={rel.image_url}
                              alt={relTitle}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-5 sm:p-6 space-y-2.5">
                          {rel.published_at && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-laterite-600" />
                              <span>{rel.published_at.substring(0, 10)}</span>
                            </div>
                          )}
                          <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100 group-hover:text-laterite-600 transition-colors line-clamp-2">
                            {relTitle}
                          </h3>
                          {relExcerpt && (
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                              {relExcerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-laterite-600">
                        <span>{km ? "អានបន្ត" : "Read Article"}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* 5. BACK TO JOURNAL LINK */}
        <div className="text-center pt-4">
          <Link
            to="/blog"
            className="min-h-[44px] px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-laterite-600 dark:text-laterite-400" />
            <span>{km ? "ត្រឡប់ទៅទំព័រអត្ថបទទាំងអស់" : "Back to All Articles"}</span>
          </Link>
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={title}
          description={excerpt}
        />
      </PageContainer>
    </div>
  );
};

export default BlogDetailPage;
