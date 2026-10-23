import { RumduolFlower } from "@/components/common/RumduolMotifs";

export const LoadingFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-amber-500/20 border-t-amber-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <RumduolFlower className="w-5 h-5 text-amber-500/60" />
        </div>
      </div>
      <span className="mt-3 text-caption font-semibold font-mono text-amber-600/80 dark:text-amber-400/80 tracking-wider">
        LOADING...
      </span>
    </div>
  );
};
export default LoadingFallback;
