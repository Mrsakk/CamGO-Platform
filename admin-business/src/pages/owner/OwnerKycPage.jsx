import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import api from "@/lib/axios";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { QueryError } from "@/components/common/QueryError";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const DOCUMENT_TYPES = [
  { value: "business_license", km: "អាជ្ញាបណ្ណអាជីវកម្ម", en: "Business license" },
  { value: "id_card", km: "អត្តសញ្ញាណប័ណ្ណ", en: "National ID card" },
  { value: "other", km: "ឯកសារផ្សេងៗ", en: "Other supporting document" },
];

const typeLabel = (type, isKm) => {
  const option = DOCUMENT_TYPES.find((item) => item.value === type);
  if (!option) return type;
  return isKm ? option.km : option.en;
};

const formatSize = (bytes) => {
  const value = Number(bytes || 0);
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png";
const MAX_BYTES = 10 * 1024 * 1024;

export const OwnerKycPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [type, setType] = useState("business_license");
  const [file, setFile] = useState(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const {
    data: business,
    isLoading: businessLoading,
    isError: businessError,
    refetch: refetchBusiness,
  } = useQuery({
    queryKey: ["owner-my-business"],
    queryFn: async () => {
      const res = await api.get("/business/owner/my-business");
      return res.data?.data || res.data;
    },
  });

  const {
    data: documents = [],
    isLoading: documentsLoading,
    isError: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["owner-kyc-documents"],
    queryFn: async () => {
      const res = await api.get("/business/owner/kyc");
      return res.data?.data || [];
    },
  });

  const isVerified = Boolean(business?.is_verified);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("missing_file");

      const form = new FormData();
      form.append("document", file);
      form.append("type", type);
      if (expiresAt) form.append("expires_at", expiresAt);
      if (notes.trim()) form.append("notes", notes.trim());

      const res = await api.post("/business/owner/kyc", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isKm
          ? "បានផ្ទុកឯកសារ KYC ដោយសុវត្ថិភាព! ក្រុមការងារនឹងពិនិត្យវា។"
          : "KYC document uploaded securely. Staff will review it."
      );
      setFile(null);
      setExpiresAt("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["owner-kyc-documents"] });
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
      queryClient.invalidateQueries({ queryKey: ["owner-subscription"] });
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : null;
      toast.error(
        firstError ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចផ្ទុកឯកសារបានទេ" : "Could not upload the document")
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/business/owner/kyc/${id}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានលុបឯកសារ KYC" : "KYC document removed");
      queryClient.invalidateQueries({ queryKey: ["owner-kyc-documents"] });
      queryClient.invalidateQueries({ queryKey: ["owner-my-business"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចលុបឯកសារបានទេ" : "Could not remove the document")
      );
    },
  });

  const stats = useMemo(() => {
    const list = Array.isArray(documents) ? documents : [];
    const thisMonth = list.filter((document) => {
      if (!document.created_at) return false;
      const created = new Date(document.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    return {
      total: list.length,
      thisMonth,
      expiring: list.filter((document) => {
        if (!document.expires_at) return false;
        const expires = new Date(document.expires_at);
        return expires.getTime() - Date.now() <= 30 * 86400000;
      }).length,
    };
  }, [documents]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    if (selected && selected.size > MAX_BYTES) {
      toast.error(isKm ? "ឯកសារធំពេក (អតិបរមា ១០ MB)" : "File is too large (maximum 10 MB)");
      event.target.value = "";
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleDownload = async (document) => {
    try {
      const res = await api.get(`/business/owner/kyc/${document.id}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: document.mime_type || "application/octet-stream" }));
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.file_name || `kyc-${document.id}`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចទាញយកឯកសារបានទេ" : "Could not download the document")
      );
    }
  };

  if (businessError || documentsError) {
    return (
      <QueryError
        className="max-w-2xl mx-auto mt-10"
        onRetry={() => {
          refetchBusiness();
          refetchDocuments();
        }}
        isRetrying={businessLoading || documentsLoading}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 rounded-3xl border border-sage-deep bg-gradient-to-r from-forest to-[#163c2e] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-stone-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            <Lock className="h-4 w-4" />
            {isKm ? "ទូឯកសារឯកជន" : "Private document vault"}
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {isKm ? "ការផ្ទៀងផ្ទាត់ KYC" : "KYC verification"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-300">
            {isKm
              ? "ផ្ទុកអាជ្ញាបណ្ណអាជីវកម្ម ឬឯកសារអត្តសញ្ញាណ ដើម្បីទទួលបានសញ្ញាផ្ទៀងផ្ទាត់។ ឯកសារត្រូវបានរក្សាទុកជាឯកជន និងមើលឃើញតែដោយក្រុមការងារដែលមានសិទ្ធិប៉ុណ្ណោះ។"
              : "Upload your business license or identity document to request a verified badge. Files are stored privately and visible only to authorized staff."}
          </p>
        </div>
        <div className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${isVerified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>
          {isVerified ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {isVerified
            ? isKm ? "អាជីវកម្មបានផ្ទៀងផ្ទាត់" : "Business verified"
            : isKm ? "រង់ចាំការផ្ទៀងផ្ទាត់" : "Verification pending"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: isKm ? "ឯកសារសរុប" : "Total documents", value: stats.total },
          { label: isKm ? "ផ្ទុកខែនេះ" : "Uploaded this month", value: stats.thisMonth },
          { label: isKm ? "ជិតផុតកំណត់" : "Expiring within 30 days", value: stats.expiring },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-sage-deep bg-white p-5 dark:border-stone-800 dark:bg-stone-850">
            <div className="text-2xl font-extrabold text-forest dark:text-white">{item.value}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-stone-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-forest dark:text-white">
              {isKm ? "ឯកសារដែលបានផ្ទុក" : "Uploaded documents"}
            </h2>
            <span className="text-xs font-semibold text-stone-400">
              {isKm ? `${stats.total} ឯកសារ` : `${stats.total} files`}
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-sage-deep bg-white shadow-sm dark:border-stone-800 dark:bg-stone-850">
            {documentsLoading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-stone-500">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                {isKm ? "កំពុងផ្ទុកឯកសារ..." : "Loading documents..."}
              </div>
            ) : !Array.isArray(documents) || documents.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600" />
                <p className="mt-3 text-sm font-bold text-stone-700 dark:text-stone-300">
                  {isKm ? "មិនទាន់មានឯកសារ KYC ទេ" : "No KYC documents yet"}
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-400">
                  {isKm
                    ? "ផ្ទុកអាជ្ញាបណ្ណអាជីវកម្ម ឬអត្តសញ្ញាណប័ណ្ណ ដើម្បីចាប់ផ្តើមការផ្ទៀងផ្ទាត់។"
                    : "Upload a business license or ID document to start verification."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {documents.map((document) => {
                  const canDelete = Number(document.uploaded_by) === Number(user?.id);
                  const expiringSoon = document.expires_at
                    ? new Date(document.expires_at).getTime() - Date.now() <= 30 * 86400000
                    : false;

                  return (
                    <div key={document.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                          <FileCheck2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-bold text-forest dark:text-white">
                              {document.file_name || `${typeLabel(document.type, isKm)}.pdf`}
                            </p>
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                              {typeLabel(document.type, isKm)}
                            </span>
                            {expiringSoon ? (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                {isKm ? "ជិតផុតកំណត់" : "Expiring soon"}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                            {document.created_at ? new Date(document.created_at).toLocaleDateString() : ""}
                            {document.file_size ? ` • ${formatSize(document.file_size)}` : ""}
                            {document.expires_at ? ` • ${isKm ? "ផុតកំណត់" : "Expires"} ${new Date(document.expires_at).toLocaleDateString()}` : ""}
                          </p>
                          {document.notes ? (
                            <p className="mt-1 text-xs italic text-stone-400">{document.notes}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleDownload(document)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sage-deep bg-white px-3 py-2 text-xs font-bold text-forest transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {isKm ? "ទាញយក" : "Download"}
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(document)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isKm ? "លុប" : "Delete"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-stone-400">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {isKm
              ? "ឯកសារត្រូវបានរក្សាទុកក្នុងឧបករណ៍ផ្ទុកឯកជន។ មានតែអ្នក និងបុគ្គលិកដែលមានសិទ្ធិ KYC ប៉ុណ្ណោះអាចមើលឃើញ។"
              : "Files are stored in a private vault. Only you and staff with KYC permission can access them."}
          </p>
        </div>

        <div className="h-fit rounded-3xl border border-sage-deep bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-850">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-forest dark:text-white">
              {isKm ? "ផ្ទុកឯកសារថ្មី" : "Upload a document"}
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            {isKm
              ? "គាំទ្រ PDF, JPG និង PNG រហូតដល់ ១០ MB។ សូមធានាថាឯកសារច្បាស់លាស់ និងមិនជាប់ពន្លឺ។"
              : "Supports PDF, JPG, and PNG up to 10 MB. Make sure the document is clear and not glare-covered."}
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!file) {
                toast.error(isKm ? "សូមជ្រើសរើសឯកសារ" : "Please choose a file");
                return;
              }
              uploadMutation.mutate();
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isKm ? "ប្រភេទឯកសារ" : "Document type"}
              </span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              >
                {DOCUMENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isKm ? option.km : option.en}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isKm ? "ឯកសារ" : "File"}
              </span>
              <input
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="w-full cursor-pointer rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 py-3 text-xs text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-stone-950 hover:border-amber-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
              />
              {file ? (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {file.name} • {formatSize(file.size)}
                </span>
              ) : null}
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isKm ? "ថ្ងៃផុតកំណត់ (ស្រេចចិត្ត)" : "Expiry date (optional)"}
              </span>
              <input
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isKm ? "កំណត់ចំណាំ (ស្រេចចិត្ត)" : "Notes (optional)"}
              </span>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={isKm ? "ព័ត៌មានបន្ថែមសម្រាប់ក្រុមការងារ..." : "Anything staff should know..."}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-extrabold text-stone-950 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {uploadMutation.isPending
                ? isKm ? "កំពុងផ្ទុក..." : "Uploading..."
                : isKm ? "ផ្ទុកឯកសារដោយសុវត្ថិភាព" : "Upload securely"}
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={isKm ? "លុបឯកសារនេះ?" : "Delete this document?"}
        description={
          isKm
            ? "ឯកសារនឹងត្រូវលុបចេញពីទូឯកជនជាអចិន្ត្រៃយ៍។"
            : "The file will be permanently removed from the private vault."
        }
        confirmLabel={isKm ? "លុប" : "Delete"}
        tone="danger"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteMutation.mutate(confirmDelete.id, {
            onSettled: () => setConfirmDelete(null),
          });
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
