import api from "../services/api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  CalendarDays,
  ClipboardList,
  ChartNoAxesColumn,
  UserRound,
  LogOut,
  Bell,
  Menu,
  X,
  CheckCircle2,
  TriangleAlert,
  Clock3,
  ArrowRight,
} from "lucide-react";

import logo from "../assets/Logo-GraduationCap.png";

function StudentDashboard() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      setSubjectsError("");

      const response = await api.get("/subjects/viewEnrolled");
      setSubjects(response.data);
    } catch (error) {
      setSubjectsError(
        error.response?.data?.message || "Failed to load enrolled subjects."
      );
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchMySessions = async (mySubjects) => {
    try {
      setLoadingSessions(true);
      setSessionsError("");

      const results = await Promise.all(
        mySubjects.map((subject) =>
          api.get(`/sessions/subject/${subject._id}`)
        )
      );

      const allSessions = results.flatMap((result, index) =>
        result.data.map((session) => ({
          ...session,
          subjectName: mySubjects[index].name,
          subjectCode: mySubjects[index].code,
        }))
      );

      allSessions.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setSessions(allSessions);
    } catch (error) {
      setSessionsError(
        error.response?.data?.message || "Failed to load class sessions."
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMyAttendance = async (mySubjects) => {
    try {
      setLoadingAttendance(true);
      setAttendanceError("");

      const results = await Promise.all(
        mySubjects.map((subject) =>
          api.get(`/attendance/my/${subject._id}`)
        )
      );

      const records = results.flatMap((result, index) =>
        result.data.attendance.map((record) => ({
          ...record,
          subjectName: mySubjects[index].name,
          subjectCode: mySubjects[index].code,
        }))
      );

      records.sort(
        (a, b) =>
          new Date(b.session?.date || 0) -
          new Date(a.session?.date || 0)
      );

      setAttendanceRecords(records);

      setAttendanceSummary({
        present: records.filter(
          (record) => record.status?.toLowerCase() === "present"
        ).length,
        absent: records.filter(
          (record) => record.status?.toLowerCase() === "absent"
        ).length,
        late: records.filter(
          (record) => record.status?.toLowerCase() === "late"
        ).length,
      });

    } catch (error) {
      setAttendanceError(
        error.response?.data?.message ||
          "Failed to load attendance history."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoadingSubjects(true);
        setSubjectsError("");

        const response = await api.get("/subjects/viewEnrolled");
        setSubjects(response.data);

        await fetchMySessions(response.data);
        await fetchMyAttendance(response.data);
      } catch (error) {
        setSubjectsError(
          error.response?.data?.message || "Failed to load enrolled subjects."
        );
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadStudentData();
  }, []);

  useEffect(() => {
    const loadStudentProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        const profileData = response.data;

        setUser((previousUser) => {
          const updatedUser = {
            ...previousUser,
            ...profileData,
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));

          return updatedUser;
        });
      } catch (error) {
        console.error(
          "Failed to load student profile:",
          error.response?.data?.message || error.message
        );
      }
    };

    loadStudentProfile();
  }, []);
  
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );


  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { label: "My Subjects", icon: BookOpen, id: "subjects" },
    { label: "Join Subject", icon: PlusCircle, id: "join-subject" },
    { label: "Class Sessions", icon: CalendarDays, id: "sessions" },
    { label: "Attendance History", icon: ClipboardList, id: "history" },
    { label: "Attendance Summary", icon: ChartNoAxesColumn, id: "summary" },
    { label: "Profile", icon: UserRound, id: "profile" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const scrollToSection = (id) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const totalSessions = sessions.length;

  const attendedSessions = attendanceRecords.filter((record) => {
    const status = record.status?.toLowerCase();
    return status === "present" || status === "late";
  }).length;

  const attendancePercentage =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  const subjectsBelow80 = subjects.filter((subject) => {
    const subjectSessions = sessions.filter(
      (session) => session.subjectCode === subject.code
    );

    if (subjectSessions.length === 0) return false;

    const subjectAttendance = attendanceRecords.filter(
      (record) =>
        record.subjectCode === subject.code &&
        ["present", "late"].includes(record.status?.toLowerCase())
    ).length;

    return (subjectAttendance / subjectSessions.length) * 100 < 80;
  }).length;

  const cards = [
    {
      title: "Enrolled Subjects",
      value: subjects.length,
      subtitle: "Your subjects",
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Total Sessions",
      value: totalSessions,
      subtitle: "Across all subjects",
      icon: CalendarDays,
      color: "violet",
    },
    {
      title: "Attendance Percentage",
      value: `${attendancePercentage}%`,
      subtitle: "Your attendance",
      icon: CheckCircle2,
      color: "emerald",
    },
    {
      title: "Subjects Below 80%",
      value: subjectsBelow80,
      subtitle: "Need attention",
      icon: TriangleAlert,
      color: "orange",
    },
  ];


  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");

  const handleJoinSubject = async (e) => {
    e.preventDefault();

    try{
        setEnrollmentLoading(true);
        setEnrollmentMessage("");
        setEnrollmentError("");

        const response = await api.post("/subjects/enrol", {
            enrollmentKey: enrollmentKey.trim(),
        });

        setEnrollmentMessage(
            response.data.message || "Successfully enrolled in the subject!"
        );
        setEnrollmentKey("");
        await fetchSubjects(); // Refresh the subjects list after successful enrollment
    } catch (error) {
        setEnrollmentError(
            error.response?.data?.message || "Failed to join subject."
        );
    } finally {
        setEnrollmentLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");

    try {
      const response = await api.put("/auth/profile", {
        name: user.name,
      });

      const updatedUser = {
        ...user,
        ...response.data.user,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileMessage(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);

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
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf6ff] text-[#101b50]">

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-blue-100 bg-white px-5 shadow-sm md:px-8">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-lg p-2 text-[#24447c] transition hover:bg-blue-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={23} /> : <Menu size={23} />}
          </button>

          <Link to="/student" className="flex items-center gap-3">
            <img
              src={logo}
              alt="StudentTrack"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-extrabold tracking-tight">
              Student<span className="text-blue-600">Track</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button
            aria-label="Notifications"
            className="relative rounded-full p-2 text-slate-500 transition hover:bg-blue-50"
          >
            <Bell size={21} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="border-l border-slate-200 pl-4 text-right">
            <p className="text-sm font-bold text-[#101b50]">
              {user.name || "Student"}
            </p>
            <p className="text-xs text-slate-500">Student</p>
          </div>

          <button
            onClick={logout}
            aria-label="Logout"
            title="Logout"
            className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 sm:block"
          >
            <LogOut size={21} />
          </button>
        </div>
      </header>


      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-30 flex w-60 flex-col border-r border-blue-100 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  index === 0
                    ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                    : "text-[#24447c] hover:bg-blue-50"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-blue-100 pt-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-[#24447c] hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            Logout
          </button>

          <div className="mt-7 rounded-2xl bg-linear-to-br from-blue-50 to-cyan-50 p-4">
            <GraduationCap size={32} className="mb-3 text-blue-600" />
            <p className="font-extrabold">
              Student<span className="text-blue-600">Track</span>
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Smarter Attendance for a Brighter Future
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="px-4 pb-10 pt-22.5 lg:ml-60 lg:px-6">
        <section id="dashboard" className="mb-7 scroll-mt-24">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            ━ Welcome back{user.name ? `, ${user.name}` : ""}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Student <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Track your subjects, attendance and academic progress.
          </p>
        </section>

        {/* Summary cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            const colors = {
              blue: "bg-blue-100 text-blue-600",
              violet: "bg-violet-100 text-violet-600",
              emerald: "bg-emerald-100 text-emerald-600",
              orange: "bg-orange-100 text-orange-600",
            };

            return (
              <div
                key={card.title}
                className="flex items-center gap-4 rounded-2xl border border-white bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`rounded-2xl p-4 ${colors[card.color]}`}>
                  <Icon size={28} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600">
                    {card.title}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* My Subjects */}
        <section
          id="subjects"
          className="mb-6 scroll-mt-24 rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-3 text-lg font-extrabold sm:text-xl">
              <BookOpen className="text-blue-600" />
              My Subjects
            </h2>
            <button
              onClick={() => scrollToSection("join-subject")}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Join Subject <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-blue-50 text-xs text-[#24447c]">
                <tr>
                  <th className="rounded-l-lg px-3 py-3">#</th>
                  <th className="px-3 py-3">Subject Code</th>
                  <th className="px-3 py-3">Subject Name</th>
                  <th className="px-3 py-3">Lecturer</th>
                  <th className="rounded-r-lg px-3 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {loadingSubjects ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-10 text-center text-slate-500">
                      Loading subjects...
                    </td>
                  </tr>
                ) :subjectsError ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-10 text-center text-red-500">
                      {subjectsError}
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-10 text-center text-slate-500">
                      No enrolled subjects yet. Join a subject using its enrollment key.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject,index) => (
                    <tr key={subject._id} className="border-b border-blue-50">
                      <td className="px-3 py-4">
                        {index + 1}
                      </td>
                      <td className="px-3 py-4">
                        {subject.code}
                      </td>
                      <td className="px-3 py-4">
                        {subject.name}
                      </td>
                      <td className="px-3 py-4">
                        {subject.lecturer?.name || "Not assigned"}
                      </td>
                      <td className="px-3 py-4">
                        {(() => {
                          const subjectSessions = sessions.filter(
                            (session) => session.subjectCode === subject.code
                          );

                          const subjectRecords = attendanceRecords.filter(
                            (record) => record.subjectCode === subject.code
                          );

                          if (subjectRecords.length === 0 || subjectSessions.length === 0) {
                            return <span className="text-slate-400">—</span>;
                          }

                          const attended = subjectRecords.filter((record) =>
                            ["present", "late"].includes(record.status?.toLowerCase())
                          ).length;

                          const percentage = Math.round(
                            (attended / subjectSessions.length) * 100
                          );

                          const badgeStyle =
                            percentage >= 80
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700";

                          return (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}
                            >
                              {percentage}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Join Subject */}
        <section
          id="join-subject"
          className="mb-6 scroll-mt-24 rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-2 flex items-center gap-3 text-lg font-extrabold sm:text-xl">
            <PlusCircle className="text-blue-600" />
            Join a Subject
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Use the enrollment key provided by your lecturer to join a subject.
          </p>
          <form
            onSubmit = {handleJoinSubject}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
                type="text"
                value={enrollmentKey}
                onChange={(e) => setEnrollmentKey(e.target.value)}
                placeholder="Enter enrollment key (e.g. HVSBIG)"
                required
                className="flex-1 rounded-xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
                type="submit"
                disabled={enrollmentLoading}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"            
            >
                {enrollmentLoading ? "Joining..." : "Join Subject"}
            </button>
          </form>

          {enrollmentMessage && (
            <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {enrollmentMessage}
            </p>
          )}

          {enrollmentError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {enrollmentError}
            </p>
          )}
        </section>

        {/* Class Sessions */}
        <section
          id="sessions"
          className="mb-6 scroll-mt-24 rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-3 text-lg font-extrabold sm:text-xl">
            <CalendarDays className="text-blue-600" />
            Class Sessions
          </h2>

          {loadingSessions ? (
            <p className="py-6 text-center text-slate-500">
              Loading sessions...
            </p>
          ) : sessionsError ? (
            <p className="py-6 text-center text-red-500">
              {sessionsError}
            </p>
          ) : sessions.length === 0 ? (
            <p className="py-6 text-center text-slate-500">
              No class sessions available for your enrolled subjects.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead className="bg-blue-50 text-xs text-[#24447c]">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr key={session._id} className="border-b border-blue-50">
                      <td className="px-3 py-4">{index + 1}</td>
                      <td className="px-3 py-4">
                        {session.subjectCode} - {session.subjectName}
                      </td>
                      <td className="px-3 py-4">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {session.startTime} - {session.endTime}
                      </td>
                      <td className="px-3 py-4">{session.topic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Attendance History */}
        <section
          id="history"
          className="mb-6 scroll-mt-24 rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"
        >
          
          <h2 className="mb-4 flex items-center gap-3 text-lg font-extrabold sm:text-xl">
            <ClipboardList className="text-blue-600" />
            Attendance History
          </h2>

          {loadingAttendance ? (
            <p className="py-6 text-center text-slate-500">
              Loading attendance history...
            </p>
          ) : attendanceError ? (
            <p className="py-6 text-center text-red-500">
              {attendanceError}
            </p>
          ) : attendanceRecords.length === 0 ? (
            <p className="py-6 text-center text-slate-500">
              No attendance records available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead className="bg-blue-50 text-xs text-[#24447c]">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Topic</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => {
                    const status = record.status?.toLowerCase();

                    const statusStyles = {
                      present: "bg-green-100 text-green-700",
                      absent: "bg-red-100 text-red-700",
                      late: "bg-orange-100 text-orange-700",
                    };

                    return (
                      <tr
                        key={record._id}
                        className="border-b border-blue-50"
                      >
                        <td className="px-3 py-4">{index + 1}</td>
                        <td className="px-3 py-4">
                          {record.subjectCode} - {record.subjectName}
                        </td>
                        <td className="px-3 py-4">
                          {record.session?.date
                            ? new Date(record.session.date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-4">
                          {record.session?.topic || "—"}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              statusStyles[status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Attendance Summary */}
        <section
          id="summary"
          className="mb-6 scroll-mt-24 rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-3 text-lg font-extrabold sm:text-xl">
            <ChartNoAxesColumn className="text-blue-600" />
            Attendance Summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">                        
            {[
              {
                label: "Present",
                icon: CheckCircle2,
                color: "text-emerald-600",
                value: attendanceSummary.present,
              },
              {
                label: "Absent",
                icon: TriangleAlert,
                color: "text-red-500",
                value: attendanceSummary.absent,
              },
              {
                label: "Late",
                icon: Clock3,
                color: "text-orange-500",
                value: attendanceSummary.late,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl bg-blue-50 p-5">
                  <Icon className={item.color} size={25} />
                  <p className="mt-3 text-sm text-slate-600">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold">{item.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Profile */}     
        <section
          id="profile"
          className="mb-6 scroll-mt-24 rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-3 text-lg font-extrabold sm:text-xl">
            <UserRound className="text-blue-600" />
            My Profile
          </h2>

          <form onSubmit={handleProfileUpdate}>
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name || ""}
                  onChange={(e) =>
                    setUser((previousUser) => ({
                      ...previousUser,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {user.email || "—"}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm capitalize text-slate-600">
                  Student
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Student ID
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {user.studentId || "Not assigned"}
                </div>
              </div>
            </div>

            {profileMessage && (
              <p
                className={`mt-4 text-sm font-medium ${
                  profileMessage.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="mb-2 text-lg font-extrabold text-slate-800">
              Change Password
            </h3>

            <p className="mb-5 text-sm text-slate-500">
              Update your password to keep your account secure.
            </p>

            <form
              onSubmit={handlePasswordChange}
              className="grid max-w-3xl gap-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter current password"
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
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter new password (at least 8 characters)"
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
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Re-enter new password"
                />
              </div>

              {passwordMessage && (
                <p
                  className={`text-sm font-medium ${
                    passwordMessage.toLowerCase().includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordMessage}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}

export default StudentDashboard;
