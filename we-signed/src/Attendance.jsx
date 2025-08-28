import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAttendanceSession, signAttendance } from "./service";
import getCurrentLocation from "./location";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FlippingNumber from "./FlippingNumber";  
import { FaSearch } from "react-icons/fa";

// 🔹 Helper to format time mm:ss
const formatTime = (time) => {
  if (time === null) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function AttendancePage() {
  const [specialId, setSpecialId] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    
  const navigate = useNavigate();

  // Countdown effect
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Search attendance by specialId
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      setAttendance(null);
      setTimeLeft(null);

      const res = await getAttendanceSession(specialId);
      console.log("Fetched attendance:", res.data);

      if (res.data) {
        const { name, duration } = res.data;
        setAttendance({ name, duration });
        setTimeLeft(duration);
      }
    } catch (err) {
      console.error(err);
      setError("Attendance not found or expired.");
      setAttendance(null);
      setTimeLeft(null);
    } finally {
      setLoading(false);
    }
  };

  // Submit student info
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Get location
    const location = getCurrentLocation();
    if (!location) {
      console.error("Could not get location");
      setLoading(false);
      return;
    } else {
      const { latitude, longitude } = location;
      data.latitude = latitude;
      data.longitude = longitude;
      console.log("Got location:", location);
    }

    try {
      const res = await signAttendance(specialId, data);
      if(!res.data.success) toast.error(res.data.message || "Failed to sign attendance. Try again.");
      console.log("Signed attendance:", res.data);  
      toast.success("Attendance signed successfully!");
      const { title, lecturer, date } = res.data.student;
      navigate("/student", {
        state: {
          newAttendance: {
            title, lecturer, date
          }
        }
      });
      e.target.reset(); // Reset form
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign attendance. Try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Student Attendance
        </h1>

        {/* Search Input */}
        <div className="flex space-x-2 mb-6">
          <input
            type="text"
            value={specialId}
            onChange={(e) => setSpecialId(e.target.value)}
            placeholder="Enter Attendance Special ID"
                      className="flex-grow px-4 py-2 border rounded-lg hover:border-blue-300 transition duration-200
            focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSearch}
                      className="shadow-md bg-gradient-to-r from-indigo-500 to-sky-400 hover:from-indigo-500 hover:to-sky-400 text-white px-4 py-2 rounded-lg flex items-center active:scale-95 
            transition duration-200 cursor-pointer"
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
            <span className="ml-3 text-blue-500 font-medium">Searching...</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-center text-red-500 font-medium">{error}</p>
        )}

        {/* Attendance Found */}
        {attendance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6"
          >
            <h2 className="text-lg font-semibold text-center mb-4">
              {attendance.name}
            </h2>

            {/* Countdown Stopwatch with flipping numbers */}
            {timeLeft !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center space-x-2 mb-6"
              >
                {formatTime(timeLeft).split("").map((digit, index) =>
                  digit === ":" ? (
                    <div
                      key={index}
                      className="text-3xl font-bold text-gray-700 px-1"
                    >
                      :
                    </div>
                  ) : (
                    <FlippingNumber key={index} number={digit} />
                  )
                )}
              </motion.div>
            )}

            {/* Student Form (Fade in/out) */}
            <AnimatePresence mode="wait">
              {timeLeft > 0 && (
                <motion.form
                  key="student-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                                          className="w-full px-4 py-2 border rounded-lg focus:ring-2
                       focus:ring-blue-400 outline-none hover:border-blue-300 transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Matric No
                    </label>
                    <input
                      type="text"
                      name="matricNo"
                      required
                                          className="w-full px-4 py-2 border rounded-lg focus:ring-2
                       focus:ring-blue-400 outline-none hover:border-blue-300 transition duration-200"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                                      className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 hover:from-indigo-500 hover:to-sky-400 text-white text-lg py-3 rounded-lg font-semibold 
                    shadow-md active:scale-95 transition duration-200 cursor-pointer"
                  >
                    Sign Attendance
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
