import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  FaHome,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { FiFilter } from 'react-icons/fi';
import { MdCompareArrows } from 'react-icons/md';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // 🔹 Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // 🔹 Active link style
  const linkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-200"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-gradient-to-t from-indigo-300 to-sky-50 shadow-lg flex-col p-6">
        {/* Logo */}
        <img
          src="/images/welcomeLogo.png"
          alt="Logo"
          className="w-32 h-32 md:w-38 md:h-38 pt-5 -mt-13 mb-3"
        />
        <nav className="space-y-4">
          <NavLink to="/dashboard" className={linkClass}>
            <FaHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/student" className={linkClass}>
            <FaUserGraduate />
            <span>Student</span>
          </NavLink>
          <NavLink to="/lecturer" className={linkClass}>
            <FaChalkboardTeacher />
            <span>Lecturer</span>
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            <FaInfoCircle />
            <span>About</span>
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            <FaEnvelope />
            <span>Contact</span>
          </NavLink>
          <NavLink to="/compare-page" className={linkClass}>
            <FiFilter />
            <span>Compare Docs</span>
          </NavLink>
        </nav>
      </aside>

      {/* Sidebar (Mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.aside
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed top-0 left-0 h-full w-64 bg-gradient-to-t from-indigo-300 to-sky-50 shadow-lg flex flex-col p-6 z-40 md:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-600 md:hidden"
              >
                <FaTimes size={20} />
              </button>

              <img
                src="/images/welcomeLogo.png"
                alt="Logo"
                className="w-32 h-32 md:w-38 md:h-38 pt-5 -mt-13 mb-3"
              />
              <nav className="space-y-4">
                <NavLink
                  to="/dashboard"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaHome />
                  <span>Home</span>
                </NavLink>
                <NavLink
                  to="/student"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaUserGraduate />
                  <span>Student</span>
                </NavLink>
                <NavLink
                  to="lecturer"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaChalkboardTeacher />
                  <span>Lecturer</span>
                </NavLink>
                <NavLink
                  to="about"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaInfoCircle />
                  <span>About</span>
                </NavLink>
                <NavLink
                  to="contact"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaEnvelope />
                  <span>Contact</span>
                </NavLink>
                <NavLink
                  to="compare-page"
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FiFilter />
                  <span>Compare Docs</span>
                </NavLink>
              </nav>
            </motion.aside>

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={22} />
            </button>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 tracking-[0.06em]">Dashboard</h1>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <img
                src="https://i.pravatar.cc/40"
                alt="Profile"
                className="h-9 w-9 rounded-full border"
              />
              <span className="hidden sm:block text-gray-700 font-medium">
                User
              </span>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <NavLink
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    <FaUserCircle className="mr-2" />
                    Profile
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    <FaCog className="mr-2" />
                    Settings
                  </NavLink>
                  <button
                    className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setProfileOpen(false);
                      console.log("Logout clicked");
                    }}
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
