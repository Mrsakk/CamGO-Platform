import { Loader2 } from "lucide-react";

export const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    <span className="text-sm font-medium text-muted dark:text-stone-400">
      កំពុងទាញយកទិន្នន័យ... / Loading...
    </span>
  </div>
);
