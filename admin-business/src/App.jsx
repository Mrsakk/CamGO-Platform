import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { AdminLayout } from "@/layouts/AdminLayout";
import { OwnerLayout } from "@/layouts/OwnerLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminRoute } from "@/components/common/AdminRoute";
import { OwnerRoute, OwnerCapabilityRoute } from "@/components/common/OwnerRoute";
import { LoadingFallback } from "@/components/common/LoadingFallback";

// 1. Auth Pages
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const SetPasswordPage = lazy(() =>
  import("@/pages/auth/SetPasswordPage").then((m) => ({ default: m.SetPasswordPage }))
);

// 2. Admin Business Pages (Code-split)
const AdminBusinessDashboardPage = lazy(() =>
  import("@/pages/admin/AdminBusinessDashboardPage").then((m) => ({
    default: m.AdminBusinessDashboardPage,
  }))
);
const AdminBusinessesPage = lazy(() =>
  import("@/pages/admin/AdminBusinessesPage").then((m) => ({
    default: m.AdminBusinessesPage,
  }))
);
const AdminBusinessFormPage = lazy(() =>
  import("@/pages/admin/AdminBusinessFormPage").then((m) => ({
    default: m.AdminBusinessFormPage,
  }))
);
const AdminBusinessReviewsPage = lazy(() =>
  import("@/pages/admin/AdminBusinessReviewsPage").then((m) => ({
    default: m.AdminBusinessReviewsPage,
  }))
);
const AdminBusinessCategoriesPage = lazy(() =>
  import("@/pages/admin/AdminBusinessCategoriesPage").then((m) => ({
    default: m.AdminBusinessCategoriesPage,
  }))
);
const AdminBusinessReportsPage = lazy(() =>
  import("@/pages/admin/AdminBusinessReportsPage").then((m) => ({
    default: m.AdminBusinessReportsPage,
  }))
);
const AdminBusinessAuditLogsPage = lazy(() =>
  import("@/pages/admin/AdminBusinessAuditLogsPage").then((m) => ({
    default: m.AdminBusinessAuditLogsPage,
  }))
);
const AdminBillingPage = lazy(() =>
  import("@/pages/admin/AdminBillingPage").then((m) => ({
    default: m.AdminBillingPage,
  }))
);

// 3. Business Owner Pages (Code-split)
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
const OwnerSubscriptionPage = lazy(() =>
  import("@/pages/owner/OwnerSubscriptionPage").then((m) => ({
    default: m.OwnerSubscriptionPage,
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
  <Suspense fallback={<LoadingFallback />}>
    {capability ? (
      <OwnerCapabilityRoute capability={capability}>
        {children}
      </OwnerCapabilityRoute>
    ) : (
      children
    )}
  </Suspense>
);

const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, isBusinessOwner } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isBusinessOwner && !isAdmin) {
    return <Navigate to="/owner" replace />;
  }

  return <Navigate to={isAdmin ? "/admin" : "/login"} replace />;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>CamGO Business Admin</title>
        <meta
          name="description"
          content="Staff administration portal for the CamGO Business Directory."
        />
      </Helmet>

      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

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

            {/* Staff Portal */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessDashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="businesses"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessesPage />
                  </Suspense>
                }
              />
              <Route
                path="businesses/create"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessFormPage />
                  </Suspense>
                }
              />
              <Route
                path="businesses/:id/edit"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessFormPage />
                  </Suspense>
                }
              />
              <Route
                path="reviews"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessReviewsPage />
                  </Suspense>
                }
              />
              <Route
                path="categories"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessCategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="stats"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessReportsPage />
                  </Suspense>
                }
              />
              <Route
                path="billing"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBillingPage />
                  </Suspense>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessAuditLogsPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Business Owner Portal */}
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

            <Route
              path="/accept-invite/:token"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AcceptInvitePage />
                </Suspense>
              }
            />

            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
