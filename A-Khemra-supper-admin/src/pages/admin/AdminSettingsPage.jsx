import { useState, useEffect, useRef } from "react";
import {
  Save,
  Globe,
  Mail,
  Share2,
  Search,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAdminSettingsStore } from "@/store/settingsStore";
import { useThemeStore } from "@/store/themeStore";
import { toast } from "@/store/toastStore";

const AdminSettingsPage = () => {
  const { settings: globalSettings, isLoaded, updateSettingState } = useAdminSettingsStore();
  const { theme } = useThemeStore();
  const fileInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const [settings, setSettings] = useState(() => ({
    site_name_en: "CamGO",
    site_name_highlight: "GO",
    site_name_km: "CamGO",
    site_tagline_en: "Trusted Local. Direct Connection.",
    site_tagline_km: "ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់",
    logo_badge_text: "CG",
    logo_url: "",
    favicon_url: "/favicon.ico",
    contact_email: "",
    contact_phone: "",
    contact_address_en: "",
    contact_address_km: "",
    social_facebook: "",
    social_telegram: "",
    social_instagram: "",
    social_youtube: "",
    seo_title_default: "",
    seo_description_default: "",
    seo_keywords_default: "",
    ...(globalSettings || {})
  }));

  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(theme || "dark");
  const [dragOver, setDragOver] = useState(false);

  // Sync preview theme if global admin theme changes
  useEffect(() => {
    if (theme) {
      setPreviewTheme(theme);
    }
  }, [theme]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getSettings();
      const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      if (Array.isArray(items)) {
        const map = {};
        items.forEach((s) => {
          map[s.key] =
            typeof s.value === "string"
              ? s.value
              : s.value === null || s.value === undefined
              ? ""
              : JSON.stringify(s.value);
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    updateSettingState(key, val);
  };

  const handleLogoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadLogoFile(file);
  };

  const uploadLogoFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image file size exceeds 4MB limit");
      return;
    }

    try {
      setIsUploadingLogo(true);
      const res = await adminApi.uploadLogo(file);
      const newUrl = res?.data?.logo_url || res?.logo_url;
      if (newUrl) {
        handleChange("logo_url", newUrl);
        toast.success("Website logo uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload logo image");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    handleChange("logo_url", "");
    toast.info("Logo reset to default initials badge");
  };

  const handleFaviconFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFavicon(true);
      const res = await adminApi.uploadFavicon(file);
      const newUrl = res?.data?.favicon_url || res?.favicon_url;
      if (newUrl) {
        handleChange("favicon_url", newUrl);
        toast.success("Favicon uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload favicon");
    } finally {
      setIsUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadLogoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = Object.entries(settings).map(([key, value]) => ({
        key,
        value
      }));
      await adminApi.updateSettings(payload);
      toast.success("All platform settings updated successfully!");
      fetchSettings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-laterite-600 dark:text-laterite-400" />
        <p className="text-xs text-stone-500 dark:text-stone-700 font-semibold">Loading platform settings from database...</p>
      </div>
    );
  }

  // Wordmark formatting helper for live preview
  const renderWordmark = () => {
    const name = settings.site_name_en || "CamGO";
    const hl = settings.site_name_highlight || "GO";
    if (hl && name.includes(hl)) {
      const parts = name.split(hl);
      return (
        <>
          {parts[0]}
          <span className="text-laterite-600 dark:text-laterite-400">{hl}</span>
          {parts.slice(1).join(hl)}
        </>
      );
    }
    return name;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-900 flex items-center gap-2">
            <span>Platform & Site Settings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-laterite-100 dark:bg-laterite-950/60 text-laterite-600 dark:text-laterite-400 font-medium border border-laterite-200 dark:border-laterite-800/50">
              Admin Control
            </span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-700 mt-1">
            Manage your custom image logo, website branding name, contact details, and SEO metadata.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ======================================================== */}
        {/* 1. BRAND IDENTITY & LOGO (FEATURED CARD)                 */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-laterite-50 dark:bg-laterite-950/50 border border-laterite-200 dark:border-laterite-800/60 flex items-center justify-center text-laterite-600 dark:text-laterite-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-stone-900 dark:text-stone-900">
                  Logo & Website Name (រូបសញ្ញា & ឈ្មោះគេហទំព័រ)
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-700">
                  Upload custom brand logo image or configure fallback badge initials and title
                </p>
              </div>
            </div>

            {/* Live Theme Toggle for Preview */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-700 px-1.5">Preview:</span>
              <button
                type="button"
                onClick={() => setPreviewTheme("dark")}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  previewTheme === "dark"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-900"
                }`}
              >
                <Moon className="w-3 h-3 text-amber-400" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme("light")}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  previewTheme === "light"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-900"
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* REAL-TIME LIVE BRAND PREVIEW BOX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-700">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                Live Brand Header Preview (ការមើលសាកល្បងជាក់ស្តែង)
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-700 font-normal">
                {settings.logo_url ? "Using Custom Image Logo" : "Using Default Styled Badge"}
              </span>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-colors flex flex-col md:flex-row items-center justify-between gap-6 ${
                previewTheme === "dark"
                  ? "bg-[#1e1e1e] border-stone-800 text-white shadow-inner"
                  : "bg-[#FAFAF9] border-stone-300 text-stone-900 shadow-sm"
              }`}
            >
              {/* Header Preview Element (Exact Match to Brand Screenshot) */}
              <div className="flex items-center gap-3">
                {settings.logo_url ? (
                  <div className="relative group">
                    <img
                      src={settings.logo_url}
                      alt="Brand Logo"
                      className="h-12 sm:h-16 w-auto max-w-[220px] object-contain rounded-xl p-1 bg-black/10 dark:bg-white/5 border border-white/10 shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="h-12 sm:h-14 px-3.5 rounded-xl bg-laterite-600 text-white flex items-center justify-center font-heading font-bold text-2xl sm:text-3xl tracking-wider shadow-sm shrink-0">
                    {settings.logo_badge_text || "CG"}
                  </div>
                )}

                <div className="flex flex-col">
                  {/* English Wordmark */}
                  <span
                    className={`font-heading font-bold text-lg sm:text-xl lg:text-2xl leading-tight tracking-wide ${
                      previewTheme === "dark" ? "text-stone-100" : "text-stone-900"
                    }`}
                  >
                    {renderWordmark()}
                  </span>
                  {/* Khmer Tagline */}
                  <span
                    className={`text-xs sm:text-small font-sans font-medium leading-none mt-1 ${
                      previewTheme === "dark" ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    {settings.site_tagline_km || "ទេសចរណ៍ & បេតិកភណ្ឌ"}
                  </span>
                </div>
              </div>

              {/* Khmer Name Variant Preview */}
              <div
                className={`flex flex-col items-center md:items-end text-xs px-4 py-2.5 rounded-xl border ${
                  previewTheme === "dark"
                    ? "bg-stone-900/70 border-stone-800 text-stone-300"
                    : "bg-white border-stone-300 text-stone-800"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 mb-0.5">
                  Khmer View (ភាសាខ្មែរ)
                </span>
                <span className="font-heading font-bold text-base text-laterite-600 dark:text-laterite-400">
                  {settings.site_name_km || "CamGO"}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {settings.site_tagline_km || "ទេសចរណ៍ & បេតិកភណ្ឌ"}
                </span>
              </div>
            </div>
          </div>

          {/* LOGO IMAGE UPLOAD DROPZONE */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            
            {/* Upload Box (7 Cols) */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-700">
                1. Upload Website Logo Image (រូបសញ្ញា Logo)
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragOver
                    ? "border-laterite-500 bg-laterite-50/50 dark:bg-laterite-950/20"
                    : "border-stone-300 dark:border-stone-800 hover:border-laterite-500 bg-stone-50/60 dark:bg-stone-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-laterite-600 dark:text-laterite-400 shadow-xs">
                    {isUploadingLogo ? (
                      <Loader2 className="w-6 h-6 animate-spin text-laterite-600 dark:text-laterite-400" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="px-4 py-2 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      <span>{isUploadingLogo ? "Uploading Logo..." : "Choose Image File"}</span>
                    </button>
                    <p className="text-[11px] text-stone-500 dark:text-stone-700 mt-2">
                      or drag & drop logo image file directly here
                    </p>
                  </div>

                  <p className="text-[10px] text-stone-400 dark:text-stone-700">
                    PNG, SVG, JPG, WebP supported (Max: 4MB). Transparent background recommended.
                  </p>
                </div>
              </div>

              {/* URL Direct Fallback */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-700">
                  Direct Logo URL / Path (or paste external URL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.logo_url || ""}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                    placeholder="/storage/settings/... or https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs focus:outline-none focus:border-laterite-500 text-stone-900 dark:text-stone-900 font-mono"
                  />
                  {settings.logo_url && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="Reset to default initials badge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Badge & Quick Fallback Settings (5 Cols) */}
            <div className="md:col-span-5 space-y-4 bg-stone-50/80 dark:bg-stone-50/70 p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                <span>2. Fallback Initials Badge</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-700">
                Shown when no custom logo image is uploaded, or while the image is loading.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 mb-1">
                  Badge Text (អក្សរកាត់លើ Badge)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={4}
                    value={settings.logo_badge_text || ""}
                    onChange={(e) => handleChange("logo_badge_text", e.target.value.toUpperCase())}
                    placeholder="CG"
                    className="w-24 px-3 py-2 text-center uppercase tracking-widest font-bold text-sm rounded-xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500"
                  />
                  <div className="h-9 px-3 rounded-xl bg-laterite-600 text-white flex items-center justify-center font-heading font-bold text-base shadow-xs">
                    {settings.logo_badge_text || "CG"}
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-stone-700">e.g. KM, MOR, KH</span>
                </div>
              </div>

              {/* Favicon configuration */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700">
                    Favicon (.ico, .png, .svg)
                  </label>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*,.ico"
                    onChange={handleFaviconFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                    className="text-[11px] font-bold text-laterite-600 dark:text-laterite-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingFavicon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Upload Favicon</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={settings.favicon_url || ""}
                  onChange={(e) => handleChange("favicon_url", e.target.value)}
                  placeholder="/favicon.ico"
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-100 text-xs font-mono text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500"
                />
              </div>
            </div>
          </div>

          {/* WEBSITE NAMES & TAGLINES FORM */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-700 flex items-center gap-1.5">
              <span>3. Website Name & Tagline Configuration (ឈ្មោះគេហទំព័រ & ពាក្យស្លោក)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Site Name EN */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 mb-1">
                  Website Name (English)
                </label>
                <input
                  type="text"
                  value={settings.site_name_en || ""}
                  onChange={(e) => handleChange("site_name_en", e.target.value)}
                  placeholder="CamGO"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 font-sans transition-colors"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-700 mt-1 block">
                  Main brand name shown in header and titles
                </span>
              </div>

              {/* Accent Word Highlight */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 mb-1">
                  Accent Word Highlight (ពាក្យបន្លិចពណ៌)
                </label>
                <input
                  type="text"
                  value={settings.site_name_highlight || ""}
                  onChange={(e) => handleChange("site_name_highlight", e.target.value)}
                  placeholder="GO"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-laterite-600 dark:text-laterite-400 font-semibold focus:outline-none focus:border-laterite-500 font-sans transition-colors"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-700 mt-1 block">
                  This portion of the name is styled in signature coral color
                </span>
              </div>

              {/* Site Name Khmer */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 mb-1">
                  ឈ្មោះគេហទំព័រ (ភាសាខ្មែរ)
                </label>
                <input
                  type="text"
                  value={settings.site_name_km || ""}
                  onChange={(e) => handleChange("site_name_km", e.target.value)}
                  placeholder="CamGO"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 font-khmer transition-colors"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-700 mt-1 block">
                  Displayed when Khmer language mode is active
                </span>
              </div>

              {/* Tagline Khmer */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 mb-1">
                  ពាក្យស្លោកខាងក្រោម (ភាសាខ្មែរ)
                </label>
                <input
                  type="text"
                  value={settings.site_tagline_km || ""}
                  onChange={(e) => handleChange("site_tagline_km", e.target.value)}
                  placeholder="ទេសចរណ៍ & បេតិកភណ្ឌ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 font-khmer transition-colors"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-700 mt-1 block">
                  Sub-header tagline (e.g. ទេសចរណ៍ & បេតិកភណ្ឌ)
                </span>
              </div>

              {/* Tagline English */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 mb-1">
                  Tagline (English)
                </label>
                <input
                  type="text"
                  value={settings.site_tagline_en || ""}
                  onChange={(e) => handleChange("site_tagline_en", e.target.value)}
                  placeholder="Heritage & Tourism"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 font-sans transition-colors"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-700 mt-1 block">
                  Sub-header tagline in English (e.g. Heritage & Tourism)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. CONTACT INFORMATION                                   */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-900 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Public Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.contact_phone || ""}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Office Address (English)
              </label>
              <input
                type="text"
                value={settings.contact_address_en || ""}
                onChange={(e) => handleChange("contact_address_en", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                អាសយដ្ឋានការិយាល័យ (Khmer)
              </label>
              <input
                type="text"
                value={settings.contact_address_km || ""}
                onChange={(e) => handleChange("contact_address_km", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 font-khmer transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SOCIAL CHANNELS                                       */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-900 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <span>Social Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Facebook Page
              </label>
              <input
                type="text"
                value={settings.social_facebook || ""}
                onChange={(e) => handleChange("social_facebook", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Telegram Channel
              </label>
              <input
                type="text"
                value={settings.social_telegram || ""}
                onChange={(e) => handleChange("social_telegram", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Instagram URL
              </label>
              <input
                type="text"
                value={settings.social_instagram || ""}
                onChange={(e) => handleChange("social_instagram", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                YouTube URL
              </label>
              <input
                type="text"
                value={settings.social_youtube || ""}
                onChange={(e) => handleChange("social_youtube", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. SEO DEFAULTS                                          */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-900 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-500" />
            <span>SEO Defaults</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Default Meta Title
              </label>
              <input
                type="text"
                value={settings.seo_title_default || ""}
                onChange={(e) => handleChange("seo_title_default", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Default Meta Description
              </label>
              <textarea
                rows={2}
                value={settings.seo_description_default || ""}
                onChange={(e) => handleChange("seo_description_default", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1 text-stone-700 dark:text-stone-700">
                Default Meta Keywords
              </label>
              <input
                type="text"
                value={settings.seo_keywords_default || ""}
                onChange={(e) => handleChange("seo_keywords_default", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-50 text-xs sm:text-sm text-stone-900 dark:text-stone-900 focus:outline-none focus:border-laterite-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export { AdminSettingsPage };
