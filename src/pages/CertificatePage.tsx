import { useState, useEffect } from "react";
import { Award, Download, Zap, Shield, Share2, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import { toast } from "../store/useToastStore";

const CertificatePage = () => {
  const { user } = useAuthStore();
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const [configRes, profileRes] = await Promise.all([
          axiosInstance.get("/payments/config").catch(() => ({ data: null })),
          axiosInstance.get("/ambassador/me").catch(() => null)
        ]);
        
        if (configRes?.data) setPaymentConfig(configRes.data);
        if (profileRes?.data) {
          useAuthStore.getState().updateUser(profileRes.data.data || profileRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchPaymentConfig();
  }, [user]);

  const handleClaimCertificate = async () => {
    try {
      setPaymentLoading(true);
      const response = await axiosInstance.post("/payments/initialize");
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment process");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && user?.profile?.certificateUrl) {
      navigator.share({
        title: "My NextIF Accelerator Certificate",
        text: `I just completed the NextIF Accelerator! Check out my official certificate.`,
        url: user.profile.certificateUrl,
      }).catch(console.error);
    } else {
      toast.success("Certificate link copied to clipboard!");
      navigator.clipboard.writeText(user?.profile?.certificateUrl || "");
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <Award className="text-emerald-600" size={32} /> Program Certificate
        </h1>
        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
          View, download, and share your official NextIF Accelerator credential. Show the world what you've achieved.
        </p>
      </div>

      {!user?.profile?.hasPaidCertificate ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 bg-indigo-50 text-indigo-600 shadow-indigo-500/10">
                <Award size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black font-heading text-slate-900 tracking-tight">
                  Certificate Fee
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Pay to secure the official certificate for the incredible work involved in this project.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate Fee:</p>
                <p className="text-2xl font-black text-indigo-600 tracking-tight">
                  {paymentConfig?.displayPrice || "..."}
                </p>
              </div>
              <Button
                onClick={handleClaimCertificate}
                isLoading={paymentLoading}
                className="w-full md:w-auto px-8 h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10"
                leftIcon={<Zap size={18} />}
              >
                Secure Checkout
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden text-white shadow-xl shadow-slate-900/10 group">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-emerald-500/30">
                <Shield size={14} /> Verified Credential
              </div>

              <h2 className="text-4xl font-heading font-black tracking-tight mb-4">
                Congratulations, <span className="text-emerald-400">{user.firstName}</span>!
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
                Your official NextIF Accelerator Certificate has been securely generated and verified. You can now download it or share it directly to your network.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {user?.profile?.certificateUrl ? (
                  <>
                    <Button
                      onClick={() => window.open(user?.profile?.certificateUrl || "", "_blank")}
                      className="px-8 h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                      leftIcon={<Download size={20} />}
                    >
                      Download PDF
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="px-8 h-14 rounded-2xl text-sm font-black uppercase tracking-widest border-slate-700 hover:bg-slate-800 text-white"
                      leftIcon={<Share2 size={20} />}
                    >
                      Share Credential
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-6 py-4 rounded-2xl text-sm font-bold font-heading uppercase tracking-wider">
                    <Loader2 size={20} className="animate-spin" /> Certificate Generation in Progress
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-full aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4 relative overflow-hidden group">
              {user?.profile?.certificateUrl ? (
                <>
                  <iframe 
                    src={`${user?.profile?.certificateUrl || ""}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full rounded-xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                    <button 
                      onClick={() => window.open(user?.profile?.certificateUrl || "", "_blank")}
                      className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 font-bold px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
                    >
                      <Download size={18} /> View Full PDF
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <Award size={48} className="mb-4 opacity-50" />
                  <p className="font-bold">Preview Unavailable</p>
                  <p className="text-sm">Check back shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
