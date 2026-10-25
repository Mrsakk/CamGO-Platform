import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { queryClient, MAX_CACHE_AGE } from "@/lib/queryClient";
import { createIdbPersister } from "@/lib/persister";

const idbPersister = createIdbPersister("CAMGO_BUSINESS_CACHE");

const persistOptions = {
  persister: idbPersister,
  maxAge: MAX_CACHE_AGE,
  buster: "kmb-perf-v2",
  dehydrateOptions: {
    // Only persist public directory, categories, and home data
    // NEVER persist owner private data, KYC, leads, tokens, or team records
    shouldDehydrateQuery: (query) => {
      if (query.state.status !== "success" || !Array.isArray(query.queryKey)) {
        return false;
      }
      const rootKey = query.queryKey[0];
      const sensitiveKeys = ["owner", "auth", "token", "kyc", "leads", "team", "subscription"];
      if (sensitiveKeys.includes(rootKey)) {
        return false;
      }
      return ["business", "categories", "home", "directory"].includes(rootKey);
    },
  },
};
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { OwnerLayout } from "@/layouts/OwnerLayout";
import { OwnerCapabilityRoute, OwnerRoute } from "@/components/common/OwnerRoute";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { useAuthStore } from "@/store/authStore";

// Public pages
const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const DirectoryPage = lazy(() =>
  import("@/pages/DirectoryPage").then((m) => ({ default: m.DirectoryPage }))
);
const BusinessProfilePage = lazy(() =>
  import("@/pages/BusinessProfilePage").then((m) => ({
    default: m.BusinessProfilePage,
  }))
);
const PricingPage = lazy(() =>
  import("@/pages/PricingPage").then((m) => ({ default: m.PricingPage }))
);
const ListBusinessPage = lazy(() =>
  import("@/pages/ListBusinessPage").then((m) => ({
    default: m.ListBusinessPage,
  }))
);
const AboutPage = lazy(() =>
  import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage }))
);
const PrivacyPage = lazy(() =>
  import("@/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage }))
);
const TermsPage = lazy(() =>
  import("@/pages/TermsPage").then((m) => ({ default: m.TermsPage }))
);

// Auth pages
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const SetPasswordPage = lazy(() =>
  import("@/pages/auth/SetPasswordPage").then((m) => ({
    default: m.SetPasswordPage,
  }))
);

// Owner pages
const OwnerDashboardPage = lazy(() =>
  import("@/pages/owner/OwnerDashboardPage").then((m) => ({
    default: m.OwnerDashboardPage,
  }))
);
const OwnerBusinessProfilePage = lazy(() =>
  import("@/pages/owner/OwnerBusinessProfilePage").then((m) => ({
    default: m.OwnerBusinessProfilePage,
  }))
);
const OwnerKycPage = lazy(() =>
  import("@/pages/owner/OwnerKycPage").then((m) => ({
    default: m.OwnerKycPage,
  }))
);
const OwnerSubscriptionPage = lazy(() =>
  import("@/pages/owner/OwnerSubscriptionPage").then((m) => ({
    default: m.OwnerSubscriptionPage,
  }))
);
const OwnerLeadsPage = lazy(() =>
  import("@/pages/owner/OwnerLeadsPage").then((m) => ({
    default: m.OwnerLeadsPage,
  }))
);
const OwnerReviewsPage = lazy(() =>
  import("@/pages/owner/OwnerReviewsPage").then((m) => ({
    default: m.OwnerReviewsPage,
  }))
);
const OwnerNotificationsPage = lazy(() =>
  import("@/pages/owner/OwnerNotificationsPage").then((m) => ({
    default: m.OwnerNotificationsPage,
  }))
);
const OwnerTeamPage = lazy(() =>
  import("@/pages/owner/OwnerTeamPage").then((m) => ({
    default: m.OwnerTeamPage,
  }))
);
const OwnerHelpPage = lazy(() =>
  import("@/pages/owner/OwnerHelpPage").then((m) => ({
    default: m.OwnerHelpPage,
  }))
);
const AcceptInvitePage = lazy(() =>
  import("@/pages/owner/AcceptInvitePage").then((m) => ({
    default: m.AcceptInvitePage,
  }))
);

const OwnerPage = ({ capability, children }) => (
  <OwnerCapabilityRoute capability={capability}>
    <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
  </OwnerCapabilityRoute>
);

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>CamGO Business | CamGO Business</title>
        <meta
          name="description"
          content="Cambodia direct tourism business directory: hotels, restaurants, local guides, crafts, and transport."
        />
      </Helmet>

      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="businesses"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DirectoryPage />
                  </Suspense>
                }
              />
              <Route
                path="b/:slug"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <BusinessProfilePage />
                  </Suspense>
                }
              />
              <Route
                path="pricing"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PricingPage />
                  </Suspense>
                }
              />
              <Route
                path="list-your-business"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ListBusinessPage />
                  </Suspense>
                }
              />
              <Route
                path="about"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AboutPage />
                  </Suspense>
                }
              />
              <Route
                path="contact"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ContactPage />
                  </Suspense>
                }
              />
              <Route
                path="privacy"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PrivacyPage />
                  </Suspense>
                }
              />
              <Route
                path="terms"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TermsPage />
                  </Suspense>
                }
              />
            </Route>

            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route
                path="/set-password"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SetPasswordPage />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="/accept-invite/:token"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AcceptInvitePage />
                </Suspense>
              }
            />

            <Route
              path="/owner"
              element={
                <OwnerRoute>
                  <OwnerLayout />
                </OwnerRoute>
              }
            >
              <Route
                index
                element={
                  <OwnerPage capability="stats.view">
                    <OwnerDashboardPage />
                  </OwnerPage>
                }
              />
              <Route
                path="my-business"
                element={
                  <OwnerPage capability="business.view">
                    <OwnerBusinessProfilePage />
                  </OwnerPage>
                }
              />
              <Route
                path="kyc"
                element={
                  <OwnerPage capability="kyc.manage">
                    <OwnerKycPage />
                  </OwnerPage>
                }
              />
              <Route
                path="leads"
                element={
                  <OwnerPage capability="leads.view">
                    <OwnerLeadsPage />
                  </OwnerPage>
                }
              />
              <Route
                path="reviews"
                element={
                  <OwnerPage capability="reviews.view">
                    <OwnerReviewsPage />
                  </OwnerPage>
                }
              />
              <Route
                path="notifications"
                element={
                  <OwnerPage capability="notifications.view">
                    <OwnerNotificationsPage />
                  </OwnerPage>
                }
              />
              <Route
                path="team"
                element={
                  <OwnerPage capability="team.manage">
                    <OwnerTeamPage />
                  </OwnerPage>
                }
              />
              <Route
                path="subscription"
                element={
                  <OwnerPage capability="billing.manage">
                    <OwnerSubscriptionPage />
                  </OwnerPage>
                }
              />
              <Route
                path="help"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <OwnerHelpPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PersistQueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
