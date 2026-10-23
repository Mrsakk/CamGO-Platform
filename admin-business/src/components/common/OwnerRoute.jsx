import { Navigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const OwnerAccessDenied = ({ isKm }) => (
  <div className="mx-auto mt-16 max-w-lg rounded-[32px] border border-sage-deep bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-850">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
      <ShieldAlert className="w-7 h-7" />
    </div>
    <h1 className="mt-5 text-2xl text-forest dark:text-white">
      {isKm ? "អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ" : "You do not have access to this page"}
    </h1>
    <p className="mt-2 text-sm leading-relaxed text-muted dark:text-stone-400">
      {isKm
        ? "សូមទាក់ទងម្ចាស់អាជីវកម្ម ដើម្បីស្នើសុំសិទ្ធិបន្ថែម។"
        : "Ask the business owner to grant you the required permission."}
    </p>
    <Link
      to="/owner"
      className="mt-6 inline-flex rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-forest transition hover:bg-brand-400"
    >
      {isKm ? "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង" : "Back to dashboard"}
    </Link>
  </div>
);

export const OwnerCapabilityRoute = ({ capability, children }) => {
  const { i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const hasBusinessCapability = useAuthStore((state) => state.hasBusinessCapability);

  if (!user || !hasBusinessCapability(capability)) {
    return <OwnerAccessDenied isKm={i18n.language === "km"} />;
  }

  return children;
};

export const OwnerRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isBusinessOwner } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isBusinessOwner) {
    return <Navigate to={isAdmin ? "/admin" : "/login"} replace />;
  }

  return children;
};
