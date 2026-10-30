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
  UserRound,
} from "lucide-react";

import logo from "../assets/Logo-GraduationCap.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, target: "dashboard" },
  { label: "My Subjects", icon: BookOpen, target: "subjects" },
  { label: "Session Management", icon: CalendarDays, target: "sessions" },
  { label: "Mark Attendance", icon: ClipboardCheck, target: "attendance" },
  { label: "Attendance Summary", icon: ChartNoAxesColumn, target: "summary" },
  { label: "Reports", icon: FileText, target: "reports" },
  { label: "Profile", icon: UserRound, target: "profile" },
];

function LecturerDashboard() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [viewingSession, setViewingSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [summarySubject, setSummarySubject] = useState("");
  const [reportData, setReportData] = useState({});
  const [reportLoading, setReportLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const lecturerName = storedUser.name || "Lecturer";
  
  const totalStudents = new Set(
    subjects.flatMap((subject) =>
      (subject.enrolledStudents || []).map((student) =>
        typeof student === "object" ? student._id : student
      )
    )
  ).size;

  const allStudents = Object.values(reportData).flat();

  const averageAttendance =
    allStudents.length > 0
      ? (
          allStudents.reduce(
            (total, student) =>
              total +
              Number(
                student.percentage ??
                student.attendancePercentage ??
                0
              ),
            0
          ) / allStudents.length
        ).toFixed(1)
      : null;

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



  const fetchReportData = async () => {
    try {
      setReportLoading(true);
      setReportData({});

      const results = await Promise.all(
        subjects.map(async (subject) => {
          const response = await api.get(
            `/attendance/summary/${subject._id}`
          );

          return [subject._id, response.data];
        })
      );

      setReportData(Object.fromEntries(results));
    } catch (error) {
      console.error("Failed to load attendance reports:", error);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (subjects.length > 0) {
      fetchReportData();
    } else {
      setReportData({});
    }
  }, [subjects]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    lecturerId: "",
    role: "",
    approvalStatus: "",
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileMessage("");

        const response = await api.get("/auth/profile");

        setProfile(response.data);
      } catch (error) {
        setProfileMessage(
          error.response?.data?.message ||
            "Failed to load profile details."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


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
          
          <div className="hidden h-9 border-l border-slate-200 sm:block" />
          <div className="text-right">
            <p className="text-md font-bold">{lecturerName}</p>
            <p className="text-sm text-slate-500">Lecturer</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut size={20} />
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
          className={`fixed bottom-0 left-0 top-18 z-20 flex w-80 flex-col border-r border-blue-100 bg-white px-3 py-5 transition-transform lg:sticky lg:top-18 lg:h-[calc(100vh-72px)] lg:translate-x-0 ${
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
                 ━ WELCOME BACK, {(profile?.name || "LECTURER").toUpperCase()}
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
                { label: "Total Students", value: loadingSubjects ? "..." : totalStudents, icon: GraduationCap, color: "emerald" },
                { label: "Average Attendance", value: reportLoading ? "..." : averageAttendance !== null ? `${averageAttendance}%` : "—", icon: ChartNoAxesColumn, color: "orange" },
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
                <div>
                  <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-162.5 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="px-5 py-4 font-semibold">#</th>
                          <th className="px-5 py-4 font-semibold">Subject</th>
                          <th className="px-5 py-4 font-semibold">Subject Code</th>
                          <th className="px-5 py-4 font-semibold">Enrollment Key</th>
                          <th className="px-5 py-4 text-center font-semibold">
                            Enrolled Students
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {subjects.map((subject, index) => (
                          <tr
                            key={subject._id}
                            className="transition-colors hover:bg-blue-50/50"
                          >
                            <td className="px-5 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4 font-semibold text-slate-800">
                              {subject.name}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {subject.code}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-md bg-blue-50 px-3 py-1 font-medium text-blue-700">
                                {subject.enrollmentKey || "—"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700">
                                {Array.isArray(subject.enrolledStudents)
                                  ? subject.enrolledStudents.length
                                  : 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            
            <section
              id="sessions"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-extrabold">
                    {showAllSessions ? "All Sessions" : "Upcoming Sessions"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {showAllSessions
                      ? "View all your past and upcoming class sessions."
                      : "View and manage your upcoming classes."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/lecturer/sessions")}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View All Sessions →
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateSessionModal(true)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    + Create Session
                  </button>
                </div>
              </div>

              {loadingSessions ? (
                <p className="mt-5 text-sm text-slate-500">Loading sessions...</p>
              ) : sessionsError ? (
                <p className="mt-5 text-sm text-red-600">{sessionsError}</p>
              ) : (
                (() => {
                  const now = new Date();

                  const sortedSessions = [...sessions].sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                  );

                  const displayedSessions = showAllSessions
                    ? sortedSessions
                    : sortedSessions.filter((session) => {
                        const sessionEnd = new Date(session.date);
                        const [hours, minutes] = (session.endTime || "23:59")
                          .split(":")
                          .map(Number);

                        sessionEnd.setHours(hours, minutes, 0, 0);

                        return sessionEnd > now;
                      });

                  if (displayedSessions.length === 0) {
                    return (
                      <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        {showAllSessions
                          ? "No sessions created yet."
                          : "No upcoming sessions. Create a new session to get started."}
                      </p>
                    );
                  }

                  return (
                    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-187.5 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-semibold">#</th>
                            <th className="px-4 py-3 font-semibold">Subject</th>
                            <th className="px-4 py-3 font-semibold">Date & Time</th>
                            <th className="px-4 py-3 font-semibold">Topic</th>
                            <th className="px-4 py-3 font-semibold">Venue</th>
                            <th className="px-4 py-3 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedSessions.map((session, index) => {
                            const subject = subjects.find(
                              (item) =>
                                item._id ===
                                (typeof session.subject === "object"
                                  ? session.subject?._id
                                  : session.subject)
                            );

                            return (
                              <tr key={session._id} className="hover:bg-slate-50">
                                <td className="px-4 py-4">{index + 1}</td>
                                <td className="px-4 py-4 font-medium text-slate-800">
                                  {subject?.code || subject?.name || "Subject"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div>
                                    {new Date(session.date).toLocaleDateString()}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    {session.startTime} – {session.endTime}
                                  </div>
                                </td>
                                <td className="px-4 py-4">{session.topic || "—"}</td>
                                <td className="px-4 py-4">{session.venue || "—"}</td>
                                <td className="px-4 py-4">
                                  <button
                                    type="button"
                                    onClick={() => setViewingSession(session)}
                                    className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}

              {showCreateSessionModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setShowCreateSessionModal(false);
                    }
                  }}
                >
                  <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Create New Session
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Enter the details for your class session.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCreateSessionModal(false)}
                        className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
                        aria-label="Close modal"
                      >
                        ×
                      </button>
                    </div>

                    <form
                      className="grid gap-4 sm:grid-cols-2"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const form = event.currentTarget;
                        const formData = new FormData(form);

                        const startTime = formData.get("startTime");
                        const endTime = formData.get("endTime");

                        if (endTime <= startTime) {
                          window.alert("End time must be later than start time.");
                          return;
                        }

                        try {
                          await api.post("/sessions", {
                            subjectId: formData.get("subjectId"),
                            date: formData.get("date"),
                            startTime,
                            endTime,
                            topic: formData.get("topic"),
                            venue: formData.get("venue"),
                            description: formData.get("description"),
                          });

                          const results = await Promise.all(
                            subjects.map((subject) =>
                              api.get(`/sessions/subject/${subject._id}`)
                            )
                          );

                          setSessions(results.flatMap((result) => result.data));
                          setSessionsError("");
                          setShowCreateSessionModal(false);
                          setSelectedSubject("");
                          form.reset();
                        } catch (error) {
                          window.alert(
                            error.response?.data?.message || "Failed to create session."
                          );
                        }
                      }}
                    >
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="subjectId"
                          value={selectedSubject}
                          onChange={(event) => setSelectedSubject(event.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        >
                          <option value="">Select a subject</option>
                          {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.code} - {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="date"
                          type="date"
                          min={new Date().toLocaleDateString("en-CA")}
                          required
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Topic <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="topic"
                          required
                          placeholder="Enter session topic"
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="startTime"
                          type="time"
                          required
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="endTime"
                          type="time"
                          required
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold">
                          Venue <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="venue"
                          required
                          placeholder="e.g. LT 1 or Electronics Laboratory"
                          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold">
                          Description (Optional)
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          placeholder="Add session description..."
                          className="w-full resize-y rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="mt-2 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCreateSessionModal(false)}
                          className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={subjects.length === 0}
                          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Create Session
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {viewingSession && (
                <div
                  className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setViewingSession(null);
                    }
                  }}
                >
                  <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Session Details
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          View your class session information.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingSession(null)}
                        className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
                        aria-label="Close session details"
                      >
                        ×
                      </button>
                    </div>

                    {(() => {
                      const selectedSessionSubject = subjects.find(
                        (item) =>
                          item._id ===
                          (typeof viewingSession.subject === "object"
                            ? viewingSession.subject?._id
                            : viewingSession.subject)
                      );

                      const details = [
                        {
                          label: "Subject",
                          value: selectedSessionSubject
                            ? `${selectedSessionSubject.code} - ${selectedSessionSubject.name}`
                            : viewingSession.subject?.name || "Subject",
                        },
                        {
                          label: "Topic",
                          value: viewingSession.topic || "Not specified",
                        },
                        {
                          label: "Date",
                          value: new Date(viewingSession.date).toLocaleDateString(),
                        },
                        {
                          label: "Start Time",
                          value: viewingSession.startTime || "Not specified",
                        },
                        {
                          label: "End Time",
                          value: viewingSession.endTime || "Not specified",
                        },
                        {
                          label: "Venue",
                          value: viewingSession.venue || "Not specified",
                        },
                      ];

                      return (
                        <div className="space-y-4">
                          {details.map((detail) => (
                            <div key={detail.label}>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {detail.label}
                              </p>
                              <p className="text-sm font-medium text-slate-800">
                                {detail.value}
                              </p>
                            </div>
                          ))}

                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Description
                            </p>
                            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                              {viewingSession.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setViewingSession(null)}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  onChange={(event) => {
                    const sessionId = event.target.value;

                    if (sessionId) {
                      navigate(`/lecturer/mark-attendance?sessionId=${sessionId}`);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 p-3"
                >
                  <option value="">Choose a session</option>
                  {sessions
                    .filter((session) => {
                      const sessionDate = new Date(session.date);
                      const [hours, minutes] = (session.endTime || "23:59")
                        .split(":")
                        .map(Number);

                      sessionDate.setHours(hours, minutes, 0, 0);

                      return sessionDate >= new Date();
                    })
                    .map((session) => {
                      const subjectId =
                        typeof session.subject === "object"
                          ? session.subject?._id
                          : session.subject;

                      const subject = subjects.find((item) => item._id === subjectId);

                      return (
                        <option key={session._id} value={session._id}>
                          {session.topic} — {subject?.name || "Subject"} (
                          {new Date(session.date).toLocaleDateString()} · {session.startTime})
                        </option>
                      );
                    })}
                </select>
              </div>
            </section>


            <section
              id="summary"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-extrabold">Individual Student Attendance</h3>
              <p className="mt-2 text-sm text-slate-500">
                Select a subject to review student attendance.
              </p>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold">
                  Select Subject
                </label>
                <select
                  value={summarySubject}
                  onChange={(event) => {
                    const subjectId = event.target.value;
                    setSummarySubject(subjectId);

                    if (subjectId) {
                      navigate(`/lecturer/student-attendance/${subjectId}`);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 p-3"
                >
                  <option value="">Choose a subject</option>

                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
            </section>
            
            <section
              id="reports"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-extrabold">Subject-wise Attendance Reports</h3>
              <p className="mt-2 text-sm text-slate-500">
                View attendance statistics for your subjects.
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-150 text-left text-sm">
                  
                <thead className="bg-blue-50 text-xs text-slate-700">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Code</th>
                    <th className="px-3 py-3">Sessions</th>
                    <th className="px-3 py-3">Students</th>
                    <th className="px-3 py-3">Present</th>
                    <th className="px-3 py-3">Absent</th>
                    <th className="px-3 py-3">Late</th>
                    <th className="px-3 py-3">Attendance</th>
                  </tr>
                </thead>

                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-3 py-6 text-center text-slate-500">
                          No subjects available.
                        </td>
                      </tr>
                    ) : (                      
                      subjects.map((subject, index) => {
                        const subjectId = subject._id;
                        
                        const students = reportData[subjectId] || [];

                        const present = students.reduce(
                          (total, student) =>
                            total + (student.presentCount ?? student.present ?? 0),
                          0
                        );

                        const absent = students.reduce(
                          (total, student) =>
                            total + (student.absentCount ?? student.absent ?? 0),
                          0
                        );

                        const late = students.reduce(
                          (total, student) =>
                            total + (student.lateCount ?? student.late ?? 0),
                          0
                        );

                        const averageAttendance =
                          students.length > 0
                            ? (
                                students.reduce(
                                  (total, student) =>
                                    total + Number(student.percentage ?? student.attendancePercentage ?? 0),
                                  0
                                ) / students.length
                              ).toFixed(1)
                            : null;


                        const subjectSessions = sessions.filter((session) => {
                          const sessionSubjectId =
                            typeof session.subject === "object"
                              ? session.subject?._id
                              : session.subject;

                          return sessionSubjectId === subjectId;
                        });

                        return (
                          <tr key={subjectId} className="border-b border-blue-50">
                            <td className="px-3 py-4">{index + 1}</td>
                            <td className="px-3 py-4">{subject.name}</td>
                            <td className="px-3 py-4">{subject.code}</td>
                            <td className="px-3 py-4">{subjectSessions.length}</td>
                            <td className="px-3 py-4">
                              {subject.enrolledStudents?.length ?? 0}
                            </td>
                            <td className="px-3 py-4">{reportLoading ? "..." : present}</td>
                            <td className="px-3 py-4">{reportLoading ? "..." : absent}</td>
                            <td className="px-3 py-4">{reportLoading ? "..." : late}</td>
                            <td className="px-3 py-4 font-semibold">
                              {reportLoading
                                ? "..."
                                : averageAttendance !== null
                                  ? `${averageAttendance}%`
                                  : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>


            <section
              id="profile"
              className="mt-6 scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-800">
                  My Profile
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Manage your lecturer profile information.
                </p>
              </div>

              {profileLoading ? (
                <p className="text-sm text-slate-500">
                  Loading profile details...
                </p>
              ) : (
                <>         
  
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setProfileMessage("");

                      try {
                        const response = await api.put("/auth/profile", {
                          name: profile.name,
                        });

                        setProfile((previous) => ({
                          ...previous,
                          ...response.data.user,
                        }));

                        setProfileMessage("Profile updated successfully.");
                      } catch (error) {
                        setProfileMessage(
                          error.response?.data?.message ||
                            "Failed to update profile."
                        );
                      }
                    }}
                    className="grid max-w-4xl grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name || ""}
                        onChange={(e) =>
                          setProfile((previous) => ({
                            ...previous,
                            name: e.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email || ""}
                        readOnly
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:col-span-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Lecturer ID
                        </label>
                        <input
                          type="text"
                          value={profile.lecturerId || "Not assigned"}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Role
                        </label>
                        <input
                          type="text"
                          value={profile.role || "Lecturer"}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      {profileMessage && (
                        <p
                          className={`mb-4 text-sm font-medium ${
                            profileMessage.toLowerCase().includes("success")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                          role="status"
                        >
                          {profileMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>               
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h4 className="text-lg font-bold text-slate-800">
                      Change Password
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Update your password to keep your account secure.
                    </p>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setPasswordMessage("");

                        if (newPassword !== confirmPassword) {
                          setPasswordMessage("New passwords do not match.");
                          return;
                        }

                        try {
                          const response = await api.put("/auth/change-password", {
                            currentPassword,
                            newPassword,
                          });

                          setPasswordMessage(
                            response.data.message || "Password changed successfully."
                          );

                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        } catch (error) {
                          setPasswordMessage(
                            error.response?.data?.message ||
                              "Failed to change password."
                          );
                        }
                      }}
                      className="mt-5 max-w-2xl space-y-5"
                    >
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {passwordMessage && (
                        <p
                          className={`text-sm font-medium ${
                            passwordMessage.toLowerCase().includes("success")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                          role="status"
                        >
                          {passwordMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                </>
              )}
            </section>


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
