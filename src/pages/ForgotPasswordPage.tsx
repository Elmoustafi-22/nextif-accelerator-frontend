import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";

type Step = "REQUEST_EMAIL" | "VERIFY_OTP" | "RESET_PASSWORD" | "SUCCESS";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<Step>("REQUEST_EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.post("/auth/password-reset-request", { email, role: "AMBASSADOR" });
      setStep("VERIFY_OTP");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/auth/verify-otp", { email, otp, role: "AMBASSADOR" });
      setResetToken(response.data.resetToken);
      setStep("RESET_PASSWORD");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/auth/password-reset", { token: resetToken, password, role: "AMBASSADOR" });
      setAuth(response.data.user, response.data.token);
      setStep("SUCCESS");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 w-full max-w-[480px] p-6"
      >
        <div className="bg-white/70 backdrop-blur-2xl border border-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 relative overflow-hidden">
          <button 
            onClick={() => step === "REQUEST_EMAIL" ? navigate("/login") : setStep("REQUEST_EMAIL")}
            className="absolute top-8 left-8 p-2 hover:bg-slate-100 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
          </button>

          <AnimatePresence mode="wait">
            {step === "REQUEST_EMAIL" && (
              <motion.div key="request" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
                    <Mail className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Forgot Password</h2>
                  <p className="text-slate-500 mt-2 font-medium">Enter your email to receive a verification code</p>
                </div>
                <form onSubmit={handleRequestEmail} className="space-y-6">
                  <Input label="Email Address" type="email" placeholder="name@nextif.com" required value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
                  {error && <div className="text-red-600 text-xs font-bold p-4 bg-red-50 rounded-2xl">{error}</div>}
                  <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>Send Code</Button>
                </form>
              </motion.div>
            )}

            {step === "VERIFY_OTP" && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
                    <ShieldCheck className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Verify Code</h2>
                  <p className="text-slate-500 mt-2 font-medium">Enter the 6-digit code sent to <span className="text-slate-900 font-bold">{email}</span></p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <Input label="Verification Code" type="text" placeholder="123456" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                  {error && <div className="text-red-600 text-xs font-bold p-4 bg-red-50 rounded-2xl">{error}</div>}
                  <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>Verify Code</Button>
                </form>
              </motion.div>
            )}

            {step === "RESET_PASSWORD" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
                    <Lock className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Set New Password</h2>
                  <p className="text-slate-500 mt-2 font-medium">Choose a strong password for your account</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <Input label="New Password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} />
                  {error && <div className="text-red-600 text-xs font-bold p-4 bg-red-50 rounded-2xl">{error}</div>}
                  <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>Reset Password</Button>
                </form>
              </motion.div>
            )}

            {step === "SUCCESS" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200">
                  <CheckCircle2 className="text-emerald-600 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Password Reset!</h2>
                <p className="text-slate-500 mt-3 font-medium">Your account has been secured. Redirecting to your dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
