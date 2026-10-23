import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  isPending = false,
  onConfirm,
  onCancel,
}) => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isPending) onCancel?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, isPending, onCancel]);

  if (!open) return null;

  const confirmTone =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-brand-500 hover:bg-brand-400 text-forest";

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-[28px] border border-sage-deep bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-850"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              tone === "danger"
                ? "bg-rose-500/10 text-rose-600"
                : "bg-sage text-forest"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="text-xl font-semibold text-forest dark:text-white">
              {title || (isKm ? "បញ្ជាក់សកម្មភាព" : "Confirm action")}
            </h2>
            {description ? (
              <p className="mt-1.5 text-xs leading-relaxed text-muted dark:text-stone-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-full bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-700 disabled:opacity-50 dark:bg-stone-800 dark:text-stone-300"
          >
            {cancelLabel || (isKm ? "បោះបង់" : "Cancel")}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold disabled:opacity-50 ${confirmTone}`}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmLabel || (isKm ? "បញ្ជាក់" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
