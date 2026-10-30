import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Search,
  GraduationCap,
  Users,
  ChevronDown,
} from "lucide-react";
import api from "../services/api";

function AllMySubjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [subjectSort, setSubjectSort] = useState("newest");

  const [sessions, setSessions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  
useEffect(() => {
  const fetchSubjectsAndAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const subjectsResponse = await api.get("/subjects/viewEnrolled");
      const enrolledSubjects = subjectsResponse.data || [];

      setSubjects(enrolledSubjects);

      const [sessionResults, attendanceResults] = await Promise.all([
        Promise.all(
          enrolledSubjects.map((subject) =>
            api.get(`/sessions/subject/${subject._id}`)
          )
        ),
        Promise.all(
          enrolledSubjects.map((subject) =>
            api.get(`/attendance/my/${subject._id}`)
          )
        ),
      ]);

      const allSessions = sessionResults.flatMap((result, index) =>
        (result.data || []).map((session) => ({
          ...session,
          subjectCode: enrolledSubjects[index].code,
        }))
      );

      const allAttendance = attendanceResults.flatMap((result, index) =>
        (result.data.attendance || []).map((record) => ({
          ...record,
          subjectCode: enrolledSubjects[index].code,
        }))
      );

      setSessions(allSessions);
      setAttendanceRecords(allAttendance);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load your subjects and attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchSubjectsAndAttendance();
}, []);


  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subjects.filter((subject) =>
      [
        subject.code,
        subject.name,
        subject.lecturerName,
        subject.lecturer?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [subjects, search]);

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (subjectSort) {
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);

      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");

      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");

      case "code-asc":
        return (a.code || "").localeCompare(b.code || "");

      case "code-desc":
        return (b.code || "").localeCompare(a.code || "");

      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <div className="min-h-screen bg-[#edf6ff] px-4 py-8 text-[#101b50] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/student")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-7">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            All My Subjects
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            View all subjects you have enrolled in StudentTrack.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500">
              Total Enrolled Subjects
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {loading ? "..." : subjects.length}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Subject Management</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredSubjects.length} subject(s) found
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by subject, code, or lecturer..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Sorting */}
              <div className="relative w-full sm:w-44">
                <select
                  value={subjectSort}
                  onChange={(e) => setSubjectSort(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A–Z)</option>
                  <option value="name-desc">Name (Z–A)</option>
                  <option value="code-asc">Code (A–Z)</option>
                  <option value="code-desc">Code (Z–A)</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">
              Loading your subjects...
            </p>
          ) : error ? (
            <p className="px-6 py-12 text-center text-sm text-red-600">
              {error}
            </p>
          ) : filteredSubjects.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">
              {search
                ? "No subjects match your search."
                : "You have not enrolled in any subjects yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead className="bg-blue-50 text-xs text-[#24447c]">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Subject Code</th>
                    <th className="px-5 py-4">Subject Name</th>
                    <th className="px-5 py-4">Lecturer</th>
                    <th className="px-5 py-4">Attendance</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedSubjects.map((subject, index) => {
                    const lecturer =
                      subject.lecturerName ||
                      subject.lecturer?.name ||
                      "Not assigned";
              
                        const subjectSessions = sessions.filter(
                        (session) => session.subjectCode === subject.code
                        );

                        const subjectRecords = attendanceRecords.filter(
                        (record) => record.subjectCode === subject.code
                        );

                        const attendance =
                        subjectSessions.length > 0
                            ? Math.round(
                                (subjectRecords.filter((record) =>
                                ["present", "late"].includes(record.status?.toLowerCase())
                                ).length /
                                subjectSessions.length) *
                                100
                            )
                            : null;

                    return (
                      <tr
                        key={subject._id}
                        className="border-b border-blue-50 transition last:border-b-0 hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4 text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4 font-semibold text-blue-600">
                          {subject.code || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {subject.name || "Unnamed Subject"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <GraduationCap
                              size={16}
                              className="shrink-0 text-blue-500"
                            />
                            {lecturer}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {attendance == null ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                Number(attendance) >= 80
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {Number(attendance).toFixed(0)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
              Showing {sortedSubjects.length} of {subjects.length} subjects
            </div>
          )}
        </section>

        <footer className="py-7 text-center text-xs text-slate-500">
          StudentTrack · Student Attendance Management System
        </footer>
      </div>
    </div>
  );
}

export default AllMySubjects;
