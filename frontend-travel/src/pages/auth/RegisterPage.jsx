import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Mail, Lock, UserPlus, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuthStore();

  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError(t("auth.password_mismatch", "Passwords do not match"));
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await register(formData);
      toast.success(t("auth.register_success", "Account created successfully!"));
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check your information.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-stone-900 dark:text-stone-100">
      <div className="text-center space-y-1">
        <span className="text-small font-semibold text-laterite-600 dark:text-laterite-400 block tracking-wide uppercase">
          CREATE ACCOUNT
        </span>
        <h2 className="text-heading font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t("auth.create_account", "Register")}
        </h2>
        <p className="text-small text-stone-600 dark:text-stone-400">
          Save Cambodian wonders and share reviews
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-danger-600/10 border border-danger-600/30 text-small text-danger-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-small font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {t("auth.full_name", "Full Name")} *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sokha Chan"
              className="w-full h-11 !pl-11 pr-3.5 rounded-xl input-carved text-body text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-small font-semibold text-stone-700 dark:text-stone-300 mb-1">
            {t("auth.email", "Email Address")} *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full h-11 !pl-11 pr-3.5 rounded-xl input-carved text-body text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600"
              required
            />
          </div>
        </div>

        {/* Passwords in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-small font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t("auth.password", "Password")} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-11 !pl-11 pr-3.5 rounded-xl input-carved text-body text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label className="block text-small font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Confirm *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="••••••••"
                className="w-full h-11 !pl-11 pr-3.5 rounded-xl input-carved text-body text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600"
                required
                minLength={8}
              />
            </div>
          </div>
        </div>

        {/* Single Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] rounded-xl btn-primary text-body font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enrolling...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>{t("auth.register", "Create Account")}</span>
            </>
          )}
        </button>
      </form>

      {/* Secondary Links Below */}
      <div className="text-center pt-3 border-t border-stone-200 dark:border-stone-800 text-small">
        <span className="text-stone-600 dark:text-stone-400">Already have an account? </span>
        <Link to="/login" state={{ from: location.state?.from }} className="text-laterite-600 dark:text-laterite-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export { RegisterPage };
