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
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import { cn } from "../utils/cn";

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors font-medium border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {sequence.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-neutral-100 shadow-sm text-xs font-bold font-heading text-neutral-900">
            <span className="text-neutral-400">Step</span>
            <span>
              {currentIndex + 1} of {sequence.length}
            </span>
            <div className="w-24 h-1.5 bg-neutral-100 rounded-full ml-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentIndex + 1) / sequence.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold font-heading text-neutral-900">
                  {task.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm font-heading">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <Calendar size={16} /> Due{" "}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      task.verificationType === "AUTO"
                        ? "bg-green-100 text-green-700"
                        : task.status === "REDO"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    {task.status === "REDO"
                      ? "Redo Required"
                      : task.verificationType + " Verification"}
                  </span>
                  {task.isBonus && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                      Bonus Task
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-neutral max-w-none">
              <h3 className="text-sm font-bold font-heading text-neutral-400 uppercase tracking-widest mb-3">
                Explanation
              </h3>
              <div className="text-neutral-600 leading-relaxed mb-8">
                {renderFormattedText(task.explanation || task.description)}
              </div>
            </div>

            {/* What to do Section - Only shown when completed and not editing */}
            {task.status === "COMPLETED" &&
              !isEditing &&
              !isSuccess &&
              (task.whatToDo || task.steps) && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-sm font-bold font-heading text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <ListChecks size={18} className="text-blue-600" /> Task
                    Completion Details
                  </h3>
                  <div className="space-y-6">
                    {(task.whatToDo || task.steps).map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="space-y-3 p-6 bg-neutral-50 rounded-3xl border border-neutral-100/50"
                        >
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 mb-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-neutral-500 leading-relaxed italic">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-neutral-100 text-sm text-neutral-700 leading-relaxed">
                            {responses[item._id] || "No response provided."}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Materials Section */}
            {task.materials && task.materials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-heading text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <PlayCircle size={18} className="text-red-600" /> Learning
                  Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.materials.map((mat: any, index: number) => (
                    <a
                      key={index}
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          mat.type === "VIDEO"
                            ? "bg-blue-50 text-blue-600"
                            : mat.type === "PDF"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        )}
                      >
                        {mat.type === "VIDEO" ? (
                          <PlayCircle size={20} />
                        ) : mat.type === "PDF" ? (
                          <FileText size={20} />
                        ) : (
                          <ExternalLink size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
                          {mat.title}
                        </p>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                          {mat.type}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isSuccess &&
          (!task.status ||
            task.status === "PENDING" ||
            task.status === "REDO" ||
            isEditing) ? (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Submit Your Work</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <ListChecks size={18} className="text-blue-600" />{" "}
                    Requirements & Responses
                  </h3>

                  {(task.whatToDo || task.steps)?.map(
                    (item: any, idx: number) => (
                      <div
                        key={item._id || idx}
                        className="space-y-4 p-6 bg-neutral-50 rounded-3xl border border-neutral-100"
                      >
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-blue-200">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-neutral-500 leading-relaxed italic">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                            Your Submission for this item
                          </label>
                          <textarea
                            required
                            className="w-full min-h-[100px] bg-white border border-neutral-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-sm"
                            placeholder={`Enter your response for: ${item.title}...`}
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
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-900">
                      General Remarks
                    </label>
                    <textarea
                      className="w-full min-h-[120px] bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-sm"
                      placeholder="Any additional information..."
                      value={submissionMsg}
                      onChange={(e) => setSubmissionMsg(e.target.value)}
                    />
                  </div>
                )}

                {(task.requirements?.includes("LINK") ||
                  task.requirements?.includes("FILE")) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {task.requirements?.includes("LINK") && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral-900">
                          Submission Links (Google Drive, Social Media, etc.)
                        </label>
                        {links.map((link, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="url"
                              className="flex-1 bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                              placeholder="https://..."
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
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setLinks([...links, ""])}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2"
                        >
                          + Add More Links
                        </button>
                      </div>
                    )}

                    {task.requirements?.includes("FILE") && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral-900">
                          Attachments
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg,.mp4,.mov"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl cursor-pointer hover:bg-neutral-100 transition-colors"
                          >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <Paperclip
                                size={18}
                                className="text-neutral-400"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900">
                                {file ? file.name : "Upload Proof"}
                              </p>
                              <p className="text-[10px] text-neutral-400">
                                PDF, Images, Video (Max 50MB)
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs">{error}</p>
                  </div>
                )}

                <Button
                  className="w-full h-12"
                  disabled={submitting}
                  isLoading={submitting}
                  rightIcon={<Send size={18} />}
                >
                  {currentIndex < sequence.length - 1
                    ? "Submit & Next Task"
                    : "Submit & Complete"}
                </Button>
              </form>
            </div>
          ) : task.status === "COMPLETED" && !isEditing ? (
            <div className="bg-green-50 rounded-3xl border border-green-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-900">
                Already Submitted!
              </h2>
              <p className="text-green-700 mt-2 text-sm">
                You have already submitted your work.
              </p>
              {new Date() < new Date(task.dueDate) && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="mt-6 border-green-200 text-green-700 hover:bg-green-100"
                >
                  Edit Submission
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-green-50 rounded-3xl border border-green-100 p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-900">
                {currentIndex < sequence.length - 1
                  ? "Ready for Next Task!"
                  : "All Done!"}
              </h2>
              <p className="text-green-700 mt-2 text-sm">
                {currentIndex < sequence.length - 1
                  ? "Your submission was saved. Moving to the next task..."
                  : "You have completed all tasks for this week!"}
              </p>
              {currentIndex < sequence.length - 1 ? (
                <Button
                  onClick={() =>
                    navigate(`/tasks/${sequence[currentIndex + 1]._id}`)
                  }
                  className="mt-6 bg-green-600 hover:bg-green-700 border-none"
                >
                  Go to Next Task
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="mt-6 border-green-200 text-green-700 hover:bg-green-100"
                >
                  Back to Dashboard
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">
              Task Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span
                  className={cn(
                    "font-bold uppercase",
                    task.status === "COMPLETED"
                      ? "text-green-600"
                      : task.status === "REDO"
                      ? "text-amber-600"
                      : "text-amber-600"
                  )}
                >
                  {task.status === "REDO"
                    ? "Redo Required"
                    : task.status || "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Points</span>
                <span className="font-bold text-blue-600">
                  {task.rewardPoints || 0} XP
                </span>
              </div>
              {task.createdBy && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Created By</span>
                  <span className="font-bold text-neutral-900">
                    {task.createdBy.firstName} {task.createdBy.lastName}
                  </span>
                </div>
              )}

              {/* Admin Feedback */}
              {task.submission?.adminFeedback && (
                <div
                  className={cn(
                    "mt-4 p-4 rounded-2xl border text-sm leading-relaxed",
                    task.status === "REDO"
                      ? "bg-amber-50 border-amber-200 text-amber-900 border-l-4 border-l-amber-500"
                      : task.status === "COMPLETED"
                      ? "bg-green-50 border-green-100 text-green-800"
                      : "bg-red-50 border-red-100 text-red-800"
                  )}
                >
                  <p className="font-bold text-xs uppercase tracking-wider mb-1 opacity-70">
                    {task.status === "REDO"
                      ? "Action Required: Admin Feedback"
                      : "Admin Feedback"}
                  </p>
                  <p className="font-medium italic">
                    "{task.submission.adminFeedback}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-600/20">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              If you have questions about this task, you can send a message to
              the admin team.
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-none"
            >
              Message Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
