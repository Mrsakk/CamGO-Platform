import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Clock,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import api from "@/lib/ownerApi";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "@/store/toastStore";

const emptyForm = {
  name_km: "",
  name_en: "",
  description_km: "",
  description_en: "",
  price_usd: "",
  duration_minutes: "",
  is_active: true,
};

const toForm = (service) => ({
  name_km: service.name_km || "",
  name_en: service.name_en || "",
  description_km: service.description_km || "",
  description_en: service.description_en || "",
  price_usd: service.price_usd ?? "",
  duration_minutes: service.duration_minutes ?? "",
  is_active: Boolean(service.is_active),
});

export const ServiceCatalogEditor = ({ services = [], presets = {}, canEdit = false }) => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const invalidateBusiness = () => {
    queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
    queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
  };

  const showError = (error) => {
    const errors = error.response?.data?.errors;
    const firstError = errors ? Object.values(errors)[0]?.[0] : null;
    toast.error(
      firstError ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចរក្សាទុកសេវាកម្មបានទេ" : "Failed to save service")
    );
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/business/me/services", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានបន្ថែមសេវាកម្មថ្មី!" : "Service added!");
      closeEditor();
      invalidateBusiness();
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/business/me/services/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានធ្វើបច្ចុប្បន្នភាពសេវាកម្ម!" : "Service updated!");
      closeEditor();
      invalidateBusiness();
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/business/me/services/${id}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានលុបសេវាកម្ម!" : "Service deleted!");
      invalidateBusiness();
    },
    onError: () => {
      toast.error(isKm ? "មិនអាចលុបសេវាកម្មបានទេ" : "Failed to delete service");
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (service) => {
    setEditingId(service.id);
    setForm(toForm(service));
    setEditorOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name_km.trim() || !form.name_en.trim()) {
      toast.error(
        isKm
          ? "សូមបំពេញឈ្មោះសេវាកម្មជាភាសាខ្មែរ និងអង់គ្លេស។"
          : "Enter the service name in both Khmer and English."
      );
      return;
    }

    const payload = {
      name_km: form.name_km.trim(),
      name_en: form.name_en.trim(),
      description_km: form.description_km.trim() || null,
      description_en: form.description_en.trim() || null,
      price_usd: form.price_usd === "" ? null : Number(form.price_usd),
      duration_minutes:
        form.duration_minutes === "" ? null : Number(form.duration_minutes),
      is_active: Boolean(form.is_active),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return isKm ? "តម្លៃសាកសួរ" : "Price on request";
    }
    if (Number(price) === 0) {
      return isKm ? "ឥតគិតថ្លៃ" : "Free";
    }
    return `$${Number(price).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) {
      return isKm ? `${minutes} នាទី` : `${minutes} min`;
    }
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!rest) return isKm ? `${hours} ម៉ោង` : `${hours} hr`;
      return isKm ? `${hours} ម៉ោង ${rest} នាទី` : `${hours} hr ${rest} min`;
    }
    const days = Math.floor(minutes / 1440);
    const restHours = Math.floor((minutes % 1440) / 60);
    if (!restHours) return isKm ? `${days} ថ្ងៃ` : `${days} day`;
    return isKm ? `${days} ថ្ងៃ ${restHours} ម៉ោង` : `${days} day ${restHours} hr`;
  };

  const serviceLabel = isKm
    ? presets?.label_km || "សេវាកម្ម"
    : presets?.label_en || "Service";
  const examples = Array.isArray(presets?.examples) ? presets.examples : [];
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const commonField =
    "w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm disabled:opacity-60";

  return (
    <div className="space-y-5 bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {isKm ? "សេវាកម្ម និងតម្លៃ" : "Services & pricing"}
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            {isKm
              ? `បង្កើតបញ្ជី ${serviceLabel} របស់អ្នក ជាមួយតម្លៃ និងរយៈពេលជាជម្រើស។ ភ្ញៀវនឹងឃើញសេវាដែលកំពុងសកម្មនៅលើទំព័រសាធារណៈ។`
              : `Build your ${serviceLabel.toLowerCase()} catalog with prices and optional duration. Active services appear on your public profile.`}
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {isKm ? "បន្ថែមសេវាកម្ម" : "Add service"}
          </button>
        )}
      </div>

      {examples.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] text-amber-800 dark:text-amber-300">
          <span className="font-bold">
            {isKm ? "ឧទាហរណ៍សម្រាប់ប្រភេទនេះ៖ " : "Examples for this category: "}
          </span>
          {examples.join(" · ")}
        </div>
      )}

      {editorOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">
              {editingId
                ? isKm
                  ? "កែសម្រួលសេវាកម្ម"
                  : "Edit service"
                : isKm
                ? "សេវាកម្មថ្មី"
                : "New service"}
            </h3>
            <button
              type="button"
              onClick={closeEditor}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              aria-label={isKm ? "បិទ" : "Close"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold mb-1">
                {isKm ? "ឈ្មោះសេវាកម្ម (ខ្មែរ) *" : "Service name (Khmer) *"}
              </span>
              <input
                type="text"
                required
                value={form.name_km}
                placeholder={examples[0] || ""}
                onChange={(event) => setForm({ ...form, name_km: event.target.value })}
                className={commonField}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1">
                {isKm ? "ឈ្មោះសេវាកម្ម (English) *" : "Service name (English) *"}
              </span>
              <input
                type="text"
                required
                value={form.name_en}
                placeholder={examples[0] || ""}
                onChange={(event) => setForm({ ...form, name_en: event.target.value })}
                className={commonField}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold mb-1">
                {isKm ? "ការពិពណ៌នា (ខ្មែរ)" : "Description (Khmer)"}
              </span>
              <textarea
                rows={3}
                value={form.description_km}
                onChange={(event) =>
                  setForm({ ...form, description_km: event.target.value })
                }
                className={commonField}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1">
                {isKm ? "ការពិពណ៌នា (English)" : "Description (English)"}
              </span>
              <textarea
                rows={3}
                value={form.description_en}
                onChange={(event) =>
                  setForm({ ...form, description_en: event.target.value })
                }
                className={commonField}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold mb-1">
                {isKm ? "តម្លៃ (USD)" : "Price (USD)"}
              </span>
              <input
                type="number"
                min="0"
                max="999999.99"
                step="0.01"
                value={form.price_usd}
                placeholder="25.00"
                onChange={(event) =>
                  setForm({ ...form, price_usd: event.target.value })
                }
                className={commonField}
              />
              <span className="block text-[10px] text-stone-400 mt-1">
                {isKm ? "ទុកទទេ ប្រសិនបើតម្លៃត្រូវសាកសួរ។" : "Leave blank if the price is on request."}
              </span>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1">
                {isKm ? "រយៈពេល (នាទី)" : "Duration (minutes)"}
              </span>
              <input
                type="number"
                min="1"
                max="10080"
                step="1"
                value={form.duration_minutes}
                placeholder="60"
                onChange={(event) =>
                  setForm({ ...form, duration_minutes: event.target.value })
                }
                className={commonField}
              />
              <span className="block text-[10px] text-stone-400 mt-1">
                {isKm ? "ឧទាហរណ៍ 60 សម្រាប់ 1 ម៉ោង។" : "For example 60 for one hour."}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-200 dark:border-stone-700">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={Boolean(form.is_active)}
                onChange={(event) =>
                  setForm({ ...form, is_active: event.target.checked })
                }
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              {isKm
                ? "បង្ហាញសេវានេះនៅលើទំព័រសាធារណៈ"
                : "Show this service on the public profile"}
            </label>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={closeEditor}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-500"
              >
                {isKm ? "បោះបង់" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isKm ? "រក្សាទុកសេវាកម្ម" : "Save service"}
              </button>
            </div>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-3xl">
          <Sparkles className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
            {isKm ? "មិនទាន់មានសេវាកម្មទេ" : "No services yet"}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isKm
              ? "បន្ថែមសេវាដំបូង ដើម្បីឱ្យភ្ញៀវដឹងពីអ្វីដែលអ្នកផ្តល់ជូន។"
              : "Add your first service so visitors know what you offer."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => {
            const name = isKm
              ? service.name_km || service.name_en
              : service.name_en || service.name_km;
            const description = isKm
              ? service.description_km || service.description_en
              : service.description_en || service.description_km;
            const duration = formatDuration(service.duration_minutes);

            return (
              <div
                key={service.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                        {name}
                      </h3>
                      {!service.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                          {isKm ? "មិនបង្ហាញ" : "Hidden"}
                        </span>
                      )}
                    </div>
                    {description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-3">
                        {description}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        className="p-2 rounded-lg text-stone-400 hover:text-amber-600"
                        title={isKm ? "កែសម្រួល" : "Edit"}
                        aria-label={isKm ? "កែសម្រួលសេវាកម្ម" : "Edit service"}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(service)}
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-600"
                        title={isKm ? "លុប" : "Delete"}
                        aria-label={isKm ? "លុបសេវាកម្ម" : "Delete service"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 text-amber-700 dark:text-amber-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    {formatPrice(service.price_usd)}
                  </span>
                  {duration && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-1 text-stone-600 dark:text-stone-300">
                      <Clock className="w-3.5 h-3.5" />
                      {duration}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={isKm ? "លុបសេវាកម្ម?" : "Delete service?"}
        description={
          confirmDelete
            ? isKm
              ? `លុប “${
                  confirmDelete.name_km || confirmDelete.name_en
                }” ចេញពីបញ្ជីសេវាកម្ម? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`
              : `Remove “${
                  confirmDelete.name_en || confirmDelete.name_km
                }” from your service catalog? This cannot be undone.`
            : ""
        }
        confirmLabel={isKm ? "លុប" : "Delete"}
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(confirmDelete.id, {
            onSettled: () => setConfirmDelete(null),
          })
        }
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
