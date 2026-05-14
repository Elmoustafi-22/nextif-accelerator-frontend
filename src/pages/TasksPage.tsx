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
import { motion } from "framer-motion";

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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black font-heading text-slate-900 tracking-tight">
            Mission Hub
          </h1>
          <p className="text-slate-500 mt-1 md:mt-2 font-medium text-sm md:text-lg">
            {activeTab === "active"
              ? "Track and manage your active operations."
              : "Review your operational history and achievements."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 bg-white p-1.5 md:p-2 rounded-2xl border border-slate-100 shadow-sm self-start w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black font-heading transition-all duration-300 flex items-center justify-center gap-2",
              activeTab === "active"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02] md:scale-105"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Clock size={16} /> Active
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black font-heading transition-all duration-300 flex items-center justify-center gap-2",
              activeTab === "history"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02] md:scale-105"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <History size={16} /> History
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search missions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3.5 md:py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all shadow-sm placeholder:text-slate-300"
          />
        </div>

        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300",
              view === "grid"
                ? "bg-slate-100 text-indigo-600 shadow-inner"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300",
              view === "list"
                ? "bg-slate-100 text-indigo-600 shadow-inner"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-100 rounded-2xl md:rounded-[3rem] p-8 md:p-24 text-center shadow-sm"
        >
          <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-50 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
            <Filter className="text-slate-300" size={32} />
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 font-heading tracking-tight">
            No missions detected
          </h2>
          <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium text-lg">
            {searchQuery
              ? "We couldn't find any missions matching your current search parameters."
              : activeTab === "active"
              ? "Your mission log is clear. All objectives have been neutralized!"
              : "No historical records found in your mission archives."}
          </p>
          {searchQuery && (
            <button
              className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10"
              onClick={() => setSearchQuery("")}
            >
              Reset Search Filter
            </button>
          )}
        </motion.div>
      ) : (
        <div
          className={cn(
            "gap-8",
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
                "bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 group overflow-hidden flex flex-col",
                view === "list" && "md:flex-row md:items-center md:p-2"
              )}
            >
              <div
                className={cn(
                  "p-6 md:p-10 flex-1",
                  view === "list" && "p-4 md:p-4 flex flex-row items-center gap-4 md:gap-8"
                )}
              >
                <div
                  className={cn(
                    "w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-[1.75rem] flex items-center justify-center mb-6 md:mb-8 transition-all duration-500 group-hover:scale-110 shadow-sm relative overflow-hidden",
                    task.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-600"
                      : task.status === "REDO"
                      ? "bg-amber-50 text-amber-600"
                      : task.isBonus
                      ? "bg-fuchsia-50 text-fuchsia-600"
                      : "bg-indigo-50 text-indigo-600",
                    view === "list" && "mb-0 shrink-0"
                  )}
                >
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {task.status === "COMPLETED" ? (
                    <CheckCircle2 size={24} className="md:w-9 md:h-9 relative z-10" />
                  ) : (
                    <Clock size={24} className="md:w-9 md:h-9 relative z-10" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 md:mb-3 gap-3 md:gap-4">
                    <h3 className="text-lg md:text-2xl font-black font-heading text-slate-900 group-hover:text-indigo-600 transition-colors truncate tracking-tight">
                      {task.title}
                    </h3>
                    {task.isBonus && (
                      <span className="px-2 md:px-3 py-1 bg-fuchsia-100 text-fuchsia-700 text-[8px] md:text-[9px] font-black font-heading uppercase rounded-lg tracking-widest shrink-0 border border-fuchsia-200 shadow-sm">
                        Bonus
                      </span>
                    )}
                  </div>

                  <p className="text-sm md:text-base text-slate-500 line-clamp-2 mb-6 md:mb-8 leading-relaxed font-medium">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 font-heading">
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-slate-400 bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl uppercase tracking-widest border border-slate-100">
                      <Calendar size={12} className="text-slate-300 md:w-[14px] md:h-[14px]" />
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl uppercase tracking-widest border border-indigo-100">
                      <TrendingUp size={12} className="text-indigo-400 md:w-[14px] md:h-[14px]" />
                      {task.rewardPoints} XP
                    </div>
                    <span
                      className={cn(
                        "px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        task.status === "COMPLETED"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : task.status === "REDO"
                          ? "bg-amber-50 border-amber-100 text-amber-700 underline underline-offset-4 decoration-amber-300"
                          : "bg-amber-50 border-amber-100 text-amber-700"
                      )}
                    >
                      {task.status === "REDO"
                        ? "Redo"
                        : task.status || "Open"}
                    </span>
                  </div>
                </div>
              </div>

              {view === "grid" && (
                <div className="px-6 md:px-10 py-4 md:py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto group-hover:bg-white transition-colors">
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {task.verificationType} Protocol
                  </p>
                  <div className="flex items-center gap-1.5 md:gap-2 text-indigo-600 text-[10px] md:text-xs font-black uppercase tracking-widest group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform">
                    Briefing <ChevronRight size={14} className="md:w-4 md:h-4" />
                  </div>
                </div>
              )}

              {view === "list" && (
                <div className="pr-8 py-4 md:py-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30 transition-all duration-300">
                    <ChevronRight size={24} />
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
