import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass, Heart, User } from "lucide-react";
import { useFavoriteStore } from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";

/**
 * MobileBottomNav Component - Angkor Sandstone & Bas-Relief
 * - Exactly 4 items: Home, Explore, Favorites, Profile
 * - 56px tall (h-14)
 * - Active tab has a laterite top bar and bold label
 * - Respects safe-area inset
 * - Solid stone background with subtle relief
 */
import { useState, useEffect } from "react";

const MobileBottomNav = () => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";
  const { count: favoritesCount } = useFavoriteStore();
  const { isAuthenticated } = useAuthStore();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Hide bottom nav when virtual keyboard is active to prevent blocking inputs
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      const diff = window.innerHeight - window.visualViewport.height;
      setIsKeyboardOpen(diff > 150);
    };

    window.visualViewport.addEventListener("resize", handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  if (isKeyboardOpen) return null;

  const navItems = [
    {
      to: "/",
      end: true,
      label: km ? "ទំព័រដើម" : "Home",
      icon: Home
    },
    {
      to: "/destinations",
      end: false,
      label: km ? "រុករក" : "Explore",
      icon: Compass
    },
    {
      to: "/favorites",
      end: false,
      label: km ? "ចំណូលចិត្ត" : "Favorites",
      icon: Heart,
      badge: favoritesCount
    },
    {
      to: isAuthenticated ? "/profile" : "/login",
      end: false,
      label: isAuthenticated ? (km ? "គណនី" : "Profile") : (km ? "ចូលប្រើ" : "Profile"),
      icon: User
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-100/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-300 dark:border-stone-800 lg:hidden px-2 shadow-raise pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                  isActive
                    ? "text-laterite-600 dark:text-laterite-400 font-bold border-t-2 border-laterite-600 dark:border-laterite-400"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
                }`
              }
            >
              <div className="relative mt-0.5">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-sans leading-tight mt-0.5">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export { MobileBottomNav };
