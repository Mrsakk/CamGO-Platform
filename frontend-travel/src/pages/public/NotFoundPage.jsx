import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, Home } from "lucide-react";

const NotFoundPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  return (
    <div className="pt-24 pb-20 max-w-xl mx-auto px-4 text-center space-y-8 font-sans text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-950 min-h-[70vh] flex flex-col justify-center">
      <div className="p-8 sm:p-10 rounded-2xl panel-raised bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-stone-200 dark:bg-stone-800 text-laterite-600 dark:text-laterite-400 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-small font-semibold text-laterite-600 dark:text-laterite-400 block tracking-wide uppercase">
            ERROR 404 // UNCHARTED PATH
          </span>
          <h1 className="text-hero font-bold text-stone-900 dark:text-stone-100">
            {km ? "រកមិនឃើញទំព័រនេះឡើយ" : "Page Not Found"}
          </h1>
          <p className="text-body text-stone-700 dark:text-stone-300 leading-relaxed max-w-prose mx-auto">
            {km
              ? "ទំព័រ ឬព័ត៌មានដែលអ្នកកំពុងស្វែងរក មិនមាននៅក្នុងប្រព័ន្ធ ឬត្រូវបានផ្លាស់ប្តូរទីតាំង។"
              : "The destination or page you are seeking is not charted in our portal or has been relocated."}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="min-h-[44px] px-6 rounded-xl btn-primary text-small font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{km ? "ត្រឡប់ទៅទំព័រដើម" : "Return Home"}</span>
          </Link>
          <Link
            to="/destinations"
            className="min-h-[44px] px-6 rounded-xl btn-secondary text-small font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{km ? "រុករកគោលដៅ" : "Explore Places"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { NotFoundPage };
