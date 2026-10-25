import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  Lock,
  ShieldCheck,
  Camera,
  Save,
  KeyRound,
  Mail,
  Phone,
  Globe,
  FileText,
  CheckCircle2,
  BadgeCheck
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { UserNavTabs } from "@/components/layout/UserNavTabs";
import { SEOHead } from "@/components/common/SEOHead";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

export const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    country: user?.country || "",
    bio: user?.bio || ""
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        country: user.country || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.put("/profile", formData);
      if (res.data?.data) {
        updateUser(res.data.data);
        toast.success(km ? "បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានជោគជ័យ!" : "Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (km ? "បរាជ័យក្នុងការកែប្រែព័ត៌មាន" : "Failed to update profile"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error(km ? "ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ" : "New passwords do not match");
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await api.put("/profile/password", passwordData);
      toast.success(km ? "បានប្តូរពាក្យសម្ងាត់ជោគជ័យ!" : "Password changed successfully!");
      setPasswordData({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || (km ? "បរាជ័យក្នុងការប្តូរពាក្យសម្ងាត់" : "Failed to change password"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("avatar", file);

    try {
      setIsUploadingAvatar(true);
      const res = await api.post("/profile/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.data) {
        const payload = res.data.data;
        const updatedUser = payload.user || payload;
        const avatarUrl = payload.avatar_url || updatedUser.avatar;
        updateUser({ ...updatedUser, avatar: avatarUrl });
        toast.success(km ? "បានផ្លាស់ប្តូររូបភាព Profile ជោគជ័យ!" : "Avatar updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (km ? "បរាជ័យក្នុងការ Upload រូបភាព" : "Failed to upload avatar"));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="stone-grain pt-20 sm:pt-24 pb-20 space-y-8 font-sans text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-950 min-h-screen">
      <SEOHead
        title={km ? "ព័ត៌មានផ្ទាល់ខ្លួន — CamGO" : "My Profile — CamGO Travel"}
        description="Manage your account profile, personal credentials, and travel settings."
      />

      <PageContainer className="max-w-5xl space-y-6">
        {/* Navigation Tabs */}
        <UserNavTabs />

        {/* =================================================================== */}
        {/* 1. ANGKOR SANDSTONE PROFILE HERO BANNER                             */}
        {/* =================================================================== */}
        <motion.div
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

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">


              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                {km ? "ព័ត៌មានគណនីផ្ទាល់ខ្លួន" : "User Profile & Settings"}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                {km
                  ? "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន សុវត្ថិភាពគណនី និងបទពិសោធន៍រុករកបេតិកភណ្ឌកម្ពុជារបស់អ្នក។"
                  : "Manage your personal travel credentials, security settings, and exploration preferences."}
              </p>
            </div>

            {/* Active Status Badge */}
            <div className="shrink-0 self-start md:self-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs font-sans font-bold border border-stone-200 dark:border-stone-700 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{km ? "គណនីសកម្ម" : "Status: Active"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 2-COLUMN CONTENT: LEFT IDENTITY CARD, RIGHT FORMS                   */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Avatar & Identity Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="md:col-span-4 bg-white dark:bg-stone-900 rounded-3xl sm:rounded-[36px] p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-sm flex flex-col items-center text-center space-y-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-laterite-600/5 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar Frame */}
            <div className="relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-laterite-600/20 border-2 border-laterite-600 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-heading font-black text-4xl flex items-center justify-center ring-4 ring-laterite-600/20 border-2 border-laterite-600 shadow-sm">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}

              {/* Quick Camera Overlay Badge */}
              <label className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>


            {/* Name & Email Details */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100 tracking-wide">
                  {user?.name}
                </h3>
                <BadgeCheck className="w-5 h-5 text-laterite-600 shrink-0" />
              </div>
              <p className="text-xs font-mono text-stone-500 truncate max-w-[220px]">
                {user?.email}
              </p>
            </div>

            {/* Role Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-laterite-600/10 dark:bg-laterite-500/15 text-laterite-700 dark:text-laterite-300 text-xs font-sans font-bold uppercase tracking-wider border border-laterite-600/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.roles?.[0] || "EXPLORER"}</span>
            </div>
          </motion.div>

          {/* Right Column: Personal Details & Password Forms */}
          <div className="md:col-span-8 space-y-6">
            {/* Personal Details Form */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-stone-900 rounded-3xl sm:rounded-[36px] p-6 sm:p-8 lg:p-10 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-6"
            >
              <div className="pb-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="space-y-1">

                  <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                    {km ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "Personal Information"}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "ឈ្មោះពេញ *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                    required
                  />
                </div>

                {/* Phone & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                      {km ? "លេខទូរស័ព្ទ" : "Phone"}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+855 12 345 678"
                      className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm font-mono focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                      {km ? "ប្រទេស" : "Country"}
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Cambodia"
                      className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "អំពីអ្នក (Bio)" : "Bio & Travel Interests"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={km ? "សរសេរពីចំណាប់អារម្មណ៍ដំណើរកម្សាន្តរបស់អ្នក..." : "Share a short note about your travel interests..."}
                    className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 leading-relaxed font-sans transition-all"
                  />
                </div>

                {/* Submit Profile */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="min-h-[46px] px-8 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUpdatingProfile ? (km ? "កំពុងរក្សាទុក..." : "Saving...") : (km ? "រក្សាទុកការផ្លាស់ប្តូរ" : "Save Changes")}</span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Change Password Form */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-stone-900 rounded-3xl sm:rounded-[36px] p-6 sm:p-8 lg:p-10 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-6"
            >
              <div className="pb-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="space-y-1">

                  <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                    {km ? "ផ្លាស់ប្តូរពាក្យសម្ងាត់" : "Change Password"}
                  </h3>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                    {km ? "ពាក្យសម្ងាត់បច្ចុប្បន្ន *" : "Current Password *"}
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                    required
                  />
                </div>

                {/* New & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                      {km ? "ពាក្យសម្ងាត់ថ្មី *" : "New Password *"}
                    </label>
                    <input
                      type="password"
                      value={passwordData.password}
                      onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                      {km ? "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី *" : "Confirm New Password *"}
                    </label>
                    <input
                      type="password"
                      value={passwordData.password_confirmation}
                      onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 text-sm focus:outline-none focus:border-laterite-600 focus:ring-2 focus:ring-laterite-600/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Submit Password */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="min-h-[46px] px-8 rounded-2xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98] border border-stone-700 shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isUpdatingPassword ? (km ? "កំពុងកែប្រែ..." : "Updating...") : (km ? "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់" : "Update Password")}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProfilePage;
