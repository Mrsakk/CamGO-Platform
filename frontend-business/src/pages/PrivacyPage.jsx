import { useTranslation } from "react-i18next";

export const PrivacyPage = () => {
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
          {isKm ? "គោលការណ៍ឯកជនភាព" : "Privacy policy"}
        </h1>
      </div>

      <article className="surface mt-5 space-y-8 px-6 py-8 text-sm leading-7 text-muted dark:text-slate-300 sm:px-10 sm:py-10">
        <p>
          {isKm
            ? "CamGO Business ផ្តល់អាទិភាពខ្ពស់បំផុតដល់ការការពារទិន្នន័យឯកជនភាពរបស់អ្នកប្រើប្រាស់ និងភ្ញៀវទេសចរទាំងអស់។"
            : "CamGO Business prioritizes user privacy. This policy outlines how information is handled."}
        </p>

        <section>
          <h2 className="border-b border-sage-deep pb-3 text-lg font-semibold text-forest dark:border-slate-700 dark:text-white">
            {isKm ? "១. ការតាមដានដែលគោរពឯកជនភាព" : "1. Privacy-preserving event tracking"}
          </h2>
          <p className="mt-2">
            {isKm
              ? "នៅពេលអ្នកទស្សនាចុចលើប៊ូតុងទូរស័ព្ទ ឬតេឡេក្រាម ប្រព័ន្ធកត់ត្រាតែចំនួនស្ថិតិទំនាក់ទំនងប៉ុណ្ណោះ។ យើងមិនរក្សាទុកអាសយដ្ឋាន IP ឬព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកទស្សនាឡើយ។"
              : "When tourists click contact links, the system only counts interaction metrics. We do not store raw IP addresses or identifiable user agents."}
          </p>
        </section>

        <section>
          <h2 className="border-b border-sage-deep pb-3 text-lg font-semibold text-forest dark:border-slate-700 dark:text-white">
            {isKm ? "២. ឯកសារសម្គាល់អាជីវកម្ម (KYC)" : "2. KYC document vault"}
          </h2>
          <p className="mt-2">
            {isKm
              ? "ឯកសារសម្គាល់អត្តសញ្ញាណ និងអាជ្ញាប័ណ្ណអាជីវកម្មដែលផ្តល់ដោយម្ចាស់អាជីវកម្ម ត្រូវបានរក្សាទុកនៅលើ Private Storage ដាច់ដោយឡែក ដែលមិនមានតំណភ្ជាប់សាធារណៈឡើយ។ មានតែបុគ្គលិកដែលមានសិទ្ធិស្របច្បាប់ប៉ុណ្ណោះដែលអាចត្រួតពិនិត្យបាន។"
              : "All identity verification documents provided by business owners are strictly kept in an isolated private vault, never exposed to public URLs."}
          </p>
        </section>

        <section>
          <h2 className="border-b border-sage-deep pb-3 text-lg font-semibold text-forest dark:border-slate-700 dark:text-white">
            {isKm ? "៣. ការទំនាក់ទំនងដោយផ្ទាល់" : "3. Direct communications"}
          </h2>
          <p className="mt-2">
            {isKm
              ? "រាល់ការហៅទូរស័ព្ទ ផ្ញើសារ ឬអ៊ីមែល ធ្វើឡើងដោយផ្ទាល់រវាងអ្នក និងអាជីវកម្មទេសចរណ៍ តាមរយៈកម្មវិធីទូរស័ព្ទរបស់អ្នក។"
              : "All phone calls, chats, and messages occur directly between tourists and business owners."}
          </p>
        </section>
      </article>
    </div>
  );
};
