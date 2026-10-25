import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Star,
  Tag,
  BarChart3,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { PortalLayout } from "@/layouts/PortalLayout";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export const AdminLayout = () => {
  const { t, i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const { user, hasPermission } = useAuthStore();
  const canModerateReviews = hasPermission("business.reviews.moderate");

  const { data: pendingReviewsCount = 0 } = useQuery({
    queryKey: ["admin", "business", "reviews", "pendingCount"],
    queryFn: async () => {
      const res = await api.get("/admin/business/reviews?status=pending&per_page=1");
      return res.data?.data?.pending_count ?? res.data?.pending_count ?? 0;
    },
    enabled: canModerateReviews,
    staleTime: 60 * 1000,
  });

  const navItems = [
    {
      to: "/admin",
      icon: LayoutDashboard,
      label: t("nav.dashboard", "Dashboard"),
      end: true,
    },
    {
      to: "/admin/businesses",
      icon: Store,
      label: t("nav.businesses", "Businesses"),
      end: true,
    },
    {
      to: "/admin/businesses/create",
      icon: PlusCircle,
      label: t("nav.create_business", "Add Business"),
      show: hasPermission("business.create"),
    },
    {
      to: "/admin/reviews",
      icon: Star,
      label: t("nav.reviews", "Review Moderation"),
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
      show: hasPermission("business.reviews.moderate"),
    },
    {
      to: "/admin/billing",
      icon: CreditCard,
      label: t("nav.billing", "Billing & Payments"),
      show:
        hasPermission("subscriptions.manage") &&
        hasPermission("plans.manage") &&
        hasPermission("payments.verify"),
    },
    {
      to: "/admin/categories",
      icon: Tag,
      label: t("nav.categories", "Categories"),
      show: hasPermission("business.categories.manage"),
    },
    {
      to: "/admin/stats",
      icon: BarChart3,
      label: t("nav.stats", "Analytics & Reports"),
      show: hasPermission("business.stats.view"),
    },
    {
      to: "/admin/audit-logs",
      icon: ShieldCheck,
      label: t("nav.audit_logs", "Audit Logs"),
    },
  ];

  return (
    <PortalLayout
      brandTitle={isKm ? "CamGO" : "CamGO"}
      brandSubtitle={isKm ? "មជ្ឈមណ្ឌលអាជីវកម្ម" : "Business Control Center"}
        portalName="CamGO Business Admin"
      roleLabel={isKm ? "បុគ្គលិក" : "Staff"}
      userSubtitle={user?.email || "admin@khemaramorodok.com"}
      navItems={navItems}
      mode="staff"
      accent="gold"
      externalLink={{
        href: "http://localhost:5174",
        label: t("nav.travel_admin", "Travel Admin Panel"),
      }}
    />
  );
};
