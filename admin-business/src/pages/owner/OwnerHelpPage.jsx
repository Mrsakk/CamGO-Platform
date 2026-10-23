import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  CreditCard,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const guideItems = [
  {
    icon: ImageIcon,
    to: "/owner/my-business",
    kmTitle: "១. បំពេញព័ត៌មានអាជីវកម្ម",
    enTitle: "1. Complete your business profile",
    capability: "profile.update",
    kmText: "បន្ថែមឈ្មោះ ការពិពណ៌នា ទីតាំង ម៉ោងបើកបិទ និងរូបភាពយ៉ាងហោចណាស់ ៣ សន្លឹក។ ព័ត៌មានពេញលេញជួយឱ្យភ្ញៀវជឿជាក់ និងស្វែងរកអ្នកបានយាយ។",
    enText: "Add your name, description, location, opening hours, and at least 3 photos. Complete profiles build trust and are easier to find.",
  },
  {
    icon: MessageSquare,
    to: "/owner/leads",
    kmTitle: "២. តាមដានអតិថិជន",
    enTitle: "2. Follow up with leads",
    capability: "leads.view",
    kmText: "រាល់ពេលភ្ញៀវចុចទូរស័ព្ទ ឬផ្ញើសារ ពួកគេនឹងបង្ហាញក្នុងបញ្ជីអតិថិជន។ កត់ត្រាការទាក់ទង និងធ្វើបច្ចុប្បន្នភាពដំណាក់កាលឱ្យបានទៀងទាត់។",
    enText: "Every call or message click appears in your leads list. Record follow-ups and update each stage regularly.",
  },
  {
    icon: Star,
    to: "/owner/reviews",
    kmTitle: "៣. ឆ្លើយតបការវាយតម្លៃ",
    enTitle: "3. Reply to reviews",
    capability: "reviews.view",
    kmText: "ការឆ្លើយតបដោយសុភាព និងវិជ្ជាជីវៈបង្ហាញថាអ្នកយកចិត្តទុកដាក់អតិថិជន។ ការវាយតម្លៃត្រូវឆ្លងកាត់ការត្រួតពិនិត្យពីក្រុមការងារជាមុន។",
    enText: "Professional replies show that you care. Reviews are moderated by staff before they appear publicly.",
  },
  {
    icon: Sparkles,
    to: "/owner/subscription",
    kmTitle: "៤. ជ្រើសរើសគម្រោង",
    enTitle: "4. Choose a plan",
    capability: "billing.manage",
    kmText: "គម្រោង Pro ជួយបង្ហាញអាជីវកម្មរបស់អ្នកខ្ពស់ជាងគេ។ អ្នកអាចសាកល្បង ៣០ ថ្ងៃ ប្រសិនបើព័ត៌មានពេញលេញ ៨០% និងបានផ្ទៀងផ្ទាត់ KYC។",
    enText: "The Pro plan puts your business in front. Start a 30-day trial when your profile is at least 80% complete and KYC verified.",
  },
  {
    icon: Users,
    to: "/owner/team",
    kmTitle: "៥. អញ្ជើញក្រុមការងារ",
    enTitle: "5. Invite your team",
    capability: "team.manage",
    kmText: "បន្ថែមបុគ្គលិកដោយកំណត់តួនាទីសមស្រប។ អ្នកគ្រប់គ្រងអាចថែទាំអតិថិជន និងការវាយតម្លៃជំនួសអ្នកបាន។",
    enText: "Add staff with the right role. Managers can handle leads and reviews on your behalf.",
  },
];

