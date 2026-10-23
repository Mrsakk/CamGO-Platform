import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Star,
  MapPin,
  CheckCircle,
  Phone,
  Send,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { trackContactEvent } from "@/lib/trackEvent";
import { getBusinessCover } from "@/lib/businessMedia";

export const BusinessCard = ({ business, source = "list" }) => {
  if (!business) return null;

  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const name = isKm
    ? business.name_km || business.name_en
    : business.name_en || business.name_km;
  const tagline = isKm
    ? business.tagline_km || business.tagline_en
    : business.tagline_en || business.tagline_km;
  const categoryName = isKm
    ? business.category?.name_km || business.category?.name_en
    : business.category?.name_en || business.category?.name_km;
  const provinceName = isKm
    ? business.province?.name_km || business.province?.name_en
    : business.province?.name_en || business.province?.name_km;

  const primaryContact =
    business.primary_contact || (business.contacts && business.contacts[0]);

  const handleContactClick = () => {
    if (!primaryContact) return;
    trackContactEvent(business.slug, primaryContact.type, source);
  };

  const leadMessage = isKm
    ? `សួស្តី ${name}! ខ្ញុំបានឃើញព័ត៌មាន និងសេវាកម្មរបស់អ្នកនៅលើ CamGO ហើយចង់សាកសួរព័ត៌មានបន្ថែម។`
    : `Hello ${name}! I found your listing on CamGO and would like to inquire about your services.`;
  const encodedLead = encodeURIComponent(leadMessage);

  const getContactHref = (contact) => {
    if (!contact) return `/b/${business.slug}`;
    if (contact.type === "phone") return `tel:${contact.value}`;
    if (contact.type === "telegram") {
      const val = contact.value.replace("@", "");
      if (val.startsWith("http")) {
        return val.includes("?") ? `${val}&text=${encodedLead}` : `${val}?text=${encodedLead}`;
      }
      return `https://t.me/${val}?text=${encodedLead}`;
    }
    if (contact.type === "whatsapp") {
      const cleanPhone = contact.value.replace(/[^0-9]/g, "");
      return `https://wa.me/${cleanPhone}?text=${encodedLead}`;
    }
    if (contact.type === "email") return `mailto:${contact.value}`;
    if (contact.type === "messenger") {
      return contact.value.startsWith("http") ? contact.value : `https://m.me/${contact.value}`;
    }
    return contact.value;
  };

  const isFeatured = Boolean(business.is_featured || business.tier === "featured");
  const isSponsored = Boolean(
    business.is_sponsored_category || business.is_sponsored_province
  );

  const badgeLabel = isSponsored
    ? isKm
      ? "ឧបត្ថម្ភ"
      : "Sponsored"
    : isFeatured
    ? isKm
      ? "ពិសេស"
      : "Featured"
    : business.is_verified
    ? isKm
      ? "ផ្ទៀងផ្ទាត់"
      : "Verified"
    : null;

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-card border border-line bg-cream shadow-premium transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-premium-lg dark:border-white/10 dark:bg-stone-850">
      {/* 1. Cover Image Section */}
      <Link
        to={`/b/${business.slug}`}
        className="relative block aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0"
      >
        <img
          src={getBusinessCover(business, "url_800")}
          alt={
            isKm
              ? business.cover_image?.alt_km || name
              : business.cover_image?.alt_en || name
          }
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges (Verified / Featured / Open-Closed) */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 right-2.5 sm:left-3 sm:top-3 sm:right-3 flex items-start justify-between gap-2">
          {badgeLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-cream/95 dark:bg-stone-900/90 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-forest dark:text-cream shadow-premium backdrop-blur">
              {isSponsored || isFeatured ? (
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-700 dark:text-brand-400" />
              ) : (
                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-600 dark:text-teal-400" />
              )}
              <span>{badgeLabel}</span>
            </span>
          ) : (
            <span />
          )}

          {business.open_now !== undefined && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold backdrop-blur ${
                business.open_now
                  ? "bg-cream/95 text-forest dark:bg-stone-900/90 dark:text-cream"
                  : "bg-ink/80 text-white/90 dark:bg-black/80"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>{business.open_now ? (isKm ? "បើក" : "Open") : isKm ? "បិទ" : "Closed"}</span>
            </span>
          )}
        </div>

        {/* Distance Badge */}
        {business.distance_km !== undefined && (
          <span className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs font-medium text-white backdrop-blur-sm">
            <Compass className="h-3 w-3" />
            <span>{business.distance_km} km</span>
          </span>
        )}
      </Link>

      {/* 2. Business Info & Actions */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-5 gap-3">
        {/* Top Segment: Category, Location, Title, Tagline */}
        <div className="space-y-2">
          {/* Category & Province Row */}
          <div className="flex items-center justify-between gap-2 text-xs font-semibold">
            <span className="truncate rounded-full border border-brand-200/80 bg-brand-50 px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-300 max-w-[65%]">
              {categoryName}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[11px] sm:text-xs text-muted dark:text-white/50 ml-auto">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{provinceName}</span>
            </span>
          </div>

          {/* Business Name (Title) */}
          <Link to={`/b/${business.slug}`} className="block">
            <h3 className="line-clamp-2 text-base sm:text-lg font-bold text-forest transition group-hover:text-brand-700 dark:text-cream dark:group-hover:text-brand-300 leading-snug">
              {name}
            </h3>
          </Link>

          {/* Tagline */}
          {tagline && (
            <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {tagline}
            </p>
          )}
        </div>

        {/* Bottom Segment: Rating, Price Level & Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-line dark:border-white/10">
          {/* Rating & Price */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-brand-500 text-brand-500" />
              <span className="font-semibold text-ink dark:text-white">
                {business.rating_avg
                  ? Number(business.rating_avg).toFixed(1)
                  : isKm
                  ? "ថ្មី"
                  : "New"}
              </span>
              {business.rating_count > 0 && (
                <span className="text-stone-400">({business.rating_count})</span>
              )}
            </span>

            {business.price_level && (
              <span className="font-medium text-stone-500 dark:text-stone-400">
                {"$".repeat(business.price_level)}
              </span>
            )}
          </div>

          {/* Action Buttons: Direct Contact & View Profile */}
          <div className="flex items-center gap-2">
            {primaryContact ? (
              <a
                href={getContactHref(primaryContact)}
                onClick={handleContactClick}
                target={primaryContact.type === "phone" ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="flex h-10 sm:h-11 flex-1 items-center justify-center gap-2 rounded-control bg-brand-500 px-3 py-2 text-xs sm:text-sm font-bold text-forest-dark transition duration-200 hover:bg-brand-600 active:scale-[0.98] shadow-xs"
              >
                {primaryContact.type === "telegram" ? (
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                <span className="truncate">
                  {primaryContact.type === "telegram"
                    ? "Telegram"
                    : primaryContact.type === "phone"
                    ? isKm
                      ? "ទូរស័ព្ទ"
                      : "Call"
                    : primaryContact.label || (isKm ? "ទាក់ទង" : "Contact")}
                </span>
              </a>
            ) : (
              <Link
                to={`/b/${business.slug}`}
                className="flex h-10 sm:h-11 flex-1 items-center justify-center rounded-control border border-line bg-cream px-3 py-2 text-xs sm:text-sm font-semibold text-forest transition hover:border-brand-500 hover:bg-brand-50 dark:border-white/15 dark:bg-transparent dark:text-cream dark:hover:bg-white/5 shadow-xs"
              >
                {isKm ? "មើលលម្អិត" : "View profile"}
              </Link>
            )}

            <Link
              to={`/b/${business.slug}`}
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-control border border-line text-forest transition hover:border-brand-500 hover:bg-brand-50 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/5 active:scale-95"
              title={isKm ? "មើលលម្អិត" : "View details"}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BusinessCard;
