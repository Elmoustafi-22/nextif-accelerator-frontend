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
        return "bg-blue-100 border-blue-200 text-blue-700";
      case "UNDER_REVIEW":
        return "bg-amber-100 border-amber-200 text-amber-700";
      case "RESOLVED":
        return "bg-green-100 border-green-200 text-green-700";
      default:
        return "bg-neutral-100 border-neutral-200 text-neutral-700";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Complaints & Support
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Submit issues or track your support tickets.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="gap-2 h-11 px-6"
        >
          {isFormOpen ? (
            "Cancel"
          ) : (
            <>
              <Plus size={18} /> New Ticket
            </>
          )}
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold mb-6">Submit Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Subject"
                placeholder="What's the issue?"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-900">
                  Category
                </label>
                <div className="relative">
                  <select
                    className="w-full h-11 bg-neutral-50 border border-neutral-100 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="TASK_ISSUE">Task Related Issue</option>
                    <option value="PAYMENT">Points/Payment Inquiry</option>
                    <option value="ACCOUNT">Account Problems</option>
                    <option value="TECHNICAL">Technical Bug</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-900">
                Description
              </label>
              <textarea
                className="w-full min-h-[160px] bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Please provide details about your concern..."
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <Button
              className="w-full h-12"
              isLoading={submitting}
              rightIcon={<Send size={18} />}
            >
              Submit Complaint
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-4xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-50 flex items-center gap-2">
          <History size={20} className="text-neutral-400" />
          <h2 className="text-lg font-bold text-neutral-900">Ticket History</h2>
        </div>

        <div className="divide-y divide-neutral-50">
          {loading ? (
            <div className="p-12 text-center animate-pulse">
              Loading history...
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-neutral-300" />
              </div>
              <p className="text-neutral-500">
                You haven't submitted any complaints yet.
              </p>
            </div>
          ) : (
            complaints.map((item: any) => (
              <div
                key={item._id}
                className="p-8 hover:bg-neutral-50/25 transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      item.status === "RESOLVED"
                        ? "bg-green-50 text-green-600"
                        : item.status === "UNDER_REVIEW"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    )}
                  >
                    {item.status === "RESOLVED" ? (
                      <CheckCircle2 size={20} />
                    ) : item.status === "UNDER_REVIEW" ? (
                      <Clock size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-neutral-900 truncate">
                        {item.subject}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusColor(item.status)
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {item.adminResponse && (
                  <div className="ml-14 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MessageSquare size={14} className="fill-blue-600/10" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Admin Response
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 italic">
                      "{item.adminResponse}"
                    </p>
                  </div>
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
