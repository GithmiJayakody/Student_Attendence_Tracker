
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, GraduationCap, AlertTriangle } from "lucide-react";
import api from "../services/api";

export default function IndividualStudentAttendance() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [subject, setSubject] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const [subjectsResponse, attendanceResponse] = await Promise.all([
          api.get("/subjects/my"),
          api.get(`/attendance/summary/${subjectId}`),
        ]);

        const subjects = Array.isArray(subjectsResponse.data)
          ? subjectsResponse.data
          : [];

        const selectedSubject = subjects.find(
          (item) => item._id === subjectId
        );

        setSubject(selectedSubject || null);

        setAttendance(
          Array.isArray(attendanceResponse.data)
            ? attendanceResponse.data
            : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load student attendance."
        );
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) fetchAttendance();
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-[#eef6ff] text-[#10234e]">
      <main className="mx-auto max-w-300 px-4 py-7 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/lecturer")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">

            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                  Individual Student Attendance
                </h1>
              <p className="mt-1 text-sm text-slate-500">
                Review attendance records for each student.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">
              Loading attendance...
            </p>
          ) : error ? (
            <p className="rounded-xl bg-red-50 p-4 text-red-600">
              {error}
            </p>
          ) : (
            <>
              <div className="mb-5 rounded-xl bg-blue-50 p-4">
                <p className="font-bold">
                  {subject?.name || "Selected Subject"}
                  {subject?.code ? ` (${subject.code})` : ""}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Student attendance summary
                </p>
              </div>

              {attendance.some((item) => Number(item.percentage) < 80) && (
                <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertTriangle size={22} className="shrink-0" />
                  <div>
                    <p className="font-bold">Low Attendance Alert</p>
                    <p className="mt-1 text-sm">
                      {attendance.filter(
                        (item) => Number(item.percentage) < 80
                      ).length}{" "}
                      student(s) have attendance below 80%.
                    </p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-162.5 text-left text-sm">
                  <thead className="bg-[#eef5ff] text-[#10234e]">
                    <tr>
                      <th className="px-4 py-4">#</th>
                      <th className="px-4 py-4">Student</th>
                      <th className="px-4 py-4">Student ID</th>
                      <th className="px-4 py-4">Present</th>
                      <th className="px-4 py-4">Absent</th>
                      <th className="px-4 py-4">Late</th>
                      <th className="px-4 py-4">Attendance</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((item, index) => (
                      <tr key={item.student?.id || index}>
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4 font-medium">
                          {item.student?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-4">
                          {item.student?.studentId || "—"}
                        </td>
                        <td className="px-4 py-4">{item.presentCount ?? 0}</td>
                        <td className="px-4 py-4">{item.absentCount ?? 0}</td>
                        <td className="px-4 py-4">{item.lateCount ?? 0}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              Number(item.percentage) < 80
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {Number(item.percentage || 0).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}

                    {attendance.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No student attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
