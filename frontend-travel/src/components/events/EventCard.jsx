import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, ArrowRight, Clock } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

// Khmer Calendar Month Names
const KM_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

const EN_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Standard Numerals (User requirement: no Khmer numerals)
const toKhmerNum = (num) => (num === null || num === undefined ? "" : String(num));

// Fallback Angkor Festival Photography (Unsplash licensed Cambodia cultural photo)
const DEFAULT_EVENT_COVER =
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80";

/**
 * Safely parse date parts without browser UTC timezone shifts
 * Prioritizes backend fields (start_day, start_month, etc.) or ISO/SQL regex
 */
const parseDateParts = (evt, field = "start") => {
  if (!evt) return null;

  // 1. If backend API provided exact DB numbers
  if (field === "start" && evt.start_day && evt.start_month && evt.start_year) {
    return {
      day: evt.start_day,
      month: evt.start_month - 1, // 0-indexed
      year: evt.start_year,
      time: evt.start_time || null,
    };
  }
  if (field === "end" && evt.end_day && evt.end_month && evt.end_year) {
    return {
      day: evt.end_day,
      month: evt.end_month - 1,
      year: evt.end_year,
      time: null,
    };
  }

  // 2. Parse raw string directly from DB (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  const val = field === "start"
    ? (evt.start_date_raw || evt.start_date_date || evt.start_date)
    : (evt.end_date_raw || evt.end_date_date || evt.end_date);

  if (!val) return null;

  const str = String(val);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const day = parseInt(match[3], 10);
    const hours = match[4] !== undefined ? parseInt(match[4], 10) : 0;
    const minutes = match[5] !== undefined ? parseInt(match[5], 10) : 0;
    const time = (hours !== 0 || minutes !== 0)
      ? `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`
      : null;
    return { day, month, year, time };
  }

  // 3. Fallback standard Date parsing
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return {
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        time: (d.getHours() !== 0 || d.getMinutes() !== 0)
          ? `${d.getHours() < 10 ? "0" + d.getHours() : d.getHours()}:${d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()}`
          : null,
      };
    }
  } catch {
    // ignore
  }

  return null;
};

/**
 * EventCard — 100% Real-Data Driven Design (Zero Generic Icons)
 * Uses genuine database fields:
 * - Real Photographic Cover (from DB)
 * - Real Calendar Plaque (Exact Month & Day Number)
 * - Real Relative Countdown (e.g. ក្នុង 12 ថ្ងៃ / In 12d)
 * - Real Location & Venue (from DB province & venue relationships)
 * - Real Formatted Date & Time String (from DB timestamps)
 * - Real Excerpt & Title
 */
