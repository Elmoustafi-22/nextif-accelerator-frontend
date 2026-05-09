import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Download,
  ChevronDown,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { cn } from "../utils/cn";
import Button from "../components/Button";
import { motion } from "framer-motion";

const ReportsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // all, week, month

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, tasksRes] = await Promise.all([
          axiosInstance.get("/ambassador/stats"),
          axiosInstance.get("/tasks/my/all"),
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Error fetching reports data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredTasks = () => {
    if (timeRange === "all") return tasks;

    const now = new Date();
    const filtered = tasks.filter((task: any) => {
      const taskDate = new Date(task.createdAt);
      if (timeRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return taskDate >= weekAgo;
      } else if (timeRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return taskDate >= monthAgo;
      }
      return true;
    });
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const completedTasks = filteredTasks.filter(
    (t: any) => t.status === "COMPLETED"
  );
  const pendingTasks = filteredTasks.filter(
    (t: any) => t.status !== "COMPLETED"
  );
  const totalPoints = stats?.pointsEarned || 0;
  const completionRate =
    filteredTasks.length > 0
      ? Math.round((completedTasks.length / filteredTasks.length) * 100)
      : 0;

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    color = "indigo",
  }: any) => (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-50/50 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500",
              color === "indigo" && "bg-indigo-50 text-indigo-600",
              color === "emerald" && "bg-emerald-50 text-emerald-600",
              color === "fuchsia" && "bg-fuchsia-50 text-fuchsia-600",
              color === "amber" && "bg-amber-50 text-amber-600"
            )}
          >
            <Icon size={28} />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black font-heading uppercase tracking-widest border",
                trend > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              )}
            >
              <TrendingUp size={12} className={trend < 0 ? "rotate-180" : ""} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em] mb-2">
          {label}
        </p>
        <h3 className="text-4xl font-black font-heading text-slate-900 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-10 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-10 bg-slate-100 rounded-2xl w-64" />
            <div className="h-6 bg-slate-50 rounded-xl w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-heading text-slate-900 tracking-tight">
            Personnel Analytics
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Comprehensive program performance and task achievement metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-14 bg-white border border-slate-100 rounded-2xl px-6 pr-12 text-xs font-black font-heading uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 appearance-none cursor-pointer shadow-sm transition-all"
            >
              <option value="week">7 Day Cycle</option>
              <option value="month">30 Day Cycle</option>
              <option value="all">Full Protocol</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <Button 
            variant="outline" 
            className="h-14 px-8 rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-xs font-black uppercase tracking-widest"
            leftIcon={<Download size={18} />}
          >
            Export Intel
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          icon={CheckCircle2}
          label="Missions Completed"
          value={completedTasks.length}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Pending Protocol"
          value={pendingTasks.length}
          color="amber"
        />
        <StatCard
          icon={Award}
          label="Merit Points"
          value={totalPoints}
          color="fuchsia"
        />
        <StatCard
          icon={Target}
          label="Efficiency Rate"
          value={`${completionRate}%`}
          color="indigo"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Completion Progress */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
                  Protocol Distribution
                </h2>
                <p className="text-slate-400 text-sm font-medium font-heading">Mission status and deployment tracking</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                <BarChart3 size={24} />
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest">
                      Secured Objectives
                    </span>
                  </div>
                  <span className="text-sm font-black font-heading text-emerald-600">
                    {completedTasks.length} Units
                  </span>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-100/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/20 relative"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest">
                      In-Progress Actions
                    </span>
                  </div>
                  <span className="text-sm font-black font-heading text-amber-600">
                    {pendingTasks.length} Units
                  </span>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-100/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - completionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/20 relative"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </motion.div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-black font-heading text-slate-400 uppercase tracking-[0.2em]">
                  Total Campaigns Logged
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-heading text-slate-900 tracking-tighter">
                    {filteredTasks.length}
                  </span>
                  <span className="text-xs font-black text-slate-300 uppercase">Operational Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-black font-heading tracking-tight">Active Cycle</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black font-heading tracking-tighter">
                  {stats?.weeklyProgress || 0}%
                </span>
                <span className="text-sm font-black text-indigo-100 uppercase tracking-widest opacity-80">Sync</span>
              </div>
              <p className="text-[10px] text-indigo-100 font-black uppercase tracking-[0.2em] opacity-60">
                Weekly Task Progress
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-fuchsia-50 rounded-2xl flex items-center justify-center border border-fuchsia-100 text-fuchsia-600 group-hover:scale-110 transition-transform">
                  <Award size={24} />
                </div>
                <h3 className="text-xl font-black font-heading text-slate-900 tracking-tight">
                  Status Feed
                </h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest">
                    Task Points
                  </span>
                  <span className="text-xl font-black font-heading text-indigo-600 tracking-tight">
                    {stats?.taskPoints || 0}
                  </span>
                </div>
                <div className="h-px bg-slate-50 w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest">
                    Attendance Points
                  </span>
                  <span className="text-xl font-black font-heading text-emerald-600 tracking-tight">
                    {stats?.attendancePoints || 0}
                  </span>
                </div>
                <div className="h-px bg-slate-50 w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest">
                    Total XP
                  </span>
                  <span className="text-2xl font-black font-heading text-fuchsia-600 tracking-tight">
                    {stats?.pointsEarned || 0}
                  </span>
                </div>
                <div className="h-px bg-slate-50 w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black font-heading text-slate-400 uppercase tracking-widest">
                    Global Rank
                  </span>
                  <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black font-heading uppercase tracking-widest rounded-xl border border-indigo-100 shadow-sm">
                    {stats?.globalRank || "Fellows"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              Activity History
            </h2>
            <p className="text-slate-400 text-sm font-medium font-heading tracking-tight">Real-time program participation history</p>
          </div>
          <div className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm">
            <Calendar size={24} />
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredTasks.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100/50">
                <BarChart3 className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-400 font-black font-heading uppercase tracking-widest text-xs">
                Intelligence database empty for this cycle
              </p>
            </div>
          ) : (
            filteredTasks.slice(0, 10).map((task: any) => (
              <div
                key={task._id}
                className="p-8 hover:bg-slate-50 transition-all group/item cursor-default"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-500",
                      task.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    )}
                  >
                    {task.status === "COMPLETED" ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Clock size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black font-heading text-slate-900 truncate tracking-tight group-hover/item:text-indigo-600 transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-black font-heading uppercase tracking-widest mt-1 opacity-70">
                      {new Date(task.createdAt).toLocaleDateString()} • {task.rewardPoints || 0} XP Merit
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black font-heading uppercase tracking-[0.2em] shrink-0 border shadow-sm",
                        task.status === "COMPLETED"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-indigo-50 border-indigo-100 text-indigo-700"
                      )}
                    >
                      {task.status || "Deployed"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
