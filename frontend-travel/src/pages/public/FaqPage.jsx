import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  X,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Ticket,
  Compass,
  FileCheck,
  Coins,
  Shield,
  Bus,
  CheckCircle2
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { SEOHead } from "@/components/common/SEOHead";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

// Fallback curated bilingual FAQs
const DEFAULT_FAQS = [
  {
    id: 1,
    category: "angkor",
    category_km: "សំបុត្រអង្គរ",
    category_en: "Angkor Pass",
    question_en: "How does the Angkor Pass work and where can I buy it?",
    question_km: "តើប័ណ្ណចូលទស្សនាអង្គរ (Angkor Pass) មានដំណើរការយ៉ាងដូចម្តេច ហើយទិញនៅឯណា?",
    answer_en:
      "The Angkor Pass covers all major temples in the Archaeological Park (Angkor Wat, Bayon, Ta Prohm, and surrounding monuments). Available options include 1-day ($37 USD), 3-day ($62 USD, valid within 10 days), and 7-day ($72 USD, valid within 30 days). Tickets can be purchased at the official Angkor Enterprise ticketing center in Siem Reap or online via the official portal at angkor.com.kh. Cambodian citizens and children under 12 enter free with valid ID.",
    answer_km:
      "ប័ណ្ណចូលទស្សនាអង្គរគ្របដណ្តប់លើប្រាសាទសំខាន់ៗទាំងអស់ក្នុងរមណីយដ្ឋានអង្គរ (អង្គរវត្ត បាយ័ន តាព្រហ្ម និងប្រាសាទជុំវិញ)។ មានជម្រើសប័ណ្ណ 1 ថ្ងៃ (37 ដុល្លារ), 3 ថ្ងៃ (62 ដុល្លារ មានសុពលភាពក្នុងរង្វង់ 10 ថ្ងៃ) និង 7 ថ្ងៃ (72 ដុល្លារ មានសុពលភាពក្នុងរង្វង់ 30 ថ្ងៃ)។ អ្នកអាចទិញនៅមជ្ឈមណ្ឌលលក់សំបុត្រផ្លូវការ Angkor Enterprise នៅក្រុងសៀមរាប ឬតាមរយៈគេហទំព័រផ្លូវការ angkor.com.kh។ ជនជាតិខ្មែរ និងកុមារអាយុក្រោម 12 ឆ្នាំ ចូលទស្សនាដោយឥតគិតថ្លៃ។"
  },
  {
    id: 2,
    category: "angkor",
    category_km: "សំបុត្រអង្គរ",
    category_en: "Angkor Pass",
    question_en: "What is the official dress code for visiting Cambodian temples?",
    question_km: "តើមានវិន័យស្លៀកពាក់បែបណាខ្លះក្នុងការចូលទស្សនាប្រាសាទបុរាណ និងទីសក្ការៈ?",
    answer_en:
      "Cambodian temples are sacred religious sites. Visitors are required to adhere to the Angkor Visitor Code of Conduct: shoulders and knees must be covered (shirts with sleeves, long pants or skirts below the knee). Revealing attire, transparent fabrics, and sleeveless tank tops are strictly prohibited and entry will be denied at upper levels like the Bakan tower of Angkor Wat.",
    answer_km:
      "ប្រាសាទបុរាណខ្មែរគឺជាទីសក្ការបូជាដ៏ពិសិដ្ឋ។ ភ្ញៀវទេសចរត្រូវគោរពតាមក្រមសីលធម៌ទស្សនាអង្គរ៖ ត្រូវស្លៀកសំលៀកបំពាក់គ្របស្មា និងជង្គង់ (អាវមានដៃ ខោវែង ឬសំពត់វែងក្រោមជង្គង់)។ ការស្លៀកពាក់វាលលើវាលក្រោម សម្លៀកបំពាក់ស្តើងថ្លា និងអាវវាលក្លៀក ត្រូវបានហាមឃាត់ដាច់ខាត ហើយនឹងមិនត្រូវបានអនុញ្ញាតឱ្យឡើងប៉មបាកាននៃអង្គរវត្តឡើយ។"
  },
  {
    id: 3,
    category: "general",
    category_km: "ទូទៅ",
    category_en: "General",
    question_en: "What is the best time of year to visit Cambodia?",
    question_km: "តើរដូវណាដែលល្អបំផុតសម្រាប់មកទស្សនាកម្ពុជា?",
    answer_en:
      "The most popular window is the cool, dry season from November to February, with pleasant temperatures averaging 24°C - 30°C and crystal blue skies. The green season (June to October) brings refreshing afternoon showers, dramatically lower crowds, vibrant lush landscapes, and reflective moats at their most photogenic fullness.",
    answer_km:
      "រដូវដែលពេញនិយមបំផុតគឺរដូវរំហើយចាប់ពីខែវិច្ឆិកា ដល់ខែកុម្ភៈ ដែលមានធាតុអាកាសត្រជាក់ស្រួល សីតុណ្ហភាពជាមធ្យម 24°C - 30°C និងផ្ទៃមេឃស្រឡះល្អ។ រដូវវស្សា (មិថុនា ដល់ តុលា) មានភ្លៀងធ្លាក់នៅពេលរសៀល ទេសភាពធម្មជាតិខៀវបំព្រង គូទឹកជុំវិញប្រាសាទពេញប្រៀប និងមានភ្ញៀវទេសចរតិចដែលងាយស្រួលថតរូបស្អាតៗ។"
  },
  {
    id: 4,
    category: "visa",
    category_km: "ទិដ្ឋាការ",
    category_en: "Visa",
    question_en: "Do international visitors need a visa to enter Cambodia?",
    question_km: "តើភ្ញៀវទេសចរអន្តរជាតិត្រូវការទិដ្ឋាការ (Visa) ដែរឬទេ?",
    answer_en:
      "Most foreign passport holders require a tourist visa (Type T). You can apply conveniently online for an official e-Visa prior to arrival via evisa.gov.kh ($36 USD), or obtain a Visa on Arrival ($30 USD) at Phnom Penh, Siem Reap-Angkor, and Sihanoukville international airports and land border crossings. Citizens of ASEAN member nations enjoy bilateral visa exemptions ranging from 14 to 30 days.",
    answer_km:
      "អ្នកកាន់លិខិតឆ្លងដែនបរទេសភាគច្រើនត្រូវការទិដ្ឋាការទេសចរណ៍ (ប្រភេទ T)។ អ្នកអាចស្នើសុំ e-Visa ផ្លូវការជាមុនតាមអនឡាញ (evisa.gov.kh ក្នុងតម្លៃ 36 ដុល្លារ) ឬធ្វើទិដ្ឋាការពេលមកដល់ (Visa on Arrival តម្លៃ 30 ដុល្លារ) នៅព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ សៀមរាបអង្គរ និងព្រះសីហនុ។ ពលរដ្ឋនៃប្រទេសសមាជិកអាស៊ាន ទទួលបានការលើកលែងទិដ្ឋាការពី 14 ទៅ 30 ថ្ងៃ។"
  },
  {
    id: 5,
    category: "currency",
    category_km: "រូបិយប័ណ្ណ",
    category_en: "Currency",
    question_en: "What currency is used in Cambodia and can tourists use mobile payments?",
    question_km: "តើកម្ពុជាប្រើប្រាស់រូបិយប័ណ្ណអ្វីខ្លះ ហើយអាចទូទាត់តាមទូរស័ព្ទដៃបានទេ?",
    answer_en:
      "Cambodia operates a dual-currency economy with the Cambodian Riel (KHR, standard exchange around 4,100 KHR per 1 USD) and US Dollars. Tourists can pay with cash or download the Bakong Tourists app for seamless KHQR contactless payments accepted by virtually all merchants, restaurants, tuk-tuks, and local street stalls nationwide.",
    answer_km:
      "ប្រទេសកម្ពុជាប្រើប្រាស់រូបិយប័ណ្ណពីរស្របគ្នាគឺ ប្រាក់រៀលខ្មែរ (KHR អត្រាប្តូរប្រាក់ប្រហែល 4,100 រៀល = 1 ដុល្លារ) និងប្រាក់ដុល្លារអាមេរិក។ ភ្ញៀវទេសចរអាចប្រើប្រាស់ក្រដាសប្រាក់ ឬទាញយកកម្មវិធី Bakong Tourists ដើម្បីស្កេនទូទាត់ KHQR បានយ៉ាងងាយស្រួលនៅគ្រប់ទីកន្លែង រាប់ទាំងភោជនីយដ្ឋាន ហាងទំនិញ រ៉ឺម៉កកង់បី និងតូបអាហារតាមផ្លូវ។"
  },
  {
    id: 6,
    category: "safety",
    category_km: "សុវត្ថិភាព",
    category_en: "Safety",
    question_en: "Is Cambodia safe for solo travelers and families?",
    question_km: "តើប្រទេសកម្ពុជាមានសុវត្ថិភាពសម្រាប់អ្នកដំណើរទោល និងក្រុមគ្រួសារដែរឬទេ?",
    answer_en:
      "Cambodia is widely celebrated for its warmth, kindness, and welcoming hospitality. Violent crime against travelers is extremely rare. Standard travel awareness applies: take care of your smartphone and bags when riding in open tuk-tuks, drink bottled or filtered water, and use registered ride-hailing apps such as Grab and PassApp.",
    answer_km:
      "ប្រទេសកម្ពុជាត្រូវបានពិភពលោកទទួលស្គាល់ចំពោះភាពរួសរាយរាក់ទាក់ និងចិត្តសប្បុរសរបស់ប្រជាជន។ បទល្មើសធ្ងន់ធ្ងរលើភ្ញៀវទេសចរគឺកម្រកើតមានបំផុត។ ការប្រុងប្រយ័ត្នទូទៅរួមមាន៖ ថែរក្សាទូរស័ព្ទ និងកាបូបពេលជិះរ៉ឺម៉កកង់បី បរិភោគទឹកដបស្អាត និងប្រើប្រាស់កម្មវិធីហៅយានជំនិះដែលមានសុវត្ថិភាពដូចជា Grab ឬ PassApp។"
  },
  {
    id: 7,
    category: "transport",
    category_km: "ការធ្វើដំណើរ",
    category_en: "Transport",
    question_en: "How do I travel between Phnom Penh, Siem Reap, and the southern islands?",
    question_km: "តើធ្វើដំណើររវាងភ្នំពេញ សៀមរាប និងតំបន់កោះភាគខាងត្បូងដោយរបៀបណា?",
    answer_en:
      "Domestic air travel connects Phnom Penh and Siem Reap in 45 minutes. For overland routes, express mini-vans and VIP buses operate frequently along national highways (5-6 hours between PP and SR). High-speed express catamarans connect Sihanoukville mainland to Koh Rong and Koh Rong Sanloem within 45 minutes.",
    answer_km:
      "ជើងហោះហើរក្នុងស្រុកតភ្ជាប់ភ្នំពេញ និងសៀមរាបក្នុងរយៈពេលត្រឹមតែ 45 នាទី។ សម្រាប់ការធ្វើដំណើរតាមផ្លូវគោក មានរថយន្តក្រុង VIP និងរថយន្តឈ្នួលទំនើបរត់ជាប្រចាំតាមផ្លូវជាតិ (ប្រហែល 5 ទៅ 6 ម៉ោង)។ ចំណែកការទៅកាន់កោះរ៉ុង និងកោះរ៉ុងសន្លឹម មានអូរប័រល្បឿនលឿនចេញពីក្រុងព្រះសីហនុជារៀងរាល់ថ្ងៃក្នុងរយៈពេល 45 នាទី។"
  }
];

