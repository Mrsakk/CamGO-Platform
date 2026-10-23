import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";

export const SetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const hasSetupDetails = Boolean(token && email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 10) {
      setError("Use at least 10 characters for your password.");
      return;
    }

    if (password !== confirmation) {
      setError("The two passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmation,
      });
      setSuccess(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      setError(
        firstError ||
          err.response?.data?.message ||
          "Unable to set your password. Ask an administrator for a new setup link."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasSetupDetails) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl text-forest dark:text-white">Setup link is incomplete</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted dark:text-stone-400">
            Open the full setup link from your administrator, or ask them to generate a new one.
          </p>
        </div>
        <Link
          to="/login"
          className="portal-cta"
        >
          Go to sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl text-forest dark:text-white">Password set successfully</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted dark:text-stone-400">
            Your owner account is ready. Sign in with <strong>{email}</strong> and your new password.
          </p>
        </div>
        <Link
          to="/login"
          className="portal-cta"
        >
          Sign in to your portal
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 rounded-control border border-line bg-sage/60 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-stone-200">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          Secure owner onboarding
        </div>
        <p className="mt-1 break-all text-xs text-muted dark:text-stone-400">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-control border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-forest dark:text-stone-300">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-brand-600" />
            <input
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 10 characters"
              className="portal-input pl-11"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-forest dark:text-stone-300">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-brand-600" />
            <input
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Enter the same password"
              className="portal-input pl-11"
            />
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted dark:text-stone-400">
          Use at least 10 characters. Avoid reusing a password from another service.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
              className="portal-cta w-full"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>Set password</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-relaxed text-stone-400">
        Setup links expire for security. If this link has expired, ask an administrator to generate a new one.
      </p>
    </div>
  );
};
