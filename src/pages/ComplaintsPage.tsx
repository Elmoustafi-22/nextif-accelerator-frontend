import { useState, useEffect } from "react";
import {
  AlertCircle,
  Send,
  Plus,
  History,
  CheckCircle2,
  Clock,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Input from "../components/Input";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "TASK_ISSUE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      const response = await axiosInstance.get("/complaints/my");
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await axiosInstance.post("/complaints", {
        subject: formData.subject,
        message: formData.description,
      });
      setIsFormOpen(false);
      setFormData({ subject: "", description: "", category: "TASK_ISSUE" });
      fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-indigo-50 border-indigo-100 text-indigo-700";
      case "UNDER_REVIEW":
        return "bg-amber-50 border-amber-100 text-amber-700";
      case "RESOLVED":
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      default:
        return "bg-slate-50 border-slate-100 text-slate-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-heading text-slate-900 tracking-tight">
            Support Protocol
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Submit mission reports or track tactical support tickets.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={cn(
            "h-14 px-10 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all",
            isFormOpen 
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border-none shadow-none" 
              : "bg-indigo-600 shadow-indigo-600/20"
          )}
        >
          {isFormOpen ? "Cancel Mission" : "New Ticket"}
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-indigo-600/5 animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
              <Plus size={24} />
            </div>
            <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">Deployment Report</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Mission Subject"
                placeholder="Brief summary of the issue..."
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest ml-1">
                  Report Category
                </label>
                <div className="relative group">
                  <select
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black font-heading uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 appearance-none transition-all cursor-pointer"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="TASK_ISSUE">Tactical Objective Issue</option>
                    <option value="PAYMENT">Merit Point Discrepancy</option>
                    <option value="ACCOUNT">Credential Protocol</option>
                    <option value="TECHNICAL">System Anomaly</option>
                    <option value="OTHER">Unspecified Incident</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest ml-1">
                Incident debriefing
              </label>
              <textarea
                className="w-full min-h-[200px] bg-slate-50 border border-slate-100 rounded-3xl p-6 text-base font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all resize-none shadow-inner placeholder:text-slate-300"
                placeholder="Provide a detailed description of the tactical situation..."
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-sm font-bold flex items-center gap-4"
              >
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              className="w-full h-16 text-lg rounded-2xl group shadow-xl shadow-indigo-600/20"
              isLoading={submitting}
              rightIcon={<Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            >
              Signal Command Team
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">Tactical Log</h2>
            <p className="text-slate-400 text-sm font-medium font-heading tracking-tight">Active and historical support tickets</p>
          </div>
          <div className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm">
            <History size={24} />
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-20 text-center animate-pulse">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto mb-4" />
              <p className="text-slate-400 font-black font-heading text-xs uppercase tracking-widest">Scanning Intelligence history...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100/50">
                <CheckCircle2 size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black font-heading text-xs uppercase tracking-[0.2em]">
                Tactical history clean. No incidents recorded.
              </p>
            </div>
          ) : (
            complaints.map((item: any) => (
              <div
                key={item._id}
                className="p-10 hover:bg-slate-50/50 transition-all space-y-6 group/item cursor-default"
              >
                <div className="flex items-start gap-6">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-500 border",
                      item.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : item.status === "UNDER_REVIEW"
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}
                  >
                    {item.status === "RESOLVED" ? (
                      <CheckCircle2 size={24} />
                    ) : item.status === "UNDER_REVIEW" ? (
                      <Clock size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-black font-heading text-slate-900 truncate tracking-tight group-hover/item:text-indigo-600 transition-colors">
                        {item.subject}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-black font-heading uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-base font-medium leading-relaxed mb-4">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-black font-heading uppercase tracking-widest border shadow-sm",
                          getStatusColor(item.status)
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {item.adminResponse && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-20 bg-white border border-indigo-100 rounded-[2rem] p-8 space-y-4 shadow-xl shadow-indigo-600/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                    <div className="flex items-center gap-3 text-indigo-600 relative z-10">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <MessageSquare size={16} />
                      </div>
                      <span className="text-[10px] font-black font-heading uppercase tracking-[0.2em]">
                        Command Response
                      </span>
                    </div>
                    <p className="text-base text-slate-900 font-bold italic leading-relaxed relative z-10">
                      "{item.adminResponse}"
                    </p>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
