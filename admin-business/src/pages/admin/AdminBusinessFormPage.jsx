import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Plus,
  Trash2,
  Star,
  ExternalLink,
  Clock,
  Phone,
  Image as ImageIcon,
  FileText,
  User,
  History,
  Eye,
  Check,
  X,
  Calendar,
  Send,
  Sparkles,
  Key,
  Copy,
  CheckCheck,
  Link2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { getPublicBusinessUrl } from "@/lib/publicUrls";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const normalizeBasicForm = (data = {}) => ({
  name_km: data.name_km || "",
  name_en: data.name_en || "",
  slug: data.slug || "",
  category_id: data.category_id ? String(data.category_id) : "",
  province_id: data.province_id ? String(data.province_id) : "",
  tagline_km: data.tagline_km || "",
  tagline_en: data.tagline_en || "",
  description_km: data.description_km || "",
  description_en: data.description_en || "",
  address_km: data.address_km || "",
  address_en: data.address_en || "",
  lat: data.lat === null || data.lat === undefined || data.lat === "" ? "" : Number(data.lat),
  lng: data.lng === null || data.lng === undefined || data.lng === "" ? "" : Number(data.lng),
  price_level: Number(data.price_level) || 2,
  owner_name: data.owner_name || "",
  owner_phone: data.owner_phone || "",
  internal_notes: data.internal_notes || "",
});

const buildOwnerSetupUrl = (payload) => {
  const params = new URLSearchParams({
    token: payload.setup_token,
    email: payload.user.email,
  });

  return `${window.location.origin}/set-password?${params.toString()}`;
};

