import { Link } from "react-router-dom";
import { Mail, Lock, Eye } from "lucide-react";

import loginImage from "../assets/loginImage.png";
import logo from "../assets/Logo-GraduationCap.png";

function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-100 via-white to-blue-50">

      {/* BACKGROUND DECORATIONS */}
      <div className="pointer-events-none absolute -left-40 top-24 z-0 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-10 z-0 h-125 w-125 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-20 z-0 h-32 w-32 rounded-full bg-blue-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-20 z-0 h-112.5 w-187.5 rounded-[50%] bg-blue-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-25 z-0 h-100 w-162.5 rounded-[50%] bg-indigo-100/60 blur-2xl" />
      <div className="pointer-events-none absolute left-[45%] top-[25%] z-0 h-6 w-6 rounded-full bg-blue-300/40" />
      <div className="pointer-events-none absolute right-[20%] top-[18%] z-0 h-10 w-10 rounded-full bg-blue-200/50" />
      <div className="pointer-events-none absolute left-[15%] bottom-[20%] z-0 h-12 w-12 rounded-full bg-blue-200/40" />

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

          {/* Desktop Navigation */}
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

            {/* Login */}
            <Link
              to="/login"
              className="rounded-lg border border-blue-500 bg-white px-5 py-2 text-md font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            {/* Register */}
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-md font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Register
            </Link>

          </div>
        </nav>
      </header>

      {/* LOGIN SECTION */}

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-5 py-6 sm:px-8 lg:px-10">

        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* LEFT - LOGIN FORM */}

          <div className="order-2 -translate-y-6 lg:order-1 lg:-translate-y-10">

            <div className="mx-auto max-w-md">

              {/* Welcome Label */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-1 w-10 rounded-full bg-blue-600" />

                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Welcome Back
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
                Sign In to
                <span className="block">
                  Your Account
                </span>
              </h1>

              {/* Description */}
              <p className="mt-4 text-base leading-7 text-slate-600">
                Continue to StudentTrack and manage attendance with ease.
              </p>

              {/* FORM CARD */}

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

                {/* Email */}
                <div>
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
                      placeholder="Enter your university email"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* Password */}
                <div className="mt-5">

                  <label className="text-sm font-semibold text-slate-800">
                    Password
                  </label>

                  <div className="relative mt-2">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <Eye
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-blue-600"
                    />

                  </div>
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="mt-4 flex items-center justify-between gap-3">

                  <label className="flex items-center gap-2 text-sm text-slate-600">

                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-blue-600"
                    />

                    <span>
                      Remember me
                    </span>

                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>

                </div>

                {/* Login Button */}
                <button
                  type="button"
                  className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
                >
                  Login
                </button>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    or
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                {/* Register Link */}
                <p className="text-center text-sm text-slate-600">

                  Don't have an account?

                  <Link
                    to="/register"
                    className="ml-1 font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Register
                  </Link>

                </p>

              </div>

            </div>
          </div>

          {/* RIGHT - ILLUSTRATION */}

          <div className="hidden justify-center lg:order-2 lg:flex">

            <div className="relative w-full max-w-2xl">

              {/* Illustration Glow */}
              <div className="pointer-events-none absolute inset-10 rounded-full bg-blue-200/50 blur-3xl" />

              {/* Illustration */}
              <img
                src={loginImage}
                alt="Students using StudentTrack attendance system"
                className="relative mx-auto w-full max-w-2xl scale-110 object-contain sm:scale-115 lg:scale-125 xl:scale-135"
              />

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Login;