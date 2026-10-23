import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center dark:bg-stone-900">
        <div className="w-full max-w-md rounded-[32px] border border-sage-deep bg-white p-8 dark:border-stone-800 dark:bg-stone-850">
        <h1 className="mb-2 text-2xl text-rose-600">
          ការចូលប្រើត្រូវបានបដិសេធ / Access Denied
        </h1>
        <p className="mb-5 max-w-md text-sm text-muted dark:text-stone-400">
          អ្នកមិនមានសិទ្ធិចូលប្រើផ្ទាំងគ្រប់គ្រងបុគ្គលិកទេ។
          / You do not have staff portal access.
        </p>
        <button
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }}
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          ចូលជាមួយគណនីផ្សេង / Login with another account
        </button>
        </div>
      </div>
    );
  }

  return children;
};
