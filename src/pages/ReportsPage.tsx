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
  const totalPoints = completedTasks.reduce(
    (sum: number, t: any) => sum + (t.rewardPoints || 0),
    0
  );
  const completionRate =
    filteredTasks.length > 0
      ? Math.round((completedTasks.length / filteredTasks.length) * 100)
      : 0;

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    color = "blue",
  }: any) => (
    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            color === "blue" && "bg-blue-50 text-blue-600",
            color === "green" && "bg-green-50 text-green-600",
            color === "purple" && "bg-purple-50 text-purple-600",
            color === "amber" && "bg-amber-50 text-amber-600"
          )}
        >
          <Icon size={24} />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold font-heading uppercase",
              trend > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            <TrendingUp size={12} className={trend < 0 ? "rotate-180" : ""} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium font-heading text-neutral-500 mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-bold font-heading text-neutral-900">
        {value}
      </h3>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-100 rounded-xl w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-neutral-100 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-neutral-900 tracking-tight">
            Performance Reports
          </h1>
          <p className="text-neutral-500 mt-1 font-heading">
            Track your progress and achievements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-11 bg-white border border-neutral-100 rounded-xl px-4 pr-10 text-sm font-bold font-heading focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={completedTasks.length}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending Tasks"
          value={pendingTasks.length}
          color="amber"
        />
        <StatCard
          icon={Award}
          label="Total Points"
          value={totalPoints}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="Completion Rate"
          value={`${completionRate}%`}
          color="blue"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Progress */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-heading text-neutral-900">
              Task Breakdown
            </h2>
            <BarChart3 className="text-neutral-400" size={20} />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold font-heading text-neutral-600">
                  Completed
                </span>
                <span className="text-sm font-bold font-heading text-green-600">
                  {completedTasks.length} tasks
                </span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold font-heading text-neutral-600">
                  Pending
                </span>
                <span className="text-sm font-bold font-heading text-amber-600">
                  {pendingTasks.length} tasks
                </span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${100 - completionRate}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold font-heading text-neutral-600">
                  Total Tasks
                </span>
                <span className="text-2xl font-bold font-heading text-neutral-900">
                  {filteredTasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <h3 className="font-bold font-heading">This Week</h3>
            </div>
            <p className="text-3xl font-bold font-heading mb-1">
              {stats?.weeklyProgress || 0}%
            </p>
            <p className="text-xs text-blue-100 font-heading">
              Weekly Progress
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Award className="text-purple-600" size={20} />
              </div>
              <h3 className="font-bold font-heading text-neutral-900">
                Achievements
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 font-heading">
                  Total XP
                </span>
                <span className="text-lg font-bold font-heading text-purple-600">
                  {stats?.totalPoints || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 font-heading">
                  Rank
                </span>
                <span className="text-sm font-bold font-heading text-neutral-900">
                  Fellows
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-neutral-900">
            Recent Activity
          </h2>
          <Calendar className="text-neutral-400" size={20} />
        </div>
        <div className="divide-y divide-neutral-50">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-neutral-300" size={32} />
              </div>
              <p className="text-neutral-500 font-heading">
                No activity in this period
              </p>
            </div>
          ) : (
            filteredTasks.slice(0, 10).map((task: any) => (
              <div
                key={task._id}
                className="p-6 hover:bg-neutral-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      task.status === "COMPLETED"
                        ? "bg-green-50 text-green-600"
                        : "bg-blue-50 text-blue-600"
                    )}
                  >
                    {task.status === "COMPLETED" ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold font-heading text-neutral-900 truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-neutral-500 font-heading">
                      {new Date(task.createdAt).toLocaleDateString()} •{" "}
                      {task.rewardPoints || 0} XP
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold font-heading uppercase tracking-wider shrink-0",
                      task.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    {task.status || "Pending"}
                  </span>
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
