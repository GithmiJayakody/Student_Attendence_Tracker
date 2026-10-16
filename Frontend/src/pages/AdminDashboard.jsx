
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { GraduationCap, LogOut, CheckCircle, XCircle, RefreshCw } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadPendingUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/pending-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load pending registrations."
      );
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

      loadPendingUsers();
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
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage(response.data.message);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update the registration."
      );
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-blue-600" size={32} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              StudentTrack
            </h1>
            <p className="text-sm text-slate-500">Admin Dashboard</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          <LogOut size={17} />
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Pending Registrations
            </h2>
            <p className="mt-1 text-slate-600">
              Review and approve student and lecturer accounts.
            </p>
          </div>

          <button
            onClick={loadPendingUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading registrations...
            </p>
          ) : users.length === 0 && !error ? (
            <p className="py-10 text-center text-slate-500">
              No pending registrations found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b last:border-0">
                      <td className="px-3 py-4 font-medium text-slate-800">
                        {user.name}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-3 py-4 capitalize">
                        {user.role}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {user.studentId || user.lecturerId || "—"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateApproval(user._id, "approve")}
                            disabled={processingId === user._id}
                            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle size={15} />
                            Approve
                          </button>
                          <button
                            onClick={() => updateApproval(user._id, "reject")}
                            disabled={processingId === user._id}
                            className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle size={15} />
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
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

