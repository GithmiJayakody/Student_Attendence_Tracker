
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  GraduationCap, LayoutDashboard, Users, ClipboardCheck, BookOpen,
  UserRoundCog, BarChart3, Settings, LogOut, Bell, Search,
  Plus, RefreshCw, CheckCircle, XCircle, Pencil, Trash2, Eye,
  Menu, X, CalendarDays, TrendingUp, ChevronDown, LoaderCircle
} from "lucide-react";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const cardClass = "rounded-2xl border border-slate-100 bg-white shadow-sm";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState("");
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", lecturerId: "" });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [usersRes, subjectsRes, lecturersRes, statsRes, allUsersRes] = await Promise.all([
        api.get("/admin/pending-users", authConfig()),
        api.get("/subjects", authConfig()),
        api.get("/admin/approved-lecturers", authConfig()),
        api.get("/admin/dashboard-stats", authConfig()),
        api.get("/admin/users", authConfig()),
      ]);

      setUsers(usersRes.data.users || []);

      setAllUsers(allUsersRes.data.users || []);

      setSubjects(
        Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.subjects || []
      );

      setLecturers(lecturersRes.data.lecturers || []);

      setRegisteredStudents(statsRes.data.registeredStudents || 0);
      setTotalUsers(statsRes.data.totalUsers || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        navigate("/login", { replace: true });
        return;
      }
      loadDashboard();
    } catch {
      logout();
    }
  }, []);

  const updateApproval = async (userId, action) => {
    setProcessingId(userId);
    setMessage("");
    setError("");

    try {
      const response = await api.patch(
        `/admin/${action}/${userId}`,
        {},
        authConfig()
      );
      setMessage(response.data.message);
      setUsers((current) => current.filter((user) => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update registration.");
    } finally {
      setProcessingId("");
    }
  };

  const openCreate = () => {
    setSelectedSubject(null);
    setForm({ name: "", code: "", lecturerId: "" });
    setError("");
    setModal("form");
  };

  const openEdit = (subject) => {
    setSelectedSubject(subject);
    setForm({
      name: subject.name || "",
      code: subject.code || "",
      lecturerId: subject.lecturer?._id || subject.lecturer || "",
    });
    setError("");
    setModal("form");
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    setAdminLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        "/admin/create-admin", 
        adminForm, 
        authConfig()
      );
      setMessage(response.data.message || "Admin created successfully.");
      setAdminForm({ 
        name: "", 
        email: "", 
        password: "" 
      });
      setModal("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not create admin.");
    } finally {
      setAdminLoading(false);
    }
  };

  const saveSubject = async (event) => {
    event.preventDefault();
    setSubjectLoading(true);
    setError("");
    setMessage("");

    try {
      if (selectedSubject) {
        await api.put(
          `/subjects/${selectedSubject._id}`,
          form,
          authConfig()
        );
        setMessage("Subject updated successfully.");
      } else {
        await api.post("/subjects", form, authConfig());
        setMessage("Subject created successfully.");
      }

      setModal("");
      const response = await api.get("/subjects", authConfig());
      setSubjects(Array.isArray(response.data) ? response.data : response.data.subjects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save subject.");
    } finally {
      setSubjectLoading(false);
    }
  };

  const deleteSubject = async (subject) => {
    if (!window.confirm(`Delete "${subject.name}"? This cannot be undone.`)) return;

    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/subjects/${subject._id}`, authConfig());
      setSubjects((current) => current.filter((item) => item._id !== subject._id));
      setMessage(response.data.message || "Subject deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete subject.");
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.code} ${subject.lecturer?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredUsers = allUsers.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.role || ""} ${
      user.studentId || ""
    } ${user.lecturerId || ""} ${user.approvalStatus || ""}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, target: "dashboard" },
    { label: "User Management", icon: Users, target: "user-management" },
    { label: "Account Approvals", icon: ClipboardCheck, target: "registrations", count: users.length },
    { label: "Subjects", icon: BookOpen, target: "subjects" },
    { label: "Lecturer Assignment", icon: UserRoundCog, target: "subjects" },
    { label: "Reports", icon: BarChart3, target: "overview" },
    { label: "Settings", icon: Settings, target: "dashboard" },
  ];

  const scrollTo = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#eef6ff] text-[#10234e]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16.5 items-center justify-between border-b border-blue-100 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-7">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
          <GraduationCap size={38} className="text-blue-600" />
          <h1 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
            Student<span className="text-blue-600">Track</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={() => scrollTo("registrations")}
            className="relative rounded-full p-2 text-slate-500 hover:bg-blue-50"
            aria-label="View pending approvals"
          >
            <Bell size={21} />
            {users.length > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </button>
          <div className="hidden h-8 border-l border-slate-200 sm:block" />
          <div className="text-right">
            <p className="text-sm font-bold">Admin</p>
            <p className="text-xs text-slate-500">System Administrator</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 hover:bg-blue-50" title="Logout">
            <LogOut size={19} className="text-slate-500" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${mobileMenu ? "translate-x-0" : "-translate-x-full"} fixed bottom-0 left-0 top-16.5 z-20 flex w-60 flex-col border-r border-blue-100 bg-white px-3 py-5 transition-transform lg:sticky lg:top-16.5 lg:h-[calc(100vh-66px)] lg:translate-x-0`}
        >
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, target, count }, index) => (
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
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className="rounded-full bg-orange-400 px-2 py-0.5 text-xs text-white">{count}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} /> Logout
            </button>
            <div className="mt-5 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 p-4">
              <GraduationCap size={34} className="mb-2 text-blue-600" />
              <p className="font-bold text-slate-900">StudentTrack</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Smarter attendance for a brighter future.
              </p>
            </div>
          </div>
        </aside>

        {mobileMenu && (
          <button
            className="fixed inset-0 z-10 bg-slate-950/30 lg:hidden"
            onClick={() => setMobileMenu(false)}
            aria-label="Close navigation"
          />
        )}

        {/* Main content */}
        <main id="dashboard" className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                  ━ &nbsp; Welcome back, Admin
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#10234e] sm:text-4xl lg:text-5xl">
                  Admin <span className="text-blue-600">Dashboard</span>
                </h2>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Manage users, approvals, subjects, and system activity.
                </p>
              </div>
              <button
                onClick={loadDashboard}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </section>

            {message && (
              <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}
            {error && (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Statistics */}
            <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { 
                  label: "Registered Students", 
                  value: registeredStudents,
                  note: "Approved students", 
                  icon: Users, 
                  color: "blue" 
                },
                { 
                  label: "Registered Lecturers", 
                  value: lecturers.length, 
                  note: "Available for assignment", 
                  icon: UserRoundCog, 
                  color: "violet" 
                },
                { 
                  label: "Total Subjects", 
                  value: subjects.length, 
                  note: "Registered subjects", 
                  icon: BookOpen, 
                  color: "emerald" 
                },
                { 
                  label: "Pending Approvals", 
                  onClick: () => scrollTo("registrations"),
                  value: users.filter((u) => u.approvalStatus === "pending").length, 
                  note: "Awaiting review", 
                  icon: ClipboardCheck, 
                  color: "orange" 
                },
              ].map(({ label, value, note, icon: Icon, color }) => (
                <div key={label} className={`${cardClass} flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md`}>
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-${color}-100`}>
                    <Icon size={29} className={`text-${color}-600`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className="mt-1 text-3xl font-extrabold text-[#10234e]">
                      {loading ? "—" : value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{note}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Registration requests */}
            <section id="registrations" className={`${cardClass} mb-5 scroll-mt-24 overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Users size={25} className="text-blue-600" />
                  <h3 className="text-lg font-extrabold">Registration Requests</h3>
                </div>
                <button
                  onClick={() => scrollTo("registrations")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                  <LoaderCircle size={19} className="animate-spin" /> Loading registrations...
                </div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle size={34} className="mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold text-slate-700">No pending registrations</p>
                  <p className="mt-1 text-sm text-slate-500">New registration requests will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-180 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                      <tr>
                        {["#", "Name", "Email", "Role", "Submitted On", "Action"].map((title) => (
                          <th key={title} className="px-4 py-3">{title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user._id} className="border-t border-slate-100 hover:bg-blue-50/40">
                          <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-slate-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.role === "lecturer" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateApproval(user._id, "approve")}
                                disabled={processingId === user._id}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                {processingId === user._id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => updateApproval(user._id, "reject")}
                                disabled={processingId === user._id}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>


            
            {/* User Management */}
            <section
              id="user-management"
              className={`${cardClass} mb-5 scroll-mt-24 overflow-hidden`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Users size={25} className="text-blue-600" />
                    <div>
                      <h3 className="text-lg font-extrabold">User Management</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        View all registered users and their account status.
                      </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, email, role, or ID..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-slate-500">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users size={32} className="mx-auto mb-2 text-blue-300" />
                    <p className="font-semibold text-slate-700">
                      {userSearch ? "No matching users found" : "No registered users found"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try another search term.
                    </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-225 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                      <tr>
                        {[
                          "#",
                          "Name",
                          "Email",
                          "User ID",
                          "Role",
                          "Account Status",
                          "Registered On",
                        ].map((heading) => (
                          <th key={heading} className="whitespace-nowrap px-4 py-3">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr
                          key={user._id}
                          className="border-t border-slate-100 hover:bg-blue-50/40"
                        >
                          <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            {user.name || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {user.email || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {user.role === "student"
                              ? user.studentId || "—"
                              : user.role === "lecturer"
                                ? user.lecturerId || "—"
                                : "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : user.role === "lecturer"
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {user.role || "Unknown"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.approvalStatus === "approved"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : user.approvalStatus === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {user.approvalStatus || "Unknown"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                Showing {filteredUsers.length} of {allUsers.length} registered users
              </div>
            </section>



            {/* Overview panel */}
            <section id="overview" className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className={`${cardClass} p-5`}>
                <div className="mb-5 flex items-center gap-3">
                  <BarChart3 size={25} className="text-blue-600" />
                  <div>
                    <h3 className="text-lg font-extrabold">Attendance Overview</h3>
                    <p className="text-xs text-slate-500">Attendance reports will appear here.</p>
                  </div>
                </div>
                <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
                  <CalendarDays size={35} className="mb-3 text-blue-500" />
                  <p className="font-semibold text-slate-700">Attendance analytics</p>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Real attendance percentages can be displayed after attendance records are connected to this dashboard.
                  </p>
                </div>
              </div>


              <div className={`${cardClass} p-5`}>
                <div className="mb-5 flex items-center gap-3">
                  <TrendingUp size={25} className="text-emerald-600" />
                  <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-extrabold">System Overview</h3>
                      <button
                        onClick={() => {
                          setAdminForm({ name: "", email: "", password: "" });
                          setError("");
                          setModal("admin");
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Plus size={17} />
                        Add Admin
                     </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Pending Requests", value: users.length, icon: ClipboardCheck },
                    { label: "Total Users", value: totalUsers, icon: Users },
                    { label: "Subjects", value: subjects.length, icon: BookOpen },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-4">
                      <Icon size={22} className="mb-3 text-blue-600" />
                      <p className="text-2xl font-extrabold">{loading ? "—" : value}</p>
                      <p className="mt-1 text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>


            {/* Subject management */}
            <section id="subjects" className={`${cardClass} scroll-mt-24 overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <BookOpen size={25} className="text-blue-600" />
                  <h3 className="text-lg font-extrabold">Subject Management</h3>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <div className="relative min-w-0 flex-1 sm:w-56">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search subjects..."
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus size={18} /> Add Subject
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-slate-500">Loading subjects...</div>
              ) : filteredSubjects.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen size={32} className="mx-auto mb-2 text-blue-300" />
                  <p className="font-semibold text-slate-700">
                    {search ? "No matching subjects found" : "No subjects added yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {search ? "Try another search term." : "Use Add Subject to create your first subject."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-225 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                      <tr>
                        {["#", "Subject Code", "Subject Name", "Assigned Lecturer", "Enrolled Students", "Status", "Actions"].map((title) => (
                          <th key={title} className="px-4 py-3">{title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.map((subject, index) => (
                        <tr key={subject._id} className="border-t border-slate-100 hover:bg-blue-50/40">
                          <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-blue-700">{subject.code}</td>
                          <td className="px-4 py-3 font-medium">{subject.name}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {subject.lecturer?.name || "Not assigned"}
                          </td>
                          <td className="px-4 py-3">{subject.enrolledStudents?.length ?? 0}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSubject(subject);
                                  setModal("view");
                                }}
                                title="View subject"
                                className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => openEdit(subject)}
                                title="Edit subject"
                                className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => deleteSubject(subject)}
                                title="Delete subject"
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <footer className="py-6 text-center text-xs text-slate-500">
              StudentTrack · Student Attendance Management System
            </footer>
          </div>
        </main>
      </div>


      {/* Create Admin Modal */}
      {modal === "admin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold">Create Admin Account</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add another system administrator.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModal("")}
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={createAdmin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Full Name</label>
                <input
                  required
                  value={adminForm.name}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal("")}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {adminLoading && <LoaderCircle size={16} className="animate-spin" />}
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Subject Modal */}
      {modal === "form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold">
                  {selectedSubject ? "Edit Subject" : "Add Subject"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Enter subject details below.
                </p>
              </div>
              <button onClick={() => setModal("")} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={saveSubject} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Subject Name</label>
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Database Management Systems"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Subject Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CE3202"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Assign Lecturer</label>
                <select
                  required
                  value={form.lecturerId}
                  onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select an approved lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer._id} value={lecturer._id}>
                      {lecturer.name} {lecturer.lecturerId ? `(${lecturer.lecturerId})` : ""}
                    </option>
                  ))}
                </select>
                {lecturers.length === 0 && (
                  <p className="mt-2 text-xs text-orange-600">
                    No approved lecturers available. Approve a lecturer account first.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal("")}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectLoading || lecturers.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {subjectLoading && <LoaderCircle size={16} className="animate-spin" />}
                  {selectedSubject ? "Save Changes" : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subject Modal */}
      {modal === "view" && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Subject Details</h3>
              <button onClick={() => setModal("")} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                ["Subject Name", selectedSubject.name],
                ["Subject Code", selectedSubject.code],
                ["Assigned Lecturer", selectedSubject.lecturer?.name || "Not assigned"],
                ["Lecturer Email", selectedSubject.lecturer?.email || "—"],
                ["Enrolled Students", selectedSubject.enrolledStudents?.length ?? 0],
                ["Enrollment Key", selectedSubject.enrollmentKey || "—"],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 wrap-break-word text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModal("")}
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
