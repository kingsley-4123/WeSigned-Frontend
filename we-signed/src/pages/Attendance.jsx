import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAttendanceSession, signAttendance } from "../utils/service.js";
import getCurrentLocation from "../utils/location.js";
import { useNavigate } from "react-router-dom";
import FlippingNumber from "../components/FlippingNumber";
import { FaSearch } from "react-icons/fa";
import { useAlert } from "../components/AlertContext.jsx";

export default function AttendancePage() {

  // Convert duration units to milliseconds
  const getDurationInMs = (duration, unit) => {
    switch (unit) {
      case "minutes":
        return duration * 60;
      case "hours":
        return duration * 3600;
      case "seconds":
        return duration;
      default:
        return 0;
    }
  };

  // Compute remaining seconds based on time difference
  const computeRemainingSeconds = (createdAt, duration, unit) => {
    const safeDuration = Number(duration) || 0;
    const durationMs = getDurationInMs(safeDuration, unit);
    const createdAtTime = Number(createdAt);
    if (isNaN(createdAtTime)) return 0;
    const elapsed = Math.floor((Date.now() - createdAtTime) / 1000);
    const remainingMs = Math.max(durationMs - elapsed, 0);
    return remainingMs;
  };

  const [duration, setDuration] = useState(0);
  const [unit, setUnit] = useState("");
  const [createdAt, setCreatedAt] = useState(0);
  const [specialId, setSpecialId] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // ✅ Fixed time formatter
  const formatTime = (time) => {
    if (time === null || time <= 0) return "00:00:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // ✅ Countdown effect
  useEffect(() => {
    if (!attendance || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          showAlert("Attendance session has ended.", "error");
          setAttendance(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attendance]);

  // ✅ Search attendance
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      setAttendance(null);
      setTimeLeft(0);

      const res = await getAttendanceSession(specialId);
      console.log("Fetched attendance:", res.data);

      if (res.data.ok) {
        const { attendance_name, unit, duration, createdAt } =
          res.data;

        setCreatedAt(createdAt);
        setUnit(unit);
        setDuration(duration);

        const remaining = computeRemainingSeconds(
          createdAt,
          duration,
          unit
        );
        setTimeLeft(remaining);
        setAttendance({ name: attendance_name });
      } else {
        setError("Invalid attendance session.");
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      setError(
        err.response?.data?.message || "Attendance session not found."
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Get location
    const loc = await getCurrentLocation();
    if (!loc || !loc.location) {
      showAlert("Could not get location. Please allow location access.", "error");
      setLoading(false);
      return;
    }

    const { latitude, longitude } = loc.location;
    data.latitude = latitude;
    data.longitude = longitude;

    try {
      const res = await signAttendance(specialId, data);
      if (!res.data.success) {
        showAlert(res.data.message, "error");
        setLoading(false);
        return;
      }
      console.log("Signed attendance:", res.data);
      const { title, lecturer, date } = res.data.student;
      localStorage.setItem(
        "studentAttendanceObj",
        JSON.stringify({ title, lecturer, date })
      );
      setSuccess(true);

      navigate("/dashboard/student");
      e.target.reset();
      setAttendance(null);
      setTimeLeft(0);
      setSpecialId("");
    } catch (err) {
      console.error(err);
      if(err.response) return showAlert(err.response.data.message, "error");
    } finally {
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-6 md:px-10 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-md sm:max-w-lg md:max-w-2xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-10"
      >
        {/* Success Check Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="absolute inset-0 bg-white/80 flex items-center justify-center z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-green-100 rounded-full p-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-[#94c04c]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-600 mb-6">
          Student Attendance
        </h1>

        {/* 🔍 Search Input */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={specialId}
            onChange={(e) => setSpecialId(e.target.value)}
            placeholder="Enter Attendance Special ID"
            className="flex-grow px-3 py-2 border rounded-lg hover:border-blue-300 transition duration-200 focus:ring-2 focus:ring-blue-400 outline-none text-base sm:text-lg"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSearch}
            disabled={loading || !specialId.trim()}
            className="shadow-md bg-gradient-to-r from-indigo-500 to-sky-300 hover:from-indigo-600 hover:to-sky-400 text-white px-4 py-2 rounded-lg flex items-center justify-center active:scale-95 transition duration-200 text-base sm:text-lg"
          >
            <FaSearch className="mr-2" />
            Search
          </motion.button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-6"
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-500 font-medium">
              {attendance ? "Processing..." : "Searching..."}
            </span>
          </motion.div>
        )}

        {/* Error */}
        {error && <p className="text-center text-red-500 font-medium">{error}</p>}

        {/* Attendance Session Found */}
        {attendance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
              {attendance.name}
            </h2>

            {/* Countdown Timer */}
            {timeLeft > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center items-center space-x-1 sm:space-x-2 mb-6 text-gray-800"
              >
                {formatTime(timeLeft).split("").map((digit, index) =>
                  digit === ":" ? (
                    <span
                      key={index}
                      className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-700 mx-1 sm:mx-2"
                    >
                      :
                    </span>
                  ) : (
                    <div
                      key={index}
                      className="w-7 sm:w-10 md:w-12 flex justify-center"
                    >
                      <FlippingNumber number={digit} />
                    </div>
                  )
                )}
              </motion.div>
            )}

            {/* Student Form */}
            <AnimatePresence mode="wait">
              {timeLeft > 0 && (
                <motion.form
                  key="student-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none hover:border-blue-300 transition duration-200 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reg No
                    </label>
                    <input
                      type="text"
                      name="matric_no"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none hover:border-blue-300 transition duration-200 text-sm sm:text-base"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-sky-300 hover:from-indigo-600 hover:to-sky-400 text-white text-base sm:text-lg py-2 sm:py-3 rounded-lg font-semibold shadow-md active:scale-95 transition duration-200 cursor-pointer"
                  >
                    {loading ? "Processing..." : "Sign Attendance"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
