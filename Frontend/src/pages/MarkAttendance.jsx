import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Timer,
} from "lucide-react";
import api from "../services/api";

function MarkAttendance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId) {
        setError("Please select a session from the Lecturer Dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const sessionResponse = await api.get(`/sessions/${sessionId}`);
        const sessionData = sessionResponse.data;
        setSession(sessionData);

        const subjectId =
          typeof sessionData.subject === "object"
            ? sessionData.subject?._id
            : sessionData.subject;

        const [subjectResponse, attendanceResponse] = await Promise.all([
          api.get("/subjects/my"),
          api.get(`/attendance/session/${sessionId}`),
        ]);

        const subject = subjectResponse.data.find(
          (item) => item._id === subjectId
        );

        if (!subject) {
          throw new Error("Subject not found.");
        }

        const enrolledStudents = subject.enrolledStudents || [];
        const existingRecords = attendanceResponse.data || [];

        const rows = enrolledStudents.map((student) => {
          const existing = existingRecords.find(
            (record) =>
              (record.student?._id || record.student) === student._id
          );

          return {
            studentId: student._id,
            name: student.name,
            email: student.email,
            status: existing?.status || "present",
            remarks: existing?.remarks || "",
          };
        });

        setStudents(rows);

        const attendanceMap = {};
        const remarksMap = {};

        rows.forEach((student) => {
          attendanceMap[student.studentId] = student.status;
          remarksMap[student.studentId] = student.remarks;
        });

        setAttendance(attendanceMap);
        setRemarks(remarksMap);
      } catch (err) {
        console.error("Failed to load attendance page:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load session attendance."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        `${student.name} ${student.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  const counts = useMemo(() => {
    const values = Object.values(attendance);

    return {
      total: students.length,
      present: values.filter((value) => value === "present").length,
      absent: values.filter((value) => value === "absent").length,
      late: values.filter((value) => value === "late").length,
    };
  }, [attendance, students]);

  const attendancePercentage =
    counts.total > 0
      ? Math.round((counts.present / counts.total) * 100)
      : 0;

  const updateStatus = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  };

  
  const saveAttendance = async () => {
    try {
      setSaving(true);
      setError("");

      await api.post(`/attendance/${sessionId}`, {
        attendanceData: students.map((student) => ({
          studentId: student.studentId,
          status: attendance[student.studentId] || "present",
          remarks: remarks[student.studentId] || "",
        })),
      });

      setShowSuccessPopup(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };


  const subject =
    session && typeof session.subject === "object"
      ? session.subject
      : null;

  return (
    <div className="min-h-screen bg-[#eef6ff] text-[#10234e]">
     
      <main className="mx-auto max-w-375 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/lecturer")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
            <ArrowLeft size={17} />
            Back to Dashboard
        </button>
        </div>

        <div className="mb-6 flex items-center gap-3">

            <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#10234e] sm:text-3xl">
                Mark Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                Mark and manage attendance for the selected class session.
            </p>
            </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading session details...
          </div>
        ) : error && !session ? (
          <div className="rounded-2xl bg-white p-6 text-red-600 shadow-sm">
            {error}
          </div>
        ) : session ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold">
                    {session.topic || "Class Session"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {subject?.code || "Subject"}{" "}
                    {subject?.name ? `- ${subject.name}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/lecturer")}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Back to Sessions
                </button>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoItem
                  icon={CalendarDays}
                  label="Date"
                  value={new Date(session.date).toLocaleDateString()}
                />
                <InfoItem
                  icon={Clock3}
                  label="Time"
                  value={`${session.startTime || "—"} - ${session.endTime || "—"}`}
                />
                <InfoItem
                  icon={FileText}
                  label="Topic"
                  value={session.topic || "—"}
                />
                <InfoItem
                  icon={MapPin}
                  label="Venue"
                  value={session.venue || "—"}
                />
              </div>

              <div className="mb-4 flex flex-col gap-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students by name or email..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">
                    All ({counts.total})
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-2 text-green-700">
                    Present ({counts.present})
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-2 text-red-700">
                    Absent ({counts.absent})
                  </span>
                  <span className="rounded-full bg-orange-50 px-3 py-2 text-orange-700">
                    Late ({counts.late})
                  </span>
                </div>
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {students.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No enrolled students found for this subject.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-162.5 text-left text-sm">
                    <thead className="bg-blue-50 text-xs text-slate-600">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Attendance Status</th>
                        <th className="px-4 py-3">Remarks (Optional)</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student, index) => (
                        <tr key={student.studentId} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">
                              {student.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {student.email}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <select
                              value={attendance[student.studentId] || "present"}
                              onChange={(event) =>
                                updateStatus(student.studentId, event.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="present">🟢 Present</option>
                              <option value="absent">🔴 Absent</option>
                              <option value="late">🟠 Late</option>
                            </select>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              value={remarks[student.studentId] || ""}
                              onChange={(event) =>
                                setRemarks((previous) => ({
                                  ...previous,
                                  [student.studentId]: event.target.value,
                                }))
                              }
                              placeholder="Add remarks..."
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {students.length} student(s) in this session
                </p>

                <button
                  onClick={saveAttendance}
                  disabled={saving || students.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="font-extrabold">Session Details</h2>

                <div className="mt-4 rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-blue-600" size={25} />
                    <div>
                      <p className="font-bold">{subject?.code || "Subject"}</p>
                      <p className="text-xs text-slate-500">
                        {subject?.name || "Selected session"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4 text-sm">
                  <InfoItem
                    icon={CalendarDays}
                    label="Date"
                    value={new Date(session.date).toLocaleDateString()}
                  />
                  <InfoItem
                    icon={Clock3}
                    label="Time"
                    value={`${session.startTime || "—"} - ${session.endTime || "—"}`}
                  />
                  <InfoItem
                    icon={FileText}
                    label="Topic"
                    value={session.topic || "—"}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Venue"
                    value={session.venue || "—"}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="font-extrabold">Attendance Summary</h2>

                <div className="mt-4 flex items-center gap-5">
                  <div
                    className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                    style={{
                        background: `conic-gradient(
                            #10b981 0% ${counts.total ? (counts.present / counts.total) * 100 : 0}%,
                            #ef4444 ${counts.total ? (counts.present / counts.total) * 100 : 0}% ${counts.total ? ((counts.present + counts.absent) / counts.total) * 100 : 0}%,
                            #f97316 ${counts.total ? ((counts.present + counts.absent) / counts.total) * 100 : 0}% 100%
                        )`,
                        }}
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-xl font-extrabold">
                        {attendancePercentage}%
                      </span>
                      <span className="text-[10px] text-slate-500">Present</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <SummaryCount
                      icon={CheckCircle2}
                      label="Present"
                      value={counts.present}
                      color="text-green-600"
                    />
                    <SummaryCount
                      icon={AlertTriangle}
                      label="Absent"
                      value={counts.absent}
                      color="text-red-500"
                    />
                    <SummaryCount
                      icon={Timer}
                      label="Late"
                      value={counts.late}
                      color="text-orange-500"
                    />
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Students</span>
                    <span className="font-bold">
                        {counts.total}
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </main>

      {/* Attendance Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-success-title"
            className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2
                size={36}
                className="text-green-600"
              />
            </div>

            <h2
              id="attendance-success-title"
              className="text-xl font-extrabold text-[#10234e]"
            >
              Attendance Saved!
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Attendance has been marked successfully for this session.
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
   

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryCount({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className={color} />
      <span className="text-slate-600">{label}</span>
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}

export default MarkAttendance;