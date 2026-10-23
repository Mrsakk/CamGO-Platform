import { useToastStore } from "@/store/toastStore";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const ToastContainer = () => {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed top-[calc(env(safe-area-inset-top,0px)+12px)] sm:top-auto sm:bottom-6 left-4 sm:left-auto right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-[calc(100vw-32px)] sm:max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center justify-between p-3.5 sm:p-4 rounded-xl shadow-xl backdrop-blur-md border ${
              toast.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-700"
                : toast.type === "error"
                ? "bg-red-900/90 text-white border-red-700"
                : toast.type === "warning"
                ? "bg-amber-900/90 text-white border-amber-700"
                : "bg-slate-900/90 text-white border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
              <span className="text-small font-medium font-km leading-relaxed break-anywhere">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="w-11 h-11 -mr-2 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors ml-2 shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 text-white/80 hover:text-white" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export {
  ToastContainer
};