export const AdminBusinessFormPage = () => {
  const { id } = useParams();
  const isCreate = !id || id === "create";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();

  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState({
    name_km: "",
    name_en: "",
    slug: "",
    category_id: "",
    province_id: "",
    tagline_km: "",
    tagline_en: "",
    description_km: "",
    description_en: "",
    address_km: "",
    address_en: "",
    lat: "",
    lng: "",
    price_level: 2,
    owner_name: "",
    owner_phone: "",
    internal_notes: "",
  });

  // Subscription state
  const [subscriptionForm, setSubscriptionForm] = useState({
    tier: "free",
    subscription_expires_at: "",
    featured_until: "",
    note: "",
  });

  // Owner account modal state
  const [createOwnerModalOpen, setCreateOwnerModalOpen] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [ownerSetup, setOwnerSetup] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Verify modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyAction, setVerifyAction] = useState("verify"); // 'verify' | 'unverify'
  const [verifyReason, setVerifyReason] = useState("");

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    type: "phone",
    value: "",
    label: "",
    is_primary: false,
  });

  // Closure modal state
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [newClosure, setNewClosure] = useState({
    from_date: "",
    to_date: "",
    note_km: "",
    note_en: "",
  });

  // Hours state (7 days, 0 = Sun to 6 = Sat)
  const [hours, setHours] = useState([
    { weekday: 1, opens_at: "08:00", closes_at: "21:00", is_closed: false },
    { weekday: 2, opens_at: "08:00", closes_at: "21:00", is_closed: false },
    { weekday: 3, opens_at: "08:00", closes_at: "21:00", is_closed: false },
    { weekday: 4, opens_at: "08:00", closes_at: "21:00", is_closed: false },
    { weekday: 5, opens_at: "08:00", closes_at: "21:00", is_closed: false },
    { weekday: 6, opens_at: "08:00", closes_at: "21:00", is_closed: false },
    { weekday: 0, opens_at: "08:00", closes_at: "21:00", is_closed: false },
  ]);

  // Fetch reference categories & provinces
  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await api.get("/admin/business/categories");
      return res.data?.data || [];
    },
  });

  const { data: provinces } = useQuery({
    queryKey: ["public", "provinces"],
    queryFn: async () => {
      const res = await api.get("/business/public/provinces");
      return res.data?.data || [];
    },
  });

  // Fetch business details if editing
  const { data: businessData, isLoading: isFetchingBiz } = useQuery({
    queryKey: ["admin", "business", id],
    queryFn: async () => {
      const res = await api.get(`/admin/business/businesses/${id}`);
      return res.data?.data?.business || res.data?.business || res.data?.data;
    },
    enabled: !isCreate,
  });

  // Populate data when loaded
  useEffect(() => {
    if (businessData) {
      setFormData({
        name_km: businessData.name_km || "",
        name_en: businessData.name_en || "",
        slug: businessData.slug || "",
        category_id: businessData.category_id || "",
        province_id: businessData.province_id || "",
        tagline_km: businessData.tagline_km || "",
        tagline_en: businessData.tagline_en || "",
        description_km: businessData.description_km || "",
        description_en: businessData.description_en || "",
        address_km: businessData.address_km || "",
        address_en: businessData.address_en || "",
        lat: businessData.lat !== null ? businessData.lat : "",
        lng: businessData.lng !== null ? businessData.lng : "",
        price_level: businessData.price_level || 2,
        owner_name: businessData.owner_name || "",
        owner_phone: businessData.owner_phone || "",
        internal_notes: businessData.internal_notes || "",
      });

      if (businessData.hours && businessData.hours.length > 0) {
        setHours(businessData.hours);
      }

      setSubscriptionForm({
        tier: businessData.tier || "free",
        subscription_expires_at: businessData.subscription_expires_at
          ? businessData.subscription_expires_at.split("T")[0]
          : "",
        featured_until: businessData.featured_until
          ? businessData.featured_until.split("T")[0]
          : "",
        note: "",
      });
    }
  }, [businessData]);

  // Mutations
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/admin/business/businesses/${id}/subscription`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Subscription tier updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update subscription");
    },
  });

  const createOwnerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/admin/business/businesses/${id}/owner-account`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      toast.success("Owner account created. Share the setup link.");
      setOwnerSetup({ ...data, setup_url: buildOwnerSetupUrl(data) });
      setNewOwnerForm({ name: "", email: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create owner account");
    },
  });

  const regenerateOwnerSetupMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await api.post(
        `/admin/business/businesses/${id}/owner-accounts/${userId}/setup-link`
      );
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      toast.success("A new setup link has been generated.");
      setOwnerSetup({ ...data, setup_url: buildOwnerSetupUrl(data) });
      setCreateOwnerModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to generate a setup link");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isCreate) {
        const res = await api.post("/admin/business/businesses", payload);
        return res.data?.data?.business || res.data?.business;
      } else {
        const res = await api.put(`/admin/business/businesses/${id}`, payload);
        return res.data?.data?.business || res.data?.business;
      }
    },
    onSuccess: (savedBiz) => {
      toast.success(isCreate ? "Business created as draft" : "Business updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
      if (isCreate && savedBiz?.id) {
        navigate(`/admin/businesses/${savedBiz.id}/edit`);
      } else {
        queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save business details.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await api.post(`/admin/business/businesses/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
      onError: (err) => {
        const missing = err.response?.data?.errors?.missing_requirements;
        if (missing) {
          const details = Object.values(missing).join(" ");
          toast.error(`Cannot approve. ${details}`);
        } else {
          toast.error(err.response?.data?.message || "Failed to update status.");
        }
      },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ action, reason }) => {
      const endpoint = action === "verify" ? "verify" : "unverify";
      const res = await api.post(`/admin/business/businesses/${id}/${endpoint}`, { reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Business ${verifyAction === "verify" ? "verified" : "unverified"} successfully`);
      setVerifyModalOpen(false);
      setVerifyReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Verification action failed.");
    },
  });

  const handleSave = (e) => {
    e?.preventDefault();
    const payload = {
      ...formData,
      lat: formData.lat !== "" ? parseFloat(formData.lat) : null,
      lng: formData.lng !== "" ? parseFloat(formData.lng) : null,
      category_id: parseInt(formData.category_id, 10),
      province_id: parseInt(formData.province_id, 10),
    };
    saveMutation.mutate(payload);
  };

  if (isFetchingBiz) return <LoadingFallback />;

  const isApproved = businessData?.status === "approved";
  const isVerified = businessData?.is_verified;
  const missingReqs = businessData?.missing_requirements || {};
  const hasUnsavedChanges =
    !isCreate &&
    businessData &&
    JSON.stringify(normalizeBasicForm(formData)) !==
      JSON.stringify(normalizeBasicForm(businessData));

  const checklistItems = [
    { key: "name_km", label: "Khmer Name", tab: "basic", target: "biz-name-km" },
    { key: "category", label: "Category", tab: "basic", target: "biz-category" },
    { key: "province", label: "Province", tab: "basic", target: "biz-province" },
    { key: "coordinates", label: "Coordinates", tab: "basic", target: "biz-lat" },
    { key: "address", label: "Address", tab: "basic", target: "biz-address-km" },
    { key: "contacts", label: "At least 1 Contact", tab: "contacts" },
    { key: "media", label: "At least 1 Photo", tab: "photos" },
  ];

  const handleChecklistFix = (item) => {
    setActiveTab(item.tab);
    if (!item.target) return;

    setTimeout(() => {
      const element = document.getElementById(item.target);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus();
    }, 150);
  };

  const handleStatusChange = (nextStatus) => {
    if (nextStatus === "approved" && hasUnsavedChanges) {
      toast.error("You have unsaved changes. Save before approving.");
      return;
    }

    statusMutation.mutate(nextStatus);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/businesses"
            className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                {isCreate ? "បន្ថែមអាជីវកម្មថ្មី / Add New Business" : businessData?.name_km || "Edit Business"}
              </h1>
              {!isCreate && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    businessData?.status === "approved"
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {businessData?.status}
                </span>
              )}
            </div>
            {!isCreate && (
              <div className="text-xs text-stone-500 font-medium mt-0.5">
                {businessData?.name_en} • Slug: <span className="font-mono">{businessData?.slug}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isCreate && (
            <>
              {/* Status Selector */}
              <select
                value={businessData?.status || "draft"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-gold-500"
              >
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approve & Publish</option>
                <option value="suspended">Suspend (Hide)</option>
              </select>

              {/* Verify Badge Toggle */}
              {hasPermission("business.verify") && (
                <button
                  type="button"
                  onClick={() => {
                    setVerifyAction(isVerified ? "unverify" : "verify");
                    setVerifyReason("");
                    setVerifyModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    isVerified
                      ? "bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300"
                      : "bg-stone-50 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 hover:bg-teal-50 hover:text-teal-700"
                  }`}
                >
                  {isVerified ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Verified Badge</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-stone-400" />
                      <span>Grant Verified</span>
                    </>
                  )}
                </button>
              )}

              {/* Preview as visitor */}
              <a
                href={getPublicBusinessUrl(businessData?.slug)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition"
              >
                <span>View Public</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isCreate ? "Create Business" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Publishing Readiness Checklist (Shown if not yet approved) */}
      {!isCreate && businessData?.status !== "approved" && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                លក្ខខណ្ឌតម្រូវមុននឹងអាចអនុម័តបាន (Publishing Checklist)
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                A business cannot be approved until all mandatory requirements are fulfilled:
              </p>
              {hasUnsavedChanges && (
                <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                  You have unsaved changes. Save them before approving.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                {checklistItems.map((item) => {
                  const isMissing = Boolean(missingReqs[item.key]);

                  return (
                    <div
                      key={item.key}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                        isMissing
                          ? "border-amber-200 bg-white/70 dark:border-amber-900/60 dark:bg-stone-900/40"
                          : "border-teal-200 bg-teal-50/60 dark:border-teal-900/60 dark:bg-teal-950/20"
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1.5 ${
                          isMissing
                            ? "text-amber-800 dark:text-amber-300"
                            : "font-semibold text-teal-700 dark:text-teal-400"
                        }`}
                      >
                        {isMissing ? (
                          <X className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{item.label}</span>
                      </span>
                      {isMissing ? (
                        <button
                          type="button"
                          onClick={() => handleChecklistFix(item)}
                          className="rounded-lg border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 transition hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/60"
                        >
                          Fix
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                          Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                Checklist reflects saved data. Save changes before approving.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto gap-2">
        {[
          { key: "basic", label: "១. ព័ត៌មានទូទៅ (Basic)", icon: FileText },
          { key: "contacts", label: "២. ទំនាក់ទំនង (Contacts)", icon: Phone, disabled: isCreate },
          { key: "hours", label: "៣. ម៉ោងធ្វើការ (Hours & Closures)", icon: Clock, disabled: isCreate },
          { key: "photos", label: "៤. រូបថត (Photos)", icon: ImageIcon, disabled: isCreate },
          { key: "kyc", label: "៥. ឯកសារច្បាប់ (KYC Vault)", icon: ShieldCheck, disabled: isCreate },
          { key: "internal", label: "៦. ព័ត៌មានផ្ទៃក្នុង (Internal Owner)", icon: User },
          { key: "subscription", label: "៧. គម្រោង & គណនីម្ចាស់ (Tier & Owners)", icon: Sparkles, disabled: isCreate },
          { key: "preview", label: "៨. មើលសាកល្បង (Preview)", icon: Eye, disabled: isCreate },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold whitespace-nowrap transition disabled:opacity-30 ${
                activeTab === tab.key
                  ? "border-gold-500 text-gold-600 dark:text-gold-400"
                  : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Basic Information */}
      {activeTab === "basic" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ឈ្មោះអាជីវកម្ម (ខ្មែរ) *
              </label>
              <input
                id="biz-name-km"
                type="text"
                required
                value={formData.name_km}
                onChange={(e) => setFormData({ ...formData, name_km: e.target.value })}
                placeholder="ឧ. សណ្ឋាគារ បេតិកភណ្ឌអង្គរ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Business Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="e.g. Angkor Heritage Retreat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ប្រភេទអាជីវកម្ម (Category) *
              </label>
              <select
                id="biz-category"
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:ring-2 focus:ring-gold-500"
              >
                <option value="">ជ្រើសរើសប្រភេទ / Select Category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_km} ({c.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ខេត្ត/រាជធានី (Province) *
              </label>
              <select
                id="biz-province"
                required
                value={formData.province_id}
                onChange={(e) => setFormData({ ...formData, province_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:ring-2 focus:ring-gold-500"
              >
                <option value="">ជ្រើសរើសខេត្ត / Select Province</option>
                {provinces?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_km} ({p.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                កម្រិតតម្លៃ (Price Level: 1–4)
              </label>
              <select
                value={formData.price_level}
                onChange={(e) => setFormData({ ...formData, price_level: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:ring-2 focus:ring-gold-500"
              >
                <option value={1}>$ (សមរម្យ / Budget)</option>
                <option value={2}>$$ (មធ្យម / Moderate)</option>
                <option value={3}>$$$ (ប្រណីត / Premium)</option>
                <option value={4}>$$$$ (ប្រណីតកំពូល / Luxury)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ពាក្យស្លោកខ្លី (Tagline KM)
              </label>
              <input
                type="text"
                value={formData.tagline_km}
                onChange={(e) => setFormData({ ...formData, tagline_km: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tagline (English)
              </label>
              <input
                type="text"
                value={formData.tagline_en}
                onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ការពិពណ៌នាពេញលេញ (Description KM)
              </label>
              <textarea
                rows={4}
                value={formData.description_km}
                onChange={(e) => setFormData({ ...formData, description_km: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Full Description (English)
              </label>
              <textarea
                rows={4}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                អាសយដ្ឋាន (Address KM) *
              </label>
              <input
                id="biz-address-km"
                type="text"
                value={formData.address_km}
                onChange={(e) => setFormData({ ...formData, address_km: e.target.value })}
                placeholder="ឧ. ផ្លូវលេខ ២៧ វត្តបូព៌ ក្រុងសៀមរាប"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Address (English) *
              </label>
              <input
                type="text"
                value={formData.address_en}
                onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                placeholder="e.g. Street 27, Wat Bo, Siem Reap"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Latitude (រយៈទទឹង) *
              </label>
              <input
                id="biz-lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                placeholder="13.3582"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Longitude (រយៈបណ្តោយ) *
              </label>
              <input
                id="biz-lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                placeholder="103.8643"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contacts */}
      {activeTab === "contacts" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                បណ្តាញទំនាក់ទំនងផ្ទាល់ (Direct Contact Channels)
              </h2>
              <p className="text-xs text-stone-500">
                Tourists tap these buttons to call or message directly. Exactly one primary channel is gold-highlighted.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact Channel</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
            {businessData?.contacts?.length > 0 ? (
              businessData.contacts.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-bold uppercase">
                      {c.type.substring(0, 2)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 dark:text-white capitalize">
                          {c.type}: {c.value}
                        </span>
                        {c.is_primary && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold rounded-md">
                            Primary Gold Button
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500">{c.label || "No custom label"}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Remove this contact?")) {
                        await api.delete(`/admin/business/businesses/${id}/contacts/${c.id}`);
                        toast.success("Contact removed");
                        queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-stone-400 text-sm">
                No contacts added yet. At least one contact is required to approve this business.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Hours & Closures */}
      {activeTab === "hours" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                ម៉ោងប្រតិបត្តិការប្រចាំសប្តាហ៍ (Weekly Hours)
              </h2>
              <p className="text-xs text-stone-500">
                Used to compute the real-time "Open Now" badge in Asia/Phnom_Penh.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await api.put(`/admin/business/businesses/${id}/hours`, { hours });
                toast.success("Hours updated successfully");
                queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Hours</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {hours.map((h, idx) => {
              const dayNames = ["Sunday (អាទិត្យ)", "Monday (ចន្ទ)", "Tuesday (អង្គារ)", "Wednesday (ពុធ)", "Thursday (ព្រហស្បតិ៍)", "Friday (សុក្រ)", "Saturday (សៅរ៍)"];
              return (
                <div key={h.weekday} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {dayNames[h.weekday]}
                    </span>
                    <label className="text-[11px] flex items-center gap-1 text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={h.is_closed}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[idx].is_closed = e.target.checked;
                          setHours(updated);
                        }}
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                  {!h.is_closed && (
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="time"
                        value={h.opens_at ? h.opens_at.substring(0, 5) : "08:00"}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[idx].opens_at = e.target.value;
                          setHours(updated);
                        }}
                        className="w-full p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={h.closes_at ? h.closes_at.substring(0, 5) : "21:00"}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[idx].closes_at = e.target.value;
                          setHours(updated);
                        }}
                        className="w-full p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Temporary Closures Sub-section */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  ការបិទទ្វារបណ្តោះអាសន្ន (Temporary Closures / Holidays)
                </h3>
                <p className="text-xs text-stone-500">During closure dates, the business is marked Closed</p>
              </div>
              <button
                type="button"
                onClick={() => setClosureModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 rounded-lg"
              >
                + Add Closure Date
              </button>
            </div>

            <div className="space-y-2">
              {businessData?.closures?.length > 0 ? (
                businessData.closures.map((cl) => (
                  <div key={cl.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {cl.from_date} ដល់ {cl.to_date}
                      </span>
                      <span className="text-stone-500 ml-2">({cl.note_en || cl.note_km || "Holiday"})</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.delete(`/admin/business/businesses/${id}/closures/${cl.id}`);
                        toast.success("Closure date removed");
                        queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                      }}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-400 italic">No temporary closures scheduled.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Photos */}
      {activeTab === "photos" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                វិចិត្រសាលរូបថត (Media Gallery)
              </h2>
              <p className="text-xs text-stone-500">
                Uploaded images are converted to WebP with EXIF stripped, generating 800px & 400px versions.
              </p>
            </div>
          </div>

          {/* Upload Input */}
          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-center hover:border-gold-500 transition">
            <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Upload Business Photos (JPEG, PNG, WebP up to 5MB)
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("image", file);
                fd.append("is_cover", businessData?.media?.length === 0 ? "1" : "0");
                try {
                  await api.post(`/admin/business/businesses/${id}/media`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  toast.success("Photo uploaded and re-encoded to WebP");
                  queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                } catch {
                  toast.error("Failed to upload photo.");
                }
              }}
              className="mt-3 text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
            />
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {businessData?.media?.map((m) => (
              <div key={m.id} className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 aspect-video">
                <img src={m.url_400 || m.url} alt="" className="w-full h-full object-cover" />
                {m.is_cover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-gold-500 text-white text-[10px] font-bold rounded shadow">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {!m.is_cover && (
                    <button
                      type="button"
                      onClick={async () => {
                        await api.post(`/admin/business/businesses/${id}/media/${m.id}/cover`);
                        toast.success("Set as cover photo");
                        queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                      }}
                      className="p-1.5 bg-white text-stone-800 rounded-lg text-xs font-semibold hover:bg-gold-50"
                      title="Set as cover"
                    >
                      Make Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Delete photo?")) {
                        await api.delete(`/admin/business/businesses/${id}/media/${m.id}`);
                        toast.success("Photo deleted");
                        queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                      }
                    }}
                    className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Documents / KYC Vault */}
      {activeTab === "kyc" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                ប័ណ្ណសារឯកសារច្បាប់សម្ងាត់ (Private KYC Vault)
              </h2>
              <p className="text-xs text-stone-500">
                Encrypted on private disk. Only staff with "business.kyc.view" permission can view/download.
              </p>
            </div>
          </div>

          {!hasPermission("business.kyc.view") ? (
            <div className="p-8 text-center text-rose-500 font-semibold text-sm">
              You do not have permission to access KYC documents.
            </div>
          ) : (
            <>
              {/* Upload KYC Document */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                <h3 className="text-xs font-bold uppercase text-stone-600 dark:text-stone-400 mb-3">
                  Upload Compliance Document (ID Card, Ministry License, Business Certificate)
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const file = form.document.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("document", file);
                    fd.append("type", form.type.value);
                    fd.append("notes", form.notes.value);
                    if (form.expires_at.value) fd.append("expires_at", form.expires_at.value);

                    try {
                      await api.post(`/admin/business/businesses/${id}/documents`, fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      toast.success("KYC document uploaded securely to vault");
                      form.reset();
                      queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                    } catch {
                      toast.error("Failed to upload KYC document.");
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
                >
                  <select name="type" className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800">
                    <option value="business_license">Business License / អាជ្ញាប័ណ្ណទេសចរណ៍</option>
                    <option value="id_card">National ID Card / អត្តសញ្ញាណប័ណ្ណ</option>
                    <option value="other">Other Official Document</option>
                  </select>
                  <input
                    type="date"
                    name="expires_at"
                    placeholder="Expiry Date"
                    className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                  <input
                    type="text"
                    name="notes"
                    placeholder="Notes (e.g. MOT License #2026)"
                    className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                  <div className="flex items-center gap-2">
                    <input type="file" name="document" accept=".pdf,image/*" required className="text-xs text-stone-500 w-full" />
                    <button type="submit" className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shrink-0">
                      Upload
                    </button>
                  </div>
                </form>
              </div>

              {/* Documents List */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                {businessData?.documents?.length > 0 ? (
                  businessData.documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between text-xs hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                        <div>
                          <div className="font-bold text-stone-900 dark:text-white capitalize">
                            {doc.type.replace("_", " ")}: {doc.file_name}
                          </div>
                          <div className="text-stone-500">
                            Notes: {doc.notes || "None"} • Expires: {doc.expires_at || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await api.get(`/admin/business/businesses/${id}/documents/${doc.id}/download`, {
                                responseType: "blob",
                              });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", doc.file_name);
                              document.body.appendChild(link);
                              link.click();
                            } catch {
                              toast.error("Failed to download KYC document");
                            }
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-bold rounded-lg"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm("Remove KYC document?")) {
                              await api.delete(`/admin/business/businesses/${id}/documents/${doc.id}`);
                              toast.success("Document removed");
                              queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-stone-400 text-xs italic">
                    No KYC documents uploaded. At least one document is required to award the Verified badge.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 6: Internal Owner Info */}
      {activeTab === "internal" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              ព័ត៌មានម្ចាស់អាជីវកម្ម និងកំណត់សម្គាល់ផ្ទៃក្នុង (Internal Admin Only)
            </h2>
            <p className="text-xs text-stone-500">
              Never exposed to visitors or public APIs. For staff internal records only.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ឈ្មោះម្ចាស់អាជីវកម្ម (Owner Name)
              </label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="e.g. Lok Oknha / Mr. Sokha"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                លេខទូរស័ព្ទម្ចាស់ (Owner Direct Phone)
              </label>
              <input
                type="text"
                value={formData.owner_phone}
                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                placeholder="+855 12 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              កំណត់សម្គាល់ផ្ទៃក្នុងរបស់បុគ្គលិក (Staff Confidential Notes)
            </label>
            <textarea
              rows={4}
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              placeholder="e.g. Verified by Dara on site 2026. Official license expires end of year."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
            />
          </div>
        </div>
      )}

      {/* Tab 7: Subscription & Owner Accounts */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          {/* Subscription Tiering Card */}
          <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  <span>កម្រិតគម្រោងជាវ & ការផ្សព្វផ្សាយ (Subscription & Pro/Premium Tiers)</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Provision subscription tiers and featured promotions upon manual payment receipt or promotional grant.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  businessData?.tier === "featured"
                    ? "bg-gold-500 text-stone-950"
                    : businessData?.tier === "verified"
                    ? "bg-blue-500 text-white"
                    : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                }`}>
                  {businessData?.tier === "featured" ? "Premium" : businessData?.tier === "verified" ? "Pro" : "Free"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Subscription Tier *
                </label>
                <select
                  value={subscriptionForm.tier}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, tier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm font-semibold"
                >
                  <option value="free">Free ($0/mo) - Standard Listing</option>
                  <option value="verified">Pro ($9/mo) - Priority & Growth Tools</option>
                  <option value="featured">Premium ($25/mo) - Top Placement & Sponsorship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Subscription Expiry Date
                </label>
                <input
                  type="date"
                  value={subscriptionForm.subscription_expires_at}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, subscription_expires_at: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Premium Spotlight Until
                </label>
                <input
                  type="date"
                  value={subscriptionForm.featured_until}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, featured_until: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Admin Note / Payment Reference
              </label>
              <input
                type="text"
                value={subscriptionForm.note}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, note: e.target.value })}
                placeholder="e.g. Paid $25 for 1 month via KHQR invoice #KM-2026-089."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={updateSubscriptionMutation.isPending}
                onClick={() => updateSubscriptionMutation.mutate(subscriptionForm)}
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{updateSubscriptionMutation.isPending ? "Updating..." : "Save Subscription Tier"}</span>
              </button>
            </div>
          </div>

          {/* Business Owner Accounts Management */}
          <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  <span>គណនីម្ចាស់អាជីវកម្ម (Owner Portal User Accounts)</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Business owners receive a one-time setup link, create their own password, then sign in to manage this business.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOwnerSetup(null);
                  setCopiedLink(false);
                  setNewOwnerForm({
                    name: businessData?.owner_name || "",
                    email: "",
                    phone: businessData?.owner_phone || "",
                  });
                  setCreateOwnerModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>បង្កើតគណនីម្ចាស់ (Create Owner Account)</span>
              </button>
            </div>

            {/* Persistent setup link card (survives closing the modal) */}
            {ownerSetup && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <Key className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        Owner setup link ready
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        Send this link to <strong>{ownerSetup.user.email}</strong>. It expires on{" "}
                        {new Date(ownerSetup.expires_at).toLocaleString()}.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <code className="min-w-0 flex-1 break-all rounded-xl border border-emerald-200 bg-white px-3 py-2 font-mono text-[10px] leading-relaxed text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                        {ownerSetup.setup_url}
                      </code>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(ownerSetup.setup_url);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-stone-700 dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-stone-700"
                        >
                          {copiedLink ? (
                            <CheckCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedLink ? "Copied!" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(ownerSetup.setup_url, "_blank", "noopener,noreferrer")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-stone-700 dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-stone-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Open</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List of existing linked owners */}
            {(!businessData?.owner_accounts || businessData.owner_accounts.length === 0) ? (
              <div className="p-8 text-center text-stone-400 text-xs border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                <User className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                <p>No business owner user account has been provisioned yet.</p>
                <p className="mt-1">Click "Create Owner Account" above to generate a secure setup link for the proprietor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {businessData.owner_accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-stone-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span>{acc.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                          business_owner
                        </span>
                        {acc.must_change_password ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Setup pending
                          </span>
                        ) : acc.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-500/15 text-stone-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-4">
                        <span>Email: <strong className="text-stone-700 dark:text-stone-300">{acc.email}</strong></span>
                        {acc.phone && <span>Phone: {acc.phone}</span>}
                        {acc.created_at && <span>Created: {new Date(acc.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    {acc.must_change_password && (
                      <button
                        type="button"
                        onClick={() => regenerateOwnerSetupMutation.mutate(acc.id)}
                        disabled={regenerateOwnerSetupMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sage-deep bg-paper px-3 py-2 text-[11px] font-bold text-forest transition hover:bg-sage disabled:opacity-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-700"
                      >
                        {regenerateOwnerSetupMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>Setup link</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 8: Preview as Visitor */}
      {activeTab === "preview" && (
        <div className="bg-white dark:bg-stone-850 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                ទិដ្ឋភាពដែលភ្ញៀវទេសចរមើលឃើញ (Visitor View Simulation)
              </h2>
              <p className="text-xs text-stone-500">Live preview of profile page</p>
            </div>
            <a
              href={getPublicBusinessUrl(businessData?.slug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 text-white rounded-xl text-xs font-bold"
            >
              <span>Open on Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="max-w-xl mx-auto border border-stone-200 dark:border-stone-700 rounded-3xl overflow-hidden shadow-lg bg-stone-50 dark:bg-stone-900">
            <div className="relative aspect-video bg-stone-200 dark:bg-stone-800">
              {businessData?.cover_image?.url ? (
                <img src={businessData.cover_image.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold">No Cover Image</div>
              )}
              {businessData?.is_verified && (
                <span className="absolute top-3 right-3 px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-bold shadow flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">{formData.name_km}</h1>
                <div className="text-sm text-stone-500">{formData.name_en}</div>
              </div>

              <div className="p-3 bg-white dark:bg-stone-800 rounded-xl text-xs space-y-1">
                <div className="text-stone-500">Address:</div>
                <div className="font-semibold text-stone-800 dark:text-stone-200">{formData.address_km || formData.address_en}</div>
              </div>

              {/* Primary Contact Button Demonstration */}
              {businessData?.contacts?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-stone-400 uppercase">Direct Contact Button</div>
                  <button className="w-full py-3 bg-gold-500 text-white rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Contact via {businessData.contacts[0].type}: {businessData.contacts[0].value}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verify / Unverify Reason Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-850 max-w-md w-full rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              {verifyAction === "verify" ? "Grant Verified Badge" : "Revoke Verified Badge"}
            </h3>
            <p className="text-xs text-stone-500">
              Please enter the audit justification reason. This action is permanently recorded in system audit logs.
            </p>
            <textarea
              required
              rows={3}
              value={verifyReason}
              onChange={(e) => setVerifyReason(e.target.value)}
              placeholder="e.g. Ministry of Tourism License #2026 physically inspected."
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs focus:ring-2 focus:ring-gold-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!verifyReason.trim()}
                onClick={() => verifyMutation.mutate({ action: verifyAction, reason: verifyReason })}
                className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow disabled:opacity-40"
              >
                Confirm {verifyAction === "verify" ? "Verification" : "Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-850 max-w-md w-full rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Add Contact Method</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Channel Type</label>
                <select
                  value={newContact.type}
                  onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                >
                  <option value="phone">Phone / ទូរស័ព្ទ (+855...)</option>
                  <option value="telegram">Telegram (https://t.me/...)</option>
                  <option value="whatsapp">WhatsApp (https://wa.me/...)</option>
                  <option value="messenger">Facebook Messenger</option>
                  <option value="email">Email Address</option>
                  <option value="facebook">Facebook Page URL</option>
                  <option value="website">Website URL</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Value (URL or Phone Number)</label>
                <input
                  type="text"
                  required
                  value={newContact.value}
                  onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                  placeholder="+855 12 345 678 or https://t.me/username"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Label (Optional)</label>
                <input
                  type="text"
                  value={newContact.label}
                  onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                  placeholder="e.g. Hotline, Booking, Front Desk"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold">
                <input
                  type="checkbox"
                  checked={newContact.is_primary}
                  onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })}
                />
                <span>Set as Primary Channel (Highlighted in Gold)</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newContact.value.trim()}
                onClick={async () => {
                  try {
                    await api.post(`/admin/business/businesses/${id}/contacts`, newContact);
                    toast.success("Contact added");
                    setContactModalOpen(false);
                    setNewContact({ type: "phone", value: "", label: "", is_primary: false });
                    queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                  } catch {
                    toast.error("Failed to add contact.");
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-gold-500 hover:bg-gold-600 text-white rounded-xl shadow"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Closure Modal */}
      {closureModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-850 max-w-md w-full rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Add Temporary Closure Date</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">From Date *</label>
                <input
                  type="date"
                  required
                  value={newClosure.from_date}
                  onChange={(e) => setNewClosure({ ...newClosure, from_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">To Date *</label>
                <input
                  type="date"
                  required
                  value={newClosure.to_date}
                  onChange={(e) => setNewClosure({ ...newClosure, to_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Closure Reason</label>
                <input
                  type="text"
                  value={newClosure.note_en}
                  onChange={(e) => setNewClosure({ ...newClosure, note_en: e.target.value })}
                  placeholder="e.g. Khmer New Year Holiday, Renovation"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClosureModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newClosure.from_date || !newClosure.to_date}
                onClick={async () => {
                  try {
                    await api.post(`/admin/business/businesses/${id}/closures`, newClosure);
                    toast.success("Closure date saved");
                    setClosureModalOpen(false);
                    setNewClosure({ from_date: "", to_date: "", note_km: "", note_en: "" });
                    queryClient.invalidateQueries({ queryKey: ["admin", "business", id] });
                  } catch {
                    toast.error("Failed to save closure date.");
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-gold-500 hover:bg-gold-600 text-white rounded-xl shadow"
              >
                Save Closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Owner Account Modal */}
      {createOwnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl border border-sage-deep bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-850">
            <div className="flex items-center justify-between border-b border-sage-deep pb-3 dark:border-stone-800">
              <h3 className="flex items-center gap-2 text-base font-bold text-forest dark:text-white">
                <Key className="h-5 w-5 text-brand-600" />
                <span>{ownerSetup ? "Owner Setup Link" : "Create Owner Account"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCreateOwnerModalOpen(false)}
                className="text-lg font-bold text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            {ownerSetup ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 dark:bg-emerald-950/30">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Owner account is ready
                    </p>
                    <p className="mt-1 leading-relaxed text-stone-600 dark:text-stone-300">
                      No temporary password was created. Send this one-time link to the owner so
                      they can create their own password.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      Owner email
                    </span>
                    <div className="mt-1 rounded-xl border border-sage-deep bg-paper px-3 py-2 font-semibold text-forest dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                      {ownerSetup.user.email}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      One-time setup link
                    </span>
                    <div className="mt-1 flex items-start gap-2 rounded-xl border border-sage-deep bg-paper px-3 py-2 dark:border-stone-700 dark:bg-stone-900">
                      <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span className="break-all font-mono text-[10px] leading-relaxed text-stone-600 dark:text-stone-300">
                        {ownerSetup.setup_url}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] leading-relaxed text-muted">
                    This link expires on{" "}
                    <strong className="text-stone-600 dark:text-stone-300">
                      {new Date(ownerSetup.expires_at).toLocaleString()}
                    </strong>
                    . You can generate a new link from the owner list if it expires.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `CamGO Business Owner Setup\nEmail: ${ownerSetup.user.email}\nCreate your password here: ${ownerSetup.setup_url}\nThis link expires on ${new Date(ownerSetup.expires_at).toLocaleString()}.`
                      );
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-sage-deep bg-paper px-4 py-2 font-bold text-forest transition hover:bg-sage dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                  >
                    {copiedLink ? (
                      <CheckCheck className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(ownerSetup.setup_url, "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-1.5 rounded-xl border border-sage-deep bg-paper px-4 py-2 font-bold text-forest transition hover:bg-sage dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateOwnerModalOpen(false)}
                    className="rounded-xl bg-brand-500 px-5 py-2 font-bold text-forest shadow-sm transition hover:bg-brand-400"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createOwnerMutation.mutate(newOwnerForm);
                }}
                className="space-y-3 text-xs"
              >
                <p className="rounded-2xl bg-sage/70 p-3 leading-relaxed text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">
                  The owner will receive a secure setup link and choose their own password.
                  No password is created or displayed by the administrator.
                </p>

                <div>
                  <label className="mb-1 block font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newOwnerForm.name}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, name: e.target.value })}
                    placeholder="e.g. Sokha Chan"
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 dark:border-stone-700 dark:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold">Login Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newOwnerForm.email}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, email: e.target.value })}
                    placeholder="owner@hotel.com"
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 dark:border-stone-700 dark:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={newOwnerForm.phone}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, phone: e.target.value })}
                    placeholder="+855..."
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 dark:border-stone-700 dark:bg-stone-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateOwnerModalOpen(false)}
                    className="rounded-xl px-4 py-2 font-semibold text-stone-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createOwnerMutation.isPending}
                    className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 font-bold text-forest shadow-sm transition hover:bg-brand-400 disabled:opacity-50"
                  >
                    {createOwnerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{createOwnerMutation.isPending ? "Creating..." : "Create & Get Link"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
