import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import api from "@/lib/ownerApi";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const accept = async () => {
    setStatus("loading");
    setError("");

    try {
      const res = await api.post(`/business/team/accept/${token}`);
      setStatus("success");
      toast.success(res.data?.message || (isKm ? "បានទទួលយកការអញ្ជើញ!" : "Invitation accepted!"));
      await checkAuth();
      setTimeout(() => navigate("/owner", { replace: true }), 800);
    } catch (err) {
      setStatus("error");
      setError(
        err.response?.data?.message ||
          (isKm ? "ការអញ្ជើញមិនត្រឹមត្រូវ ឬផុតកំណត់។" : "This invitation is invalid or expired.")
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4 dark:bg-stone-900">
      <div className="w-full max-w-md space-y-6 rounded-[32px] border border-sage-deep bg-white p-7 text-center shadow-xl dark:border-stone-800 dark:bg-stone-850 sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest">
          {status === "success" ? <CheckCircle2 className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
        </div>

        <div>
          <h1 className="text-2xl text-forest dark:text-white">
            {isKm ? "ទទួលយកការអញ្ជើញក្រុមការងារ" : "Accept team invitation"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted dark:text-stone-400">
            {isKm
              ? "អ្នកត្រូវបានអញ្ជើញឱ្យចូលរួមក្រុមការងារអាជីវកម្ម។ សូមបញ្ជាក់ដោយចុចប៊ូតុងខាងក្រោម។"
              : "You have been invited to join a business team. Confirm by clicking the button below."}
          </p>
        </div>

        <div className="rounded-2xl bg-sage/60 p-4 text-left text-xs dark:bg-stone-800/60">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted dark:text-stone-400">
            {isKm ? "គណនីរបស់អ្នក" : "Your account"}
          </div>
          <div className="mt-1 font-semibold text-forest dark:text-stone-200">{user?.name || user?.email}</div>
          <div className="text-muted dark:text-stone-500">{user?.email}</div>
        </div>

        {status === "error" && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isKm ? "កំពុងបើកផ្ទាំងអាជីវកម្ម..." : "Opening your business portal..."}
          </div>
        ) : (
          <button
            onClick={accept}
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3 text-sm font-bold text-forest transition hover:bg-brand-400 disabled:opacity-50"
          >
            {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isKm ? "ទទួលយកការអញ្ជើញ" : "Accept invitation"}
          </button>
        )}

        <p className="text-[10px] text-stone-400">
          {isKm
            ? "ការអញ្ជើញនេះអាចប្រើបានតែជាមួយអ៊ីមែលដែលបានអញ្ជើញប៉ុណ្ណោះ។"
            : "This invitation can only be used by the invited email address."}
        </p>
      </div>
    </div>
  );
};
