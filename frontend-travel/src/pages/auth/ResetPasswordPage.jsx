import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setIsLoading(true);
      await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      toast.success("Password successfully reset! Please sign in with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-km">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-small font-semibold">
          <RumduolFlower className="w-3.5 h-3.5 text-amber-500" />
          <span>Rekeying Explorer Pass</span>
        </div>
        <h2 className="text-h2 font-bold font-heading text-white tracking-tight">
          Create New Password
        </h2>
        <p className="text-body text-stone-300 max-w-prose mx-auto leading-relaxed">
          Establish a new secure access key for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-small text-stone-200 mb-1.5 font-semibold">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stone-950/90 border border-stone-700 text-white placeholder-stone-500 text-body focus:outline-none focus:border-amber-500 font-km transition-colors"
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label className="block text-small text-stone-200 mb-1.5 font-semibold">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stone-950/90 border border-stone-700 text-white placeholder-stone-500 text-body focus:outline-none focus:border-amber-500 font-km transition-colors"
              required
              minLength={8}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-body shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Access Key...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Lock Pass</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-stone-800">
        <Link
          to="/login"
          className="text-small text-stone-400 hover:text-amber-400 inline-flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export { ResetPasswordPage };
