import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Share2,
  Copy,
  Check,
  X,
  Send,
  Globe
} from "lucide-react";
import { toast } from "@/store/toastStore";

export const ShareModal = ({ isOpen, onClose, title, url, description }) => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareTitle = title || "CamGO Travel";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(km ? "បានចម្លងតំណភ្ជាប់ជោគជ័យ!" : "Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: description || shareTitle,
          url: shareUrl
        });
        onClose();
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=500");
  };

  const shareToTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(tgUrl, "_blank");
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md panel-raised p-6 rounded-card bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 shadow-raise space-y-5 animate-scale-in select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-subheading">
            <Share2 className="w-5 h-5 text-laterite-600" />
            <span>{km ? "ចែករំលែក" : "Share"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Destination Title */}
        <p className="text-body font-semibold text-stone-800 dark:text-stone-100 line-clamp-2">
          {shareTitle}
        </p>

        {/* Share Channels Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Telegram */}
          <button
            type="button"
            onClick={shareToTelegram}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 hover:bg-[#229ED9]/15 hover:border-[#229ED9]/40 border border-stone-300 dark:border-stone-700 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5 -rotate-12 translate-x-[-1px]" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Telegram</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={shareToFacebook}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 border border-stone-300 dark:border-stone-700 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Facebook</span>
          </button>

          {/* Native Web Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 hover:bg-laterite-600/15 hover:border-laterite-600/40 border border-stone-300 dark:border-stone-700 transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-laterite-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              {km ? "កម្មវិធីផ្សេងទៀត" : "More Apps"}
            </span>
          </button>
        </div>

        {/* Copy Link Row */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            {km ? "តំណភ្ជាប់" : "Page Link"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 h-11 px-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-600 dark:text-stone-400 select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="h-11 px-4 rounded-xl btn-primary text-small font-semibold flex items-center gap-2 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
              <span>{copied ? (km ? "បានចម្លង" : "Copied") : (km ? "ចម្លង" : "Copy")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default ShareModal;
