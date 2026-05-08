import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    firstName: "",
    title: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = user?.role === "admin" 
        ? "/auth/admin/setup-password" 
        : "/auth/ambassador/password-reset";
      
      await axiosInstance.patch(endpoint, { 
        password: formData.password,
        firstName: formData.firstName || user?.firstName,
        title: formData.title || user?.title
      });
      
      setIsSuccess(true);
      updateUser({ isFirstLogin: false });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-900">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-12 border border-white/20 text-center max-w-md w-full relative z-10"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200">
            <CheckCircle2 className="text-emerald-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight">Account Secured</h1>
          <p className="text-slate-500 mt-3 font-medium">Your password has been updated. Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-900">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/20 rounded-full blur-[100px] animate-bounce duration-[10s]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-12 border border-white/20 relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-700">
                <Lock className="text-white w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight">
                Secure Your Account
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Please set a secure password for your portal access.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!user?.firstName && (
                <Input
                  label="First Name"
                  type="text"
                  placeholder="Enter your first name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              )}
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest p-4 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-16 text-lg rounded-2xl shadow-xl shadow-indigo-600/20 mt-4 group"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              >
                Update Password
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
