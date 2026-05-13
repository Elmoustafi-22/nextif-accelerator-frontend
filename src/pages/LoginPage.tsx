import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";

const LoginPage = () => {
  const [role] = useState<"ambassador">("ambassador");
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    lastName: "",
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let endpoint = "";
      let payload: any = {};

      if (isFirstLogin) {
        endpoint = `/auth/${role}/first-login`;
        payload = { email: formData.email, lastName: formData.lastName };
      } else {
        endpoint = `/auth/${role}/login`;
        payload = { email: formData.email, password: formData.password };
      }

      const response = await axiosInstance.post(endpoint, payload);
      const { user, token } = response.data;

      setAuth(user, token);

      if (user.isFirstLogin) {
        navigate("/reset-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error details:", err);
      const message = err.response?.data?.message || 
                     (typeof err.response?.data === 'string' ? err.response.data : null) ||
                     err.message || 
                     "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,250,252,0.8)_100%]" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-12 p-6 md:p-12">
        {/* Left Side - Brand Message */}
        <div className="hidden lg:flex flex-col flex-1 text-slate-900 space-y-8">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="flex items-center gap-3 mb-12">
              <img src="/images/nextIf-ico.jpg" alt="Logo" className="w-12 h-12 rounded-xl shadow-xl shadow-indigo-600/10" />
              <span className="text-xl font-bold font-heading tracking-tight text-slate-900">NextIF Accelerator</span>
            </div>
            <h1 className="text-6xl font-black font-heading leading-[1.1] tracking-tight">
              Empowering <span className="text-indigo-600">IF</span> Enthusiasts.
              <br />
              <span className="text-slate-400">Growing Together.</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg mt-6">
              Access premium resources, track your impact, and lead meaningful initiatives in your community with the NextIF Fellows Portal.
            </p>
            <div className="flex items-center gap-6 mt-12">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-400">
                Joined by <span className="text-slate-900 font-bold">50+</span> fellows globally
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Glassmorphism Login Card */}
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-[480px]">
          <div className="bg-white/70 backdrop-blur-2xl border border-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <img src="/images/nextIf-ico.jpg" alt="Logo" className="w-10 h-10 rounded-lg" />
                <span className="font-bold text-slate-900">NextIF</span>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                  {isFirstLogin ? "Get Started" : "Welcome Back"}
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                  {isFirstLogin ? "Complete your first-time setup" : "Enter your credentials to continue"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Email Address" type="email" placeholder="name@nextif.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} icon={<Mail className="w-4 h-4" />} />
                <AnimatePresence mode="wait">
                  {isFirstLogin ? (
                    <motion.div key="first-login" initial={{ opacity: 0, height: 0, y: 10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                      <Input label="Last Name" type="text" placeholder="Enter your last name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                      <div className="flex gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold">i</span>
                        </div>
                        <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                          Entering for the first time? Use your official email and last name to verify your identity.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="returning" initial={{ opacity: 0, height: 0, y: 10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      <Input label="Password" type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} icon={<Lock className="w-4 h-4" />} />
                      <div className="flex justify-end mt-2">
                        <button 
                          type="button" 
                          onClick={() => navigate("/forgot-password")}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50/50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {error}
                  </motion.div>
                )}

                <Button type="submit" className="w-full mt-2 group" size="lg" isLoading={isLoading} rightIcon={<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}>
                  {isFirstLogin ? "Verify Account" : "Sign In to Portal"}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-slate-400 font-bold tracking-widest">Or</span>
                  </div>
                </div>

                <button type="button" onClick={() => setIsFirstLogin(!isFirstLogin)} className="w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all py-2 flex items-center justify-center gap-2">
                  {isFirstLogin ? "Back to login" : "First time here?"}
                  <span className="text-indigo-600">{isFirstLogin ? "←" : "Set up your account →"}</span>
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">© 2025 NextIF Accelerator</p>
                <div className="flex gap-6">
                  <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Support</a>
                  <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Privacy</a>
                  <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Terms</a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
