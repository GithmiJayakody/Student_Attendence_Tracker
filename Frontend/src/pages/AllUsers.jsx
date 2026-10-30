import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Users, ChevronDown } from "lucide-react";
import api from "../services/api";

function AllUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userSort, setUserSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.role || ""} ${
      user.studentId || ""
    } ${user.lecturerId || ""} ${user.approvalStatus || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (userSort) {
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);

      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");

      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");

      case "role-asc":
        return (a.role || "").localeCompare(b.role || "");

      case "role-desc":
        return (b.role || "").localeCompare(a.role || "");

      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const getUserId = (user) => {
    if (user.role?.toLowerCase() === "admin") {
      return "—";
    }

    return user.studentId || user.lecturerId || "—";
  };

  const getStatus = (user) => {
    if (user.approvalStatus) return user.approvalStatus;
    return "Approved";
  };

    const roleStyle = (role) => {
    switch (role?.toLowerCase()) {
        case "admin":
        return "bg-red-100 text-red-600";

        case "lecturer":
        return "bg-purple-100 text-purple-600";

        case "student":
        return "bg-blue-100 text-blue-600";

        default:
        return "bg-slate-100 text-slate-600";
    }
    };

  const statusStyle = (status) => {
    const value = status.toLowerCase();

    if (value === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (value === "pending") {
      return "bg-amber-100 text-amber-700";
    }

    if (value === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">      
        {/* Back to Dashboard */}
        <div className="mb-4">
        <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
            <ArrowLeft size={16} />
            Back to Dashboard
        </button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            All Registered Users
            </h1>
            <p className="mt-1 text-sm text-slate-500">
            View and search all users registered in StudentTrack.
            </p>
        </div>
        </div>

        {/* Total Users */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users size={25} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Registered Users</p>
            <p className="text-2xl font-bold text-slate-800">
              {users.length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                User Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredUsers.length} user(s) found
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, ID or role..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Sorting */}
              <div className="relative w-full sm:w-44">
                <select
                  value={userSort}
                  onChange={(e) => setUserSort(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A–Z)</option>
                  <option value="name-desc">Name (Z–A)</option>
                  <option value="role-asc">Role (A–Z)</option>
                  <option value="role-desc">Role (Z–A)</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="mb-4 text-sm text-red-600">{error}</p>
              <button
                onClick={fetchUsers}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="font-medium text-slate-700">No users found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">User ID</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Registered On</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sortedUsers.map((user, index) => (
                    <tr
                      key={user._id || user.email || index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {user.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.email || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getUserId(user)}
                      </td>

                      <td className="px-5 py-4">                       
                        <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${roleStyle(
                            user.role
                        )}`}
                        >
                        {user.role || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyle(
                            getStatus(user)
                          )}`}
                        >
                          {getStatus(user)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
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

          {!loading && !error && filteredUsers.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
              Showing {sortedUsers.length} of {users.length} registered users
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AllUsers;
