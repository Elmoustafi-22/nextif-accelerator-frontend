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
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl text-white", color)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="text-neutral-500 text-sm font-medium font-heading">{title}</p>
    <h3 className="text-3xl font-bold font-heading text-neutral-900 mt-1">
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
        setNotifications(notesRes.data.slice(0, 5)); // Only show top 5
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-neutral-900 tracking-tight">
            Hello, {user?.firstName || "Ambassador"} 👋
          </h1>
          <p className="text-neutral-500 mt-1 font-heading">
            Here's your progress for this week.
          </p>
        </div>

        {/* Weekly Progress Bar */}
        <div className="flex-1 max-w-md bg-white p-6 rounded-4xl border border-neutral-100 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs font-black font-heading uppercase tracking-widest">
            <span className="text-neutral-400">Weekly Progress</span>
            <span
              className={cn(
                "px-3 py-1 rounded-full font-heading",
                stats.weeklyProgress >= 100
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              {stats.weeklyProgress}%
            </span>
          </div>
          <div className="h-4 bg-neutral-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.weeklyProgress, 100)}%` }}
              className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
            />
            {stats.weeklyProgress > 100 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(stats.weeklyProgress - 100, 100)}%`,
                }}
                className="absolute left-full top-0 h-full bg-purple-500 rounded-full -translate-x-full"
                style={{
                  width: `${Math.min(stats.weeklyProgress - 100, 100)}%`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[10px] text-neutral-400 font-bold font-heading uppercase">
              {stats.mandatoryPending === 0
                ? "Mandatory Completed! 🎉"
                : `${stats.mandatoryPending} Tasks Remaining`}
            </p>
            {stats.weeklyProgress >= 100 && (
              <p className="text-[10px] text-purple-600 font-black font-heading uppercase tracking-tighter">
                🔥 Bonus Zone
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.totalAssigned}
          icon={BarChart3}
          color="bg-blue-600 shadow-blue-200 shadow-xl"
        />
        <StatCard
          title="Points Earned"
          value={stats.pointsEarned}
          icon={TrendingUp}
          color="bg-green-500 shadow-green-200 shadow-xl"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Clock}
          color="bg-amber-500 shadow-amber-200 shadow-xl"
        />
        <StatCard
          title="Fellows Rank"
          value={stats.globalRank}
          icon={CheckCircle2}
          color="bg-neutral-900 shadow-neutral-200 shadow-xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
            <h2 className="text-xl font-bold font-heading text-neutral-900 tracking-tight">
              Your Assigned Tasks
            </h2>
            <Link
              to="/dashboard"
              className="text-blue-600 text-sm font-bold font-heading hover:bg-white px-4 py-2 rounded-xl transition-all border border-neutral-100 hover:shadow-sm"
            >
              Refresh
            </Link>
          </div>
          <div className="p-4 sm:p-8 flex-1">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-neutral-50 rounded-3xl animate-pulse"
                  ></div>
                ))
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-neutral-300" />
                  </div>
                  <p className="text-neutral-500 font-medium">
                    No tasks assigned yet.
                  </p>
                </div>
              ) : (
                tasks.slice(0, 5).map((task: any, index: number) => (
                  <Link
                    key={task._id}
                    to={`/tasks/${task._id}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-3xl hover:bg-neutral-50 transition-all border border-neutral-50 group hover:border-blue-100 gap-4"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative",
                          task.status === "COMPLETED"
                            ? "bg-green-50 text-green-600"
                            : task.isBonus
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                        )}
                      >
                        {task.status === "COMPLETED" ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Clock size={24} />
                        )}
                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-white border border-neutral-100 rounded-lg flex items-center justify-center text-[10px] font-black font-heading text-neutral-400 shadow-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold font-heading text-neutral-900 group-hover:text-blue-600 transition-colors text-lg">
                            {task.title}
                          </p>
                          {task.isBonus && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-black font-heading uppercase rounded-md tracking-tighter">
                              Bonus
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 font-heading">
                          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <span className="w-1 h-1 bg-neutral-200 rounded-full"></span>
                          <p className="text-xs text-blue-600 font-bold">
                            +{task.rewardPoints} Points
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black font-heading uppercase tracking-widest border",
                          task.status === "COMPLETED"
                            ? "bg-green-50 border-green-100 text-green-700"
                            : task.status === "PENDING"
                              ? "bg-blue-50 border-blue-100 text-blue-700"
                              : "bg-amber-50 border-amber-100 text-amber-700"
                        )}
                      >
                        {task.status || "Pending"}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-8 border-b border-neutral-100 bg-neutral-50/30">
            <h2 className="text-xl font-bold font-heading text-neutral-900 tracking-tight">
              Recent Alerts
            </h2>
          </div>
          <div className="p-4 sm:p-8 flex-1">
            <div className="space-y-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-neutral-50 rounded-2xl animate-pulse"
                  ></div>
                ))
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-neutral-500 font-medium">
                    No recent notifications.
                  </p>
                </div>
              ) : (
                notifications.map((note: any) => (
                  <div
                    key={note._id}
                    className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-1.5 before:bottom-0 before:bg-blue-50 before:rounded-full group"
                  >
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full group-hover:scale-150 transition-transform"></div>
                    <p className="text-sm font-black font-heading text-neutral-900 tracking-tight">
                      {note.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 lines-clamp-2 leading-relaxed">
                      {note.body}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-bold font-heading uppercase tracking-tighter mt-3 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-6 border-t border-neutral-50 bg-neutral-50/20">
            <Link
              to="/inbox"
              className="text-neutral-400 font-bold font-heading text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              View Full Inbox <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FellowsDashboard;
