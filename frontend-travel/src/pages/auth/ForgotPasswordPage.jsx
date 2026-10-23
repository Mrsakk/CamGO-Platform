import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Send, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "@/store/toastStore";
import { RumduolFlower } from "@/components/common/RumduolMotifs";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setIsLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Reset link dispatched to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch password recovery link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-km">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-small font-semibold">
          <RumduolFlower className="w-3.5 h-3.5 text-amber-500" />
          <span>Security Credential Recovery</span>
        </div>
        <h2 className="text-h2 font-bold font-heading text-white tracking-tight">
          Recover Explorer Key
        </h2>
        <p className="text-body text-stone-300 max-w-prose mx-auto leading-relaxed">
          Enter your registered email address to receive password recovery dispatch.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="font-bold text-h3 text-emerald-200">Dispatch Transmitted</h4>
          <p className="text-body text-emerald-300 leading-relaxed font-km">
            We have transmitted recovery instructions to <span className="font-bold text-white">{email}</span>.
          </p>
          <Link
            to="/login"
            className="inline-block mt-3 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-body shadow-md transition-all"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-small text-stone-200 mb-1.5 font-semibold">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stone-950/90 border border-stone-700 text-white placeholder-stone-500 text-body focus:outline-none focus:border-amber-500 font-km transition-colors"
                required
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
                <span>Dispatching Recovery...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Recovery Link</span>
              </>
            )}
          </button>
        </form>
      )}

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

export { ForgotPasswordPage };
