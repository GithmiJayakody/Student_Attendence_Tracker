import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  BarChart3,
  Users,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

import homeIllustration from "../assets/home.png";
import logo from "../assets/Logo-GraduationCap.png";

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* NAVBAR */}
      <header className="relative z-50 border-b border-slate-100 bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="StudentTrack"
                className="h-10 w-12 object-contain"
              />
            </div>

            <span className="text-2xl font-bold tracking-tight sm:text-3xl">
              Student<span className="text-blue-600">Track</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#home"
              className="text-md font-medium text-blue-600 transition hover:text-blue-700"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-md font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-md font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>

          </div>

          {/* Desktop Login/Register */}
          <div className="hidden items-center gap-3 md:flex">

            <Link
              to="/login"
              className="rounded-lg border border-blue-500 px-5 py-2 text-md font-medium text-blue-600 transition hover:bg-blue-50"
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

        </nav>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-md md:hidden">

            <div className="flex flex-col gap-4">

              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-blue-600"
              >
                Home
              </a>

              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-slate-600 transition hover:text-blue-600"
              >
                Features
              </a>

              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-slate-600 transition hover:text-blue-600"
              >
                About
              </a>

              <div className="flex gap-3 border-t border-slate-100 pt-4">

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-blue-500 py-2.5 text-center text-md font-medium text-blue-600"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-md font-medium text-white"
                >
                  Register
                </Link>

              </div>

            </div>
          </div>
        )}
      </header>


      {/* HERO SECTION */}
      <main>

        <section
          id="home"
          className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50"
        >

          {/* Decorative background circles */}
          <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />


          {/* Hero Container */}
          <div className="relative mx-auto flex max-w-7xl flex-col px-5 py-8 sm:px-8 sm:py-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-10 lg:py-24">


            {/*ILLUSTRATION*/}
            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">

              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-3xl">

                <div className="pointer-events-none absolute inset-10 rounded-full bg-blue-100/70 blur-3xl" />

                <img
                  src={homeIllustration}
                  alt="Students using StudentTrack attendance system"
                  className="relative mx-auto w-full object-contain lg:scale-110 xl:scale-115"
                />

              </div>

            </div>


            {/*HERO CONTENT*/}
            <div
              className="
                order-2
                mt-5
                text-center
                lg:order-1
                lg:mt-0
                lg:text-left
              "
            >

              {/* Small heading */}
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 sm:text-sm">
                Student Attendance Management System
              </p>


              {/* Main Heading */}
              <h1
                className="
                  mx-auto
                  mt-4
                  max-w-3xl
                  text-4xl
                  font-extrabold
                  leading-[1.08]
                  tracking-tight
                  text-slate-900
                  sm:text-5xl
                  md:text-6xl
                  lg:mx-0
                  lg:text-6xl
                  xl:text-7xl
                "
              >
                Smarter

                <span className="block text-blue-600">
                  Attendance
                </span>

                <span className="block">
                  for a Brighter Future
                </span>
              </h1>


              {/* Description */}
              <p
                className="
                  mx-auto
                  mt-5
                  max-w-xl
                  text-base
                  leading-7
                  text-slate-600
                  sm:text-lg
                  sm:leading-8
                  lg:mx-0
                "
              >
                A simple, efficient and modern way to manage student attendance
                for students and lecturers.
              </p>


              {/* FEATURE HIGHLIGHTS */}
              <div
                className="
                  mx-auto
                  mt-8
                  grid
                  max-w-lg
                  grid-cols-3
                  gap-3
                  sm:gap-5
                  lg:mx-0
                  lg:max-w-xl
                "
              >

                {/* Easy Attendance */}
                <div className="flex flex-col items-center text-center">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-12 sm:w-12">
                    <CalendarCheck size={21} />
                  </div>

                  <p className="mt-2 text-[11px] font-medium leading-4 text-slate-700 sm:text-xs">
                    Easy
                    <br />
                    Attendance
                  </p>

                </div>


                {/* Analytics */}
                <div className="flex flex-col items-center text-center">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 sm:h-12 sm:w-12">
                    <BarChart3 size={21} />
                  </div>

                  <p className="mt-2 text-[11px] font-medium leading-4 text-slate-700 sm:text-xs">
                    Real-time
                    <br />
                    Analytics
                  </p>

                </div>


                {/* Roles */}
                <div className="flex flex-col items-center text-center">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-purple-600 sm:h-12 sm:w-12">
                    <Users size={21} />
                  </div>

                  <p className="mt-2 text-[11px] font-medium leading-4 text-slate-700 sm:text-xs">
                    For Students,
                    <br />
                    Lecturers & Admins
                  </p>

                </div>

              </div>


              {/* GET STARTED BUTTON */}
              <div className="mt-8 flex justify-center lg:justify-start">

                <Link
                  to="/register"
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-blue-600
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-200
                    transition
                    hover:bg-blue-700
                    hover:shadow-xl
                    sm:px-7
                    sm:py-3.5
                  "
                >
                  Get Started

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

              </div>

            </div>

          </div>
        </section>


        {/* =FEATURES SECTION */}
        <section
          id="features"
          className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
        >

          <div className="mx-auto max-w-7xl">

            {/* Section heading */}
            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Features
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Manage attendance easily with tools designed for
                students, lecturers, and administrators.
              </p>

            </div>


            {/* Feature Cards */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <FeatureCard
                icon={<CalendarCheck size={24} />}
                title="Easy Attendance"
                description="Create sessions and record attendance quickly and efficiently."
              />

              <FeatureCard
                icon={<BarChart3 size={24} />}
                title="Real-time Analytics"
                description="Monitor attendance percentages and identify students who need attention."
              />

              <FeatureCard
                icon={<Users size={24} />}
                title="Role Based Access"
                description="Separate features and dashboards for students, lecturers, and administrators."
              />

            </div>

          </div>
        </section>


        {/* ABOUT SECTION */}
        <section
          id="about"
          className="bg-blue-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
        >

          <div className="mx-auto max-w-4xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              About StudentTrack
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Simple. Smart. Student-focused.
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              StudentTrack helps educational institutions manage
              attendance efficiently while giving students and
              lecturers a clear view of attendance progress.
            </p>

          </div>

        </section>

      </main>
   
    </div>
  );
}



function FeatureCard({ icon, title, description }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        sm:p-7
      "
    >

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900 sm:text-xl">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
        {description}
      </p>

    </div>
  );
}

export default Home;