export const EventCard = ({
  event,
  layout = "adaptive", // "adaptive" | "horizontal" | "vertical"
  className = ""
}) => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  // 1. Cover Image from Database with fallbacks
  const rawImage = event.cover_image || event.image_url;
  const initialUrl = rawImage ? getImageUrl(rawImage) : DEFAULT_EVENT_COVER;
  const [imgSrc, setImgSrc] = useState(initialUrl);

  useEffect(() => {
    if (rawImage) {
      setImgSrc(getImageUrl(rawImage));
    } else {
      setImgSrc(DEFAULT_EVENT_COVER);
    }
  }, [rawImage]);

  // 2. Bilingual Text from Database
  const title = km && event.title_km ? event.title_km : (event.title_en || event.title_km || "");
  const desc = km && event.description_km ? event.description_km : (event.description_en || event.description_km || "");

  // 3. Location from Database
  const location =
    (km && event.location_name_km ? event.location_name_km : event.location_name_en) ||
    event.location ||
    null;

  const provinceName = event.province
    ? (km && event.province.name_km ? event.province.name_km : event.province.name_en)
    : null;

  // 4. Parse Dates Directly from Database
  const startParts = parseDateParts(event, "start");
  const endParts = parseDateParts(event, "end");

  let dayNum = "01";
  let monthText = km ? "មករា" : "JAN";
  let fullDateStr = "";
  let startTimeStr = null;
  let daysUntil = null;

  if (startParts) {
    const rawDay = startParts.day;
    dayNum = km ? toKhmerNum(rawDay < 10 ? `0${rawDay}` : rawDay) : (rawDay < 10 ? `0${rawDay}` : String(rawDay));
    monthText = km ? KM_MONTHS[startParts.month] : EN_MONTHS[startParts.month]?.toUpperCase();
    const year = km ? toKhmerNum(startParts.year) : startParts.year;

    // Time from Database
    if (startParts.time) {
      const [h, m] = startParts.time.split(":").map(Number);
      const isPm = h >= 12;
      const displayH = h % 12 || 12;
      const hStr = km ? toKhmerNum(displayH) : displayH;
      const minFormatted = m < 10 ? `0${m}` : `${m}`;
      const mStr = km ? toKhmerNum(minFormatted) : minFormatted;
      const periodStr = isPm ? (km ? "រសៀល" : "PM") : (km ? "ព្រឹក" : "AM");
      startTimeStr = `${hStr}:${mStr} ${periodStr}`;
    }

    // Range with End Date
    if (endParts && (endParts.day !== startParts.day || endParts.month !== startParts.month)) {
      const endRawDay = endParts.day;
      const endDayNum = km ? toKhmerNum(endRawDay < 10 ? `0${endRawDay}` : endRawDay) : (endRawDay < 10 ? `0${endRawDay}` : String(endRawDay));
      const endMonthText = km ? KM_MONTHS[endParts.month] : EN_MONTHS[endParts.month]?.toUpperCase();

      if (startParts.month === endParts.month) {
        fullDateStr = km
          ? `ថ្ងៃទី ${dayNum} - ${endDayNum} ${monthText} ${year}`
          : `${dayNum} - ${endDayNum} ${monthText} ${year}`;
      } else {
        fullDateStr = km
          ? `ថ្ងៃទី ${dayNum} ${monthText} - ${endDayNum} ${endMonthText} ${year}`
          : `${dayNum} ${monthText} - ${endDayNum} ${endMonthText} ${year}`;
      }
    } else {
      fullDateStr = km
        ? `ថ្ងៃទី ${dayNum} ${monthText} ${year}`
        : `${dayNum} ${monthText} ${year}`;
    }

    // Days Countdown
    try {
      const startDateObj = new Date(startParts.year, startParts.month, startParts.day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffMs = startDateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        daysUntil = diffDays;
      }
    } catch {
      // ignore
    }
  }

  // Split-Screen Layout configurations
  const isHorizontalOnly = layout === "horizontal";
  const isVerticalOnly = layout === "vertical";

  const containerClasses = isHorizontalOnly
    ? "flex flex-row"
    : isVerticalOnly
    ? "flex flex-col"
    : "flex flex-col max-sm:flex-row";

  const mediaClasses = isHorizontalOnly
    ? "w-2/5 sm:w-5/12 shrink-0 aspect-auto min-h-[170px] border-r border-stone-200/90 dark:border-stone-800"
    : isVerticalOnly
    ? "w-full aspect-[16/10] border-b border-stone-200/90 dark:border-stone-800"
    : "max-sm:w-[42%] max-sm:shrink-0 max-sm:aspect-auto max-sm:min-h-[160px] max-sm:border-r w-full sm:aspect-[16/10] sm:border-b border-stone-200/90 dark:border-stone-800";

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
    >
    <Link
      to={`/events/${event.slug}`}
      className={`group rounded-2xl sm:rounded-3xl overflow-hidden h-full bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 shadow-2xs hover:shadow-xl hover:shadow-stone-950/10 dark:hover:shadow-black/50 transition-all duration-300 select-none hover:-translate-y-1.5 hover:border-laterite-500/40 dark:hover:border-laterite-500/40 flex flex-col justify-between ${containerClasses} ${className}`}
    >
      {/* =================================================================== */}
      {/* PANE 1: VISUAL MEDIA SCREEN (Photo + Calendar Ticket + Status)      */}
      {/* =================================================================== */}
      <div className={`relative overflow-hidden bg-stone-200 dark:bg-stone-800 ${mediaClasses}`}>
        <img
          src={imgSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={() => setImgSrc(DEFAULT_EVENT_COVER)}
        />

        {/* Atmospheric Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent pointer-events-none" />

        {/* Real Date Ticket Plaque (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-center rounded-xl overflow-hidden shadow-md border border-white/20 backdrop-blur-md min-w-[54px]">
          {/* Month Banner */}
          <div className="w-full bg-gradient-to-r from-laterite-600 to-laterite-700 text-white text-[10px] font-bold text-center px-2 py-0.5 uppercase tracking-wider font-khmer shadow-2xs">
            {monthText}
          </div>
          {/* Day Number Box */}
          <div className="w-full bg-white/95 dark:bg-stone-900/95 text-center px-1.5 py-1 border-t border-stone-200/50 dark:border-stone-800/50">
            <span className="block font-heading font-black text-xl sm:text-2xl text-stone-950 dark:text-white leading-none tracking-tight">
              {dayNum}
            </span>
          </div>
        </div>

        {/* Top-Right Real Status Badges (Text Only) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          {event.is_featured && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold uppercase tracking-wide shadow-sm flex items-center gap-1 font-khmer">
              <Sparkles className="w-2.5 h-2.5 text-stone-950" />
              <span>{km ? "ពិសេស" : "Featured"}</span>
            </span>
          )}

          {daysUntil !== null && daysUntil <= 60 && (
            <span className="px-2.5 py-0.5 rounded-full bg-stone-950/75 text-white text-[10px] font-bold backdrop-blur-md border border-white/20 shadow-xs font-khmer flex items-center gap-1.5">
              {daysUntil === 0 ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{km ? "ថ្ងៃនេះ" : "Today"}</span>
                </>
              ) : daysUntil === 1 ? (
                <>
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  <span>{km ? "ថ្ងៃស្អែក" : "Tomorrow"}</span>
                </>
              ) : (
                <>
                  {daysUntil <= 7 && <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>}
                  <span>{km ? `ក្នុង ${toKhmerNum(daysUntil)} ថ្ងៃ` : `In ${daysUntil}d`}</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Real Province Location Overlay (Bottom-Left) */}
        {provinceName && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-950/75 text-amber-300 text-[11px] font-semibold backdrop-blur-md border border-white/20 shadow-xs font-khmer flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{provinceName}</span>
            </span>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* PANE 2: EDITORIAL CONTENT SCREEN (Real Date, Title, Venue, Excerpt) */}
      {/* =================================================================== */}
      <div className="p-5 sm:p-5.5 flex flex-col justify-between flex-1 min-w-0 space-y-3.5">
        <div className="space-y-2">
          {/* Formatted Date Range & Start Time from DB */}
          {fullDateStr && (
            <div className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-xl bg-laterite-600/10 dark:bg-laterite-950/50 border border-laterite-600/20 text-laterite-700 dark:text-amber-400 text-xs font-semibold font-khmer">
              <Calendar className="w-3.5 h-3.5 text-laterite-600 dark:text-amber-400 shrink-0" />
              <span>{fullDateStr}</span>
              {startTimeStr && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 opacity-70" />
                  <span>{startTimeStr}</span>
                </span>
              )}
            </div>
          )}

          {/* Event Title */}
          <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-laterite-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Specific Location Venue from DB */}
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 font-khmer line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400 shrink-0" />
              <span className="truncate">
                <span className="font-semibold text-stone-700 dark:text-stone-300">{km ? "ទីតាំង៖ " : "Venue: "}</span>
                {location}
              </span>
            </div>
          )}

          {/* Short Excerpt from DB */}
          {desc && (
            <p className="text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed text-xs font-sans">
              {desc}
            </p>
          )}
        </div>

        {/* Bottom Action Divider & Interactive Circle Button */}
        <div className="pt-3.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs sm:text-sm font-bold text-laterite-600 dark:text-laterite-400 font-khmer">
          <span className="truncate group-hover:text-laterite-700 dark:group-hover:text-amber-400 transition-colors">
            {km ? "មើលព័ត៌មានពិធីបុណ្យ" : "Explore Event Details"}
          </span>
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-laterite-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:translate-x-1 shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
