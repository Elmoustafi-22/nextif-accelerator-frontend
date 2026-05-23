import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Video,
  Award,
  Zap,
  Users,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import axiosInstance from "../api/axiosInstance";
import { cn } from "../utils/cn";
import { generateGoogleCalendarLink } from "../utils/calendar";

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileHover={{ y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
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
  const { addToast } = useToastStore();
  const navigate = useNavigate();
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
  const [invites, setInvites] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, statsRes, notesRes, eventsRes, paymentRes, profileRes, invitesRes] = await Promise.all([
          axiosInstance.get("/tasks/my/all"),
          axiosInstance.get("/ambassador/dashboard/stats"),
          axiosInstance.get("/notifications"),
          axiosInstance.get("/events?status=UPCOMING"),
          axiosInstance.get("/payments/config").catch(() => ({ data: null })),
          axiosInstance.get("/ambassador/me").catch(() => null),
          axiosInstance.get("/capstone/invites").catch(() => ({ data: { invites: [] } })),
        ]);
        setTasks(tasksRes.data);
        setStats(statsRes.data);
        setNotifications(notesRes.data.slice(0, 5));
        setUpcomingEvents(eventsRes.data.slice(0, 2)); // Show top 2 upcoming
        setPaymentConfig(paymentRes?.data);
        setInvites(invitesRes.data.invites || []);
        
        if (profileRes?.data) {
          useAuthStore.getState().updateUser(profileRes.data.data || profileRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isJoinable = (eventDate: string) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    return now >= new Date(eventTime.getTime() - 30 * 60000) && now <= new Date(eventTime.getTime() + 120 * 60000);
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      await axiosInstance.post(`/capstone/invites/${inviteId}/accept`);
      addToast("Successfully joined the team!", "success");
      
      // Navigate to capstone page to see the new team
      navigate("/capstone");
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to accept invite", "error");
    }
  };

  const rejectInvite = async (inviteId: string) => {
    try {
      await axiosInstance.post(`/capstone/invites/${inviteId}/reject`);
      addToast("Invitation declined", "success");
      const res = await axiosInstance.get('/capstone/invites');
      setInvites(res.data.invites || []);
    } catch (err: any) {
      console.error(err);
      addToast("Failed to reject invitation", "error");
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* Header & Progress Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-1 md:space-y-2">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-4xl font-black font-heading text-slate-900 tracking-tight"
          >
            Welcome back, <span className="text-indigo-600">{user?.firstName || "Ambassador"}</span> 👋
          </motion.h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">
            Monitor your program progress and task achievements.
          </p>

          {/* Pending Team Invites */}
          {invites.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-indigo-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black font-heading tracking-tight">Team Recruitment</h4>
                    <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest opacity-80">Pending Invitations</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {invites.map(inv => (
                    <div key={inv._id} className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black font-heading tracking-tight">{inv.team.name}</p>
                        <p className="text-xs text-indigo-100 font-medium">
                          Invited by <span className="font-black text-white">{inv.inviter.firstName} {inv.inviter.lastName}</span>
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => acceptInvite(inv._id)} 
                          className="flex-1 md:flex-none px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => rejectInvite(inv._id)} 
                          className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-500/30 text-white border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500/50 transition-all active:scale-95"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Weekly Progress Bar */}
        <div className="w-full lg:max-w-md bg-white p-5 md:p-7 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-3 md:gap-4 relative overflow-hidden group">
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
          </div>
          <p className="text-[10px] text-slate-400 font-bold font-heading uppercase tracking-wider relative z-10">
            {stats.mandatoryPending === 0
              ? "All mandatory targets met! ✨"
              : `${stats.mandatoryPending} milestones remaining`}
          </p>
        </div>
      </div>

      {/* Certificate Claim Banner */}
      {!user?.profile?.hasPaidCertificate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-indigo-600 via-indigo-700 to-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                <Zap size={14} className="text-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Program Milestone</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black font-heading tracking-tight">
                Certificate Fee
              </h2>
              <p className="text-indigo-100/80 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                Secure your certificate for the incredible work and dedication involved in this project.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 w-full lg:w-auto min-w-0 sm:min-w-[300px] text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Award className="text-white" size={32} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Certificate Fee</p>
                  <h4 className="text-2xl md:text-3xl font-black font-heading tracking-tight">
                    {paymentConfig?.displayPrice || "..."}
                  </h4>
                </div>
              </div>
              <Link
                to="/certificate"
                className="w-full py-4 md:py-5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Content Row: Tactical Briefings & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Tactical Briefings (Upcoming Events) */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-xl font-black font-heading text-slate-900 tracking-tight uppercase tracking-widest flex items-center gap-2 md:gap-3">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              Upcoming Sessions
            </h2>
            <Link to="/events" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="h-40 md:h-48 bg-slate-50 rounded-2xl md:rounded-[2.5rem] animate-pulse" />
              <div className="h-40 md:h-48 bg-slate-50 rounded-2xl md:rounded-[2.5rem] animate-pulse" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-slate-50 p-8 md:p-12 rounded-2xl md:rounded-[2.5rem] border border-slate-100 text-center">
               <p className="text-slate-400 font-bold font-heading uppercase tracking-widest text-[10px] md:text-xs">
                No sessions scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {upcomingEvents.map((event: any) => (
                <div key={event._id} className="bg-slate-900 rounded-2xl md:rounded-[2rem] p-5 md:p-8 text-white relative overflow-hidden group border border-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-indigo-500/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className="text-[9px] font-black tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl uppercase border border-indigo-500/20">
                      {event.type} Session
                    </span>
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black font-heading mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mb-8">
                    {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.location?.startsWith("http") ? (
                    <div className="flex flex-col gap-3">
                      {isJoinable(event.date) ? (
                        <a href={event.location} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                          <Video size={14} /> Join Now
                        </a>
                      ) : (
                        <div className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                          Awaiting Sync
                        </div>
                      )}
                      <a 
                        href={generateGoogleCalendarLink(event.title, event.date, event.explanation || "NextIF Mentorship Session", event.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                         Sync to Calendar
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link to="/events" className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                        View Details
                      </Link>
                      <a 
                        href={generateGoogleCalendarLink(event.title, event.date, event.explanation || "NextIF Mentorship Session", event.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                         Sync to Calendar
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Intelligence (Notifications) */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
          <div className="p-5 md:p-8 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-xl md:text-2xl font-black font-heading text-slate-900 tracking-tight">
              Updates & Activity
            </h2>
          </div>
          <div className="p-5 md:p-8 flex-1">
            <div className="space-y-6 md:space-y-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ))
              ) : notifications.length === 0 ? (
                <p className="text-slate-400 font-bold font-heading uppercase tracking-widest text-[10px] text-center py-10">
                  No new data.
                </p>
              ) : (
                notifications.map((note: any) => (
                  <div key={note._id} className="relative pl-8 group/note">
                    <div className="absolute left-0 top-1.5 w-1 h-full bg-slate-50 rounded-full" />
                    <div className="absolute left-0 top-1.5 w-1 h-6 bg-indigo-600 rounded-full group-hover/note:h-full transition-all duration-500" />
                    <p className="text-sm font-black font-heading text-slate-900 tracking-tight group-hover/note:text-indigo-600 transition-colors">
                      {note.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                      {note.body}
                    </p>
                    {note.title.toLowerCase().includes("recording available") && (
                      <Link
                        to="/events"
                        className="mt-3 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Video size={12} /> Watch Session
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-8 border-t border-slate-50">
            <Link to="/inbox" className="group/btn w-full py-4 rounded-2xl border border-slate-200 text-slate-400 font-black font-heading text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-3">
              View All Updates <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total XP" value={stats.pointsEarned} icon={TrendingUp} color="bg-indigo-600" trend="+450" />
        <StatCard title="Active Missions" value={stats.totalAssigned} icon={BarChart3} color="bg-emerald-500" />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock} color="bg-amber-500" />
        <StatCard title="Global Rank" value={`#${stats.globalRank}`} icon={CheckCircle2} color="bg-slate-900" />
      </div>

      {/* Active Tasks */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl md:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Active Tasks
          </h2>
          <button onClick={() => window.location.reload()} className="text-indigo-600 text-[10px] md:text-xs font-black font-heading uppercase tracking-widest hover:bg-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl transition-all border border-slate-200">
            Sync Data
          </button>
        </div>
        <div className="p-5 md:p-8">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
              ))
            ) : tasks.length === 0 ? (
              <p className="text-slate-400 font-bold font-heading uppercase tracking-widest text-sm text-center py-10">
                No missions assigned.
              </p>
            ) : (
              tasks.slice(0, 5).map((task: any) => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="flex items-center justify-between p-3.5 md:p-6 rounded-2xl md:rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group/task">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all shadow-sm", task.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600")}>
                      {task.status === "COMPLETED" ? <CheckCircle2 size={20} className="md:w-6 md:h-6" /> : <Clock size={20} className="md:w-6 md:h-6" />}
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-black font-heading text-slate-900 group-hover/task:text-indigo-600 transition-colors tracking-tight">
                        {task.title}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover/task:text-indigo-600 group-hover/task:translate-x-1 transition-all md:w-5 md:h-5" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FellowsDashboard;
