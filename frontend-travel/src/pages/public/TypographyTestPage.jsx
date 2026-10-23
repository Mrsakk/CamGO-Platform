import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heading, Text, Prose } from "@/components/common/Typography";
import { Sun, Moon, Globe, Check, Eye } from "lucide-react";

export const TypographyTestPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  const toggleLanguage = () => {
    const next = km ? "en" : "km";
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 1. Strict Khmer Subscript & Vowel Stress Test Cases
  const KHMER_STRESS_TESTS = [
    { label: "Word 1 (Stacked subscript ្ដ)", text: "ស្រ្ដី", note: "Subscript ្ដ under ្រ must never clip" },
    { label: "Word 2 (Stacked subscript ្ម)", text: "ក្រុមហ៊ុន", note: "Subscript ្ម under ្រ must never clip" },
    { label: "Word 3 (Multiple vowels & subscript វ)", text: "ព្រះបរមរាជវាំង", note: "Upper vowel ះ, ាំ and subscript វ" },
    { label: "Word 4 (Temple Landmark)", text: "ប្រាសាទអង្គរវត្ត", note: "Standard cultural landmark" },
    { label: "Phrase 5 (Search Action)", text: "ស្វែងរកទីកន្លែងទេសចរណ៍", note: "Standard UI search query" },
    { label: "Phrase 6 (National Park)", text: "ឧទ្យានជាតិភ្នំគូលែន", note: "Diacritics on ភ្, គូ, លែន" }
  ];

  // 2. Strict 6 Core Tokens Scale
  const TYPE_SCALE_TOKENS = [
    {
      token: "text-hero",
      use: "Home hero headline ONLY",
      mobile: "32px (2rem)",
      desktop: "56px (3.5rem)",
      weight: "700",
      lhKm: "1.5",
      lhEn: "1.15",
      sampleKm: "រតនសម្បត្តិប្រាសាទបុរាណ និងវប្បធម៌ខ្មែរ",
      sampleEn: "Kingdom of Wonder: Ancient Temples & Coastal Sanctuaries"
    },
    {
      token: "text-title",
      use: "Page title (one H1 per page)",
      mobile: "28px (1.75rem)",
      desktop: "40px (2.5rem)",
      weight: "700",
      lhKm: "1.5",
      lhEn: "1.25",
      sampleKm: "គោលដៅទេសចរណ៍ និងបេតិកភណ្ឌប្រវត្តិសាស្ត្រ",
      sampleEn: "Curated Travel Destinations & Cultural Heritage"
    },
    {
      token: "text-heading",
      use: "Section title (H2)",
      mobile: "24px (1.5rem)",
      desktop: "32px (2rem)",
      weight: "700",
      lhKm: "1.5",
      lhEn: "1.25",
      sampleKm: "រមណីយដ្ឋានពេញនិយមទូទាំង 25 ខេត្ត-រាជធានី",
      sampleEn: "Explore Iconic Wonders Across All 25 Provinces"
    },
    {
      token: "text-subheading",
      use: "Card title, group label (H3)",
      mobile: "18px (1.125rem)",
      desktop: "20px (1.25rem)",
      weight: "600",
      lhKm: "1.5",
      lhEn: "1.3",
      sampleKm: "ប្រាសាទបន្ទាយស្រី ខេត្តសៀមរាប",
      sampleEn: "Banteay Srei Jewel Temple, Siem Reap"
    },
    {
      token: "text-body",
      use: "Paragraphs, descriptions, buttons, inputs",
      mobile: "16px (1rem)",
      desktop: "17px (1.0625rem)",
      weight: "400",
      lhKm: "1.8",
      lhEn: "1.6",
      sampleKm: "ពីប្រាសាទអង្គរវត្តដល់ឆ្នេរកោះរ៉ុង រកកន្លែងទៅលេងក្នុងខេត្តទាំង 25 ហើយរក្សាទុកកន្លែងដែលអ្នកចូលចិត្ត។ រៀបចំឡើងយ៉ាងសាមញ្ញ ស្រាល និងងាយស្រួលប្រើប្រាស់។",
      sampleEn: "From ancient Angkor temples to turquoise island bays, discover authentic Khmer heritage. Designed for effortless discovery with calm, comfortable typography."
    },
    {
      token: "text-small",
      use: "Captions, dates, badges, helper text (14px floor)",
      mobile: "14px (0.875rem)",
      desktop: "14px (0.875rem)",
      weight: "400 - 500",
      lhKm: "1.7",
      lhEn: "1.5",
      sampleKm: "ចុះផ្សាយថ្ងៃទី 10 ខែតុលា ឆ្នាំ2026 • ផ្ទៀងផ្ទាត់ដោយមន្ត្រីបេតិកភណ្ឌ",
      sampleEn: "Published October 10, 2026 • Verified Heritage Record"
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* ================================================================= */}
        {/* HEADER & CONTROLS                                                 */}
        {/* ================================================================= */}
        <div className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-small font-bold uppercase tracking-wider text-laterite-600 dark:text-laterite-400">
              [ BILINGUAL TYPOGRAPHY SPECIFICATION ]
            </span>
            <Heading level={1}>
              {km ? "តារាងផ្ទៀងផ្ទាត់អក្សរពុម្ពខ្មែរ & អង់គ្លេស" : "Typography System Verification"}
            </Heading>
            <Text variant="small">
              Current Language: <span className="font-bold uppercase font-mono">{i18n.language}</span> ({km ? "Khmer Default" : "English"}) |
              Floor: <span className="font-bold">14px</span> | Max Families: <span className="font-bold">4</span>
            </Text>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-small font-bold flex items-center gap-2 cursor-pointer hover:border-laterite-600 transition-colors"
            >
              <Globe className="w-4 h-4 text-laterite-600" />
              <span>{km ? "ប្តូរទៅ English" : "Switch to ខ្មែរ"}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-small font-bold flex items-center gap-2 cursor-pointer hover:border-laterite-600 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. MIXED KHMER + ENGLISH LINE TEST (Same Line Consistency)        */}
        {/* ================================================================= */}
        <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-small font-bold uppercase tracking-wider text-moss-600">
              [ TEST 1: MIXED KHMER + ENGLISH IN ONE LINE ]
            </span>
            <Heading level={2}>
              {km ? "ការបង្ហាញអក្សរចម្រុះខ្មែរ និងឡាតាំង" : "Mixed Script Inline Rendering"}
            </Heading>
            <Text variant="small">
              Latin glyphs rendered via Inter; Khmer glyphs rendered via Kantumruy Pro. Consistent baseline and optical scale.
            </Text>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="text-body font-bold text-stone-900 dark:text-stone-100">
              ប្រាសាទ Angkor Wat ស្ថិតនៅខេត្ត Siem Reap, Cambodia (GPS: 13.4125° N, 103.8670° E) • តម្លៃសំបុត្រ: $37 USD (1-Day Pass)
            </div>
            <div className="text-small text-stone-600 dark:text-stone-400">
              កោះ Koh Rong Sanloem, ខេត្ត Preah Sihanouk • Fast Ferry Speedboat: 45 Minutes from Sihanoukville Pier #2
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. KHMER DIACRITICS & SUBSCRIPTS STRESS TESTS (No Clipping)       */}
        {/* ================================================================= */}
        <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-small font-bold uppercase tracking-wider text-laterite-600 dark:text-laterite-400">
              [ TEST 2: KHMER STACKED SUBSCRIPTS & VOWEL DIACRITICS ]
            </span>
            <Heading level={2}>
              {km ? "តេស្តជើងអក្សរត្រួត និងស្រៈលើ-ក្រោម (គ្មានដាច់ជើង)" : "Khmer Subscript Clipping Stress Test"}
            </Heading>
            <Text variant="small">
              Verified with Kantumruy Pro at 1.5 - 1.8 line-height. Stacked subscripts (្ដ, ្ម, វ) and upper vowels (ះ, ាំ) must render cleanly without clipping.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KHMER_STRESS_TESTS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-2"
              >
                <div className="flex items-center justify-between text-small text-stone-500 font-mono">
                  <span>{item.label}</span>
                  <Check className="w-4 h-4 text-moss-600" />
                </div>
                <div className="text-heading font-bold text-stone-900 dark:text-stone-100 py-1">
                  {item.text}
                </div>
                <div className="text-small text-stone-600 dark:text-stone-400">
                  {item.note}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. THE 6 TOKEN TYPE SCALE SHOWCASE                                */}
        {/* ================================================================= */}
        <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-small font-bold uppercase tracking-wider text-river-600 dark:text-river-400">
              [ TEST 3: THE 6 CORE TYPE SCALE TOKENS ]
            </span>
            <Heading level={2}>
              {km ? "កម្រិតទំហំអក្សរទាំង 6 ផ្លូវការ" : "The 6 Core Type Scale Tokens"}
            </Heading>
            <Text variant="small">
              Mobile to desktop scaling via clamp(). Line heights: Khmer 1.5 - 1.8, English 1.15 - 1.6. Minimum size: 14px.
            </Text>
          </div>

          <div className="space-y-6">
            {TYPE_SCALE_TOKENS.map((t, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3"
              >
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-800 text-small">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-laterite-600 dark:text-laterite-400">
                      .{t.token}
                    </span>
                    <span className="text-stone-500">({t.use})</span>
                  </div>
                  <div className="font-mono text-stone-500 text-small">
                    Scale: {t.mobile} → {t.desktop} | W: {t.weight} | LH: {km ? t.lhKm : t.lhEn}
                  </div>
                </div>

                {/* Live sample */}
                <div className={`${t.token} text-stone-900 dark:text-stone-100`}>
                  {km ? t.sampleKm : t.sampleEn}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. FORM INPUTS & BUTTONS (16px MINIMUM)                           */}
        {/* ================================================================= */}
        <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-small font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              [ TEST 4: BUTTONS & FORM INPUTS (16px MINIMUM) ]
            </span>
            <Heading level={2}>
              {km ? "ប៊ូតុង និងប្រអប់បញ្ចូលទិន្នន័យ (16px អប្បបរមា)" : "Inputs & Controls (16px Floor)"}
            </Heading>
            <Text variant="small">
              Inputs and buttons must be 16px minimum (1rem) to prevent iOS auto-zoom on touch focus.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-small font-bold text-stone-700 dark:text-stone-300 block">
                {km ? "ស្វែងរកគោលដៅទេសចរណ៍" : "Search Sanctuaries"}
              </label>
              <input
                type="text"
                placeholder={km ? "វាយបញ្ចូលឈ្មោះប្រាសាទ ឬខេត្ត..." : "Enter temple or province..."}
                defaultValue={km ? "ប្រាសាទអង្គរវត្ត" : "Angkor Wat Temple"}
                className="w-full h-12 px-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-body text-stone-900 dark:text-stone-100 focus:outline-none focus:border-laterite-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-small font-bold text-stone-700 dark:text-stone-300 block">
                {km ? "ប៊ូតុងសកម្មភាព" : "Action Button"}
              </label>
              <button
                type="button"
                className="w-full h-12 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white text-body font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <span>{km ? "រៀបចំដំណើរកម្សាន្តឥឡូវនេះ" : "Plan Your Expedition Now"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. PROSE READING COLUMN (max-w-prose / 65-75 chars)               */}
        {/* ================================================================= */}
        <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-small font-bold uppercase tracking-wider text-moss-600">
              [ TEST 5: PROSE READING WIDTH (65 - 75 CH) ]
            </span>
            <Heading level={2}>
              {km ? "ចម្ងាយបន្ទាត់អានអត្ថបទវែង (<Prose>)" : "Reading Column & Vertical Rhythm"}
            </Heading>
          </div>

          <Prose>
            <p>
              {km
                ? "ប្រាសាទអង្គរវត្ត ត្រូវបានសាងសង់ឡើងក្នុងរាជ្យព្រះបាទសូរ្យវរ្ម័នទី2 នៅដើមសតវត្សរ៍ទី12 ដើម្បីឧទ្ទិសថ្វាយព្រះវិស្ណុក្នុងព្រហ្មញ្ញសាសនា មុនពេលប្រែក្លាយជាទីសក្ការបូជាពុទ្ធសាសនា។ ស្ថាបត្យកម្មដ៏មហិមានេះឆ្លុះបញ្ចាំងពីភ្នំព្រះសុមេរុ ដែលជាមជ្ឈមណ្ឌលនៃចក្រវាលក្នុងជំនឿបុរាណខ្មែរ។"
                : "Angkor Wat was constructed during the reign of King Suryavarman II in the early 12th century as a temple-mountain dedicated to Vishnu, before transforming into a revered Buddhist sanctuary. The monuments represent Mount Meru, the cosmic axis of Hindu and Buddhist cosmology."}
            </p>
            <p>
              {km
                ? "ការអានអត្ថបទវែងទាមទារនូវគម្លាតបន្ទាត់សមរម្យ (Line-height 1.8 សម្រាប់ភាសាខ្មែរ) ដើម្បីកុំឱ្យស្រៈខាងលើ និងជើងអក្សរខាងក្រោមប៉ះទង្គិចគ្នា បង្កើនភាពងាយស្រួលដល់ភ្នែកអ្នកអានគ្រប់វ័យ។"
                : "Long-form editorial narratives require generous vertical rhythm (1.6 for English, 1.8 for Khmer) to ensure effortless readability on both mobile displays and high-resolution desktop screens."}
            </p>
          </Prose>
        </section>
      </div>
    </div>
  );
};

export default TypographyTestPage;
