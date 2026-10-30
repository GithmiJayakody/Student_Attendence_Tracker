import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock3,
  ClipboardCheck,
  LoaderCircle,
} from "lucide-react";
import api from "../services/api";

function SubjectAttendanceHistory() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [subject, setSubject] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const subjectsResponse = await api.get(
          "/subjects/viewEnrolled"
        );

        const enrolledSubjects = Array.isArray(subjectsResponse.data)
          ? subjectsResponse.data
          : subjectsResponse.data.subjects || [];

        const selectedSubject = enrolledSubjects.find(
          (item) => item._id === subjectId
        );

        if (!selectedSubject) {
          setError("Subject not found in your enrolled subjects.");
          return;
        }

        setSubject(selectedSubject);

        const attendanceResponse = await api.get(
          `/attendance/my/${subjectId}`
        );

        const data = attendanceResponse.data;

        setAttendance(data.attendance || []);
        setTotalSessions(data.totalSessions || 0);
        setPercentage(Number(data.percentage || 0));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load attendance history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, [subjectId]);

  const presentCount = attendance.filter(
    (record) => record.status?.toLowerCase() === "present"
  ).length;

  const absentCount = attendance.filter(
    (record) => record.status?.toLowerCase() === "absent"
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status?.toLowerCase() === "late"
  ).length;

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-emerald-100 text-emerald-700";
      case "absent":
        return "bg-red-100 text-red-600";
      case "late":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#edf6ff] px-4 py-6 text-[#10234e] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/student")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <header className="mb-7">
          <div className="flex items-center gap-3">

            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Attendance History
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Session-wise attendance records for this subject.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-slate-500 shadow-sm">
            <LoaderCircle size={20} className="animate-spin" />
            Loading attendance history...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => navigate("/student")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Subject details */}
            <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-medium text-blue-600">
                {subject?.code || "Subject"}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                {subject?.name || "Subject Attendance"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {subject?.lecturer?.name
                  ? `Lecturer: ${subject.lecturer.name}`
                  : "Your attendance records for this subject"}
              </p>
            </section>

            {/* Summary cards */}
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays size={21} />
                </div>
                <p className="text-sm text-slate-500">Total Sessions</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {totalSessions}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle size={21} />
                </div>
                <p className="text-sm text-slate-500">Present</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {presentCount}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle size={21} />
                </div>
                <p className="text-sm text-slate-500">Absent</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {absentCount}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Clock3 size={21} />
                </div>
                <p className="text-sm text-slate-500">Late</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {lateCount}
                </p>
              </div>
            </section>

            {/* Overall attendance rate */}
            <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-bold text-slate-800">
                  Attendance Percentage
                </h2>
                <span
                  className={`text-lg font-extrabold ${
                    percentage < 80
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentage < 80 ? "bg-red-500" : "bg-blue-600"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, percentage))}%`,
                  }}
                />
              </div>

              {percentage < 80 && (
                <p className="mt-3 text-sm text-red-600">
                  Your attendance is below 80%. Please pay attention to
                  upcoming sessions.
                </p>
              )}
            </section>

            {/* Session-wise history */}
            <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
                <ClipboardCheck className="text-blue-600" size={23} />
                <div>
                  <h2 className="text-lg font-bold">Session-wise History</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {attendance.length} attendance record(s)
                  </p>
                </div>
              </div>

              {attendance.length === 0 ? (
                <div className="p-10 text-center">
                  <CalendarDays
                    size={34}
                    className="mx-auto mb-3 text-blue-300"
                  />
                  <p className="font-semibold text-slate-700">
                    No attendance records yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Records will appear here after attendance is marked.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-162.5 text-left text-sm">
                    <thead className="bg-blue-50 text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="px-5 py-4">#</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Time</th>
                        <th className="px-5 py-4">Topic</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...attendance]
                        .sort(
                          (a, b) =>
                            new Date(b.session?.date || 0) -
                            new Date(a.session?.date || 0)
                        )
                        .map((record, index) => (
                          <tr
                            key={record._id}
                            className="border-t border-blue-50 transition hover:bg-blue-50/40"
                          >
                            <td className="px-5 py-4 text-slate-500">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              {formatDate(record.session?.date)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {record.session?.startTime || "—"}
                              {record.session?.endTime
                                ? ` - ${record.session.endTime}`
                                : ""}
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-800">
                              {record.session?.topic || "—"}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                                  record.status
                                )}`}
                              >
                                {record.status || "Unknown"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="py-7 text-center text-xs text-slate-500">
          StudentTrack · Student Attendance Management System
        </footer>
      </div>
    </div>
  );
}

export default SubjectAttendanceHistory;
