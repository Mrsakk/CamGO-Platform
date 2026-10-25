import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Star,
  Store,
  Trash2,
  UploadCloud,
} from "lucide-react";
import api from "@/lib/ownerApi";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { QueryError } from "@/components/common/QueryError";
import { ServiceCatalogEditor } from "@/components/owner/ServiceCatalogEditor";
import { getPublicBusinessUrl } from "@/lib/publicUrls";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const weekdays = [
  { id: 0, km: "ថ្ងៃអាទិត្យ", en: "Sunday" },
  { id: 1, km: "ថ្ងៃចន្ទ", en: "Monday" },
  { id: 2, km: "ថ្ងៃអង្គារ", en: "Tuesday" },
  { id: 3, km: "ថ្ងៃពុធ", en: "Wednesday" },
  { id: 4, km: "ថ្ងៃព្រហស្បតិ៍", en: "Thursday" },
  { id: 5, km: "ថ្ងៃសុក្រ", en: "Friday" },
  { id: 6, km: "ថ្ងៃសៅរ៍", en: "Saturday" },
];

const mediaUrl = (media) => media?.url_800 || media?.url || media?.thumb_url || media?.path;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialForm = {
  name_km: "",
  name_en: "",
  tagline_km: "",
  tagline_en: "",
  description_km: "",
  description_en: "",
  address_km: "",
  address_en: "",
  lat: "",
  lng: "",
  price_level: 2,
};

const buildGeneralForm = (business = {}) => ({
  name_km: business.name_km || "",
  name_en: business.name_en || "",
  tagline_km: business.tagline_km || "",
  tagline_en: business.tagline_en || "",
  description_km: business.description_km || "",
  description_en: business.description_en || "",
  address_km: business.address_km || "",
  address_en: business.address_en || "",
  lat: business.lat ?? "",
  lng: business.lng ?? "",
  price_level: business.price_level || 2,
});

const normalizeGeneralForm = (data = {}) => ({
  ...initialForm,
  ...data,
  lat: data.lat === "" || data.lat === null || data.lat === undefined ? "" : Number(data.lat),
  lng: data.lng === "" || data.lng === null || data.lng === undefined ? "" : Number(data.lng),
  price_level: Number(data.price_level) || 2,
});

const buildProfileState = (business = {}, schema = []) => {
  const rawProfile = business.profile_data || {};
  const normalized = {};

  schema.forEach((field) => {
    const value = rawProfile[field.key];
    if (field.type === "tags") {
      normalized[field.key] = Array.isArray(value) ? value.join(", ") : value || "";
    } else if (field.type === "boolean") {
      normalized[field.key] = Boolean(value);
    } else if (field.type === "number") {
      normalized[field.key] = value === "" || value === null || value === undefined ? "" : Number(value);
    } else {
      normalized[field.key] = value ?? "";
    }
  });

  return normalized;
};

const normalizeProfileState = (data = {}, schema = []) => {
  const normalized = {};

  schema.forEach((field) => {
    const value = data[field.key];
    if (field.type === "tags") {
      normalized[field.key] = Array.isArray(value) ? value.join(", ") : value || "";
    } else if (field.type === "boolean") {
      normalized[field.key] = Boolean(value);
    } else if (field.type === "number") {
      normalized[field.key] = value === "" || value === null || value === undefined ? "" : Number(value);
    } else {
      normalized[field.key] = value ?? "";
    }
  });

  return normalized;
};

const normalizeHoursState = (list = []) =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
    const found = list.find((item) => Number(item.weekday) === weekday);
    return {
      weekday,
      opens_at: found?.opens_at || "08:00",
      closes_at: found?.closes_at || "20:00",
      is_closed: Boolean(found?.is_closed),
    };
  });

const buildHoursState = (business = {}) => normalizeHoursState(business.hours || []);

const normalizeValidationErrors = (errors = {}) =>
  Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : String(value),
    ])
  );

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">{message}</p>
  ) : null;

const fieldErrorClass = (message) =>
  message
    ? "!border-rose-400 focus:!border-rose-500 focus:!ring-rose-200 dark:!border-rose-700"
    : "";

