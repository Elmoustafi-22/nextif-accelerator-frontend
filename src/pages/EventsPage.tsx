import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPinIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: string;
  speaker?: string;
  recordingLink?: string;
  status: string;
}

interface AttendanceRecord {
  _id: string;
  event: Event;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  marks: number;
  markedAt: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const isJoinable = (eventDate: string) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const thirtyMinutesBefore = new Date(eventTime.getTime() - 30 * 60000);
    const twoHoursAfter = new Date(eventTime.getTime() + 120 * 60000);

    return now >= thirtyMinutesBefore && now <= twoHoursAfter;
  };

  const isOnline = (location?: string) => {
    if (!location) return false;
    return location.toLowerCase().startsWith("http") || 
           location.toLowerCase().includes("zoom.us") || 
           location.toLowerCase().includes("meet.google") ||
           location.toLowerCase().includes("teams.microsoft");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, attendanceRes] = await Promise.all([
          api.get("/events?status=UPCOMING"),
          api.get("/events/my-attendance"),
        ]);
        setEvents(eventsRes.data);
        setMyAttendance(attendanceRes.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-heading text-slate-900 tracking-tight">
          Program Sessions
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Stay updated with upcoming sessions and track your program participation.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-black font-heading text-xs uppercase tracking-widest">
            Loading sessions...
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Upcoming Events Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
                Upcoming Briefings
              </h2>
            </div>

            {events.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-black font-heading text-xs uppercase tracking-widest">
                  No active operations scheduled in current sector.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col overflow-hidden relative cursor-pointer"
                  >
                    <div className="h-2 bg-indigo-600 w-full group-hover:h-3 transition-all duration-500"></div>
                    <div className="p-8 flex flex-col flex-1 relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase border border-indigo-100 shadow-sm">
                          {event.type}
                        </span>
                      </div>

                      <h3 className="text-xl font-black font-heading text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>
                      {event.speaker && (
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">
                          Speaker: {event.speaker}
                        </p>
                      )}

                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-center text-sm font-bold text-slate-500">
                          <CalendarIcon className="w-5 h-5 mr-3 text-indigo-400" />
                          {format(
                            new Date(event.date),
                            "EEE, MMM d, yyyy • p"
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-sm font-bold text-slate-500">
                            {event.location.startsWith("http") ? (
                              <VideoCameraIcon className="w-5 h-5 mr-3 text-indigo-400" />
                            ) : (
                              <MapPinIcon className="w-5 h-5 mr-3 text-indigo-400" />
                            )}
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3 mb-8">
                          {event.description}
                        </p>
                      )}

                      {isOnline(event.location) ? (
                        isJoinable(event.date) ? (
                          <a
                            href={event.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-auto block w-full py-4 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all active:scale-95 mb-3"
                          >
                            Join Briefing Now
                          </a>
                        ) : (
                          <div className="mt-auto block w-full py-4 text-center bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-3 cursor-not-allowed">
                            Link Active 30m Before
                          </div>
                        )
                      ) : event.type === "WEBINAR" || event.type === "SESSION" ? (
                         <div className="mt-auto block w-full py-4 text-center bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-3 cursor-not-allowed">
                            Link Pending
                          </div>
                      ) : null}
                      {event.recordingLink && (
                        <a
                          href={event.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full py-4 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/10 hover:shadow-emerald-700/20 transition-all active:scale-95"
                        >
                          Watch Recording
                        </a>
                      )}
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Attendance Section */}
          {myAttendance.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
                  Presence Log
                </h2>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Protocol Objective
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Cycle Date
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Operational Status
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Assigned Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {myAttendance.map((record) => (
                        <tr
                          key={record._id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-10 py-8">
                            <div className="font-black text-lg text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                              {record.event.title}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {record.event.type} Protocol
                            </div>
                          </td>
                          <td className="px-10 py-8 text-sm font-bold text-slate-500">
                            {format(
                              new Date(record.event.date),
                              "MMM d, yyyy"
                            )}
                          </td>
                          <td className="px-10 py-8">
                            <span
                              className={cn(
                                "inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                record.status === "PRESENT"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                  : record.status === "EXCUSED"
                                  ? "bg-amber-50 border-amber-100 text-amber-700"
                                  : "bg-rose-50 border-rose-100 text-rose-700"
                              )}
                            >
                              {record.status === "PRESENT" && (
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                              )}
                              {record.status === "ABSENT" && (
                                <XCircleIcon className="w-4 h-4 mr-2" />
                              )}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-900">
                                {record.marks}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Points
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-8 right-8 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-colors z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="h-3 bg-indigo-600 w-full" />

            <div className="p-10 sm:p-16 space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl uppercase border border-indigo-100">
                  {selectedEvent.type} Protocol
                </span>
                <h2 className="text-4xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                      <p className="font-bold text-slate-700">
                        {format(new Date(selectedEvent.date), "EEEE, MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(selectedEvent.date), "p")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <MapPinIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="font-bold text-slate-700 truncate max-w-[200px]">
                        {selectedEvent.location || "Internal Operations"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Speaker</p>
                      <p className="font-bold text-slate-700">
                        {selectedEvent.speaker || "Operational Command"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <ClockIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        {selectedEvent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Briefing Description</p>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-medium">
                  {selectedEvent.description || "No details available for this session."}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isOnline(selectedEvent.location) ? (
                  <a
                    href={selectedEvent.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex-1 py-5 text-center rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95",
                      isJoinable(selectedEvent.date)
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isJoinable(selectedEvent.date) ? "Join Live Briefing" : "Link Active 30m Before"}
                  </a>
                ) : (selectedEvent.type === "WEBINAR" || selectedEvent.type === "SESSION") && (
                   <div className="flex-1 py-5 text-center bg-slate-200 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">
                      Link Pending
                   </div>
                )}
                {selectedEvent.recordingLink && (
                  <div className="space-y-4 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Recording</p>
                    {selectedEvent.recordingLink.includes("drive.google.com") ? (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
                        <iframe
                          src={selectedEvent.recordingLink.replace("/view?usp=sharing", "/preview").replace("/view", "/preview")}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={selectedEvent.recordingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-5 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        Watch Recording
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
