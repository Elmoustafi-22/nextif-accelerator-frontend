import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPinIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: string;
  status: string;
}

interface AttendanceRecord {
  _id: string;
  event: Event;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  markedAt: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
          Tactical Operations
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Synchronize with upcoming training sessions and track your operational presence.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-black font-heading text-xs uppercase tracking-widest">
            Scanning upcoming protocols...
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
                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col overflow-hidden relative"
                  >
                    <div className="h-2 bg-indigo-600 w-full group-hover:h-3 transition-all duration-500"></div>
                    <div className="p-8 flex flex-col flex-1 relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase border border-indigo-100 shadow-sm">
                          {event.type}
                        </span>
                      </div>

                      <h3 className="text-xl font-black font-heading text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>

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

                      {event.location &&
                        event.location.startsWith("http") && (
                          <a
                            href={event.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto block w-full py-4 text-center bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20 transition-all active:scale-95"
                          >
                            Initiate Link
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
    </div>
  );
};

export default EventsPage;
