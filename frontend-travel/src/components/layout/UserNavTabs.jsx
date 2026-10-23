import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Heart, Star } from "lucide-react";
import { useFavoriteStore } from "@/store/favoriteStore";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

export const UserNavTabs = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const { count: favoritesCount } = useFavoriteStore();

  const tabs = [
    {
      to: "/profile",
      label: km ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "My Profile",
      icon: User
    },
    {
      to: "/favorites",
      label: km ? "បានរក្សាទុក" : "Saved",
      icon: Heart,
      badge: favoritesCount > 0 ? toKm(favoritesCount) : null
    },
    {
      to: "/my-reviews",
      label: km ? "ការវាយតម្លៃរបស់ខ្ញុំ" : "My Reviews",
      icon: Star
    }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/80 dark:border-stone-800 text-xs">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `min-h-[42px] px-4 py-2 rounded-2xl font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? "bg-laterite-600 text-white border-laterite-600 shadow-sm"
                  : "bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-laterite-600/40 hover:bg-stone-50 dark:hover:bg-stone-800/50 shadow-2xs"
              }`
            }
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/30 text-white font-bold">
                {tab.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

export default UserNavTabs;
