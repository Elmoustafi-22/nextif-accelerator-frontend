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
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Events & Attendance
          </h1>
          <p className="text-neutral-500">
            Stay updated with upcoming sessions and track your participation.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">
            Loading events...
          </div>
        ) : (
          <>
            {/* Upcoming Events Section */}
            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Events
              </h2>

              {events.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center text-neutral-500">
                  No upcoming events scheduled at the moment.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                    >
                      <div className="h-2 bg-blue-600 w-full"></div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
                            {event.type}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4 flex-1">
                          <div className="flex items-center text-sm text-neutral-600">
                            <CalendarIcon className="w-4 h-4 mr-2 text-neutral-400" />
                            {format(
                              new Date(event.date),
                              "EEE, MMM d, yyyy • p"
                            )}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-neutral-600">
                              {event.location.startsWith("http") ? (
                                <VideoCameraIcon className="w-4 h-4 mr-2 text-neutral-400" />
                              ) : (
                                <MapPinIcon className="w-4 h-4 mr-2 text-neutral-400" />
                              )}
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-neutral-500 line-clamp-3 mb-4">
                            {event.description}
                          </p>
                        )}

                        {event.location &&
                          event.location.startsWith("http") && (
                            <a
                              href={event.location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-auto block w-full py-2 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              Join Event
                            </a>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Attendance Section */}
            {myAttendance.length > 0 && (
              <section className="pt-4">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                  Attendance History
                </h2>

                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {myAttendance.map((record) => (
                          <tr
                            key={record._id}
                            className="hover:bg-neutral-50/50"
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-neutral-900">
                                {record.event.title}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {record.event.type}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600">
                              {format(
                                new Date(record.event.date),
                                "MMM d, yyyy"
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${
                                                          record.status ===
                                                          "PRESENT"
                                                            ? "bg-green-100 text-green-800"
                                                            : record.status ===
                                                              "EXCUSED"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                              >
                                {record.status === "PRESENT" && (
                                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                                )}
                                {record.status === "ABSENT" && (
                                  <XCircleIcon className="w-3 h-3 mr-1" />
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
          </>
        )}
      </div>
    </>
  );
};

export default EventsPage;
