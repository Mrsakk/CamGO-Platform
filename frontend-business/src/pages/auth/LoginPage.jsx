import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });

      const { isBusinessOwner } = useAuthStore.getState();
      const defaultPath = isBusinessOwner ? "/owner" : "/";
      const attemptedPath = location.state?.from?.pathname;
      const canReturnToAttempted =
        attemptedPath &&
        (attemptedPath.startsWith("/accept-invite") ||
          (isBusinessOwner && attemptedPath.startsWith("/owner")));

      toast.success("ចូលប្រព័ន្ធបានជោគជ័យ / Successfully logged in");
      navigate(canReturnToAttempted ? attemptedPath : defaultPath, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "ព័ត៌មានចូលមិនត្រឹមត្រូវ ឬគណនីត្រូវបានផ្អាក។"
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-control border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-forest dark:text-stone-300">
            អ៊ីមែល / Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-brand-600" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@khemaramorodok.com"
              className="field pl-11"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-forest dark:text-stone-300">
            ពាក្យសម្ងាត់ / Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-brand-600" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field pl-11"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>ចូលប្រព័ន្ធ / Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
