import api from "./axios";

const prefetchedUrls = new Set();

/**
 * Prefetches both the JS chunk and the initial TanStack query for a target route.
 * Triggered on pointerenter / hover in sidebar and navigation links.
 */
export const prefetchRoute = (to, queryClient) => {
  if (!to || prefetchedUrls.has(to)) return;
  prefetchedUrls.add(to);

  try {
    switch (to) {
      case "/admin":
        import("@/pages/admin/AdminBusinessDashboardPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin", "business", "stats"],
          queryFn: async () => {
            const res = await api.get("/admin/business/stats");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/admin/businesses":
        import("@/pages/admin/AdminBusinessesPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin", "businesses", { page: 1, search: "", status: "", missingInfo: false, categoryId: "", provinceId: "" }],
          queryFn: async () => {
            const res = await api.get("/admin/business/businesses?page=1");
            return res.data;
          },
        });
        break;

      case "/admin/businesses/create":
        import("@/pages/admin/AdminBusinessFormPage");
        break;

      case "/admin/reviews":
        import("@/pages/admin/AdminBusinessReviewsPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin", "reviews", "pending", 1],
          queryFn: async () => {
            const res = await api.get("/admin/business/reviews", { params: { page: 1, per_page: 15, status: "pending" } });
            return res.data;
          },
        });
        break;

      case "/admin/billing":
        import("@/pages/admin/AdminBillingPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin-billing", "stats"],
          queryFn: async () => {
            const res = await api.get("/admin/business/billing/stats");
            return res.data?.data || {};
          },
        });
        queryClient?.prefetchQuery?.({
          queryKey: ["admin-billing", "plans"],
          queryFn: async () => {
            const res = await api.get("/admin/business/billing/plans");
            return res.data?.data || [];
          },
        });
        break;

      case "/admin/categories":
        import("@/pages/admin/AdminBusinessCategoriesPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin", "categories"],
          queryFn: async () => {
            const res = await api.get("/admin/business/categories");
            return res.data;
          },
        });
        break;

      case "/admin/stats":
        import("@/pages/admin/AdminBusinessReportsPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin", "business", "stats"],
          queryFn: async () => {
            const res = await api.get("/admin/business/stats");
            return res.data;
          },
        });
        break;

      case "/admin/audit-logs":
        import("@/pages/admin/AdminBusinessAuditLogsPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["admin", "audit-logs", 1, ""],
          queryFn: async () => {
            const res = await api.get("/admin/business/audit-logs", { params: { page: 1, per_page: 20 } });
            return res.data;
          },
        });
        break;

      case "/owner":
        import("@/pages/owner/OwnerDashboardPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-stats", "30d"],
          queryFn: async () => {
            const res = await api.get("/business/owner/stats?range=30d");
            return res.data?.data || res.data;
          },
        });
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-my-business"],
          queryFn: async () => {
            const res = await api.get("/business/owner/my-business");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/owner/my-business":
        import("@/pages/owner/OwnerBusinessProfilePage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-my-business"],
          queryFn: async () => {
            const res = await api.get("/business/owner/my-business");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/owner/kyc":
        import("@/pages/owner/OwnerKycPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-my-business"],
          queryFn: async () => {
            const res = await api.get("/business/owner/my-business");
            return res.data?.data || res.data;
          },
        });
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-kyc-documents"],
          queryFn: async () => {
            const res = await api.get("/business/owner/kyc");
            return res.data?.data || [];
          },
        });
        break;

      case "/owner/leads":
        import("@/pages/owner/OwnerLeadsPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-leads", "all", 1],
          queryFn: async () => {
            const res = await api.get("/business/owner/leads", { params: { page: 1, per_page: 15 } });
            return res.data;
          },
        });
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-lead-stats"],
          queryFn: async () => {
            const res = await api.get("/business/owner/leads/stats?days=90");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/owner/reviews":
        import("@/pages/owner/OwnerReviewsPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-reviews", "approved", 1],
          queryFn: async () => {
            const res = await api.get("/business/owner/reviews", { params: { page: 1, per_page: 15, status: "approved" } });
            return res.data;
          },
        });
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-review-stats"],
          queryFn: async () => {
            const res = await api.get("/business/owner/reviews/stats");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/owner/notifications":
        import("@/pages/owner/OwnerNotificationsPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-notifications", false, 1],
          queryFn: async () => {
            const res = await api.get("/business/owner/notifications", { params: { page: 1, per_page: 20 } });
            return res.data;
          },
        });
        break;

      case "/owner/team":
        import("@/pages/owner/OwnerTeamPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-team"],
          queryFn: async () => {
            const res = await api.get("/business/owner/team");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/owner/subscription":
        import("@/pages/owner/OwnerSubscriptionPage");
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-subscription"],
          queryFn: async () => {
            const res = await api.get("/business/owner/subscription");
            return res.data?.data || res.data;
          },
        });
        queryClient?.prefetchQuery?.({
          queryKey: ["owner-subscription-plans"],
          queryFn: async () => {
            const res = await api.get("/business/owner/plans");
            return res.data?.data || res.data;
          },
        });
        break;

      case "/owner/help":
        import("@/pages/owner/OwnerHelpPage");
        break;

      default:
        break;
    }
  } catch (_e) {
    // Ignore prefetch errors gracefully
  }
};
