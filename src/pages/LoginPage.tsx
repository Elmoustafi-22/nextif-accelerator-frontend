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
      let payload = {};

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
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image with Text Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-blue-900 to-blue-700">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/FE-BG.jpeg)",
            opacity: 0.3,
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Empowering IF Enthusiast.
              <br />
              Growing Nextif Together.
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Access resources, track impact, and lead meaningful initiatives in
              your community.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <img
                src="/images/nextIf-ico.jpg"
                alt="Logo"
                className="w-14 h-14 mb-6 shadow-lg object-center shadow-blue-600/20 rounded-2xl"
              />

              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Fellows Login
              </h1>
              <p className="text-neutral-500">NextIF Fellows Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@nextif.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                icon={<Mail className="w-4 h-4 text-neutral-400" />}
              />

              <AnimatePresence mode="wait">
                {isFirstLogin ? (
                  <motion.div
                    key="first-login"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      label="Last Name"
                      type="text"
                      placeholder="Enter your last name"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                    <p className="text-[11px] text-blue-600 bg-blue-50 p-3 rounded-lg mt-3 border border-blue-100">
                      Entering for the first time? Use your email and last name
                      to secure your account.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="returning"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      icon={<Lock className="w-4 h-4 text-neutral-400" />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
              >
                {isFirstLogin ? "Get Started" : "Sign In"}
              </Button>

              <button
                type="button"
                onClick={() => setIsFirstLogin(!isFirstLogin)}
                className="w-full text-center text-sm text-neutral-500 hover:text-blue-600 transition-colors py-2"
              >
                {isFirstLogin
                  ? "Already have a password? Sign in"
                  : "First time logging in?"}
              </button>
            </form>

            <p className="text-center text-neutral-400 text-xs mt-8">
              &copy; 2025 NextIF Accele Portal. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
