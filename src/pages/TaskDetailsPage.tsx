import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Send,
  AlertCircle,
  Paperclip,
  ListChecks,
  PlayCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionMsg, setSubmissionMsg] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sequence, setSequence] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        // Fetch current task
        const taskRes = await axiosInstance.get(`/tasks/${id}`);
        const currentTask = taskRes.data;
        setTask(currentTask);

        if (currentTask.submission) {
          setSubmissionMsg(currentTask.submission.content || "");
          setLinks(currentTask.submission.links || [""]);

          // Pre-fill responses from submission
          const existingResponses: { [key: string]: string } = {};
          currentTask.submission.responses?.forEach((r: any) => {
            existingResponses[r.whatToDoId] = r.text;
          });
          setResponses(existingResponses);
        }

        // Fetch all tasks to build the sequence
        const allTasksRes = await axiosInstance.get("/tasks/my/all");
        const allTasks = allTasksRes.data;

        // Filter tasks for the same week (sharing the same due date)
        const weeklyTasks = allTasks
          .filter(
            (t: any) =>
              new Date(t.dueDate).toDateString() ===
              new Date(currentTask.dueDate).toDateString()
          )
          .sort((a: any, b: any) => a.title.localeCompare(b.title));

        setSequence(weeklyTasks);
        setCurrentIndex(weeklyTasks.findIndex((t: any) => t._id === id));
      } catch (err) {
        console.error("Error fetching task data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there's any valid submission content
    const hasValidLinks = links.some((l) => l.trim() !== "");
    const hasValidResponses = Object.values(responses).some(
      (r) => r.trim() !== ""
    );

    if (!submissionMsg && !file && !hasValidLinks && !hasValidResponses) {
      setError(
        "Please provide at least one form of submission (response, link, text, or file)"
      );
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("content", submissionMsg);
    links
      .filter((l) => l.trim() !== "")
      .forEach((link) => formData.append("links[]", link));

    // Add structured responses
    const formattedResponses = Object.entries(responses).map(
      ([whatToDoId, text]) => ({
        whatToDoId,
        text,
      })
    );

    // Append as JSON or multiple fields depending on backend expectation.
    // Since I updated validation.schemas to expect responses in body, I'll send it as part of the payload.
    // However, since I'm using FormData for files, I need to stringify complex objects.
    formData.append("responses", JSON.stringify(formattedResponses));

    if (file) {
      formData.append("proofFiles", file);
    }

    try {
      await axiosInstance.post(`/tasks/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsSuccess(true);

      // If there is a next task, navigate after a short delay or immediately
      if (currentIndex < sequence.length - 1) {
        setTimeout(() => {
          navigate(`/tasks/${sequence[currentIndex + 1]._id}`);
          setIsSuccess(false); // Reset for the next task
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to submit task. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Simple regex for bold, italic and subheadings
    let formatted = text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={i} className="text-lg font-bold text-neutral-900 mt-6 mb-2">
            {line.replace("### ", "")}
          </h4>
        );
      }

      // Handle bold **text**
      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      const formattedLine = boldParts.map((part, j) => {
        if (j % 2 === 1)
          return (
            <strong key={j} className="font-bold text-black">
              {part}
            </strong>
          );

        // Handle italic *text*
        const italicParts = part.split(/\*(.*?)\*/g);
        return italicParts.map((iPart, k) => {
          if (k % 2 === 1)
            return (
              <em key={k} className="italic text-neutral-800">
                {iPart}
              </em>
            );
          return iPart;
        });
      });

      return (
        <p key={i} className="mb-2 leading-relaxed">
          {formattedLine}
        </p>
      );
    });

    return <div>{formatted}</div>;
  };

  if (loading)
    return (
      <div className="p-8 animate-pulse text-center">
        Loading task details...
      </div>
    );
  if (!task)
    return <div className="p-8 text-center text-red-500">Task not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm border-none bg-transparent cursor-pointer self-start"
        >
          <div className="p-2 bg-white rounded-xl border border-slate-100 group-hover:border-slate-200 shadow-sm transition-all">
            <ArrowLeft size={18} />
          </div>
          Back to Tasks
        </button>

        {sequence.length > 1 && (
          <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 md:py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-[10px] md:text-xs font-black font-heading text-slate-900">
            <span className="text-slate-300 uppercase tracking-widest hidden sm:inline">Task Progress</span>
            <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-none">
              <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg shrink-0">
                {currentIndex + 1} / {sequence.length}
              </span>
              <div className="flex-1 w-full sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / sequence.length) * 100}%`,
                  }}
                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100/50 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                  <h1 className="text-xl md:text-3xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] font-black font-heading uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Calendar size={14} className="text-slate-300" />
                      Deadline: {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-xl border shadow-sm",
                        task.verificationType === "AUTO"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : task.status === "REDO"
                          ? "bg-amber-50 border-amber-100 text-amber-700"
                          : "bg-indigo-50 border-indigo-100 text-indigo-700"
                      )}
                    >
                      {task.status === "REDO"
                        ? "Action Required: Redo"
                        : task.verificationType + " Verification"}
                    </span>
                    {task.isBonus && (
                      <span className="px-3 py-1.5 rounded-xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 shadow-sm">
                        Bonus Achievement
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 md:w-1.5 md:h-6 bg-indigo-600 rounded-full" />
                  <h3 className="text-[10px] md:text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em]">
                    Task Briefing
                  </h3>
                </div>
                <div className="text-slate-600 leading-relaxed text-sm md:text-lg font-medium mb-8 md:mb-10">
                  {renderFormattedText(task.explanation || task.description)}
                </div>
              </div>

              {/* What to do Section - View Only */}
              {task.status === "COMPLETED" &&
                !isEditing &&
                !isSuccess &&
                (task.whatToDo || task.steps) && (
                  <div className="space-y-6 mb-10">
                    <h3 className="text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <ListChecks size={16} />
                      </div>
                      Submission History
                    </h3>
                    <div className="space-y-4 md:space-y-6">
                      {(task.whatToDo || task.steps).map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="space-y-3 md:space-y-4 p-5 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100/60 shadow-inner"
                          >
                            <div className="flex gap-4 md:gap-5">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white text-indigo-600 flex items-center justify-center text-xs md:text-sm font-black shadow-sm shrink-0">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 mb-0.5 md:mb-1 text-base md:text-lg">
                                  {item.title}
                                </h4>
                                <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed italic opacity-80">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 text-sm md:text-base text-slate-700 leading-relaxed font-medium shadow-sm">
                              {responses[item._id] || "No data recorded for this step."}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Materials Section */}
              {task.materials && task.materials.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <PlayCircle size={16} />
                    </div>
                    Learning Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {task.materials.map((mat: any, index: number) => (
                      <a
                        key={index}
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            mat.type === "VIDEO"
                              ? "bg-indigo-50 text-indigo-600"
                              : mat.type === "PDF"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-emerald-50 text-emerald-600"
                          )}
                        >
                          {mat.type === "VIDEO" ? (
                            <PlayCircle size={24} />
                          ) : mat.type === "PDF" ? (
                            <FileText size={24} />
                          ) : (
                            <ExternalLink size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
                            {mat.title}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                            {mat.type} Asset
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isSuccess &&
          (!task.status ||
            task.status === "PENDING" ||
            task.status === "REDO" ||
            isEditing) ? (
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-6 md:mb-10">
                <div className="w-1 h-5 md:w-1.5 md:h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-xl md:text-2xl font-black font-heading text-slate-900 tracking-tight">
                  Task Submission
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-6 md:space-y-8">
                  <h3 className="text-[10px] md:text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <ListChecks size={14} className="md:w-4 md:h-4" />
                    </div>
                    Action Steps
                  </h3>

                  {(task.whatToDo || task.steps)?.map(
                    (item: any, idx: number) => (
                      <div
                        key={item._id || idx}
                        className="space-y-4 md:space-y-6 p-5 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-inner group/step focus-within:bg-white focus-within:shadow-xl focus-within:shadow-indigo-500/5 transition-all duration-300"
                      >
                        <div className="flex gap-4 md:gap-5">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs md:text-sm font-black shrink-0 shadow-lg shadow-indigo-600/20 group-focus-within/step:scale-110 transition-transform">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 mb-0.5 md:mb-1 text-base md:text-lg">
                              {item.title}
                            </h4>
                            <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed italic opacity-80">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            Observation / Outcome
                          </label>
                          <textarea
                            required
                            className="w-full min-h-[120px] md:min-h-[140px] bg-white border border-slate-100 rounded-xl md:rounded-2xl p-4 md:p-5 text-sm md:text-base font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all resize-none shadow-sm placeholder:text-slate-300"
                            placeholder={`Document your results for: ${item.title}...`}
                            value={responses[item._id] || ""}
                            onChange={(e) =>
                              setResponses({
                                ...responses,
                                [item._id]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>

                {(task.requirements?.includes("TEXT") ||
                  !task.requirements) && (
                  <div className="space-y-4">
                    <label className="text-xs font-black font-heading text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      Submission Notes
                    </label>
                    <textarea
                      className="w-full min-h-[160px] bg-slate-50 border border-slate-100 rounded-3xl p-6 text-base font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all resize-none shadow-inner"
                      placeholder="Any final notes or observations regarding your submission..."
                      value={submissionMsg}
                      onChange={(e) => setSubmissionMsg(e.target.value)}
                    />
                  </div>
                )}

                {(task.requirements?.includes("LINK") ||
                  task.requirements?.includes("FILE")) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                    {task.requirements?.includes("LINK") && (
                      <div className="space-y-4">
                        <label className="text-xs font-black font-heading text-slate-900 uppercase tracking-widest">
                          External Evidence Links
                        </label>
                        <div className="space-y-3">
                          {links.map((link, idx) => (
                            <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                              <input
                                type="url"
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                placeholder="https://external-resource.com"
                                value={link}
                                onChange={(e) => {
                                  const newLinks = [...links];
                                  newLinks[idx] = e.target.value;
                                  setLinks(newLinks);
                                }}
                              />
                              {links.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newLinks = links.filter(
                                      (_, i) => i !== idx
                                    );
                                    setLinks(
                                      newLinks.length > 0 ? newLinks : [""]
                                    );
                                  }}
                                  className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <AlertCircle size={20} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setLinks([...links, ""])}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest flex items-center gap-2 mt-4 px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          + Append New Link
                        </button>
                      </div>
                    )}

                    {task.requirements?.includes("FILE") && (
                      <div className="space-y-4">
                        <label className="text-xs font-black font-heading text-slate-900 uppercase tracking-widest">
                          Visual Evidence
                        </label>
                        <div className="relative group">
                          <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg,.mp4,.mov"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center gap-5 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/5"
                          >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                              <Paperclip
                                size={24}
                                className="text-slate-400 group-hover:text-indigo-600"
                              />
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {file ? file.name : "Upload Documentation"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                PDF, Media, Logs (Limit: 50MB)
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-4"
                  >
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-bold tracking-tight">{error}</p>
                  </motion.div>
                )}

                <Button
                  className="w-full h-16 text-lg rounded-2xl group shadow-xl shadow-indigo-600/20"
                  disabled={submitting}
                  isLoading={submitting}
                  rightIcon={<Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                >
                  {currentIndex < sequence.length - 1
                    ? "Save & Next Task"
                    : "Finalize Submission"}
                </Button>
              </form>
            </div>
          ) : task.status === "COMPLETED" && !isEditing ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 rounded-2xl md:rounded-[3rem] p-8 md:p-12 text-center shadow-sm"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={40} className="md:w-[48px] md:h-[48px] text-emerald-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
                Submission Verified
              </h2>
              <p className="text-slate-600 mt-3 md:mt-4 text-base md:text-lg font-medium max-w-md mx-auto">
                This mission objective has been verified and registered in the system.
              </p>
              {new Date() < new Date(task.dueDate) && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-8 md:mt-10 px-8 md:px-10 py-3 md:py-4 bg-white border border-emerald-100 text-emerald-700 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl hover:bg-emerald-100 hover:shadow-lg hover:shadow-emerald-500/5 transition-all active:scale-95"
                >
                  Modify Records
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 rounded-2xl md:rounded-[3rem] p-10 md:p-16 text-center shadow-sm"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 size={48} className="md:w-[56px] md:h-[56px] text-emerald-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
                {currentIndex < sequence.length - 1
                  ? "Section Complete!"
                  : "Task Completed!"}
              </h2>
              <p className="text-slate-500 font-medium text-xs md:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                {task.status === "COMPLETED"
                  ? "Your work has been verified."
                  : "Submission received and ready for review."}
              </p>
              {currentIndex < sequence.length - 1 ? (
                <Button
                  onClick={() =>
                    navigate(`/tasks/${sequence[currentIndex + 1]._id}`)
                  }
                  className="mt-8 md:mt-10 h-14 md:h-16 px-10 md:px-12 bg-emerald-600 hover:bg-emerald-700 border-none rounded-2xl shadow-xl shadow-emerald-600/20 text-sm md:text-base"
                >
                  Advance to Next Task
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="mt-8 md:mt-10 h-14 md:h-16 px-10 md:px-12 bg-slate-900 hover:bg-indigo-600 border-none rounded-2xl shadow-xl shadow-slate-900/10 text-sm md:text-base"
                >
                  Back to Dashboard
                </Button>
              )}
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group">
            <h3 className="text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em] mb-8">
              Task Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Status</span>
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                    task.status === "COMPLETED"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                      : task.status === "REDO"
                      ? "bg-rose-50 border-rose-100 text-rose-600"
                      : "bg-indigo-50 border-indigo-100 text-indigo-600"
                  )}
                >
                  {task.status === "REDO"
                    ? "Redo Action"
                    : task.status || "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Merit Points</span>
                <span className="text-lg font-black text-indigo-600 font-heading">
                  +{task.submission?.pointsAwarded || task.rewardPoints || 0} XP
                </span>
              </div>
              {task.submission?.grade && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">Grade</span>
                  <span className="text-lg font-black text-emerald-600 font-heading">
                    {task.submission.grade} / 5
                  </span>
                </div>
              )}
              {task.createdBy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">Officer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] font-black text-slate-400">
                      {task.createdBy.firstName[0]}
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      {task.createdBy.firstName} {task.createdBy.lastName}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Feedback */}
              {task.submission?.adminFeedback && (
                <div
                  className={cn(
                    "mt-8 p-6 rounded-2xl border text-sm leading-relaxed relative overflow-hidden group/feedback",
                    task.status === "REDO"
                      ? "bg-rose-50 border-rose-200 text-rose-900 border-l-4 border-l-rose-500"
                      : task.status === "COMPLETED"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800 border-l-4 border-l-emerald-500"
                      : "bg-indigo-50 border-indigo-100 text-indigo-800 border-l-4 border-l-indigo-500"
                  )}
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/feedback:opacity-30 transition-opacity">
                    <AlertCircle size={48} />
                  </div>
                  <p className="font-black text-[10px] uppercase tracking-widest mb-3 opacity-60">
                    {task.status === "REDO"
                      ? "Revision Required"
                      : "Admin Feedback"}
                  </p>
                  <p className="font-bold italic text-base leading-snug">
                    "{task.submission.adminFeedback}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <MessageSquare size={200} />
            </div>
            <h3 className="text-2xl font-black font-heading mb-6 tracking-tight">
              Need Assistance?
            </h3>
            <p className="text-indigo-100 text-sm font-medium mb-10 leading-relaxed">
              If you have any questions about the task requirements or need clarification on the next steps, feel free to contact our support team.
            </p>
            <button
              className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/20 hover:border-white shadow-lg active:scale-95"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
