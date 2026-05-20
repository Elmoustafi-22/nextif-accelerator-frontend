import { useState, useEffect } from "react";
import { Mail, Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import { useNotificationStore } from "../store/useNotificationStore";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

const InboxPage = () => {
  const { notifications, isLoading, fetchNotifications, markAsRead } =
    useNotificationStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"messages" | "notifications">("messages");

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredMessages = notifications.filter((m: any) => {
    if (tab === "messages") return m.type === "MESSAGE";
    return m.type === "ANNOUNCEMENT";
  });

  const unreadMessagesCount = notifications.filter(
    (n) => n.type === "MESSAGE" && !n.read
  ).length;
  const unreadNotificationsCount = notifications.filter(
    (n) => n.type === "ANNOUNCEMENT" && !n.read
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-heading text-slate-900 tracking-tight">
          Alerts & Communications
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Stay updated with your latest messages and system alerts.
        </p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col relative group">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Tabs */}
        <div className="flex border-b border-slate-50 px-6 sm:px-12 pt-4 relative z-10 bg-slate-50/30">
          <button
            onClick={() => setTab("messages")}
            className={cn(
              "px-6 sm:px-10 py-5 sm:py-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-3",
              tab === "messages"
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Direct Messages
            {unreadMessagesCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-black shadow-lg shadow-indigo-600/20">
                {unreadMessagesCount}
              </span>
            )}
            {tab === "messages" && (
              <motion.div
                layoutId="tab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full shadow-[0_-2px_10px_rgba(79,70,229,0.3)]"
              />
            )}
          </button>
          <button
            onClick={() => setTab("notifications")}
            className={cn(
              "px-6 sm:px-10 py-5 sm:py-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-3",
              tab === "notifications"
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            System Alerts
            {unreadNotificationsCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-black shadow-lg shadow-indigo-600/20">
                {unreadNotificationsCount}
              </span>
            )}
            {tab === "notifications" && (
              <motion.div
                layoutId="tab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full shadow-[0_-2px_10px_rgba(79,70,229,0.3)]"
              />
            )}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {isLoading ? (
            <div className="p-32 text-center">
              <div className="w-14 h-14 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin mx-auto shadow-sm"></div>
              <p className="mt-6 text-slate-400 font-black font-heading uppercase tracking-widest text-xs">
                Syncing Notifications...
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-32 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-slate-100/50">
                {tab === "messages" ? (
                  <Mail size={40} className="text-slate-300" />
                ) : (
                  <Bell size={40} className="text-slate-300" />
                )}
              </div>
              <h3 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
                All Caught Up
              </h3>
              <p className="text-slate-400 mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                No active {tab} recorded in current cycle. Your feed is clear.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredMessages.map((item: any) => (
                <div
                  key={item._id}
                  onClick={() => {
                    if (!item.read) markAsRead(item._id);
                    if (item.referenceId && item.type === "MESSAGE") {
                      navigate(`/tasks/${item.referenceId}`);
                    }
                  }}
                  className={cn(
                    "p-8 sm:p-12 hover:bg-slate-50 transition-all cursor-pointer group flex items-start gap-8 border-l-[6px] border-transparent relative",
                    !item.read &&
                      "bg-indigo-50/30 border-indigo-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500 border",
                      item.type === "message" || item.type === "MESSAGE"
                        ? "bg-white text-indigo-600 border-indigo-50"
                        : "bg-white text-amber-600 border-amber-50"
                    )}
                  >
                    {item.type === "message" || item.type === "MESSAGE" ? (
                      <Mail size={32} />
                    ) : (
                      <Bell size={32} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                        <h4
                          className={cn(
                            "text-xl font-black tracking-tight",
                            !item.read ? "text-slate-900" : "text-slate-400"
                          )}
                        >
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.8)]"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200/50">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-lg leading-relaxed max-w-3xl whitespace-pre-wrap",
                        !item.read
                          ? "text-slate-600 font-bold"
                          : "text-slate-400 font-medium"
                      )}
                    >
                      {item.body}
                    </p>
                    {item.title.toLowerCase().includes("recording available") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/events");
                        }}
                        className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 w-fit"
                      >
                        <VideoCameraIcon className="w-4 h-4" />
                        Watch Session
                      </button>
                    )}
                  </div>
                  <div className="text-slate-200 group-hover:text-indigo-600 transition-all group-hover:translate-x-2 self-center">
                    <ChevronRight size={32} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
