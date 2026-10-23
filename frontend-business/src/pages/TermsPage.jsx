import { useTranslation } from "react-i18next";

export const TermsPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-brand-200/60 bg-sage px-6 py-10 shadow-premium dark:border-white/10 dark:bg-[#0D1B15] md:px-10">
        <p className="eyebrow flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {isKm ? "ច្បាប់ និងឯកជនភាព" : "Legal"}
        </p>
        <h1 className="mt-3 text-forest dark:text-white">
          {isKm ? "លក្ខខណ្ឌនៃការប្រើប្រាស់" : "Terms of service"}
        </h1>
      </div>

      <article className="surface mt-5 space-y-8 px-6 py-8 text-sm leading-7 text-muted dark:text-slate-300 sm:px-10 sm:py-10">
        <section>
          <h2 className="border-b border-sage-deep pb-3 text-lg font-semibold text-forest dark:border-slate-700 dark:text-white">
            {isKm ? "១. គ្មានការកក់លុយ ឬទូទាត់ប្រាក់ក្នុងប្រព័ន្ធ" : "1. Zero booking & payment policy"}
          </h2>
          <p className="mt-2">
            {isKm
              ? "CamGO Business គឺជាថតព័ត៌មាន (Directory Platform) សម្រាប់ស្វែងរក និងទំនាក់ទំនង។ យើងមិនមានសេវាកម្មកក់លុយ គ្មានការកាត់កម្រៃជើងសារ និងមិនទទួលខុសត្រូវលើកិច្ចសន្យាផ្ទាល់រវាងភ្ញៀវទេសចរ និងអាជីវកម្មឡើយ។"
              : "CamGO Business operates strictly as an informational and direct contact directory. The platform does not take payments or handle financial transactions."}
          </p>
        </section>

        <section>
          <h2 className="border-b border-sage-deep pb-3 text-lg font-semibold text-forest dark:border-slate-700 dark:text-white">
            {isKm ? "២. ភាពត្រឹមត្រូវនៃព័ត៌មាន" : "2. Information verification"}
          </h2>
          <p className="mt-2">
            {isKm
              ? "រាល់ព័ត៌មាន និងម៉ោងបើកដំណើរការត្រូវបានផ្ទៀងផ្ទាត់ដោយក្រុមការងារ។ ទោះយ៉ាងណា យើងលើកទឹកចិត្តឱ្យភ្ញៀវទេសចរទាក់ទងសាកសួរផ្ទាល់ជាមួយអាជីវកម្មជាមុនសិន។"
              : "While we make every effort to verify details and documents, users are encouraged to confirm reservations and operational hours directly."}
          </p>
        </section>

        <section>
          <h2 className="border-b border-sage-deep pb-3 text-lg font-semibold text-forest dark:border-slate-700 dark:text-white">
            {isKm ? "៣. មតិវាយតម្លៃរបស់អ្នកទស្សនា" : "3. Review guidelines"}
          </h2>
          <p className="mt-2">
            {isKm
              ? "រាល់ការវាយតម្លៃ និងមតិយោបល់ត្រូវតែផ្អែកលើបទពិសោធន៍ជាក់ស្តែង គ្មានពាក្យប្រមាថ និងឆ្លងកាត់ការពិនិត្យសម្រិតសម្រាំងដោយក្រុមការងារមុនពេលបង្ហាញជាសាធារណៈ។"
              : "All reviews are subject to moderation to prevent spam and ensure honest feedback."}
          </p>
        </section>
      </article>
    </div>
  );
};