const focusFirstValidationError = (errors) => {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;

  setTimeout(() => {
    const element = document.querySelector(`[name="${firstKey}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus();
  }, 80);
};

const validateGeneralForm = (data, isKm) => {
  const errors = {};

  if (!String(data.name_km || "").trim()) {
    errors.name_km = isKm ? "សូមបញ្ចូលឈ្មោះអាជីវកម្មជាភាសាខ្មែរ។" : "Khmer business name is required.";
  }
  if (!String(data.name_en || "").trim()) {
    errors.name_en = isKm ? "សូមបញ្ចូលឈ្មោះអាជីវកម្មជាភាសាអង់គ្លេស។" : "English business name is required.";
  }
  if (!String(data.address_km || "").trim()) {
    errors.address_km = isKm ? "សូមបញ្ចូលអាសយដ្ឋានជាភាសាខ្មែរ។" : "Khmer address is required.";
  }
  if (!String(data.address_en || "").trim()) {
    errors.address_en = isKm ? "សូមបញ្ចូលអាសយដ្ឋានជាភាសាអង់គ្លេស។" : "English address is required.";
  }

  const hasLat = data.lat !== "" && data.lat !== null && data.lat !== undefined;
  const hasLng = data.lng !== "" && data.lng !== null && data.lng !== undefined;
  if (hasLat !== hasLng) {
    const message = isKm
      ? "សូមបញ្ចូលទាំង Latitude និង Longitude ឬទុកទាំងពីរទទេ។"
      : "Enter both latitude and longitude, or leave both blank.";
    errors.lat = message;
    errors.lng = message;
  }

  return errors;
};

export const OwnerBusinessProfilePage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const { hasBusinessCapability } = useAuthStore();

  const canEdit = hasBusinessCapability("profile.update");
  const canHours = hasBusinessCapability("hours.manage");
  const canMedia = hasBusinessCapability("media.manage");

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = ["general", "services", "category", "hours", "contacts", "media"].includes(requestedTab)
    ? requestedTab
    : "general";
  const setActiveTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "general") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingTab, setPendingTab] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [profileData, setProfileData] = useState({});
  const [hours, setHours] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    type: "phone",
    value: "",
    label: "",
    is_primary: false,
  });

  const {
    data: business,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["owner-my-business"],
    queryFn: async () => {
      const res = await api.get("/business/me/business");
      return res.data?.data || res.data;
    },
  });

  const schema = Array.isArray(business?.category?.profile_schema)
    ? business.category.profile_schema
    : [];

  useEffect(() => {
    if (!business) return;

    setFormData(buildGeneralForm(business));
    setProfileData(buildProfileState(business, schema));
    setHours(buildHoursState(business));
    setFieldErrors({});
  }, [business, schema.length]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put("/business/me/business", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message ||
        (isKm ? "បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានអាជីវកម្ម!" : "Business profile updated successfully!")
      );
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    },
    onError: (error) => {
      const errors = normalizeValidationErrors(error.response?.data?.errors || {});
      setFieldErrors(errors);
      focusFirstValidationError(errors);
      const firstError = Object.values(errors)[0];
      toast.error(
        firstError ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ" : "Failed to update profile")
      );
    },
  });

  const syncHoursMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put("/business/me/hours", { hours: payload });
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានរក្សាទុកម៉ោងបើកបិទ!" : "Operating hours synced successfully!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    },
    onError: (error) => {
      const errors = normalizeValidationErrors(error.response?.data?.errors || {});
      const firstError = Object.values(errors)[0];
      toast.error(
        firstError ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចរក្សាទុកម៉ោងបានទេ" : "Failed to sync hours")
      );
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/business/me/contacts", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានបន្ថែមមធ្យោបាយទំនាក់ទំនង!" : "Contact channel added!");
      setShowAddContact(false);
      setNewContact({ type: "phone", value: "", label: "", is_primary: false });
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    },
    onError: (error) => {
      const errors = normalizeValidationErrors(error.response?.data?.errors || {});
      const firstError = Object.values(errors)[0];
      toast.error(
        firstError ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចបន្ថែមបានទេ" : "Failed to add contact")
      );
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/business/me/contacts/${id}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានលុបមធ្យោបាយទំនាក់ទំនង!" : "Contact deleted!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    },
    onError: () => toast.error(isKm ? "មិនអាចលុបបានទេ" : "Failed to delete contact"),
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async (files) => {
      const form = new FormData();
      Array.from(files).forEach((file) => form.append("images[]", file));
      const res = await api.post("/business/me/media", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានផ្ទុករូបភាពឡើង!" : "Photos uploaded successfully!");
      setMediaError("");
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    },
    onError: (error) => {
      const errors = normalizeValidationErrors(error.response?.data?.errors || {});
      const firstError = Object.values(errors)[0];
      const message =
        firstError ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចផ្ទុករូបភាពបានទេ" : "Failed to upload photos");
      setMediaError(message);
      toast.error(message);
    },
  });

  const setCoverMutation = useMutation({
    mutationFn: async (mediaId) => {
      await api.post(`/business/me/media/${mediaId}/cover`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានកំណត់ជារូបភាពគម្រប!" : "Set as cover photo!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចកំណត់រូបភាពគម្របបានទេ" : "Failed to set cover photo")
      );
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId) => {
      await api.delete(`/business/me/media/${mediaId}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានលុបរូបភាព!" : "Photo deleted!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចលុបរូបភាពបានទេ" : "Failed to delete photo")
      );
    },
  });

  const baselineGeneral = buildGeneralForm(business);
  const baselineProfile = buildProfileState(business, schema);
  const baselineHours = buildHoursState(business);

  const generalDirty =
    Boolean(business) &&
    JSON.stringify(normalizeGeneralForm(formData)) !==
    JSON.stringify(normalizeGeneralForm(baselineGeneral));
  const categoryDirty =
    Boolean(business) &&
    JSON.stringify(normalizeProfileState(profileData, schema)) !==
    JSON.stringify(normalizeProfileState(baselineProfile, schema));
  const hoursDirty =
    Boolean(business) &&
    JSON.stringify(normalizeHoursState(hours)) !== JSON.stringify(normalizeHoursState(baselineHours));

  const tabDirty = {
    general: generalDirty,
    category: categoryDirty,
    hours: hoursDirty,
  };
  const isDirty = generalDirty || categoryDirty || hoursDirty;
  const canSaveActive =
    activeTab === "general" || activeTab === "category"
      ? canEdit
      : activeTab === "hours"
        ? canHours
        : false;
  const activeSavePending =
    activeTab === "hours" ? syncHoursMutation.isPending : updateProfileMutation.isPending;

  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const buildProfilePayload = () => {
    const payload = {};
    schema.forEach((field) => {
      const value = profileData[field.key];
      if (field.type === "tags") {
        payload[field.key] = String(value || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else if (field.type === "boolean") {
        payload[field.key] = Boolean(value);
      } else if (field.type === "number") {
        payload[field.key] = value === "" ? null : Number(value);
      } else {
        payload[field.key] = value || null;
      }
    });
    return payload;
  };

  const handleGeneralSubmit = (event) => {
    event?.preventDefault();

    const errors = validateGeneralForm(formData, isKm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      focusFirstValidationError(errors);
      toast.error(
        isKm ? "សូមកែប្រែព័ត៌មានដែលបានសម្គាល់ជាមុន។" : "Please fix the highlighted fields."
      );
      return;
    }

    setFieldErrors({});
    updateProfileMutation.mutate({
      ...formData,
      lat: formData.lat === "" ? null : Number(formData.lat),
      lng: formData.lng === "" ? null : Number(formData.lng),
    });
  };

  const handleCategorySubmit = (event) => {
    event?.preventDefault();
    setFieldErrors({});
    updateProfileMutation.mutate({
      ...formData,
      lat: formData.lat === "" ? null : Number(formData.lat),
      lng: formData.lng === "" ? null : Number(formData.lng),
      profile_data: buildProfilePayload(),
    });
  };

  const handleHoursSubmit = (event) => {
    event?.preventDefault();
    syncHoursMutation.mutate(hours);
  };

  const discardActiveDraft = () => {
    if (activeTab === "general") setFormData(baselineGeneral);
    if (activeTab === "category") setProfileData(baselineProfile);
    if (activeTab === "hours") setHours(baselineHours);
    setFieldErrors({});
  };

  const requestTabChange = (tab) => {
    if (tab === activeTab) return;
    if (tabDirty[activeTab]) {
      setPendingTab(tab);
      return;
    }
    setActiveTab(tab);
  };

  const confirmPendingTabChange = () => {
    const nextTab = pendingTab;
    setPendingTab(null);
    if (!nextTab) return;
    discardActiveDraft();
    setActiveTab(nextTab);
  };

  const saveActiveTab = () => {
    if (activeTab === "general") handleGeneralSubmit();
    if (activeTab === "category") handleCategorySubmit();
    if (activeTab === "hours") handleHoursSubmit();
  };

  const handleMediaFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const invalidType = files.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      const message = isKm
        ? `ឯកសារ “${invalidType.name}” មិនត្រូវបានគាំទ្រទេ។ សូមប្រើ JPG, PNG ឬ WebP។`
        : `“${invalidType.name}” is not supported. Use JPG, PNG, or WebP.`;
      setMediaError(message);
      toast.error(message);
      return;
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      const message = isKm
        ? `ឯកសារ “${tooLarge.name}” ធំជាង 5MB។ សូមបង្រួមទំហំរូបភាព។`
        : `“${tooLarge.name}” is larger than 5MB. Please compress the image.`;
      setMediaError(message);
      toast.error(message);
      return;
    }

    setMediaError("");
    uploadMediaMutation.mutate(files);
  };

  const contacts = Array.isArray(business?.contacts) ? business.contacts : [];
  const mediaList = Array.isArray(business?.media) ? business.media : [];

  const requestContactDelete = (contact) => {
    setConfirmDelete({
      type: "contact",
      id: contact.id,
      title: isKm ? "បញ្ជាក់ការលុបទំនាក់ទំនង" : "Delete contact?",
      description: isKm
        ? `លុប “${contact.value}” ចេញពីទំព័រអាជីវកម្ម? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`
        : `Remove “${contact.value}” from your business profile? This cannot be undone.`,
    });
  };

  const requestMediaDelete = (media) => {
    setConfirmDelete({
      type: "media",
      id: media.id,
      title: isKm ? "បញ្ជាក់ការលុបរូបភាព" : "Delete photo?",
      description: isKm
        ? "រូបភាពនេះនឹងត្រូវលុបចេញពីវិចិត្រសាលអាជីវកម្មជាអចិន្ត្រៃយ៍។"
        : "This photo will be permanently removed from your business gallery.",
    });
  };

  const runConfirmedDelete = () => {
    if (!confirmDelete) return;
    const clear = () => setConfirmDelete(null);

    if (confirmDelete.type === "contact") {
      deleteContactMutation.mutate(confirmDelete.id, { onSettled: clear });
      return;
    }

    deleteMediaMutation.mutate(confirmDelete.id, { onSettled: clear });
  };

  const tabs = [
    { id: "general", label: isKm ? "ព័ត៌មានទូទៅ" : "General", icon: Store },
    { id: "services", label: isKm ? "សេវាកម្ម" : "Services", icon: Sparkles },
    { id: "category", label: isKm ? "ព័ត៌មានតាមប្រភេទ" : "Category details", icon: Layers },
    { id: "hours", label: isKm ? "ម៉ោងបើកបិទ" : "Hours", icon: Clock },
    { id: "contacts", label: isKm ? "ទំនាក់ទំនង" : "Contacts", icon: Phone },
    { id: "media", label: isKm ? "រូបភាព" : "Photos", icon: ImageIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-500">
          {isKm ? "កំពុងផ្ទុកព័ត៌មានអាជីវកម្ម..." : "Loading business info..."}
        </p>
      </div>
    );
  }

  if (isError) {
    return <QueryError className="max-w-2xl mx-auto mt-10" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">


        {business?.slug && (
          <a
            href={getPublicBusinessUrl(business.slug)}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center gap-2"
          >
            {isKm ? "មើលទំព័រសាធារណៈ" : "View Live Profile"}
            <ExternalLink className="w-4 h-4 text-stone-500" />
          </a>
        )}
      </div>

      {!canEdit && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          {isKm
            ? "អ្នកមានសិទ្ធិមើលតែប៉ុណ្ណោះ។ សូមទាក់ទងម្ចាស់អាជីវកម្ម ឬអ្នកគ្រប់គ្រង ដើម្បីកែប្រែព័ត៌មាន។"
            : "You have view-only access. Contact the business owner or manager to request changes."}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {isKm ? "គោលការណ៍ផ្ទៀងផ្ទាត់ព័ត៌មាន៖ " : "Content verification policy: "}
          </span>
          {isKm
            ? "ការផ្លាស់ប្តូរឈ្មោះ ឬអាសយដ្ឋានសំខាន់នឹងត្រូវក្រុមការងារផ្ទៀងផ្ទាត់ឡើងវិញ ដើម្បីការពារការក្លែងបន្លំ។"
            : "Changes to your business name or address require staff re-verification to prevent fraud."}
        </div>
      </div>

      <div
        role="tablist"
        aria-label={isKm ? "ផ្នែកព័ត៌មានអាជីវកម្ម" : "Business profile sections"}
        className="flex items-center gap-1 overflow-x-auto border-b border-stone-200 dark:border-stone-800"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => requestTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${activeTab === tab.id
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tabDirty[tab.id] && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-amber-500"
                  aria-label={isKm ? "មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក" : "Unsaved changes"}
                />
              )}
            </button>
          );
        })}
      </div>

      {tabDirty[activeTab] && canSaveActive && (
        <div className="sticky top-20 z-20 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-3 shadow-lg backdrop-blur dark:border-amber-800 dark:bg-stone-900/95 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {isKm
                ? "អ្នកមានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក។"
                : "You have unsaved changes."}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={discardActiveDraft}
              disabled={activeSavePending}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-[11px] font-bold text-stone-600 transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              {isKm ? "បោះបង់" : "Discard"}
            </button>
            <button
              type="button"
              onClick={saveActiveTab}
              disabled={activeSavePending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-[11px] font-bold text-stone-950 transition hover:bg-amber-600 disabled:opacity-50"
            >
              {activeSavePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isKm ? "រក្សាទុក" : "Save changes"}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "general" && (
        <form
          onSubmit={handleGeneralSubmit}
          onChange={() => {
            if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
          }}
          className="space-y-6 bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "ឈ្មោះអាជីវកម្ម (ខ្មែរ) *" : "Business name (Khmer) *"}
              </span>
              <input
                type="text"
                name="name_km"
                required
                disabled={!canEdit}
                value={formData.name_km}
                onChange={(event) => setFormData({ ...formData, name_km: event.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60 ${fieldErrorClass(fieldErrors.name_km)}`}
              />
              <FieldError message={fieldErrors.name_km} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "ឈ្មោះអាជីវកម្ម (English) *" : "Business name (English) *"}
              </span>
              <input
                type="text"
                name="name_en"
                required
                disabled={!canEdit}
                value={formData.name_en}
                onChange={(event) => setFormData({ ...formData, name_en: event.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60 ${fieldErrorClass(fieldErrors.name_en)}`}
              />
              <FieldError message={fieldErrors.name_en} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "ស្លោកនិយាយ (ខ្មែរ)" : "Tagline (Khmer)"}
              </span>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.tagline_km}
                onChange={(event) => setFormData({ ...formData, tagline_km: event.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "ស្លោកនិយាយ (English)" : "Tagline (English)"}
              </span>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.tagline_en}
                onChange={(event) => setFormData({ ...formData, tagline_en: event.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "អាសយដ្ឋានពេញលេញ (ខ្មែរ) *" : "Full address (Khmer) *"}
              </span>
              <textarea
                rows={2}
                name="address_km"
                required
                disabled={!canEdit}
                value={formData.address_km}
                onChange={(event) => setFormData({ ...formData, address_km: event.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60 ${fieldErrorClass(fieldErrors.address_km)}`}
              />
              <FieldError message={fieldErrors.address_km} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "អាសយដ្ឋានពេញលេញ (English) *" : "Full address (English) *"}
              </span>
              <textarea
                rows={2}
                name="address_en"
                required
                disabled={!canEdit}
                value={formData.address_en}
                onChange={(event) => setFormData({ ...formData, address_en: event.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60 ${fieldErrorClass(fieldErrors.address_en)}`}
              />
              <FieldError message={fieldErrors.address_en} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "ការពិពណ៌នា (ខ្មែរ)" : "Description (Khmer)"}
              </span>
              <textarea
                rows={4}
                disabled={!canEdit}
                value={formData.description_km}
                onChange={(event) => setFormData({ ...formData, description_km: event.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isKm ? "ការពិពណ៌នា (English)" : "Description (English)"}
              </span>
              <textarea
                rows={4}
                disabled={!canEdit}
                value={formData.description_en}
                onChange={(event) => setFormData({ ...formData, description_en: event.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60"
              />
            </label>
          </div>

          <div>
            <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              {isKm ? "កម្រិតតម្លៃ" : "Price level"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4].map((level) => (
                <button
                  type="button"
                  key={level}
                  disabled={!canEdit}
                  onClick={() => setFormData({ ...formData, price_level: level })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-50 ${formData.price_level === level
                    ? "bg-amber-500 text-stone-950 border-amber-500"
                    : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                >
                  {"$".repeat(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
              <MapPin className="w-4 h-4 text-amber-500" />
              {isKm ? "ទីតាំងលើផែនទី" : "Map location"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  disabled={!canEdit}
                  value={formData.lat}
                  onChange={(event) => setFormData({ ...formData, lat: event.target.value })}
                  placeholder="Latitude (e.g. 13.3616)"
                  className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60 ${fieldErrorClass(fieldErrors.lat)}`}
                />
                <FieldError message={fieldErrors.lat} />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  disabled={!canEdit}
                  value={formData.lng}
                  onChange={(event) => setFormData({ ...formData, lng: event.target.value })}
                  placeholder="Longitude (e.g. 103.8600)"
                  className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60 ${fieldErrorClass(fieldErrors.lng)}`}
                />
                <FieldError message={fieldErrors.lng} />
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="submit"
                disabled={!generalDirty || updateProfileMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isKm ? "រក្សាទុកការផ្លាស់ប្តូរ" : "Save changes"}
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === "services" && (
        <ServiceCatalogEditor
          services={business?.services || []}
          presets={business?.category?.service_presets || {}}
          canEdit={canEdit}
        />
      )}

      {activeTab === "category" && (
        <form
          onSubmit={handleCategorySubmit}
          onChange={() => {
            if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
          }}
          className="space-y-5 bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm"
        >
          <div>
            <h2 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              {isKm ? "ព័ត៌មានតាមប្រភេទអាជីវកម្ម" : "Category-specific details"}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isKm
                ? "ព័ត៌មាននេះជួយភ្ញៀវស្វែងយល់បន្ថែមអំពីអាជីវកម្មរបស់អ្នក។"
                : "These fields help visitors understand your business better."}
            </p>
            {fieldErrors.profile_data && (
              <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                {fieldErrors.profile_data}
              </p>
            )}
          </div>

          {schema.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-500">
              {isKm
                ? "មិនមានព័ត៌មានបន្ថែមសម្រាប់ប្រភេទអាជីវកម្មនេះទេ។"
                : "No extra fields are configured for this category."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schema.map((field) => {
                const label = isKm ? field.label_km || field.label_en : field.label_en || field.label_km;
                const value = profileData[field.key] ?? (field.type === "boolean" ? false : "");
                const common =
                  "w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60";

                return (
                  <label key={field.key} className={field.type === "textarea" ? "md:col-span-2 block" : "block"}>
                    <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      {label}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        disabled={!canEdit}
                        value={value}
                        placeholder={field.placeholder_en || ""}
                        onChange={(event) =>
                          setProfileData({ ...profileData, [field.key]: event.target.value })
                        }
                        className={common}
                      />
                    ) : field.type === "boolean" ? (
                      <span className="flex items-center gap-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5">
                        <input
                          type="checkbox"
                          disabled={!canEdit}
                          checked={Boolean(value)}
                          onChange={(event) =>
                            setProfileData({ ...profileData, [field.key]: event.target.checked })
                          }
                          className="rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs text-stone-600 dark:text-stone-300">
                          {isKm ? "បាទ/ចាស" : "Yes"}
                        </span>
                      </span>
                    ) : field.type === "tags" ? (
                      <input
                        type="text"
                        disabled={!canEdit}
                        value={value}
                        placeholder={
                          field.placeholder_en
                            ? `${field.placeholder_en} (${isKm ? "បំបែកដោយសញ្ញាក្បៀស" : "comma separated"})`
                            : isKm
                              ? "បំបែកដោយសញ្ញាក្បៀស"
                              : "Comma separated"
                        }
                        onChange={(event) =>
                          setProfileData({ ...profileData, [field.key]: event.target.value })
                        }
                        className={common}
                      />
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                        step={field.type === "number" ? "any" : undefined}
                        disabled={!canEdit}
                        value={value}
                        placeholder={field.placeholder_en || ""}
                        onChange={(event) =>
                          setProfileData({ ...profileData, [field.key]: event.target.value })
                        }
                        className={common}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {canEdit && schema.length > 0 && (
            <div className="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="submit"
                disabled={!categoryDirty || updateProfileMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isKm ? "រក្សាទុកព័ត៌មានប្រភេទ" : "Save category details"}
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === "hours" && (
        <form
          onSubmit={handleHoursSubmit}
          className="space-y-5 bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm"
        >
          <p className="text-xs text-stone-500">
            {isKm ? "កំណត់ម៉ោងបើក និងបិទសម្រាប់ថ្ងៃនីមួយៗ។" : "Configure opening and closing times for each day."}
          </p>

          <div className="space-y-2">
            {weekdays.map((day) => {
              const current = hours.find((item) => item.weekday === day.id) || {
                weekday: day.id,
                opens_at: "08:00",
                closes_at: "20:00",
                is_closed: false,
              };

              return (
                <div
                  key={day.id}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-750 flex flex-wrap items-center justify-between gap-3"
                >
                  <span className="font-bold text-xs text-stone-800 dark:text-stone-200 w-32">
                    {isKm ? day.km : day.en}
                  </span>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-stone-500 font-semibold">
                      <input
                        type="checkbox"
                        disabled={!canHours}
                        checked={current.is_closed}
                        onChange={(event) =>
                          setHours(
                            hours.map((item) =>
                              item.weekday === day.id
                                ? { ...item, is_closed: event.target.checked }
                                : item
                            )
                          )
                        }
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                      {isKm ? "បិទ" : "Closed"}
                    </label>

                    {!current.is_closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          disabled={!canHours}
                          value={current.opens_at || "08:00"}
                          onChange={(event) =>
                            setHours(
                              hours.map((item) =>
                                item.weekday === day.id ? { ...item, opens_at: event.target.value } : item
                              )
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-semibold disabled:opacity-60"
                        />
                        <span className="text-xs text-stone-400">—</span>
                        <input
                          type="time"
                          disabled={!canHours}
                          value={current.closes_at || "20:00"}
                          onChange={(event) =>
                            setHours(
                              hours.map((item) =>
                                item.weekday === day.id ? { ...item, closes_at: event.target.value } : item
                              )
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-semibold disabled:opacity-60"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {canHours && (
            <div className="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="submit"
                disabled={!hoursDirty || syncHoursMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {syncHoursMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isKm ? "រក្សាទុកម៉ោង" : "Save hours"}
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === "contacts" && (
        <div className="space-y-5 bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                {isKm ? "មធ្យោបាយទំនាក់ទំនងផ្ទាល់" : "Direct contact channels"}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isKm ? "ភ្ញៀវអាចទាក់ទងអ្នកដោយផ្ទាល់តាមច្រកទាំងនេះ។" : "Visitors can reach you directly through these channels."}
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => setShowAddContact(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                {isKm ? "បន្ថែម" : "Add"}
              </button>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              {isKm ? "មិនទាន់មានមធ្យោបាយទំនាក់ទំនងទេ។" : "No contact channels registered yet."}
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-750 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 shrink-0">
                      {contact.type}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-stone-900 dark:text-white truncate">{contact.value}</div>
                      {contact.label && <div className="text-xs text-stone-400 truncate">{contact.label}</div>}
                    </div>
                    {contact.is_primary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30 shrink-0">
                        {isKm ? "ចម្បង" : "Primary"}
                      </span>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => requestContactDelete(contact)}
                      className="p-2 text-stone-400 hover:text-rose-600 shrink-0"
                      title={isKm ? "លុប" : "Delete"}
                      aria-label={isKm ? "លុបទំនាក់ទំនង" : "Delete contact"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {showAddContact && (
            <div className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-4">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                {isKm ? "បន្ថែមមធ្យោបាយទំនាក់ទំនង" : "Add a new channel"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold mb-1">{isKm ? "ប្រភេទ" : "Type"}</span>
                  <select
                    value={newContact.type}
                    onChange={(event) => setNewContact({ ...newContact, type: event.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs"
                  >
                    <option value="phone">{isKm ? "ទូរស័ព្ទ" : "Phone"}</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="messenger">Messenger</option>
                    <option value="facebook">Facebook</option>
                    <option value="email">Email</option>
                    <option value="website">Website</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-semibold mb-1">
                    {isKm ? "លេខទូរស័ព្ទ ឬឈ្មោះគណនី" : "Phone number or username"}
                  </span>
                  <input
                    type="text"
                    value={newContact.value}
                    onChange={(event) => setNewContact({ ...newContact, value: event.target.value })}
                    placeholder="012345678 / @mybiz"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={newContact.is_primary}
                    onChange={(event) => setNewContact({ ...newContact, is_primary: event.target.checked })}
                    className="rounded text-amber-500"
                  />
                  {isKm ? "កំណត់ជាទំនាក់ទំនងចម្បង" : "Set as primary contact"}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-500"
                  >
                    {isKm ? "បោះបង់" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    disabled={!newContact.value || addContactMutation.isPending}
                    onClick={() => addContactMutation.mutate(newContact)}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold disabled:opacity-50"
                  >
                    {isKm ? "រក្សាទុក" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "media" && (
        <div
          onDragOver={(event) => {
            if (!canMedia || uploadMediaMutation.isPending) return;
            event.preventDefault();
            setIsDraggingMedia(true);
          }}
          onDragLeave={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            ) {
              return;
            }
            setIsDraggingMedia(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingMedia(false);
            if (canMedia && !uploadMediaMutation.isPending) {
              handleMediaFiles(event.dataTransfer.files);
            }
          }}
          className={`space-y-5 bg-white dark:bg-stone-850 p-6 rounded-3xl border shadow-sm transition ${isDraggingMedia
            ? "border-amber-400 ring-2 ring-amber-300/70 dark:border-amber-500"
            : "border-stone-200/80 dark:border-stone-800"
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                {isKm ? "វិចិត្រសាលរូបភាព" : "Photo gallery"}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isKm
                  ? "រូបភាពគុណភាពខ្ពស់ជួយបង្កើនការទាក់ទងពីភ្ញៀវ។ ត្រូវការយ៉ាងហោចណាស់ ៣ សន្លឹក។"
                  : "High-quality photos increase visitor contacts. At least 3 are recommended."}
              </p>
            </div>

            {canMedia && (
              <label
                className={`cursor-pointer px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0 ${uploadMediaMutation.isPending ? "pointer-events-none opacity-60" : ""
                  }`}
              >
                {uploadMediaMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                {uploadMediaMutation.isPending
                  ? isKm
                    ? "កំពុងផ្ទុក..."
                    : "Uploading..."
                  : isKm
                    ? "ផ្ទុករូបភាព"
                    : "Upload"}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadMediaMutation.isPending}
                  className="hidden"
                  onChange={(event) => {
                    handleMediaFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          {mediaError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}

          {mediaList.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl">
              <ImageIcon className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p>{isKm ? "មិនទាន់មានរូបភាពទេ។" : "No photos uploaded yet."}</p>
              {canMedia && (
                <p className="mt-1">
                  {isKm
                    ? "អូសទម្លាក់រូបភាពនៅទីនេះ ឬចុចប៊ូតុង Upload។"
                    : "Drag and drop photos here, or use the Upload button."}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaList.map((media) => {
                const isCover = media.is_cover || media.id === business?.cover_media_id;
                return (
                  <div
                    key={media.id}
                    className="relative group rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 aspect-video shadow-sm"
                  >
                    <img src={mediaUrl(media)} alt={media.alt_km || media.alt_en || ""} className="w-full h-full object-cover" />
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase shadow">
                        {isKm ? "គម្រប" : "Cover"}
                      </div>
                    )}
                    {canMedia && (
                      <div className="absolute inset-0 bg-black/50 sm:bg-black/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!isCover && (
                          <button
                            type="button"
                            disabled={setCoverMutation.isPending}
                            onClick={() => setCoverMutation.mutate(media.id)}
                            className="p-2 rounded-lg bg-amber-500 text-stone-950 disabled:opacity-50"
                            title={isKm ? "កំណត់ជារូបគម្រប" : "Set as cover"}
                            aria-label={isKm ? "កំណត់ជារូបគម្រប" : "Set as cover photo"}
                          >
                            <Star className="w-4 h-4 fill-stone-950" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={deleteMediaMutation.isPending}
                          onClick={() => requestMediaDelete(media)}
                          className="p-2 rounded-lg bg-rose-600 text-white disabled:opacity-50"
                          title={isKm ? "លុប" : "Delete"}
                          aria-label={isKm ? "លុបរូបភាព" : "Delete photo"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {mediaList.length > 0 && mediaList.length < 3 && (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
              {isKm
                ? `សូមបន្ថែមរូបភាពបន្ថែម ${3 - mediaList.length} សន្លឹក ដើម្បីបំពេញលក្ខខណ្ឌពិន្ទុ។`
                : `Add ${3 - mediaList.length} more photo(s) to meet the profile score requirement.`}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingTab)}
        title={isKm ? "បោះបង់ការផ្លាស់ប្តូរ?" : "Discard unsaved changes?"}
        description={
          isKm
            ? "អ្នកមានការផ្លាស់ប្តូរដែលមិនទាន់រក្សាទុកក្នុងផ្នែកនេះ។ ប្រសិនបើបន្ត ការផ្លាស់ប្តូរទាំងនោះនឹងត្រូវបាត់បង់។"
            : "You have unsaved changes in this section. If you continue, those changes will be lost."
        }
        confirmLabel={isKm ? "បោះបង់" : "Discard"}
        tone="danger"
        isPending={false}
        onConfirm={confirmPendingTabChange}
        onCancel={() => setPendingTab(null)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={confirmDelete?.title}
        description={confirmDelete?.description}
        confirmLabel={isKm ? "លុប" : "Delete"}
        tone="danger"
        isPending={deleteContactMutation.isPending || deleteMediaMutation.isPending}
        onConfirm={runConfirmedDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
