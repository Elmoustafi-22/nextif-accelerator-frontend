import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Calendar,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Filter,
  History,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { cn } from "../utils/cn";
import Button from "../components/Button";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/tasks/my/all");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const now = new Date();

  const filteredTasks = tasks.filter((task: any) => {
    const isPast = new Date(task.dueDate) < now;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeTab === "active") {
      return !isPast && matchesSearch;
    } else {
      return isPast && matchesSearch;
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-neutral-900 tracking-tight">
            Your Tasks
          </h1>
          <p className="text-neutral-500 mt-1 font-heading">
            {activeTab === "active"
              ? "View and complete your currently assigned tasks."
              : "Review your past task history and submissions."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold font-heading transition-all flex items-center gap-2",
              activeTab === "active"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <Clock size={16} /> Active
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold font-heading transition-all flex items-center gap-2",
              activeTab === "history"
                ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <History size={16} /> History
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by task title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-100 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 rounded-lg transition-all",
              view === "grid"
                ? "bg-neutral-100 text-blue-600"
                : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 rounded-lg transition-all",
              view === "list"
                ? "bg-neutral-100 text-blue-600"
                : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-3xl border border-neutral-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-[3rem] p-20 text-center shadow-sm">
          <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="text-neutral-300" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            No tasks found
          </h2>
          <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
            {searchQuery
              ? "We couldn't find any tasks matching your search."
              : activeTab === "active"
              ? "You don't have any active tasks right now. Great job!"
              : "You haven't completed any tasks yet."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-8"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "gap-6",
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {filteredTasks.map((task: any) => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className={cn(
                "bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden flex flex-col",
                view === "list" && "md:flex-row md:items-center md:p-4"
              )}
            >
              <div
                className={cn(
                  "p-8 flex-1",
                  view === "list" && "p-0 flex flex-row items-center gap-6"
                )}
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-sm",
                    task.status === "COMPLETED"
                      ? "bg-green-50 text-green-600"
                      : task.status === "REDO"
                      ? "bg-amber-50 text-amber-600"
                      : task.isBonus
                      ? "bg-purple-50 text-purple-600"
                      : "bg-blue-50 text-blue-600",
                    view === "list" && "mb-0 shrink-0"
                  )}
                >
                  {task.status === "COMPLETED" ? (
                    <CheckCircle2 size={32} />
                  ) : (
                    <Clock size={32} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold font-heading text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
                      {task.title}
                    </h3>
                    {task.isBonus && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[8px] font-black font-heading uppercase rounded-lg tracking-widest shrink-0">
                        Bonus
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-500 line-clamp-2 mb-6 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 font-heading">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-full">
                      <Calendar size={14} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                      <TrendingUp size={14} />
                      {task.rewardPoints} XP
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        task.status === "COMPLETED"
                          ? "bg-green-50 border-green-100 text-green-700"
                          : task.status === "REDO"
                          ? "bg-amber-50 border-amber-100 text-amber-700 underline decoration-amber-300"
                          : "bg-amber-50 border-amber-100 text-amber-700"
                      )}
                    >
                      {task.status === "REDO"
                        ? "Redo Required"
                        : task.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {view === "grid" && (
                <div className="px-8 py-5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between mt-auto">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-neutral-400">
                    {task.verificationType} Verification
                  </p>
                  <div className="flex items-center gap-1 text-blue-600 text-xs font-bold group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight size={14} />
                  </div>
                </div>
              )}

              {view === "list" && (
                <div className="pr-4 py-4 md:py-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Simplified StatCard-like layout for points if needed, but keeping it clean for now.
const TrendingUp = ({ size, className }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default TasksPage;
