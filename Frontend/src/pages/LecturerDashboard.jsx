import api from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ChartNoAxesColumn,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";

import logo from "../assets/Logo-GraduationCap.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, target: "dashboard" },
  { label: "My Subjects", icon: BookOpen, target: "subjects" },
  { label: "Session Management", icon: CalendarDays, target: "sessions" },
  { label: "Mark Attendance", icon: ClipboardCheck, target: "attendance" },
  { label: "Attendance Summary", icon: ChartNoAxesColumn, target: "summary" },
  { label: "Reports", icon: FileText, target: "reports" },
  { label: "Settings", icon: Settings, target: "settings" },
];

function LecturerDashboard() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const lecturerName = storedUser.name || "Lecturer";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const scrollTo = (target) => {
    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileMenu(false);
  };


  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setSubjectsError("");

        const response = await api.get("/subjects/my");
        console.log("My subjects response:", response.data);
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to load subjects:", error);
        setSubjectsError(
          error.response?.data?.message || "Failed to load subjects."
        );
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);


  
  useEffect(() => {
    if (subjects.length === 0) {
      setSessions([]);
      setLoadingSessions(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        setSessionsError("");

        const results = await Promise.all(
          subjects.map((subject) =>
            api.get(`/sessions/subject/${subject._id}`)
          )
        );

        const allSessions = results.flatMap((result) => result.data);
        setSessions(allSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
        setSessionsError(
          error.response?.data?.message || "Failed to load sessions."
        );
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [subjects]);


  
  useEffect(() => {
    if (!selectedSession) {
      setAttendanceStudents([]);
      setAttendanceError("");
      return;
    }

    const fetchAttendanceStudents = async () => {
      try {
        setAttendanceLoading(true);
        setAttendanceError("");
        setAttendanceMessage("");

        const session = sessions.find(
          (item) => item._id === selectedSession
        );

        if (!session) {
          setAttendanceStudents([]);
          return;
        }

        const subjectId =
          typeof session.subject === "object"
            ? session.subject._id
            : session.subject;

        const subjectResponse = await api.get("/subjects/my");
        const subject = subjectResponse.data.find(
          (item) => item._id === subjectId
        );

        if (!subject) {
          setAttendanceStudents([]);
          setAttendanceError("Subject not found.");
          return;
        }

        const existingResponse = await api.get(
          `/attendance/session/${selectedSession}`
        );

        const existingRecords = existingResponse.data;
        const enrolledStudents = subject.enrolledStudents || [];

        const studentRows = enrolledStudents.map((student) => {
          const existing = existingRecords.find(
            (record) =>
              (record.student?._id || record.student) === student._id
          );

          return {
            studentId: student._id,
            name: student.name,
            email: student.email,
            status: existing?.status || "present",
          };
        });

        setAttendanceStudents(studentRows);
      } catch (error) {
        console.error("Failed to load attendance students:", error);
        setAttendanceError(
          error.response?.data?.message ||
            "Failed to load students for attendance."
        );
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendanceStudents();
  }, [selectedSession, sessions]);


  return (
    <div className="min-h-screen bg-[#eef6ff] text-[#10234e]">
      <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-blue-100 bg-white px-4 shadow-sm sm:px-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-lg p-2 hover:bg-blue-50 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="StudentTrack"
                className="h-10 w-12 object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight sm:text-3xl">
              Student<span className="text-blue-600">Track</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            className="rounded-full p-2 text-slate-500 hover:bg-blue-50"
            aria-label="Notifications"
          >
            <Bell size={21} />
          </button>
          <div className="hidden h-9 border-l border-slate-200 sm:block" />
          <div className="text-right">
            <p className="text-sm font-bold">{lecturerName}</p>
            <p className="text-xs text-slate-500">Lecturer</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>

      <div className="flex">
        {mobileMenu && (
          <button
            className="fixed inset-0 z-10 bg-slate-950/30 lg:hidden"
            onClick={() => setMobileMenu(false)}
            aria-label="Close navigation"
          />
        )}

        <aside
          className={`fixed bottom-0 left-0 top-18 z-20 flex w-60 flex-col border-r border-blue-100 bg-white px-3 py-5 transition-transform lg:sticky lg:top-18 lg:h-[calc(100vh-72px)] lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, target }, index) => (
              <button
                key={label}
                onClick={() => scrollTo(target)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  index === 0
                    ? "bg-blue-500 font-semibold text-white shadow-md shadow-blue-200"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} />
              Logout
            </button>
            <div className="mt-4 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 p-4">
              <img
                src={logo}
                alt="StudentTrack Logo"
                className="mb-2 h-8 w-8 object-contain"
            />
              <p className="font-bold">StudentTrack</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Smarter attendance for a brighter future.
              </p>
            </div>
          </div>
        </aside>

        <main
          id="dashboard"
          className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-[1600px]">
            <section className="mb-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Welcome back
              </p>
              <h2 className="text-3xl font-extrabold sm:text-5xl">
                Lecturer <span className="text-blue-600">Dashboard</span>
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Manage your subjects, sessions and student attendance.
              </p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "My Subjects", value: loadingSubjects ? "..." : subjects.length, icon: BookOpen, color: "blue" },
                { label: "Total Sessions", value: loadingSessions ? "..." : sessions.length, icon: CalendarDays, color: "violet" },
                { label: "Total Students", value: "—", icon: GraduationCap, color: "emerald" },
                { label: "Average Attendance", value: "—", icon: ChartNoAxesColumn, color: "orange" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-${color}-100`}>
                    <Icon size={27} className={`text-${color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-3xl font-extrabold">{value}</p>
                  </div>
                </div>
              ))}
            </section>

            
            <section
              id="subjects"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-extrabold">My Subjects</h3>

              {loadingSubjects ? (
                <p className="mt-3 text-sm text-slate-500">
                  Loading subjects...
                </p>
              ) : subjectsError ? (
                <p className="mt-3 text-sm text-red-600">
                  {subjectsError}
                </p>
              ) : subjects.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No subjects assigned to you yet.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="rounded-xl border border-blue-100 bg-blue-50/50 p-5"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <BookOpen size={22} />
                      </div>

                      <h4 className="text-lg font-bold">{subject.name}</h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Subject Code: {subject.code}
                      </p>

                      <div className="mt-4 border-t border-blue-100 pt-3">
                        <p className="text-xs font-semibold text-slate-500">
                          ENROLLMENT KEY
                        </p>
                        <p className="mt-1 font-mono font-bold tracking-wider text-blue-700">
                          {subject.enrollmentKey}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            
            <section
              id="sessions"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-extrabold">Session Management</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create and manage your class sessions.
              </p>

              <form
                className="mt-5 grid gap-4 sm:grid-cols-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const formData = new FormData(form);

                  try {
                    await api.post("/sessions", {
                      subjectId: formData.get("subjectId"),
                      date: formData.get("date"),
                      startTime: formData.get("startTime"),
                      endTime: formData.get("endTime"),
                      topic: formData.get("topic"),
                    });

                    form.reset();
                    setSelectedSubject("");

                    const results = await Promise.all(
                      subjects.map((subject) =>
                        api.get(`/sessions/subject/${subject._id}`)
                      )
                    );

                    setSessions(results.flatMap((result) => result.data));
                    setSessionsError("");
                    alert("Session created successfully!");
                  } catch (error) {
                    alert(
                      error.response?.data?.message || "Failed to create session."
                    );
                  }
                }}
              >
                <div>
                  <label className="mb-1 block text-sm font-semibold">Subject</label>
                  <select
                    name="subjectId"
                    value={selectedSubject}
                    onChange={(event) => setSelectedSubject(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 p-3"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">Session Topic</label>
                  <input
                    name="topic"
                    required
                    placeholder="Enter session topic"
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Start Time</label>
                    <input
                      name="startTime"
                      type="time"
                      required
                      className="w-full rounded-xl border border-slate-200 p-3"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">End Time</label>
                    <input
                      name="endTime"
                      type="time"
                      required
                      className="w-full rounded-xl border border-slate-200 p-3"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={subjects.length === 0}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create Session
                  </button>
                </div>
              </form>

              <div className="mt-8 border-t border-slate-100 pt-5">
                <h4 className="text-lg font-bold">My Sessions</h4>

                {loadingSessions ? (
                  <p className="mt-3 text-sm text-slate-500">Loading sessions...</p>
                ) : sessionsError ? (
                  <p className="mt-3 text-sm text-red-600">{sessionsError}</p>
                ) : sessions.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No sessions created yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {sessions.map((session) => {
                      const subject = subjects.find(
                        (item) =>
                          item._id ===
                          (typeof session.subject === "object"
                            ? session.subject._id
                            : session.subject)
                      );

                      return (
                        <div
                          key={session._id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <h5 className="font-bold">{session.topic}</h5>
                          <p className="mt-1 text-sm text-slate-500">
                            {subject?.name || "Subject"} · {String(session.date).slice(0, 10)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {session.startTime} – {session.endTime}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            
            <section
              id="attendance"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-extrabold">Mark Attendance</h3>
              <p className="mt-2 text-sm text-slate-500">
                Select a session and record each student's attendance.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Select Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(event) => setSelectedSession(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3"
                >
                  <option value="">Choose a session</option>
                  {sessions.map((session) => {
                    const subjectId =
                      typeof session.subject === "object"
                        ? session.subject?._id
                        : session.subject;
                    const subject = subjects.find((item) => item._id === subjectId);

                    return (
                      <option key={session._id} value={session._id}>
                        {session.topic} — {subject?.name || "Subject"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {attendanceLoading && (
                <p className="mt-4 text-sm text-slate-500">Loading students...</p>
              )}

              {attendanceError && (
                <p className="mt-4 text-sm text-red-600">{attendanceError}</p>
              )}

              {attendanceMessage && (
                <p className="mt-4 text-sm text-green-700">{attendanceMessage}</p>
              )}

              {selectedSession && !attendanceLoading && !attendanceError && (
                <>
                  {attendanceStudents.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No enrolled students found for this subject.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {attendanceStudents.map((student) => (
                        <div
                          key={student.studentId}
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-slate-500">{student.email}</p>
                          </div>

                          <select
                            value={student.status}
                            onChange={(event) => {
                              setAttendanceStudents((current) =>
                                current.map((item) =>
                                  item.studentId === student.studentId
                                    ? { ...item, status: event.target.value }
                                    : item
                                )
                              );
                              setAttendanceMessage("");
                            }}
                            className="rounded-lg border border-slate-200 p-2"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {attendanceStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setAttendanceError("");
                          setAttendanceMessage("");

                          const response = await api.post(
                            `/attendance/${selectedSession}`,
                            {
                              attendanceData: attendanceStudents.map((student) => ({
                                studentId: student.studentId,
                                status: student.status,
                              })),
                            }
                          );

                          setAttendanceMessage(
                            response.data.message || "Attendance saved successfully."
                          );
                        } catch (error) {
                          setAttendanceError(
                            error.response?.data?.message ||
                              "Failed to save attendance."
                          );
                        }
                      }}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      Save Attendance
                    </button>
                  )}
                </>
              )}
            </section>

{[
  { id: "summary", title: "Attendance Summary", description: "Review student attendance records." },
  { id: "reports", title: "Reports", description: "Attendance reports will appear here." },
  { id: "settings", title: "Settings", description: "Lecturer account settings." },
].map(({ id, title, description }) => (
  <section
    key={id}
    id={id}
    className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
  >
    <h3 className="text-xl font-extrabold">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </section>
))}




            <footer className="py-6 text-center text-xs text-slate-500">
              StudentTrack · Student Attendance Management System
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LecturerDashboard;
