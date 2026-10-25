import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, Users, Compass, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { SEOHead } from "@/components/common/SEOHead";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { TeamMemberCard } from "@/components/common/TeamMemberCard";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

export const AboutPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  const [page, setPage] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Pull ONLY real data from database
  useEffect(() => {
    setIsLoading(true);

    Promise.allSettled([
      contentApi.getPage("about"),
      contentApi.getTeamMembers(),
      contentApi.getSettings ? contentApi.getSettings() : Promise.resolve(null),
    ])
      .then(([pageRes, teamRes, settingsRes]) => {
        if (pageRes.status === "fulfilled") {
          const item = pageRes.value?.data?.page || pageRes.value?.data?.item || pageRes.value?.data;
          if (item) setPage(item);
        }
        if (teamRes.status === "fulfilled") {
          const items = teamRes.value?.data?.items || teamRes.value?.data || [];
          if (Array.isArray(items)) setTeamMembers(items);
        }
        if (settingsRes && settingsRes.status === "fulfilled" && settingsRes.value) {
          const s = settingsRes.value?.data?.settings || settingsRes.value?.data || {};
          setSettings(s);
        }
      })
      .catch((err) => {
        console.error("Failed to load about data from database", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Title and content strictly from DB
  const title = km && page?.title_km ? page.title_km : (page?.title_en || page?.title_km || "");
  const content = km && page?.content_km ? page.content_km : (page?.content_en || page?.content_km || "");

  // Format content into clean paragraphs
  const paragraphs = content
    ? content.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="stone-grain min-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20 selection:bg-amber-500 selection:text-stone-950">
      <SEOHead
        title={title ? `${title} — CamGO` : (km ? "អំពីយើង — CamGO Travel" : "About Us — CamGO Travel")}
        description={content ? content.slice(0, 160) : ""}
      />

      <PageContainer className="space-y-10 sm:space-y-14">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "អំពីយើង" : "About Us" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. KHMER ARCHITECTURAL ABOUT HERO SECTION                           */}
        {/* =================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl sm:rounded-[36px] overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-10 lg:p-12 shadow-sm"
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
            <RumduolFlower size={440} className="text-laterite-600" />
          </motion.div>

          <div className="relative z-10 w-full min-w-0 space-y-6">

            {/* Title from Database */}
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-stone-950 dark:text-white tracking-tight leading-[1.12] break-words">
              {title || (km ? "អំពី CamGO Travel" : "About CamGO Travel")}
            </h1>

            {/* Content from Database */}
            {isLoading ? (
              <div className="space-y-3 py-2 w-full">
                <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-4/6 animate-pulse" />
              </div>
            ) : paragraphs.length > 0 ? (
              <div className="w-full max-w-none text-stone-700 dark:text-stone-300 font-sans text-sm sm:text-base leading-8 font-medium space-y-5 break-words">
                {paragraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className="w-full max-w-none whitespace-pre-line break-words text-left"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ) : content ? (
              <p className="w-full max-w-none min-w-0 text-stone-700 dark:text-stone-300 font-sans text-sm sm:text-base leading-8 whitespace-pre-line break-words font-medium text-left">
                {content}
              </p>
            ) : null}

            {/* Heritage Values Counters */}
            <div className="pt-5 border-t border-stone-200 dark:border-stone-800 grid grid-cols-3 gap-3 text-center sm:text-left">

              <div className="min-w-0 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700 shadow-sm">
                <div className="text-lg sm:text-xl font-black font-mono text-stone-900 dark:text-stone-100">
                  {km ? "25 ខេត្ត" : "25 Prov"}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1">
                  {km ? "គ្របដណ្តប់ទូទាំងប្រទេស" : "Full Coverage"}
                </div>
              </div>

              <div className="min-w-0 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700 shadow-sm">
                <div className="text-lg sm:text-xl font-black font-mono text-stone-900 dark:text-stone-100">
                  100%
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1">
                  {km ? "ស្រាវជ្រាវផ្ទាល់" : "Verified Guide"}
                </div>
              </div>

              <div className="min-w-0 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700 shadow-sm">
                <div className="text-lg sm:text-xl font-black font-mono text-laterite-600 dark:text-amber-400">
                  {km ? "ឥតគិតថ្លៃ" : "Free"}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-khmer font-bold mt-1">
                  {km ? "សម្រាប់សាធារណជន" : "For Travelers"}
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. OUR TEAM MEMBERS (FROM DATABASE: team_members table)             */}
        {/* =================================================================== */}
        {teamMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="space-y-1.5">

                <h2 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 dark:text-stone-100 tracking-tight">
                  {km ? "សមាជិកក្រុមការងារ" : "Team Members"}
                </h2>
              </div>

              <div className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-mono font-bold text-stone-600 dark:text-stone-300 self-start sm:self-auto">
                {km ? `សមាជិក ${toKm(teamMembers.length)} នាក់` : `${teamMembers.length} Members`}
              </div>
            </div>

            {/* Team Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  km={km}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* 3. EXPLORE PORTAL ACTION (Matched to Trip Planner Spotlight)        */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 sm:p-10 lg:p-12 rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          {/* Ambient Rotating Rumduol Flower Watermark */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute -right-12 -bottom-12 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
          >
            <RumduolFlower size={340} className="text-laterite-600" />
          </motion.div>

          <div className="space-y-2 max-w-xl relative z-10">


            <h3 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              {km ? "រុករកតំបន់ទេសចរណ៍កម្ពុជា" : "Explore Kingdom of Cambodia"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans font-medium">
              {km
                ? "ស្វែងរកតំបន់ទេសចរណ៍ទាំង 25 ខេត្ត-រាជធានី និងមើលលើប្រព័ន្ធផែនទីអន្តរកម្ម។"
                : "Discover destinations across all provinces and explore interactive GIS maps."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <Link
              to="/destinations"
              className="btn-primary min-h-[44px] px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{km ? "រុករកតំបន់ទេសចរណ៍" : "Explore Destinations"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/map"
              className="btn-secondary min-h-[44px] px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-stone-300 dark:border-stone-700 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-laterite-600 dark:text-amber-400" />
              <span>{km ? "មើលផែនទី" : "View Map"}</span>
            </Link>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
};

export default AboutPage;
