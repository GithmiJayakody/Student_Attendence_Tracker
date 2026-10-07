import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";

import forgotpasswordImage from "../assets/forgotpasswordImage.png";
import logo from "../assets/Logo-GraduationCap.png";

function ForgotPassword() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-100 via-white to-blue-50">

      {/* BACKGROUND DECORATIONS */}
      <div className="pointer-events-none absolute -left-40 top-24 z-0 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-10 z-0 h-125 w-125 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-20 z-0 h-112.5 w-187.5 rounded-[50%] bg-blue-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-25 z-0 h-100 w-162.5 rounded-[50%] bg-indigo-100/60 blur-2xl" />
      <div className="pointer-events-none absolute right-[18%] top-[18%] z-0 h-10 w-10 rounded-full bg-blue-200/50" />
      <div className="pointer-events-none absolute left-[50%] top-[30%] z-0 h-6 w-6 rounded-full bg-blue-300/40" />

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

            <span className="text-lg font-bold tracking-tight sm:text-2xl">
              Student<span className="text-blue-600">Track</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <Link
              to="/"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Home
            </Link>

            <a
              href="/#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="/#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>

            {/* Login */}
            <Link
              to="/login"
              className="rounded-lg border border-blue-500 bg-white px-5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            {/* Register */}
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Register
            </Link>

          </div>
        </nav>
      </header>

      {/* FORGOT PASSWORD SECTION */}

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-10">

        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* LEFT - FORM */}

          <div className="order-2 lg:order-1">

            <div className="mx-auto max-w-xl">

              {/* Small heading */}
              <div className="mb-4 flex items-center gap-3">

                <div className="h-1 w-10 rounded-full bg-blue-600" />

                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Get Back to Your Account
                </span>

              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
                Forgot Password?
              </h1>

              {/* Description */}
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                No worries! Enter your university email address and we'll
                send you a reset link to get back to your account.
              </p>

              {/* FORM CARD */}

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

                {/* Email */}
                <div>

                  <label className="text-base font-semibold text-slate-800">
                    University Email
                  </label>

                  <div className="relative mt-3">

                    <Mail
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="yourname@university.edu"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Use your official university email address.
                  </p>

                </div>

                {/* Send Reset Link */}
                <button
                  type="button"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
                >
                  <Send size={17} />
                  Send Reset Link
                </button>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    or
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  <ArrowLeft size={17} />
                  Back to Login
                </Link>

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
                src={forgotpasswordImage}
                alt="Student recovering account password"
                className="relative mx-auto w-full object-contain scale-110 xl:scale-120"
              />

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;