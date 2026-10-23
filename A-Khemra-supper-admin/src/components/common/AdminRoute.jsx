import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const staffRoles = [
    "super_admin",
    "content_manager",
    "moderator",
    "Super Admin",
    "Content Manager",
    "Moderator",
    "admin",
    "Admin"
  ];
  const hasStaffRole = user?.roles?.some((r) => staffRoles.includes(r));
  if (!isAdmin && !hasStaffRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};
export {
  AdminRoute
};
