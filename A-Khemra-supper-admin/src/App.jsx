import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminRoute } from "@/components/common/AdminRoute";
import { LoadingFallback } from "@/components/common/LoadingFallback";

// 1. Auth Pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));

// 2. Admin Panel Pages (Code-split with React.lazy)
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminDestinationsPage = lazy(() => import("@/pages/admin/AdminDestinationsPage").then((m) => ({ default: m.AdminDestinationsPage })));
const AdminDestinationFormPage = lazy(() => import("@/pages/admin/AdminDestinationFormPage").then((m) => ({ default: m.AdminDestinationFormPage })));
const AdminReviewsPage = lazy(() => import("@/pages/admin/AdminReviewsPage").then((m) => ({ default: m.AdminReviewsPage })));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })));
const AdminProvincesPage = lazy(() => import("@/pages/admin/AdminProvincesPage").then((m) => ({ default: m.AdminProvincesPage })));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/AdminCategoriesPage").then((m) => ({ default: m.AdminCategoriesPage })));
const AdminBlogPage = lazy(() => import("@/pages/admin/AdminBlogPage").then((m) => ({ default: m.AdminBlogPage })));
const AdminEventsPage = lazy(() => import("@/pages/admin/AdminEventsPage").then((m) => ({ default: m.AdminEventsPage })));
const AdminBannersPage = lazy(() => import("@/pages/admin/AdminBannersPage").then((m) => ({ default: m.AdminBannersPage })));
const AdminFaqsPage = lazy(() => import("@/pages/admin/AdminFaqsPage").then((m) => ({ default: m.AdminFaqsPage })));
const AdminPagesPage = lazy(() => import("@/pages/admin/AdminPagesPage").then((m) => ({ default: m.AdminPagesPage })));
const AdminContactPage = lazy(() => import("@/pages/admin/AdminContactPage").then((m) => ({ default: m.AdminContactPage })));
const AdminSubscribersPage = lazy(() => import("@/pages/admin/AdminSubscribersPage").then((m) => ({ default: m.AdminSubscribersPage })));
const AdminRolesPage = lazy(() => import("@/pages/admin/AdminRolesPage").then((m) => ({ default: m.AdminRolesPage })));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/AdminAuditLogsPage").then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminBusinessPortalPage = lazy(() => import("@/pages/admin/AdminBusinessPortalPage").then((m) => ({ default: m.AdminBusinessPortalPage })));
const AdminBillingPage = lazy(() => import("@/pages/admin/AdminBillingPage").then((m) => ({ default: m.AdminBillingPage })));

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>CamGO Admin - Control Center</title>
        <meta
          name="description"
          content="Administrative control center for CamGO Tourism Platform."
        />
      </Helmet>

      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to /admin */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* Auth Layout for Login */}
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
                path="/forgot-password"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ForgotPasswordPage />
                  </Suspense>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ResetPasswordPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Admin Panel Protected Routes */}
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
                    <AdminDashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="destinations"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminDestinationsPage />
                  </Suspense>
                }
              />
              <Route
                path="destinations/create"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminDestinationFormPage />
                  </Suspense>
                }
              />
              <Route
                path="destinations/:id/edit"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminDestinationFormPage />
                  </Suspense>
                }
              />
              <Route
                path="reviews"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminReviewsPage key="destinations" initialTab="destinations" />
                  </Suspense>
                }
              />
              <Route
                path="testimonials"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminReviewsPage key="testimonials" initialTab="testimonials" />
                  </Suspense>
                }
              />
              <Route
                path="users"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminUsersPage />
                  </Suspense>
                }
              />
              <Route
                path="provinces"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminProvincesPage />
                  </Suspense>
                }
              />
              <Route
                path="categories"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminCategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="blog"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBlogPage />
                  </Suspense>
                }
              />
              <Route
                path="events"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminEventsPage />
                  </Suspense>
                }
              />
              <Route
                path="banners"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBannersPage />
                  </Suspense>
                }
              />
              <Route
                path="faqs"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminFaqsPage />
                  </Suspense>
                }
              />
              <Route
                path="pages"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminPagesPage />
                  </Suspense>
                }
              />
              <Route
                path="contacts"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminContactPage />
                  </Suspense>
                }
              />
              <Route
                path="subscribers"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminSubscribersPage />
                  </Suspense>
                }
              />
              <Route
                path="roles"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminRolesPage />
                  </Suspense>
                }
              />
              <Route
                path="settings"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminSettingsPage />
                  </Suspense>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminAuditLogsPage />
                  </Suspense>
                }
              />
              <Route
                path="business-portal"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminBusinessPortalPage />
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
            </Route>

            {/* Catch-all route redirects back to /admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
