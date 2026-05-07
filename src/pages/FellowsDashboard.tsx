import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import { cn } from "../utils/cn";

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileHover={{ y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-5">
      <div className={cn("p-3.5 rounded-2xl text-white shadow-lg", color)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-xs font-bold font-heading uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black font-heading text-slate-900 mt-2 tracking-tight">
      {value}
    </h3>
  </motion.div>
);

const FellowsDashboard = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completedCount: 0,
    pendingReview: 0,
    completionRate: 0,
    pointsEarned: 0,
    globalRank: "N/A",
    weeklyProgress: 0,
    mandatoryPending: 0,
    bonusPending: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, statsRes, notesRes] = await Promise.all([
          axiosInstance.get("/tasks/my/all"),
          axiosInstance.get("/ambassador/dashboard/stats"),
          axiosInstance.get("/notifications"),
        ]);
        setTasks(tasksRes.data);
        setStats(statsRes.data);
        setNotifications(notesRes.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header & Progress Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black font-heading text-slate-900 tracking-tight"
          >
            Welcome back, <span className="text-indigo-600">{user?.firstName || "Ambassador"}</span> 👋
          </motion.h1>
          <p className="text-slate-500 font-medium text-lg">
            Here's what's happening with your projects this week.
          </p>
        </div>

        {/* Weekly Progress Bar */}
        <div className="w-full lg:max-w-md bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex justify-between items-center text-[10px] font-black font-heading uppercase tracking-[0.2em] relative z-10">
            <span className="text-slate-400">Weekly Achievement</span>
            <span
              className={cn(
                "px-3 py-1 rounded-lg font-black shadow-sm",
                stats.weeklyProgress >= 100
                  ? "bg-emerald-500 text-white"
                  : "bg-indigo-600 text-white"
              )}
            >
              {stats.weeklyProgress}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative z-10 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.weeklyProgress, 100)}%` }}
              className="h-full bg-indigo-600 rounded-full relative shadow-[0_0_15px_rgba(79,70,229,0.4)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
            </motion.div>
            {stats.weeklyProgress > 100 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stats.weeklyProgress - 100, 100)}%` }}
                className="absolute left-full top-0 h-full bg-fuchsia-500 rounded-full -translate-x-full shadow-[0_0_15px_rgba(217,70,239,0.4)]"
              />
            )}
          </div>
          <div className="flex justify-between items-center relative z-10">
            <p className="text-[10px] text-slate-400 font-bold font-heading uppercase tracking-wider">
              {stats.mandatoryPending === 0
                ? "All mandatory targets met! ✨"
                : `${stats.mandatoryPending} milestones remaining`}
            </p>
            {stats.weeklyProgress >= 100 && (
              <p className="text-[10px] text-fuchsia-600 font-black font-heading uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 bg-fuchsia-500 rounded-full animate-ping" />
                Bonus Active
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Tasks"
          value={stats.totalAssigned}
          icon={BarChart3}
          color="bg-indigo-600"
          trend="+12%"
        />
        <StatCard
          title="Reward Points"
          value={stats.pointsEarned}
          icon={TrendingUp}
          color="bg-emerald-500"
          trend="+450"
        />
        <StatCard
          title="Pending Items"
          value={stats.pendingReview}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Global Leaderboard"
          value={`#${stats.globalRank}`}
          icon={CheckCircle2}
          color="bg-slate-900"
          trend="Top 5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              Active Missions
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-600 text-xs font-black font-heading uppercase tracking-widest hover:bg-white px-5 py-2.5 rounded-xl transition-all border border-slate-200 hover:shadow-md hover:border-indigo-100 active:scale-95"
            >
              Refresh Data
            </button>
          </div>
          <div className="p-4 sm:p-8 flex-1">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 bg-slate-50 rounded-3xl animate-pulse" />
                ))
              ) : tasks.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="text-slate-300 w-10 h-10" />
                  </div>
                  <p className="text-slate-400 font-bold font-heading uppercase tracking-widest text-sm">
                    No missions assigned yet.
                  </p>
                </div>
              ) : (
                tasks.slice(0, 5).map((task: any, index: number) => (
                  <Link
                    key={task._id}
                    to={`/tasks/${task._id}`}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group/task gap-6"
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative shrink-0 shadow-sm",
                          task.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-600"
                            : task.isBonus
                              ? "bg-fuchsia-50 text-fuchsia-600"
                              : "bg-indigo-50 text-indigo-600"
                        )}
                      >
                        {task.status === "COMPLETED" ? (
                          <CheckCircle2 size={28} />
                        ) : (
                          <Clock size={28} />
                        )}
                        <span className="absolute -top-2 -left-2 w-7 h-7 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black font-heading text-slate-400 shadow-sm group-hover/task:text-indigo-600 transition-colors">
                          {index + 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-black font-heading text-slate-900 group-hover/task:text-indigo-600 transition-colors text-lg tracking-tight">
                            {task.title}
                          </p>
                          {task.isBonus && (
                            <span className="px-2.5 py-1 bg-fuchsia-100 text-fuchsia-700 text-[9px] font-black font-heading uppercase rounded-lg tracking-widest border border-fuchsia-200">
                              Bonus
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 font-heading">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.15em]">
                            +{task.rewardPoints} XP
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
                      <span
                        className={cn(
                          "px-5 py-2 rounded-xl text-[10px] font-black font-heading uppercase tracking-widest border shadow-sm",
                          task.status === "COMPLETED"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : task.status === "PENDING"
                              ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                              : "bg-amber-50 border-amber-100 text-amber-700"
                        )}
                      >
                        {task.status || "In Progress"}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/task:bg-indigo-600 group-hover/task:text-white group-hover/task:shadow-lg group-hover/task:shadow-indigo-500/30 transition-all duration-300">
                        <ChevronRight size={22} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              Intelligence
            </h2>
          </div>
          <div className="p-8 flex-1">
            <div className="space-y-10">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                ))
              ) : notifications.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold font-heading uppercase tracking-widest text-sm">
                    All caught up.
                  </p>
                </div>
              ) : (
                notifications.map((note: any) => (
                  <div
                    key={note._id}
                    className="relative pl-10 group/note"
                  >
                    <div className="absolute left-0 top-1.5 w-1.5 h-full bg-slate-50 rounded-full" />
                    <div className="absolute left-0 top-1.5 w-1.5 h-6 bg-indigo-600 rounded-full group-hover/note:h-full transition-all duration-500" />
                    
                    <p className="text-base font-black font-heading text-slate-900 tracking-tight group-hover/note:text-indigo-600 transition-colors">
                      {note.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">
                      {note.body}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover/note:text-indigo-600 transition-colors">
                        <Clock size={12} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-black font-heading uppercase tracking-widest">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-8 border-t border-slate-50 bg-slate-50/20">
            <Link
              to="/inbox"
              className="group/btn w-full py-4 rounded-2xl border border-slate-200 text-slate-400 font-black font-heading text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-3"
            >
              Access Intelligence Hub 
              <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FellowsDashboard;
