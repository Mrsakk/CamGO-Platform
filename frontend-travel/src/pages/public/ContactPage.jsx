import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  HeartHandshake,
  MessageSquare,
  Building2,
  CheckCircle2
} from "lucide-react";
import { contentApi } from "@/lib/api/content";
import { toast } from "@/store/toastStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SEOHead } from "@/components/common/SEOHead";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

export const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    contentApi.getSettings().then((res) => {
      if (res) {
        setSettings(res.data || res);
      }
    }).catch((err) => console.error("Could not load contact settings", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(km ? "សូមបំពេញគ្រប់ប្រអប់ចាំបាច់" : "Please fill in all required fields");
      return;
    }
    try {
      setIsSubmitting(true);
      await contentApi.submitContact(formData);
      toast.success(km ? "សាររបស់អ្នកត្រូវបានផ្ញើជោគជ័យ!" : "Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch {
      toast.error(km ? "មានបញ្ហាក្នុងការផ្ញើសារ សូមព្យាយាមម្តងទៀត" : "Failed to send message, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const address = km
    ? (settings?.contact_address_km || settings?.contact_address_en || "អគារលេខ 88 មហាវិថីព្រះនរោត្តម ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ")
    : (settings?.contact_address_en || "No. 88, Preah Norodom Blvd, Daun Penh, Phnom Penh, Cambodia");

  const email = settings?.contact_email || "contact@camgo.com";
  const phone = settings?.contact_phone || "+855 23 888 777";

  return (
    <div className="stone-grain min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-20 sm:pt-24 pb-20">
      <SEOHead
        title={km ? "ទំនាក់ទំនង — CamGO" : "Contact Us — CamGO Travel"}
        description="Get in touch with CamGO travel curators and cultural partnership team."
      />

      <PageContainer className="space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: km ? "ទំព័រដើម" : "Home", to: "/" },
            { label: km ? "ទំនាក់ទំនង" : "Contact" },
          ]}
        />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE CONTACT HERO BANNER                             */}
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

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 border border-laterite-600/20 text-xs font-bold text-laterite-700 dark:text-laterite-300 font-sans tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
              <span>{km ? "ការិយាល័យទំនាក់ទំនង និងកិច្ចសហការ" : "Contact & Inquiries"}</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
              {km ? "ទំនាក់ទំនងមកកាន់យើង" : "Speak with Our Curators"}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
              {km
                ? "មានចម្ងល់អំពីផ្លូវទស្សនាប្រាសាទ កោះ ឆ្នេរ ការរៀបចំដំណើរកម្សាន្ត ឬកិច្ចសហការវប្បធម៌? សូមផ្ញើសារមកកាន់យើងខ្ញុំ។ ក្រុមការងារយើងនឹងឆ្លើយតបយ៉ាងឆាប់រហ័ស។"
                : "Have questions regarding temple expedition routes, provincial highlights, travel schedules, or cultural partnerships? Reach out to our team."}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-sans font-semibold text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <Clock className="w-3.5 h-3.5 text-laterite-600" />
                <span>{km ? "ឆ្លើយតបក្នុងរង្វង់ 24 ម៉ោង" : "24h Typical Response"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{km ? "រាជធានីភ្នំពេញ កម្ពុជា" : "Phnom Penh, Cambodia"}</span>
              </span>
            </div>
          </div>
        </motion.section>

        {/* =================================================================== */}
        {/* 2. SPLIT-SCREEN CONTACT SECTION                                     */}
        {/* =================================================================== */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Headquarters Details & Partnerships */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-6"
          >
            {/* Headquarters Information Card */}
            <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-laterite-600/10 text-laterite-600 dark:text-laterite-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-sans font-bold text-stone-700 dark:text-stone-300">
                    {km ? "ទីស្នាក់ការកណ្តាល" : "General Headquarters"}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs font-bold text-laterite-600 dark:text-laterite-400">
                  KH-HQ
                </span>
              </div>

              <div className="space-y-4 text-sm text-stone-700 dark:text-stone-300 font-sans">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-laterite-600 dark:text-laterite-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                      {km ? "អាសយដ្ឋាន" : "Address"}
                    </span>
                    <span className="leading-relaxed block text-stone-900 dark:text-stone-100 font-medium">
                      {address}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-laterite-600 dark:text-laterite-400 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                      {km ? "អ៊ីមែលផ្លូវការ" : "Official Email"}
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="font-mono text-laterite-600 dark:text-laterite-400 hover:underline font-semibold block truncate"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-laterite-600 dark:text-laterite-400 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                      {km ? "ទូរស័ព្ទទំនាក់ទំនង" : "Telephone"}
                    </span>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="font-mono text-stone-900 dark:text-stone-100 font-bold hover:text-laterite-600 transition-colors block"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Partnerships Card */}
            <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-7 space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="text-xs font-sans font-bold text-laterite-600 dark:text-laterite-400 uppercase tracking-wider">
                  {km ? "កិច្ចសហការ និងបណ្តាញទេសចរណ៍" : "Cultural Partnerships"}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                {km
                  ? "តើអ្នកជាសហគមន៍ទេសចរណ៍មូលដ្ឋាន រមណីយដ្ឋានធម្មជាតិ ឬស្ថាប័នអភិរក្សបេតិកភណ្ឌមែនទេ? ចាប់ដៃគូជាមួយយើងដើម្បីលើកស្ទួយរតនសម្បត្តិជាតិខ្មែរ។"
                  : "Are you an eco-tourism community, private heritage sanctuary, or cultural institution? Partner with us to celebrate Cambodia's living legacy."}
              </p>
            </div>
          </motion.div>

          {/* Right Column: Contact Form Panel */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 rounded-3xl sm:rounded-[36px] bg-white dark:bg-stone-900 p-6 sm:p-8 lg:p-10 border border-stone-200/90 dark:border-stone-800 shadow-sm"
          >
            <div className="pb-4 border-b border-stone-100 dark:border-stone-800 mb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 tracking-tight">
                  {km ? "ផ្ញើសារ ឬសំណួរមកកាន់យើង" : "Send Us a Message"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-sans">
                  {km ? "បំពេញព័ត៌មានខាងក្រោមដើម្បីទាក់ទងមកកាន់យើង" : "Fill out the fields below and we will get back to you promptly"}
                </p>
              </div>
              <span className="w-9 h-9 rounded-2xl bg-laterite-600/10 text-laterite-600 dark:text-laterite-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "ឈ្មោះពេញ *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={km ? "ឧ. សុខា ចាន់" : "e.g. Sokha Chan"}
                    className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "អាសយដ្ឋានអ៊ីមែល *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sokha@example.com"
                    className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "លេខទូរស័ព្ទ (ជម្រើស)" : "Telephone (Optional)"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+855 ..."
                    className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "ប្រធានបទ" : "Subject"}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={km ? "ឧ. ការរៀបចំកាលវិភាគដើរកម្សាន្ត" : "e.g. Travel Itinerary Inquiry"}
                    className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  {km ? "ខ្លឹមសារសារ *" : "Message *"}
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={km ? "សរសេរសារ ឬសំណួររបស់អ្នកនៅទីនេះ..." : "Write your inquiry or question here..."}
                  className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 leading-relaxed font-sans transition-all"
                  required
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[46px] px-8 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (km ? "កំពុងផ្ញើ..." : "Sending...") : (km ? "ផ្ញើសារឥឡូវនេះ" : "Send Message")}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ContactPage;
