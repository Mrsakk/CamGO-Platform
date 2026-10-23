export const ShimmerSkeleton = ({ className = "" }) => (
  <div className={`bg-stone-200 dark:bg-stone-800 animate-pulse ${className}`} />
);

export const WonderLeadSkeleton = () => {
  return (
    <div className="mb-12 panel-raised rounded-card overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 bg-stone-200 dark:bg-stone-800 aspect-[16/10] lg:aspect-auto min-h-[360px] relative">
          <div className="absolute bottom-6 left-6 space-y-2">
            <div className="h-4 w-28 bg-stone-300 dark:bg-stone-700 rounded-control" />
            <div className="h-9 w-64 bg-stone-300 dark:bg-stone-700 rounded-control" />
          </div>
        </div>
        <div className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-28 bg-stone-300 dark:bg-stone-700 rounded-control" />
            <div className="h-8 w-3/4 bg-stone-300 dark:bg-stone-700 rounded-control" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-stone-200 dark:bg-stone-800 rounded" />
              <div className="h-3.5 w-5/6 bg-stone-200 dark:bg-stone-800 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="h-14 rounded-control bg-stone-200 dark:bg-stone-800" />
              <div className="h-14 rounded-control bg-stone-200 dark:bg-stone-800" />
              <div className="h-14 rounded-control bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>
          <div className="h-11 w-full bg-stone-300 dark:bg-stone-700 rounded-control" />
        </div>
      </div>
    </div>
  );
};

export const DestinationCardSkeleton = ({ layout = "adaptive" }) => {
  const containerClasses =
    layout === "horizontal"
      ? "flex flex-row"
      : layout === "vertical"
      ? "flex flex-col"
      : "flex flex-col max-sm:flex-row";

  const mediaClasses =
    layout === "horizontal"
      ? "w-2/5 shrink-0 aspect-auto min-h-[170px] border-r"
      : layout === "vertical"
      ? "w-full aspect-[4/3] border-b"
      : "max-sm:w-[42%] max-sm:shrink-0 max-sm:aspect-auto max-sm:min-h-[160px] max-sm:border-r w-full sm:aspect-[4/3] sm:border-b";

  return (
    <div className={`rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse justify-between h-full ${containerClasses}`}>
      <div className={`bg-stone-200 dark:bg-stone-800 border-stone-200 dark:border-stone-800 ${mediaClasses}`} />
      <div className="p-3.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 w-4/5 bg-stone-300 dark:bg-stone-700 rounded-md" />
          <div className="h-3 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="h-3 w-10 bg-stone-300 dark:bg-stone-700 rounded-md" />
          </div>
        </div>
        <div className="pt-2.5 mt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <div className="h-3 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-7 w-7 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
    </div>
  );
};

export const ProvinceCardSkeleton = () => {
  return (
    <div className="rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse flex flex-col justify-between h-full shadow-sm">
      <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-800 w-full border-b border-stone-200 dark:border-stone-800" />
      <div className="p-3.5 space-y-2">
        <div className="h-5 w-3/4 bg-stone-300 dark:bg-stone-700 rounded-md" />
        <div className="h-3.5 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-md" />
      </div>
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 flex justify-between">
        <div className="h-3.5 w-20 bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-3.5 w-4 bg-stone-300 dark:bg-stone-700 rounded-md" />
      </div>
    </div>
  );
};

export const CategoryCardSkeleton = () => {
  return (
    <div className="rounded-2xl p-6 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-11 w-11 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded-full" />
      </div>
      <div className="h-6 w-3/5 bg-stone-300 dark:bg-stone-700 rounded-md" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-3.5 w-4/5 bg-stone-200 dark:bg-stone-800 rounded-md" />
      </div>
    </div>
  );
};

export const EventCardSkeleton = ({ layout = "adaptive" }) => {
  const containerClasses =
    layout === "horizontal"
      ? "flex flex-row"
      : layout === "vertical"
      ? "flex flex-col"
      : "flex flex-col max-sm:flex-row";

  const mediaClasses =
    layout === "horizontal"
      ? "w-2/5 shrink-0 aspect-auto min-h-[170px] border-r"
      : layout === "vertical"
      ? "w-full aspect-[16/10] border-b"
      : "max-sm:w-[42%] max-sm:shrink-0 max-sm:aspect-auto max-sm:min-h-[160px] max-sm:border-r w-full sm:aspect-[16/10] sm:border-b";

  return (
    <div className={`rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse justify-between h-full shadow-sm ${containerClasses}`}>
      <div className={`bg-stone-200 dark:bg-stone-800 border-stone-200 dark:border-stone-800 ${mediaClasses}`} />
      <div className="p-3.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-5 w-4/5 bg-stone-300 dark:bg-stone-700 rounded-md" />
          <div className="h-3 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-md" />
        </div>
        <div className="pt-2.5 mt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-7 w-7 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
    </div>
  );
};

export const BlogCardSkeleton = ({ layout = "adaptive" }) => {
  const containerClasses =
    layout === "horizontal"
      ? "flex flex-row"
      : layout === "vertical"
      ? "flex flex-col"
      : "flex flex-col max-sm:flex-row";

  const mediaClasses =
    layout === "horizontal"
      ? "w-2/5 shrink-0 aspect-auto min-h-[170px] border-r"
      : layout === "vertical"
      ? "w-full aspect-[16/10] border-b"
      : "max-sm:w-[42%] max-sm:shrink-0 max-sm:aspect-auto max-sm:min-h-[160px] max-sm:border-r w-full sm:aspect-[16/10] sm:border-b";

  return (
    <div className={`rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse justify-between h-full shadow-sm ${containerClasses}`}>
      <div className={`bg-stone-200 dark:bg-stone-800 border-stone-200 dark:border-stone-800 ${mediaClasses}`} />
      <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="h-5 w-5/6 bg-stone-300 dark:bg-stone-700 rounded-md" />
          <div className="space-y-1">
            <div className="h-3 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="h-3 w-4/5 bg-stone-200 dark:bg-stone-800 rounded-md" />
          </div>
        </div>
        <div className="pt-2.5 mt-2 border-t border-stone-200 dark:border-stone-800">
          <div className="h-3 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
        </div>
      </div>
    </div>
  );
};
