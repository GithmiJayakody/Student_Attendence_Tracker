import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AllSessions from "./pages/AllSessions";
import MarkAttendance from "./pages/MarkAttendance";
import IndividualStudentAttendance from "./pages/IndividualStudentAttendance";
import AllUsers from "./pages/AllUsers";
import AllSubjects from "./pages/AllSubjects";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AllUsers />} />
        <Route path="/admin/subjects" element={<AllSubjects />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/lecturer/sessions" element={<AllSessions />} />
        <Route path="/lecturer/mark-attendance" element={<MarkAttendance />} />
        <Route path="/lecturer/student-attendance/:subjectId" element={<IndividualStudentAttendance />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;