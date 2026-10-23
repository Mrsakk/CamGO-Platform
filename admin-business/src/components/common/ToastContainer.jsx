import { useToastStore } from "@/store/toastStore";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-2xl border p-4 text-sm shadow-lg transition-all duration-300 animate-slide-up ${
            t.type === "success"
              ? "border-sage-deep bg-sage text-forest dark:border-brand-800 dark:bg-stone-850 dark:text-brand-300"
              : t.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-stone-850 dark:text-rose-300"
              : "border-sage-deep bg-cream text-forest dark:border-stone-700 dark:bg-stone-850 dark:text-stone-200"
          }`}
        >
          {t.type === "success" && <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />}
          {t.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          {t.type === "info" && <Info className="w-5 h-5 text-gold-500 shrink-0" />}
          <div className="flex-1 font-medium">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
