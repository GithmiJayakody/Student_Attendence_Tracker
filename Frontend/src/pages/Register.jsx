import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  IdCard,
  CheckCircle2,
  BriefcaseBusiness,
} from "lucide-react";

import registerImage from "../assets/registerImage.png";
import logo from "../assets/Logo-GraduationCap.png";

function Register() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-100 via-white to-blue-50">

      {/* =BACKGROUND DECORATIONS */}
      <div className="pointer-events-none absolute -left-40 top-24 z-0 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-10 z-0 h-125 w-125 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-20 z-0 h-112.5 w-187.5 rounded-[50%] bg-blue-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-25 z-0 h-100 w-162.5 rounded-[50%] bg-indigo-100/60 blur-2xl" />
      <div className="pointer-events-none absolute right-[18%] top-[18%] z-0 h-10 w-10 rounded-full bg-blue-200/50" />
      <div className="pointer-events-none absolute left-[55%] top-[28%] z-0 h-6 w-6 rounded-full bg-blue-300/40" />

      {/* NAVBAR */}

      <header className="relative z-10 border-b border-slate-100 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="StudentTrack"
              className="h-10 w-12 object-contain"
            />

            <span className="text-lg font-bold tracking-tight sm:text-3xl">
              Student<span className="text-blue-600">Track</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <Link
              to="/"
              className="text-md font-medium text-slate-600 transition hover:text-blue-600"
            >
              Home
            </Link>

            <a
              href="/#features"
              className="text-md font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="/#about"
              className="text-md font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>

            <Link
              to="/login"
              className="rounded-lg border border-blue-500 bg-white px-5 py-2 text-md font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-md font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Register
            </Link>

          </div>
        </nav>
      </header>

      {/* REGISTER SECTION */}

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* LEFT - REGISTER FORM */}

          <div className="order-2 lg:order-1">

            <div className="mx-auto max-w-xl">

              {/* Small heading */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-1 w-10 rounded-full bg-blue-600" />

                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Join Our Community
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
                Create Your
                <span className="block">
                  Account
                </span>
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Join StudentTrack and manage your attendance easily.
              </p>

              {/* FORM CARD */}

              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">

                {/* Register As */}
                <div>
                  <label className="text-base font-bold text-slate-900">
                    Register As
                  </label>

                  <div className="mt-3 grid grid-cols-2 gap-4">

                    {/* Student */}
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                        role === "student"
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          role === "student"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <GraduationCap size={22} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Student
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          I'm a student
                        </p>
                      </div>

                      {role === "student" && (
                        <CheckCircle2
                          size={18}
                          className="absolute right-3 top-3 text-blue-600"
                        />
                      )}
                    </button>

                    {/* Lecturer */}
                    <button
                      type="button"
                      onClick={() => setRole("lecturer")}
                      className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                        role === "lecturer"
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          role === "lecturer"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <BriefcaseBusiness size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Lecturer
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          I'm a lecturer
                        </p>
                      </div>

                      {role === "lecturer" && (
                        <CheckCircle2
                          size={18}
                          className="absolute right-3 top-3 text-blue-600"
                        />
                      )}
                    </button>

                  </div>
                </div>

                {/* Full Name */}
                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-800">
                    Full Name
                  </label>

                  <div className="relative mt-2">

                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* Student ID / Lecturer ID */}
                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-800">
                    {role === "student" ? "Student ID" : "Lecturer ID"}
                  </label>

                  <div className="relative mt-2">

                    <IdCard
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder={
                        role === "student"
                          ? "Enter your student ID"
                          : "Enter your lecturer ID"
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* University Email */}
                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-800">
                    University Email
                  </label>

                  <div className="relative mt-2">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="yourname@university.edu"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Use your official university email address.
                  </p>

                </div>

                {/* Passwords */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Password */}
                  <div>

                    <label className="text-sm font-semibold text-slate-800">
                      Password
                    </label>

                    <div className="relative mt-2">

                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>

                    <label className="text-sm font-semibold text-slate-800">
                      Confirm Password
                    </label>

                    <div className="relative mt-2">

                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>
                  </div>

                </div>

                {/* Create Account */}
                <button
                  type="button"
                  className="mt-6 w-full rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
                >
                  Create Account
                </button>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    or
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                {/* Login */}
                <p className="text-center text-sm text-slate-600">

                  Already have an account?

                  <Link
                    to="/login"
                    className="ml-1 font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Login
                  </Link>

                </p>

              </div>
            </div>
          </div>

          {/* RIGHT - ILLUSTRATION */}

          <div className="hidden justify-center lg:order-2 lg:flex">

            <div className="relative w-full max-w-2xl">

              {/* Glow */}
              <div className="pointer-events-none absolute inset-10 rounded-full bg-blue-200/50 blur-3xl" />

              {/* Illustration */}
              <img
                src={registerImage}
                alt="Students using StudentTrack"
                className="relative mx-auto w-full object-contain scale-110 xl:scale-120"
              />

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Register;