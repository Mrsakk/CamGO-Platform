import { useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoadingFallback } from "@/components/common/LoadingFallback";

// 1. Public & Tourist Pages (Code-split with React.lazy)
const HomePage = lazy(() => import("@/pages/public/HomePage").then((m) => ({ default: m.HomePage })));
const DestinationsPage = lazy(() => import("@/pages/public/DestinationsPage").then((m) => ({ default: m.DestinationsPage })));
const DestinationDetailPage = lazy(() => import("@/pages/public/DestinationDetailPage").then((m) => ({ default: m.DestinationDetailPage })));
const ProvincesPage = lazy(() => import("@/pages/public/ProvincesPage").then((m) => ({ default: m.ProvincesPage })));
const ProvinceDetailPage = lazy(() => import("@/pages/public/ProvinceDetailPage").then((m) => ({ default: m.ProvinceDetailPage })));
const CategoriesPage = lazy(() => import("@/pages/public/CategoriesPage").then((m) => ({ default: m.CategoriesPage })));
const CategoryDetailPage = lazy(() => import("@/pages/public/CategoryDetailPage").then((m) => ({ default: m.CategoryDetailPage })));
const BlogPage = lazy(() => import("@/pages/public/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import("@/pages/public/BlogDetailPage").then((m) => ({ default: m.BlogDetailPage })));
const EventsPage = lazy(() => import("@/pages/public/EventsPage").then((m) => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import("@/pages/public/EventDetailPage").then((m) => ({ default: m.EventDetailPage })));
const TripPlannerPage = lazy(() => import("@/pages/public/TripPlannerPage").then((m) => ({ default: m.TripPlannerPage })));
const MapExplorerPage = lazy(() => import("@/pages/public/MapExplorerPage").then((m) => ({ default: m.MapExplorerPage })));
const AboutPage = lazy(() => import("@/pages/public/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/pages/public/ContactPage").then((m) => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import("@/pages/public/FaqPage").then((m) => ({ default: m.FaqPage })));
const TermsPage = lazy(() => import("@/pages/public/TermsPage").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("@/pages/public/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import("@/pages/public/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

// 2. Auth Pages (Code-split)
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));

// 3. Tourist User Protected Pages (Code-split)
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const MyFavoritesPage = lazy(() => import("@/pages/user/MyFavoritesPage").then((m) => ({ default: m.MyFavoritesPage })));
const MyReviewsPage = lazy(() => import("@/pages/user/MyReviewsPage").then((m) => ({ default: m.MyReviewsPage })));

// Helper component to redirect any /admin requests to the standalone Admin app (Port 5174)
function RedirectToAdmin() {
  useEffect(() => {
    window.location.replace("http://localhost:5174");
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-medium text-sm">Redirecting to CamGO Admin Panel (Port 5174)...</p>
      </div>
    </div>
  );
}

function App() {
  const { checkAuth } = useAuthStore();
  const { fetchSettings } = useSettingsStore();
  const { i18n } = useTranslation();

  // Root language synchronization: switches html[lang] on every language change
  useEffect(() => {
    const currentLang = i18n.language === "en" ? "en" : "km";
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, [checkAuth, fetchSettings]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>CamGO - Explore Cambodian Tourism Wonders</title>
        <meta
          name="description"
          content="Official tourism promotion portal for Cambodia. Explore 25 provinces, ancient Angkor temples, tropical islands, and authentic Khmer cultural heritage."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CamGO - Travel Cambodia" />
        <meta
          property="og:description"
          content="Your ultimate gateway to the Kingdom of Wonder. 25 provinces, 24+ attractions, reviews, and travel guides."
        />
      </Helmet>

      <BrowserRouter>
        <Routes>
          {/* 1. PUBLIC & TOURIST ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
            <Route path="/provinces" element={<ProvincesPage />} />
            <Route path="/provinces/:slug" element={<ProvinceDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/map" element={<MapExplorerPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms-of-use" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />

            {/* Tourist Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <MyFavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute>
                  <MyReviewsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback within Public Layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* 2. AUTH ROUTES */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* 3. REDIRECT TO ADMIN PORTAL (Port 5174) */}
          <Route path="/admin" element={<RedirectToAdmin />} />
          <Route path="/admin/*" element={<RedirectToAdmin />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
