import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

type Step = "email" | "login" | "set-password";

const inputClass =
  "w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all";

const LoginPage = () => {
  const navigate = useNavigate();
  const { checkEmail, login, setPassword } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Corporate email is required.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await checkEmail(email.trim());
      setUserName(result.name);
      setStep(result.has_password ? "login" : "set-password");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Password is required.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Password is required.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await setPassword(email.trim(), password, confirmPassword);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set password.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setPasswordValue("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Lexis AI</h1>
            <p className="text-[0.625rem] text-slate-500 uppercase tracking-widest">
              Legal Intelligence Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">

          {/* Step: email */}
          {step === "email" && (
            <>
              <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
              <p className="text-slate-400 text-sm mb-8">Enter your corporate email to continue.</p>

              <form onSubmit={handleContinue} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[0.625rem] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      autoFocus
                      className={inputClass}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black border border-purple-400/30 font-bold rounded-xl shadow-[0_0_1.875rem_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? "Checking..." : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Step: returning user login */}
          {step === "login" && (
            <>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">
                Welcome back
              </p>
              <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
              <p className="text-slate-400 text-sm mb-8">Enter your password to sign in.</p>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-[0.625rem] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      autoFocus
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black border border-purple-400/30 font-bold rounded-xl shadow-[0_0_1.875rem_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
                >
                  Not you? Use a different email
                </button>
              </form>
            </>
          )}

          {/* Step: new employee set password */}
          {step === "set-password" && (
            <>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">
                Hey {userName}
              </p>
              <h2 className="text-2xl font-bold text-white mb-1">Set your password</h2>
              <p className="text-slate-400 text-sm mb-8">
                Welcome to Lexis AI. Start by creating a password for your account.
              </p>

              <form onSubmit={handleSetPassword} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="text-[0.625rem] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      autoFocus
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-[0.625rem] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black border border-purple-400/30 font-bold rounded-xl shadow-[0_0_1.875rem_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? "Setting password..." : "Set Password & Sign In"}
                </Button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Access is restricted to registered company personnel only.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