const faqs = [
  {
    kmQ: "តើខ្ញុំត្រូវបង់កម្រៃជើងសារទេ?",
    enQ: "Do I pay commission fees?",
    kmA: "ទេ។ CamGO មិនគិតកម្រៃជើងសារលើការទាក់ទង ឬការលក់របស់អ្នកទេ។ អ្នកគ្រាន់តែជ្រើសរើសគម្រោងបង្ហាញប៉ុណ្ណោះ។",
    enA: "No. CamGO does not charge commission on your contacts or sales. You only choose a visibility plan.",
  },
  {
    kmQ: "តើការទូទាត់ធ្វើឡើងដូចម្តេច?",
    enQ: "How do payments work?",
    kmA: "សម្រាប់ដំណាក់កាលសាកល្បង ការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់ដោយក្រុមការងារតាម KHQR Bakong សាច់ប្រាក់ ឬធនាគារ។ គម្រោងនឹងសកម្មបន្ទាប់ពីបញ្ជាក់ការទូទាត់។",
    enA: "During the pilot, staff verify payments made via KHQR Bakong, cash, or bank transfer. Your plan activates after confirmation.",
  },
  {
    kmQ: "ហេតុអ្វីព័ត៌មានរបស់ខ្ញុំត្រូវរង់ចាំត្រួតពិនិត្យ?",
    enQ: "Why is my profile under review?",
    kmA: "ការផ្លាស់ប្តូរឈ្មោះ ឬអាសយដ្ឋានសំខាន់ត្រូវផ្ទៀងផ្ទាត់ដើម្បីការពារការក្លែងបន្លំ និងរក្សាទំនុកចិត្តភ្ញៀវ។",
    enA: "Changes to core details like name or address are verified to prevent fraud and protect visitor trust.",
  },
  {
    kmQ: "តើ KYC ខុសពីគម្រោងដែរឬទេ?",
    enQ: "Is KYC different from a plan?",
    kmA: "បាទ/ចាស។ KYC គឺជាការផ្ទៀងផ្ទាត់អត្តសញ្ញាណអាជីវកម្ម ដែលផ្តល់សញ្ញាផ្ទៀងផ្ទាត់។ គម្រោងគឺជាការបង្ហាញ និងមុខងារបន្ថែម។",
    enA: "No. KYC verifies your business identity and grants a verified badge. Plans control visibility and extra features.",
  },
];

export const OwnerHelpPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const { hasBusinessCapability } = useAuthStore();
  const availableGuideItems = guideItems.filter(
    (item) => !item.capability || hasBusinessCapability(item.capability)
  );

  return (
    <div className=" mx-auto">
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-7 sm:p-9 border border-stone-800">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          {isKm ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center"}
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">
          {isKm ? "របៀបដំណើរការអាជីវកម្មរបស់អ្នក" : "How your business portal works"}
        </h1>
        <p className="mt-2 text-sm text-stone-300 max-w-2xl leading-relaxed">
          {isKm
            ? "គ្រប់គ្រងព័ត៌មាន តាមដានអតិថិជន និងបង្កើនឱកាសលក់ដោយមិនគិតកម្រៃជើងសារ។ សូមអនុវត្តតាមជំហានខាងក្រោម។"
            : "Manage your profile, follow up with customers, and grow without commissions. Follow the steps below."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableGuideItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="p-5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-400 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-500 transition" />
              </div>
              <h2 className="mt-3 font-bold text-sm text-stone-900 dark:text-white">
                {isKm ? item.kmTitle : item.enTitle}
              </h2>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                {isKm ? item.kmText : item.enText}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3">
          <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-stone-900 dark:text-white">{isKm ? "គ្មានកម្រៃជើងសារ" : "Zero commission"}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">{isKm ? "ទាក់ទងអតិថិជនដោយផ្ទាល់" : "Contact customers directly"}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-stone-900 dark:text-white">{isKm ? "ផ្ទៀងផ្ទាត់ KYC" : "KYC verified"}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">{isKm ? "សញ្ញាទំនុកចិត្តសម្រាប់ភ្ញៀវ" : "A trust badge for visitors"}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-stone-900 dark:text-white">{isKm ? "ជូនដំណឹងរហ័ស" : "Instant alerts"}</div>
            <p className="text-[11px] text-stone-500 mt-0.5">{isKm ? "តាម in-app ឬ Telegram" : "In-app or Telegram"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-850 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-sm">
        <h2 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          {isKm ? "សំណួរញឹកញាប់" : "Frequently asked questions"}
        </h2>
        <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
          {faqs.map((faq) => (
            <div key={faq.enQ} className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                {isKm ? faq.kmQ : faq.enQ}
              </h3>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                {isKm ? faq.kmA : faq.enA}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-stone-900 dark:text-white">
              {isKm ? "ត្រូវការជំនួយបន្ថែម?" : "Need more help?"}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {isKm
                ? "ទាក់ទងក្រុមការងារតាម Telegram @camgo_admin ឬ Hotline +855 12 345 678។"
                : "Contact our team via Telegram @camgo_admin or Hotline +855 12 345 678."}
            </p>
          </div>
        </div>
        {hasBusinessCapability("billing.manage") && (
          <Link
            to="/owner/subscription"
            className="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold text-xs text-center"
          >
            {isKm ? "មើលគម្រោង" : "View plans"}
          </Link>
        )}
      </div>
    </div>
  );
};