export const FaqPage = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(1); // open first by default

  useEffect(() => {
    contentApi
      .getFaqs()
      .then((res) => {
        const items = res?.data?.items || res?.data || res?.items;
        if (Array.isArray(items) && items.length > 0) {
          setFaqs(items);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_FAQS
      });
  }, []);

  const categories = useMemo(() => {
    return [
      { id: "all", name_km: "សំណួរទាំងអស់", name_en: "All Questions", icon: Compass },
      { id: "angkor", name_km: "សំបុត្រអង្គរ", name_en: "Angkor Pass", icon: Ticket },
      { id: "general", name_km: "ទូទៅ", name_en: "General", icon: HelpCircle },
      { id: "visa", name_km: "ទិដ្ឋាការ", name_en: "Visa", icon: FileCheck },
      { id: "currency", name_km: "រូបិយប័ណ្ណ", name_en: "Currency", icon: Coins },
      { id: "safety", name_km: "សុវត្ថិភាព", name_en: "Safety", icon: Shield },
      { id: "transport", name_km: "ការធ្វើដំណើរ", name_en: "Transport", icon: Bus }
    ];
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCat =
        selectedCategory === "all" ||
        f.category === selectedCategory ||
        f.category_slug === selectedCategory;

      const q = search.toLowerCase().trim();
      if (!q) return matchesCat;

      const qKm = (f.question_km || "").toLowerCase();
      const qEn = (f.question_en || "").toLowerCase();
      const aKm = (f.answer_km || "").toLowerCase();
      const aEn = (f.answer_en || "").toLowerCase();

      const matchesSearch =
        qKm.includes(q) ||
        qEn.includes(q) ||
        aKm.includes(q) ||
        aEn.includes(q);

      return matchesCat && matchesSearch;
    });
  }, [faqs, selectedCategory, search]);

  const toggleAccordion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "សំណួរដែលសួរញឹកញាប់ — CamGO" : "Frequently Asked Questions — CamGO"}
        description={
          km
            ? "ចម្លើយចំពោះសំណួរដែលសួរញឹកញាប់ស្តីពីការទស្សនាប្រាសាទអង្គរវត្ត សំបុត្រចូលទស្សនា ទិដ្ឋាការ រូបិយប័ណ្ណ និងការធ្វើដំណើរនៅកម្ពុជា។"
            : "Essential answers regarding Angkor tickets, temple dress codes, e-Visa regulations, currency, and transportation across Cambodia."
        }
      />

      <PageContainer className="space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "សំណួរដែលសួរញឹកញាប់" : "FAQs" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE FAQ HERO BANNER                                 */}
        {/* =================================================================== */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl sm:rounded-[36px] border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden"
        >
          {/* Layered Ambient Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-laterite-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Rotating Rumduol Flower Watermark */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute -right-16 -top-16 opacity-[0.035] dark:opacity-[0.025] pointer-events-none select-none"
          >
            <RumduolFlower size={420} className="text-laterite-600" />
          </motion.div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                <span>{km ? "មជ្ឈមណ្ឌលព័ត៌មាន និងសំណួរ-ចម្លើយ" : "Travel Knowledge Base"}</span>
              </div>

              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
                {km ? "សំណួរដែលសួរញឹកញាប់" : "Frequently Asked Questions"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed max-w-2xl">
                {km
                  ? `ការណែនាំលម្អិត និងចម្លើយផ្លូវការចំនួន ${toKm(faqs.length)} ចំណុច ស្តីពីសំបុត្រអង្គរ វិន័យស្លៀកពាក់ ទិដ្ឋាការ រូបិយប័ណ្ណ និងសុវត្ថិភាពក្នុងការធ្វើដំណើរនៅកម្ពុជា។`
                  : `Comprehensive travel answers covering Angkor Enterprise ticketing, temple codes of conduct, e-Visa protocols, currency, and transportation across Cambodia.`}
              </p>
            </div>

            {/* Right Column: Verified Metric Plate */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/80 space-y-3 text-center shadow-2xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-sans font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{km ? "ផ្ទៀងផ្ទាត់ផ្លូវការ" : "Officially Verified"}</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black font-sans text-laterite-600 dark:text-laterite-400">
                {toKm(faqs.length)}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans font-medium uppercase tracking-wider">
                {km ? "សំណួរ & ចម្លើយត្រៀមរួចជាស្រេច" : "Ready Guide Entries"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. SEARCH & CATEGORY FILTER TABS                                    */}
        {/* =================================================================== */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-laterite-600 dark:text-laterite-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={km ? "ស្វែងរកសំណួរ ចម្លើយ ឬពាក្យគន្លឹះ..." : "Search questions or keywords..."}
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 shadow-2xs transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[40px] px-4 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-laterite-600 text-white border-laterite-600 shadow-sm"
                      : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-800 hover:border-laterite-600/40 hover:bg-stone-50 dark:hover:bg-stone-800/50 shadow-2xs"
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-laterite-600 dark:text-laterite-400"}`} />
                  <span>{km ? cat.name_km : cat.name_en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. ACCORDION FAQ ITEMS LIST                                         */}
        {/* =================================================================== */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-3xl p-8 sm:p-14 text-center space-y-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 max-w-lg mx-auto shadow-sm"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 text-laterite-700 dark:text-laterite-400 text-xs font-bold font-sans uppercase">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{km ? "មិនមានសំណួរត្រូវគ្នា" : "No FAQs Found"}</span>
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
                {km ? "រកមិនឃើញសំណួរត្រូវនឹងការស្វែងរកទេ" : "No questions matching your query"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-sans">
                {km ? "សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេងទៀត ឬជ្រើសរើសប្រភេទផ្សេង។" : "Try searching with different terms or selecting another category."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="min-h-[38px] px-5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {km ? "សម្អាតការស្វែងរក" : "Clear Search"}
                </button>
              )}
            </motion.div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              const qText = km && faq.question_km ? faq.question_km : faq.question_en;
              const aText = km && faq.answer_km ? faq.answer_km : faq.answer_en;
              const itemNum = toKm(index + 1);

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-white dark:bg-stone-900 border-laterite-600/50 dark:border-laterite-500/50 shadow-md ring-1 ring-laterite-600/20"
                      : "bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-laterite-600/30 dark:hover:border-laterite-600/30 shadow-2xs"
                  }`}
                >
                  {/* Question Toggle Header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-laterite-600/10 dark:bg-laterite-500/15 text-laterite-600 dark:text-laterite-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {itemNum}
                      </span>
                      <h3 className="font-heading font-black text-base sm:text-lg lg:text-xl text-stone-900 dark:text-stone-100 leading-snug tracking-wide">
                        {qText}
                      </h3>
                    </div>

                    <div className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 transition-colors">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-laterite-600 dark:text-laterite-400" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Answer Content Panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-sans border-t border-stone-100 dark:border-stone-800/80">
                          <p className="whitespace-pre-line pl-10">
                            {aText}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. STILL HAVE QUESTIONS CTA BOX                                     */}
        {/* =================================================================== */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-3xl sm:rounded-[32px] bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-laterite-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans uppercase">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{km ? "នៅតែមានចម្ងល់បន្ថែម?" : "Still Have Questions?"}</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
              {km ? "ទាក់ទងមកកាន់ក្រុមការងារយើង" : "Speak Directly with Our Team"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "ក្រុមការងារCamGOរង់ចាំឆ្លើយតប និងជួយសម្រួលដល់ការរៀបចំដំណើរកម្សាន្តរបស់អ្នកជានិច្ច។"
                : "Our heritage curators are on standby to answer custom travel questions, road conditions, and seasonal itineraries."}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span>{km ? "ទាក់ទងយើង" : "Contact Us"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/map"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 border border-stone-200 dark:border-stone-700 transition-all"
            >
              <span>{km ? "ផែនទីទេសចរណ៍" : "Map Explorer"}</span>
            </Link>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
};

export default FaqPage;
