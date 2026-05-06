import { useState, useEffect } from "react";
import { Mail, Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import { useNotificationStore } from "../store/useNotificationStore";

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inbox</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage your messages and system notifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-neutral-50 px-4 sm:px-8 pt-2">
          <button
            onClick={() => setTab("messages")}
            className={cn(
              "px-4 sm:px-8 py-3 sm:py-5 text-sm font-bold transition-all relative flex items-center gap-2",
              tab === "messages"
                ? "text-blue-600"
                : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            Direct Messages
            {unreadMessagesCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                {unreadMessagesCount}
              </span>
            )}
            {tab === "messages" && (
              <motion.div
                layoutId="tab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setTab("notifications")}
            className={cn(
              "px-4 sm:px-8 py-3 sm:py-5 text-sm font-bold transition-all relative flex items-center gap-2",
              tab === "notifications"
                ? "text-blue-600"
                : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            System Alerts
            {unreadNotificationsCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
            {tab === "notifications" && (
              <motion.div
                layoutId="tab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"
              />
            )}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-24 text-center">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                Loading Communications...
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                {tab === "messages" ? (
                  <Mail size={48} className="text-blue-600" />
                ) : (
                  <Bell size={48} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                Your {tab} is empty
              </h3>
              <p className="text-neutral-500 mt-2 max-w-xs mx-auto">
                When you receive new {tab}, they will show up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
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
                    "p-4 sm:p-8 hover:bg-neutral-50/50 transition-all cursor-pointer group flex items-start gap-4 sm:gap-6 border-l-4 border-transparent",
                    !item.read &&
                      "bg-blue-50/30 border-blue-600 shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]"
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      item.type === "message" || item.type === "MESSAGE"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-amber-50 text-amber-600"
                    )}
                  >
                    {item.type === "message" || item.type === "MESSAGE" ? (
                      <Mail size={28} />
                    ) : (
                      <Bell size={28} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <h4
                          className={cn(
                            "font-bold truncate text-base",
                            !item.read ? "text-neutral-900" : "text-neutral-400"
                          )}
                        >
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest bg-neutral-100/50 px-3 py-1 rounded-full">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        !item.read
                          ? "text-neutral-600 font-medium"
                          : "text-neutral-400"
                      )}
                    >
                      {item.body}
                    </p>
                  </div>
                  <div className="text-neutral-200 group-hover:text-blue-500 transition-colors self-center">
                    <ChevronRight size={24} />
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
