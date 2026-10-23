import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, LogIn, Loader2, Shield, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide email and password");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await login({ email, password });
      toast.success(t("auth.login_success", "Welcome back!"));
      if (useAuthStore.getState().isAdmin && from === "/") {
        navigate("/admin");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please check your email and password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-900">
      <div className="text-center space-y-1">
        <span className="text-small font-semibold text-laterite-600 dark:text-laterite-400 block tracking-wide uppercase">
          PORTAL AUTHENTICATION
        </span>
        <h2 className="text-heading font-bold tracking-tight text-stone-900 dark:text-stone-900">
          {t("auth.welcome_back", "Sign In")}
        </h2>
        <p className="text-small text-stone-600 dark:text-stone-400">
          {t("auth.login_subtitle", "Sign in to access your saved trips & reviews")}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-danger-600/10 border border-danger-600/30 text-small text-danger-600 font-medium">
          {error}
        </div>
      )}

      {/* Quick Demo Login Preset Buttons */}
      <div className="p-3.5 rounded-xl bg-stone-200/50 dark:bg-stone-800/50 border border-stone-300 dark:border-stone-300 space-y-2">
        <span className="text-small font-semibold text-stone-700 dark:text-stone-700 block text-center">
          Demo Accounts
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@khemaramorodok.com", "password123")}
            className="p-2.5 rounded-xl btn-secondary text-small font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("sokha@example.com", "password123")}
            className="p-2.5 rounded-xl btn-secondary text-small font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-river-600" />
            <span>Tourist</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-small font-semibold text-stone-700 dark:text-stone-700 mb-1.5">
            {t("auth.email", "Email Address")}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl input-carved text-body"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-small font-semibold text-stone-700 dark:text-stone-700">
              {t("auth.password", "Password")}
            </label>
            <Link
              to="/forgot-password"
              className="text-small text-river-600 hover:underline"
            >
              {t("auth.forgot_password", "Forgot password?")}
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl input-carved text-body"
              required
            />
          </div>
        </div>

        {/* Single Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] rounded-xl btn-primary text-body font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{t("auth.login", "Sign In")}</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-stone-200 dark:border-stone-800 text-small">
        <span className="text-stone-600 dark:text-stone-400">Don't have an account? </span>
        <Link to="/register" className="text-laterite-600 dark:text-laterite-400 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export { LoginPage };
