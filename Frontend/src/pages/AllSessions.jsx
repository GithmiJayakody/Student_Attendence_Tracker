import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";
import api from "../services/api";

function AllSessions() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const subjectResponse = await api.get("/subjects/my");
        const mySubjects = subjectResponse.data;
        setSubjects(mySubjects);

        const results = await Promise.all(
          mySubjects.map((subject) =>
            api.get(`/sessions/subject/${subject._id}`)
          )
        );

        const allSessions = results.flatMap((result) => result.data);

        allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSessions(allSessions);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load sessions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const subjectId =
      typeof session.subject === "object"
        ? session.subject?._id
        : session.subject;

    const subject = subjects.find((item) => item._id === subjectId);

    const searchText = [
      session.topic,
      session.venue,
      subject?.name,
      subject?.code,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const getSubject = (session) => {
    const subjectId =
      typeof session.subject === "object"
        ? session.subject?._id
        : session.subject;

    return subjects.find((item) => item._id === subjectId);
  };

  const getSessionStatus = (session) => {
    const date = new Date(session.date);
    const [hours, minutes] = (session.endTime || "23:59")
      .split(":")
      .map(Number);

    date.setHours(hours, minutes, 0, 0);

    return date < new Date() ? "Completed" : "Upcoming";
  };

  return (
    <div className="min-h-screen bg-[#eef6ff] p-4 text-[#10234e] sm:p-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/lecturer")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CalendarDays size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">
                  All Sessions
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  View and manage all your past and upcoming sessions.
                </p>
              </div>
            </div>

            <span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {sessions.length} Sessions
            </span>
          </div>

          <div className="mt-6">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by subject, topic or venue..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading sessions...
            </p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-600">{error}</p>
          ) : filteredSessions.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No sessions found.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4">#</th>
                    <th className="px-4 py-4">Subject</th>
                    <th className="px-4 py-4">Date & Time</th>
                    <th className="px-4 py-4">Topic</th>
                    <th className="px-4 py-4">Venue</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSessions.map((session, index) => {
                    const subject = getSubject(session);
                    const status = getSessionStatus(session);

                    return (
                      <tr key={session._id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">{index + 1}</td>

                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {subject?.code || "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {subject?.name || "Subject"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {new Date(session.date).toLocaleDateString()}
                          <p className="mt-1 text-xs text-slate-500">
                            {session.startTime} – {session.endTime}
                          </p>
                        </td>

                        <td className="px-4 py-4">{session.topic || "—"}</td>
                        <td className="px-4 py-4">{session.venue || "—"}</td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "Completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedSession && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedSession(null);
              }
            }}
          >
            <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Session Details</h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
                  aria-label="Close session details"
                >
                  ×
                </button>
              </div>

              {[
                {
                  label: "Subject",
                  value: getSubject(selectedSession)?.name || "Subject",
                },
                { label: "Topic", value: selectedSession.topic || "—" },
                {
                  label: "Date",
                  value: new Date(selectedSession.date).toLocaleDateString(),
                },
                {
                  label: "Time",
                  value: `${selectedSession.startTime} – ${selectedSession.endTime}`,
                },
                { label: "Venue", value: selectedSession.venue || "—" },
              ].map((item) => (
                <div key={item.label} className="mb-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{item.value}</p>
                </div>
              ))}

              <div className="mb-5">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                  {selectedSession.description || "No description provided."}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllSessions;