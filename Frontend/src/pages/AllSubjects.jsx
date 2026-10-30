import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Eye,
  Pencil,
  Trash2,
  LoaderCircle,
  X,
  ChevronDown,
} from "lucide-react";
import api from "../services/api";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function AllSubjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectSort, setSubjectSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modal, setModal] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    lecturerId: "",
  });
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/subjects", authConfig());
        const data = response.data;

        setSubjects(
          Array.isArray(data) ? data : data.subjects || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load subjects. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

const filteredSubjects = subjects.filter((subject) =>
  `${subject.name || ""} ${subject.code || ""} ${
      subject.lecturer?.name || ""
  }`
    .toLowerCase()
    .includes(search.toLowerCase())
);

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

  
  const openView = (subject) => {
    setSelectedSubject(subject);
    setModal("view");
  };

  const openEdit = (subject) => {
    setSelectedSubject(subject);
    setForm({
      name: subject.name || "",
      code: subject.code || "",
      lecturerId: subject.lecturer?._id || subject.lecturer || "",
  });
    setError("");
    setMessage("");
    setModal("edit");
  };

  const saveSubject = async (event) => {
    event.preventDefault();
    if (!selectedSubject) return;

    setSubjectLoading(true);
    setError("");
    setMessage("");

    try {
        const response = await api.put(
        `/subjects/${selectedSubject._id}`,
        form,
        authConfig()
        );

        // Reload subjects so the updated lecturer and details are displayed.
        const subjectsResponse = await api.get("/subjects", authConfig());
        const data = subjectsResponse.data;
        const updatedSubjects = Array.isArray(data)
        ? data
        : data.subjects || [];

        setSubjects(updatedSubjects);
        setSelectedSubject(
        updatedSubjects.find((s) => s._id === selectedSubject._id) || null
        );
        setMessage(response.data.message || "Subject updated successfully.");
        setModal("");
    } catch (err) {
        setError(err.response?.data?.message || "Could not update subject.");
    } finally {
        setSubjectLoading(false);
    }
  };
  
  const deleteSubject = async (subject) => {
    setSelectedSubject(subject);
    setModal("delete");
  };

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-6 text-[#10234e] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Back to Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">

            <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
                All Subjects
            </h1>
            <p className="mt-1 text-sm text-slate-500">
                View and manage all subjects registered in StudentTrack.
            </p>
            </div>
        </div>

        </div>

        {/* Subject Table */}
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Subject Management
              </h2>
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

          {message && (
            <p className="m-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error ? (
            <div className="p-10 text-center">
              <p className="mb-4 text-sm text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading subjects...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={35} className="mx-auto mb-3 text-blue-300" />
              <p className="font-semibold text-slate-700">
                No subjects found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    {[
                      "#",
                      "Subject Code",
                      "Subject Name",
                      "Assigned Lecturer",
                      "Enrolled Students",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-4"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {sortedSubjects.map((subject, index) => (
                    <tr
                      key={subject._id}
                      className="border-t border-slate-100 transition hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-blue-700">
                        {subject.code || "—"}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        {subject.name || "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {subject.lecturer?.name || "Not assigned"}
                      </td>

                      <td className="px-4 py-4">
                        {subject.enrolledStudents?.length ?? 0}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openView(subject)}
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
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
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

          {!loading && !error && filteredSubjects.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              Showing {sortedSubjects.length} of {subjects.length} subjects
            </div>
          )}
        </section>

        <footer className="py-6 text-center text-xs text-slate-500">
          StudentTrack · Student Attendance Management System
        </footer>
      </div>

      
    {/* Edit Subject Modal */}
    {modal === "edit" && selectedSubject && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
            <div>
            <h3 className="text-xl font-extrabold text-slate-900">
                Edit Subject
            </h3>
            <p className="mt-1 text-sm text-slate-500">
                Update subject details below.
            </p>
            </div>
            <button
            onClick={() => setModal("")}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Close"
            >
            <X size={20} />
            </button>
        </div>

        {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
            </p>
        )}

        <form onSubmit={saveSubject} className="space-y-4">
            <div>
            <label className="mb-1.5 block text-sm font-semibold">
                Subject Name
            </label>
            <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) =>
                setForm({ ...form, name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-semibold">
                Subject Code
            </label>
            <input
                required
                value={form.code}
                onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500"
            />
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-semibold">
                Assign Lecturer
            </label>
            <select
                required
                value={form.lecturerId}
                onChange={(e) =>
                setForm({ ...form, lecturerId: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
                <option value="">Select an approved lecturer</option>
                {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                    {lecturer.name}
                    {lecturer.lecturerId ? ` (${lecturer.lecturerId})` : ""}
                </option>
                ))}
            </select>
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
                disabled={subjectLoading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {subjectLoading && (
                <LoaderCircle size={16} className="animate-spin" />
                )}
                Save Changes
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
            <h3 className="text-xl font-extrabold text-slate-900">
            Subject Details
            </h3>
            <button
            onClick={() => setModal("")}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Close"
            >
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
                <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-800">
                {value}
                </p>
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

    
    {/* Delete Subject Confirmation Modal */}
    {modal === "delete" && selectedSubject && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
            <Trash2 size={23} className="text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900">
                Delete Subject?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                {selectedSubject.name}
                </span>
                ? This action cannot be undone.
            </p>
            </div>

            <button
            type="button"
            onClick={() => setModal("")}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close confirmation"
            >
            <X size={19} />
            </button>
        </div>

        {error && (
            <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
            </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
            <button
            type="button"
            onClick={() => {
                setModal("");
                setSelectedSubject(null);
                setError("");
            }}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
            Cancel
            </button>

            <button
            type="button"
            onClick={async () => {
                await (async () => {
                try {
                    setSubjectLoading(true);
                    setError("");

                    const response = await api.delete(
                    `/subjects/${selectedSubject._id}`,
                    authConfig()
                    );

                    setSubjects((current) =>
                    current.filter(
                        (item) => item._id !== selectedSubject._id
                    )
                    );

                    setMessage(
                    response.data.message ||
                        "Subject deleted successfully."
                    );
                    setModal("");
                    setSelectedSubject(null);
                } catch (err) {
                    setError(
                    err.response?.data?.message ||
                        "Could not delete subject."
                    );
                } finally {
                    setSubjectLoading(false);
                }
                })();
            }}
            disabled={subjectLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {subjectLoading && (
                <LoaderCircle size={16} className="animate-spin" />
            )}
            {subjectLoading ? "Deleting..." : "Delete Subject"}
            </button>
        </div>
        </div>
    </div>
    )}

    </div>
  );
}

export default AllSubjects;
