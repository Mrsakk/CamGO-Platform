import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles, Calendar, Clock, MapPin, Compass, Route,
  Share2, Printer, Map as MapIcon, Plus, Trash2, Edit3,
  ChevronUp, ChevronDown, Check, X, ArrowRight, Lightbulb
} from "lucide-react";
import { useTripPlannerStore } from "@/store/tripPlannerStore";
import { SEOHead } from "@/components/common/SEOHead";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RumduolFlower } from "@/components/common/RumduolMotifs";
import { toast } from "@/store/toastStore";
import { SelectDestinationModal } from "@/components/planner/SelectDestinationModal";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const POPULAR_PROVINCES = [
  "Siem Reap",
  "Phnom Penh",
  "Kampot",
  "Preah Sihanouk",
  "Koh Kong",
  "Mondulkiri",
  "Battambang",
  "Kep"
];

export const TripPlannerPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";

  const {
    plans,
    activePlanId,
    setActivePlanId,
    createPlan,
    deletePlan,
    addDayToActivePlan,
    removeDayFromActivePlan,
    addDestinationToDay,
    removeItemFromDay,
    moveItemInDay,
    updateItemTimeAndNote
  } = useTripPlannerStore();

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || null;
  const [activeDayNum, setActiveDayNum] = useState(1);
  const [isNewPlanModal, setIsNewPlanModal] = useState(false);
  const [isSelectDestModalOpen, setIsSelectDestModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProvince, setNewProvince] = useState("Siem Reap");

  // Inline editing state for time and notes
  const [editingItemId, setEditingItemId] = useState(null);
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const currentDay = activePlan?.days?.find((d) => d.day === activeDayNum) || activePlan?.days?.[0];

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newId = createPlan({
      title: newTitle,
      title_en: newTitle,
      province: newProvince
    });
    setActivePlanId(newId);
    setActiveDayNum(1);
    setIsNewPlanModal(false);
    setNewTitle("");
    toast.success(km ? "បានបង្កើតកាលវិភាគថ្មីជោគជ័យ!" : "Created new travel itinerary!");
  };

  const handleShareToTelegram = () => {
    if (!activePlan) return;
    const planTitle = km ? activePlan.title : activePlan.title_en || activePlan.title;
    let message = `[ កាលវិភាគដំណើរកម្សាន្ត: ${planTitle} ]\n[ ខេត្តគោលដៅ: ${activePlan.province} ]\n\n`;

    activePlan.days?.forEach((d) => {
      message += `--- ${km ? `ថ្ងៃទី ${toKm(d.day)}` : `Day ${d.day}`}: ${km ? d.title : d.title_en || d.title} ---\n`;
      if (d.items?.length) {
        d.items.forEach((it) => {
          message += `  • ម៉ោង ${it.time || "09:00 AM"} - ${km ? it.name_km : it.name_en}\n`;
          if (it.notes) message += `    (${it.notes})\n`;
        });
      } else {
        message += `  • (មិនទាន់មានទីកន្លែង)\n`;
      }
      message += `\n`;
    });

    message += `រៀបចំជាមួយ CamGO Travel Portal`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
    window.open(tgUrl, "_blank");
  };

  const totalItemsCount = activePlan?.days?.reduce((sum, d) => sum + (d.items?.length || 0), 0) || 0;
  const provincesCount = (() => {
    const set = new Set();
    if (activePlan?.province) set.add(activePlan.province);
    activePlan?.days?.forEach((d) => {
      d.items?.forEach((it) => {
        if (it.province) set.add(it.province);
      });
    });
    return set.size || 1;
  })();

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "រៀបចំកាលវិភាគដើរកម្សាន្ត — CamGO" : "Travel Itinerary Planner — CamGO"}
        description={
          km
            ? "បង្កើត និងរៀបចំកាលវិភាគដើរកម្សាន្តតាមថ្ងៃនៅកម្ពុជា រួមទាំងប្រាសាទបុរាណ កោះ ទឹកធ្លាក់ និងចែករំលែកបានយ៉ាងងាយស្រួល។"
            : "Plan and customize day-by-day itineraries across Cambodia. Schedule attractions, add personal travel notes, and export or share."
        }
      />

      <PageContainer className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "កាលវិភាគដំណើរកម្សាន្ត" : "Trip Planner" },
          ]}
        />

        {/* ========================================================================= */}
        {/* 1. ANGKOR SANDSTONE EXPEDITION PLANNER HERO BANNER                        */}
        {/* ========================================================================= */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden space-y-6"
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

          {/* Top Row: Title, Tagline & Action Bar */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-stone-950 dark:text-white leading-[1.12]">
                {km ? "រៀបចំកាលវិភាគដំណើរកម្សាន្ត" : "Trip Itinerary Planner"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed max-w-2xl font-medium">
                {km
                  ? "រៀបចំផែនការទស្សនាប្រាសាទបុរាណ កោះ ឆ្នេរ ទឹកធ្លាក់ កំណត់ម៉ោងទស្សនា កត់ត្រាចំណាំ និងចែករំលែកបានយ៉ាងងាយស្រួល។"
                  : "Customize day-by-day itineraries across Cambodia. Schedule visiting hours, add personal notes, and share."}
              </p>
            </div>

            {/* Quick Actions (Print, Telegram, New Trip, Map) */}
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={() => setIsNewPlanModal(true)}
                className="h-11 px-5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{km ? "បង្កើតគម្រោងថ្មី" : "New Trip"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareToTelegram}
                className="h-11 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-sans font-semibold uppercase flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                title={km ? "ចែករំលែកតាម Telegram" : "Share via Telegram"}
              >
                <Share2 className="w-3.5 h-3.5 text-laterite-600 dark:text-amber-400" />
                <span>{km ? "ចែករំលែក" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="h-11 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-sans font-semibold uppercase flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                title={km ? "បោះពុម្ពកាលវិភាគ" : "Print Itinerary"}
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span>{km ? "បោះពុម្ព" : "Print"}</span>
              </button>

              <Link
                to="/map"
                className="h-11 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-sans font-semibold uppercase flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                title={km ? "មើលលើផែនទីអន្តរកម្ម" : "Open Map"}
              >
                <MapIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>{km ? "ផែនទី" : "Map"}</span>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="relative z-10 border-t border-stone-200/90 dark:border-stone-800" />

          {/* Bottom Row: Plan Switcher Pills & Concise Overview Metrics */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
            {/* Plan Switcher Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
              <span className="text-xs uppercase font-sans font-bold text-stone-500 whitespace-nowrap mr-1">
                {km ? "គម្រោង:" : "Plans:"}
              </span>
              {plans.map((p) => {
                const isSelected = p.id === activePlan?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePlanId(p.id);
                      setActiveDayNum(1);
                    }}
                    className={`h-10 px-4 rounded-2xl text-xs font-sans font-bold uppercase transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${isSelected
                        ? "bg-laterite-600 text-white border-laterite-700 shadow-sm"
                        : "bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700/80 hover:border-laterite-500 hover:bg-stone-100"
                      }`}
                  >
                    <span className="whitespace-nowrap">{km ? p.title : p.title_en || p.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isSelected
                          ? "bg-black/25 text-white"
                          : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                        }`}
                    >
                      {toKm(p.days?.length || 1)}d
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsNewPlanModal(true)}
                className="h-10 px-3.5 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-laterite-500 text-stone-600 dark:text-stone-400 hover:text-laterite-600 text-xs font-sans font-bold uppercase flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{km ? "ថែមគម្រោង" : "Add Trip"}</span>
              </button>
            </div>

            {/* Active Plan Meta Stats Strip */}
            {activePlan && (
              <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 shadow-2xs">
                  <span className="font-bold text-laterite-600 dark:text-laterite-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activePlan.province || "Cambodia"}</span>
                  </span>
                  <span className="text-stone-300 dark:text-stone-600">•</span>
                  <span className="font-mono font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>{toKm(activePlan?.days?.length || 1)} {km ? "ថ្ងៃដំណើរ" : "Days"}</span>
                  </span>
                  <span className="text-stone-300 dark:text-stone-600">•</span>
                  <span className="font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{toKm(totalItemsCount)} {km ? "ទីកន្លែង" : "Sights"}</span>
                  </span>
                </div>

                {plans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(km ? "តើអ្នកពិតជាចង់លុបគម្រោងនេះមែនទេ?" : "Delete this trip?")) {
                        deletePlan(activePlan.id);
                      }
                    }}
                    className="h-9 px-3 text-xs font-sans font-bold uppercase text-danger-600 hover:text-white hover:bg-danger-600 border border-danger-600/30 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    title={km ? "លុបគម្រោងនេះ" : "Delete trip"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{km ? "លុប" : "Delete"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.section>



        {/* ========================================================================= */}
        {/* 2. MAIN WORKSPACE GRID: TIMELINE & SIDE OVERVIEW                          */}
        {/* ========================================================================= */}
        {activePlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column (4 Cols): Trip Summary & Day Breakdown Rail */}
            <div className="lg:col-span-4 space-y-5">

              {/* Trip Outline Card */}
              <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-laterite-600/10 border border-laterite-600/20 text-xs font-bold text-laterite-600 dark:text-amber-400 font-khmer">
                    <Route className="w-3.5 h-3.5" />
                    <span>{km ? "ទិដ្ឋភាពទូទៅនៃដំណើរកម្សាន្ត" : "Trip Overview"}</span>
                  </div>
                  <h2 className="text-xl font-heading font-black text-stone-950 dark:text-white leading-snug">
                    {km ? activePlan.title : activePlan.title_en || activePlan.title}
                  </h2>
                </div>

                {/* Day Progression Rail */}
                <div className="space-y-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block">
                    {km ? "កាលវិភាគតាមថ្ងៃ:" : "Schedule by Day:"}
                  </span>

                  <div className="space-y-2">
                    {activePlan.days?.map((d) => {
                      const isCurrent = d.day === activeDayNum;
                      return (
                        <div
                          key={d.day}
                          onClick={() => setActiveDayNum(d.day)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isCurrent
                              ? "bg-laterite-500/10 border-laterite-500/40 text-stone-950 dark:text-white shadow-2xs ring-1 ring-laterite-500/20"
                              : "bg-stone-50 dark:bg-stone-850 border-stone-200/90 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-laterite-400 hover:bg-stone-100"
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs ${isCurrent
                                  ? "bg-laterite-600 text-white"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                                }`}
                            >
                              {toKm(d.day)}
                            </span>
                            <div className="truncate text-xs font-sans font-medium">
                              <span className="font-bold block truncate text-stone-900 dark:text-stone-100">
                                {km ? d.title : d.title_en || d.title}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shrink-0">
                            {toKm(d.items?.length || 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Add Day Button */}
                <button
                  type="button"
                  onClick={addDayToActivePlan}
                  className="w-full h-11 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-laterite-500 text-stone-700 dark:text-stone-300 hover:text-laterite-600 text-xs font-sans font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {km ? `បន្ថែមថ្ងៃទី ${toKm((activePlan.days?.length || 0) + 1)}` : "+ Add Another Day"}
                  </span>
                </button>
              </div>

              {/* Travel Wisdom & Tips Card */}
              <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400 font-khmer">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{km ? "គន្លឹះរៀបចំដំណើរ" : "Travel Tips"}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                  {km
                    ? "គួរចេញដំណើរពីព្រលឹមដើម្បីទស្សនាថ្ងៃរះ និងជៀសវាងកម្តៅថ្ងៃខ្លាំងនៅពេលថ្ងៃត្រង់។ កុំភ្លេចពាក់សម្លៀកបំពាក់សមរម្យពេលចូលទស្សនាប្រាសាទបុរាណ។"
                    : "Start early for sunrise and beat the midday heat. Wear respectful attire covering shoulders and knees when visiting ancient temples."}
                </p>
                <div className="pt-2 flex items-center gap-2.5">
                  <Link
                    to="/destinations"
                    className="flex-1 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase flex items-center justify-center transition-colors border border-stone-200 dark:border-stone-700"
                  >
                    <span>{km ? "រុករកគោលដៅ →" : "Destinations →"}</span>
                  </Link>
                  <Link
                    to="/map"
                    className="h-10 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase flex items-center justify-center transition-colors border border-stone-200 dark:border-stone-700"
                  >
                    <span>{km ? "ផែនទី" : "Map"}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column (8 Cols): Day Timeline & Scheduled Items */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm space-y-6">

                {/* Active Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-5 gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-laterite-600/10 border border-laterite-600/20 text-xs font-bold text-laterite-600 dark:text-amber-400 font-khmer">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{km ? `កាលវិភាគថ្ងៃទី ${toKm(currentDay?.day || 1)}` : `Day ${currentDay?.day || 1} Timeline`}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-heading font-black text-stone-950 dark:text-white tracking-tight">
                      {km ? currentDay?.title : currentDay?.title_en || currentDay?.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsSelectDestModalOpen(true)}
                      className="h-11 px-5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{km ? "បន្ថែមទីកន្លែង" : "Add Sight"}</span>
                    </button>

                    {activePlan.days?.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(km ? "តើអ្នកចង់លុបថ្ងៃនេះចេញមែនទេ?" : "Remove this day?")) {
                            removeDayFromActivePlan(currentDay?.day);
                            setActiveDayNum(1);
                          }
                        }}
                        className="h-11 px-3.5 rounded-2xl border border-danger-600/30 text-danger-600 hover:bg-danger-600 hover:text-white font-sans font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={km ? "លុបថ្ងៃនេះ" : "Delete Day"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{km ? "លុបថ្ងៃនេះ" : "Delete Day"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline Items List */}
                {currentDay?.items?.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-5 sm:before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-laterite-500 before:via-amber-400 before:to-stone-200 dark:before:to-stone-800">
                    {currentDay.items.map((it, idx) => (
                      <div
                        key={it.id}
                        className="relative pl-11 sm:pl-14 group transition-all"
                      >
                        {/* Stop Number Circle */}
                        <div className="absolute left-2.5 sm:left-3.5 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-stone-900 text-laterite-600 dark:text-amber-400 text-xs font-mono font-black flex items-center justify-center shadow-sm border-2 border-laterite-600 z-10">
                          {toKm(idx + 1)}
                        </div>

                        {/* Itinerary Destination Card */}
                        <motion.div
                          whileHover={{ y: -3, scale: 1.008 }}
                          whileTap={{ scale: 0.995 }}
                          transition={{ type: "spring", stiffness: 360, damping: 24 }}
                        >
                        <div className="rounded-3xl bg-stone-50/90 dark:bg-stone-850 border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-sm hover:border-laterite-400/50">
                          <div className="flex flex-col sm:flex-row gap-4">

                            {/* Destination Image */}
                            <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800 relative border border-stone-200 dark:border-stone-700/80">
                              <img
                                src={it.image}
                                alt={it.name_km}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-xs text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                                {it.category || "Attraction"}
                              </span>
                            </div>

                            {/* Destination Content & Controls */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                {/* Row: Time & Controls */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-laterite-500/10 text-laterite-700 dark:text-amber-400 border border-laterite-500/20 text-xs font-mono font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{it.time || "09:00 AM"}</span>
                                  </div>

                                  {/* Item Actions */}
                                  <div className="flex items-center gap-1">
                                    {/* Move Up */}
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() =>
                                        moveItemInDay(activePlan.id, currentDay.day, it.id, "up")
                                      }
                                      className="w-8 h-8 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border border-stone-200 dark:border-stone-800 flex items-center justify-center"
                                      title={km ? "ផ្លាស់ទីឡើងលើ" : "Move Up"}
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    {/* Move Down */}
                                    <button
                                      type="button"
                                      disabled={idx === currentDay.items.length - 1}
                                      onClick={() =>
                                        moveItemInDay(activePlan.id, currentDay.day, it.id, "down")
                                      }
                                      className="w-8 h-8 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border border-stone-200 dark:border-stone-800 flex items-center justify-center"
                                      title={km ? "ផ្លាស់ទីចុះក្រោម" : "Move Down"}
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingItemId(it.id);
                                        setEditTime(it.time || "09:00 AM");
                                        setEditNotes(it.notes || "");
                                      }}
                                      className="h-8 px-2.5 rounded-xl text-xs font-sans font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-stone-200 dark:border-stone-800 flex items-center gap-1"
                                      title={km ? "កែសម្រួលម៉ោង / ចំណាំ" : "Edit Time / Note"}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>{km ? "កែ" : "Edit"}</span>
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeItemFromDay(activePlan.id, currentDay.day, it.id)
                                      }
                                      className="w-8 h-8 rounded-xl text-xs font-bold text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors cursor-pointer border border-danger-600/30 flex items-center justify-center"
                                      title={km ? "លុបចេញ" : "Remove"}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Destination Title */}
                                <Link
                                  to={it.slug ? `/destinations/${it.slug}` : "#"}
                                  className="text-base sm:text-lg font-heading font-black text-stone-950 dark:text-white hover:text-laterite-600 dark:hover:text-amber-400 transition-colors mt-2 block line-clamp-1 tracking-tight"
                                >
                                  {km ? it.name_km : it.name_en}
                                </Link>

                                {/* Inline Editing Form */}
                                {editingItemId === it.id ? (
                                  <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 space-y-3 shadow-sm">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input
                                        type="text"
                                        value={editTime}
                                        onChange={(e) => setEditTime(e.target.value)}
                                        placeholder="09:00 AM"
                                        className="w-full sm:w-36 h-10 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-laterite-600"
                                      />
                                      <input
                                        type="text"
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        placeholder={km ? "កត់ត្រាចំណាំផ្ទាល់ខ្លួន..." : "Travel notes..."}
                                        className="flex-1 h-10 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-laterite-600"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setEditingItemId(null)}
                                        className="h-8 px-3 rounded-xl text-xs font-sans font-semibold uppercase text-stone-600 hover:text-stone-900 cursor-pointer"
                                      >
                                        {km ? "បោះបង់" : "Cancel"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateItemTimeAndNote(
                                            activePlan.id,
                                            currentDay.day,
                                            it.id,
                                            editTime,
                                            editNotes
                                          );
                                          setEditingItemId(null);
                                        }}
                                        className="h-8 px-4 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase cursor-pointer shadow-2xs"
                                      >
                                        {km ? "រក្សាទុក" : "Save"}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {it.notes ? (
                                      <div className="text-xs text-stone-700 dark:text-stone-300 mt-2 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-2">
                                        <span className="text-laterite-600 dark:text-amber-400 font-bold shrink-0">💬</span>
                                        <span className="italic font-medium">"{it.notes}"</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingItemId(it.id);
                                          setEditTime(it.time || "09:00 AM");
                                          setEditNotes("");
                                        }}
                                        className="text-xs text-stone-400 hover:text-laterite-600 dark:hover:text-amber-400 mt-2 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                                      >
                                        <span>+ {km ? "បន្ថែមចំណាំផ្ទាល់ខ្លួន" : "Add note"}</span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Footer: Stop Info & Detail Link */}
                              <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
                                <span className="text-stone-500 font-sans font-bold">
                                  {km ? `លំដាប់ទី ${toKm(idx + 1)}` : `Stop #${idx + 1}`}
                                </span>
                                {it.slug && (
                                  <Link
                                    to={`/destinations/${it.slug}`}
                                    className="text-laterite-600 dark:text-amber-400 hover:underline font-sans font-bold uppercase text-xs flex items-center gap-1"
                                  >
                                    <span>{km ? "មើលព័ត៌មានលម្អិត" : "View Details"}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        </motion.div>
                      </div>
                    ))}

                    {/* Add Another Sight Prompt */}
                    <div className="pl-11 sm:pl-14 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSelectDestModalOpen(true)}
                        className="w-full h-12 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-laterite-600 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          {km
                            ? `បន្ថែមទីកន្លែងទៅថ្ងៃទី ${toKm(currentDay?.day || 1)}`
                            : `Add Another Sight to Day ${currentDay?.day || 1}`}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty state for day */
                  <div className="py-14 text-center bg-stone-50/60 dark:bg-stone-950 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-10 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-laterite-600/10 text-laterite-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold shadow-2xs">
                      <Compass className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-heading font-black text-stone-950 dark:text-white tracking-tight">
                      {km ? "មិនទាន់មានទីកន្លែងសម្រាប់ថ្ងៃនេះនៅឡើយទេ" : "No sights scheduled for this day"}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                      {km
                        ? "សូមចុចប៊ូតុងខាងក្រោមដើម្បីរុករក និងជ្រើសរើសប្រាសាទ កោះ ឆ្នេរ ឬទឹកធ្លាក់បញ្ចូលក្នុងថ្ងៃនេះ។"
                        : "Click below to search and pick sanctuaries, waterfalls, and beaches to add to this day."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSelectDestModalOpen(true)}
                      className="mt-3 h-11 inline-flex items-center gap-2 px-6 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{km ? "ជ្រើសរើសទីកន្លែង" : "Select Sights"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </PageContainer>

      {/* ========================================================================= */}
      {/* 3. NEW TRIP MODAL                                                         */}
      {/* ========================================================================= */}
      {isNewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden">
            {/* Ambient Modal Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-laterite-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-laterite-600/10 text-laterite-600 dark:text-amber-400 text-xs font-bold mb-1 font-khmer">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{km ? "គម្រោងដំណើរកម្សាន្តថ្មី" : "New Travel Expedition"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-stone-950 dark:text-white tracking-tight">
                  {km ? "បង្កើតកាលវិភាគថ្មី" : "Create New Trip"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsNewPlanModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="relative z-10 mt-5 space-y-4">
              <div>
                <label className="text-xs font-sans font-bold uppercase text-stone-700 dark:text-stone-300 block mb-1.5">
                  {km ? "ឈ្មោះគម្រោងដំណើរ:" : "Trip Title:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={km ? "ឧ. ដំណើរកម្សាន្តកោះរ៉ុង 3 ថ្ងៃ 2 យប់" : "e.g. 3-Day Koh Rong Island Tour"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20"
                />
              </div>

              <div>
                <label className="text-xs font-sans font-bold uppercase text-stone-700 dark:text-stone-300 block mb-1.5">
                  {km ? "ខេត្តគោលដៅ:" : "Province:"}
                </label>
                <input
                  type="text"
                  placeholder="Siem Reap, Kampot, Preah Sihanouk..."
                  value={newProvince}
                  onChange={(e) => setNewProvince(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20"
                />

                {/* Quick Province Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-xs text-stone-500 font-sans mr-1">
                    {km ? "ពេញនិយម:" : "Popular:"}
                  </span>
                  {POPULAR_PROVINCES.map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setNewProvince(prov)}
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${newProvince === prov
                          ? "bg-laterite-600 text-white font-bold border-laterite-700 shadow-2xs"
                          : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-laterite-500"
                        }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModal(false)}
                  className="h-11 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-sans font-bold uppercase cursor-pointer transition-colors"
                >
                  {km ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  {km ? "បង្កើតគម្រោង" : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Destination Picker Modal */}
      <SelectDestinationModal
        isOpen={isSelectDestModalOpen}
        onClose={() => setIsSelectDestModalOpen(false)}
        onSelect={(dest) => {
          addDestinationToDay(activePlan?.id, currentDay?.day || 1, dest);
        }}
        dayNum={currentDay?.day || 1}
        defaultProvince={activePlan?.province}
      />
    </div>
  );
};

export default TripPlannerPage;
