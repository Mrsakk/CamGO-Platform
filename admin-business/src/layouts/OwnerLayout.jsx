import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Star,
  Store,
  Users,
} from "lucide-react";
import { PortalLayout } from "@/layouts/PortalLayout";
import api from "@/lib/axios";
import { getPublicBusinessUrl } from "@/lib/publicUrls";
import { useAuthStore } from "@/store/authStore";

const roleLabels = {
  owner: { km: "ម្ចាស់អាជីវកម្ម", en: "Owner" },
  manager: { km: "អ្នកគ្រប់គ្រង", en: "Manager" },
  editor: { km: "អ្នកកែសម្រួល", en: "Editor" },
  viewer: { km: "អ្នកមើល", en: "Viewer" },
};

export const OwnerLayout = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const { user, hasBusinessCapability } = useAuthStore();

  const business = user?.business;
  const businessName = business?.name_km || business?.name_en;
  const role = user?.business_role || (hasBusinessCapability("team.manage") ? "owner" : "viewer");
  const roleLabel = roleLabels[role]?.[isKm ? "km" : "en"] || role;

  const canViewNotifications = hasBusinessCapability("notifications.view");

  const { data: unread } = useQuery({
    queryKey: ["owner-unread-notifications"],
    queryFn: async () => {
      const res = await api.get("/business/owner/notifications/unread-count");
      return res.data?.data?.unread_count || 0;
    },
    enabled: canViewNotifications,
    refetchInterval: 60000,
  });

  const navItems = [
    {
      to: "/owner",
      icon: LayoutDashboard,
      label: isKm ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard",
      end: true,
      show: hasBusinessCapability("stats.view"),
    },
    {
      to: "/owner/my-business",
      icon: Store,
      label: isKm ? "អាជីវកម្មរបស់ខ្ញុំ" : "My Business",
      end: true,
      show: hasBusinessCapability("business.view"),
    },
    {
      to: "/owner/kyc",
      icon: ShieldCheck,
      label: isKm ? "ការផ្ទៀងផ្ទាត់ KYC" : "KYC Verification",
      end: true,
      show: hasBusinessCapability("kyc.manage"),
    },
    {
      to: "/owner/leads",
      icon: MessageSquare,
      label: isKm ? "អតិថិជនចាប់អារម្មណ៍" : "Customer Leads",
      end: true,
      show: hasBusinessCapability("leads.view"),
    },
    {
      to: "/owner/reviews",
      icon: Star,
      label: isKm ? "ការវាយតម្លៃ" : "Reviews",
      end: true,
      show: hasBusinessCapability("reviews.view"),
    },
    {
      to: "/owner/notifications",
      icon: Bell,
      label: isKm ? "ការជូនដំណឹង" : "Notifications",
      end: true,
      badge: unread > 0 ? unread : null,
      show: canViewNotifications,
    },
    {
      to: "/owner/team",
      icon: Users,
      label: isKm ? "ក្រុមការងារ" : "Team",
      end: true,
      show: hasBusinessCapability("team.manage"),
    },
    {
      to: "/owner/subscription",
      icon: CreditCard,
      label: isKm ? "ការជាវ និងការទូទាត់" : "Subscription",
      end: true,
      show: hasBusinessCapability("billing.manage"),
    },
    {
      to: "/owner/help",
      icon: HelpCircle,
      label: isKm ? "ជំនួយ និងការណែនាំ" : "Help & Guide",
      end: true,
      show: true,
    },
  ];

  return (
    <PortalLayout
      brandTitle={isKm ? "CamGO" : "CamGO"}
      brandSubtitle={isKm ? "ផ្ទាំងអាជីវកម្ម" : "Business Portal"}
      portalName="Business Owner Portal"
      roleLabel={roleLabel}
      userSubtitle={businessName || user?.email}
      navItems={navItems}
      mode="owner"
      accent="amber"
      ownerBadgeLabel={isKm ? "ផ្ទាំងម្ចាស់អាជីវកម្ម" : "Owner Portal"}
      externalLink={
        business?.slug
          ? {
              href: getPublicBusinessUrl(business.slug),
              label: isKm ? "មើលទំព័រសាធារណៈ" : "View Public Profile",
            }
          : null
      }
    />
  );
};
