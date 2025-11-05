import { useState } from "react";
import { createAttendanceSession } from "../utils/service.js";
import getCurrentLocation from "../utils/location.js";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaClock, FaRulerCombined, FaCheck } from "react-icons/fa";
import { useAlert } from "../components/AlertContext.jsx";

export default function AttendanceSession() {
  const [duration, setDuration] = useState("1"); // 1–10 or "custom"
  const [customDuration, setCustomDuration] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    unit: "minutes", // hours | minutes | seconds
    range: "100",    // 50 | 100 | 200 | 500 | 1000
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Attendance name is required";
    if (duration === "custom") {
      const n = Number(customDuration);
      if (!n || n <= 0) e.customDuration = "Enter a positive number";
    } else {
      const n = Number(duration);
      if (!n || n < 1 || n > 10) e.duration = "Choose 1–10 or Custom";
    }
    if (!["hours", "minutes", "seconds"].includes(formData.unit)) {
      e.unit = "Pick a duration unit";
    }
    if (!["20", "50", "100", "200", "500", "1000"].includes(formData.range)) {
      e.range = "Pick a valid range";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eObj = validate();
      setErrors(eObj);
      if (Object.keys(eObj).length) return;

      setLoading(true);
      const finalDuration = duration === "custom" ? Number(customDuration) : Number(duration);
      const payload = { ...formData, duration: finalDuration };

      const loc = await getCurrentLocation();
      if(!loc || !loc.location){
        showAlert("Could not get your location. Ensure location services are enabled and try again.", 'error');
        setLoading(false);
        return;
      }
      const { latitude, longitude } = loc.location;
      payload.latitude = latitude;
      payload.longitude = longitude;
      console.log("Got location:", loc);

      console.log("Submitting:", payload);
      const res = await createAttendanceSession(payload);
      if (!res.data.success) {
        showAlert(res.data.message, "error");
        setLoading(false);
        return;
      }
      console.log("Created session:", res.data);
      const { attSession, lecturer, date } = res.data;
      const attSessionObj = {attSession, lecturer, date};
      setSuccess(true);
      setLoading(false);
      showAlert(`Your Attendance Session ID is ${attSession.special_id}. Share it with your students.`, 'info', {closable: true});
      localStorage.setItem('latestSessionObj', JSON.stringify(attSessionObj));
      navigate("/dashboard/lecturer/timer");  
     
    } catch (err) {
      console.error("Error creating session:", err.response ? err.response.data : err);
      if(err.response){
        showAlert(err.response.data.message, 'error');
        setSuccess(false);
        setLoading(false);
      }
    }
    setLoading(false);
    setSuccess(false);
  };

  // Page mount animation
  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  // Reusable shake (applied to a tiny wrapper around each control)
  const shakeIf = (hasError) =>
    hasError
      ? { x: [-8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.45 } }
      : { x: 0 };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-100 px-2 sm:px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 transition hover:shadow-xl"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Loading Spinner Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 bg-white/70 flex items-center justify-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Spinner />
            </motion.div>
          )}
        </AnimatePresence>

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
        
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Create Attendance Session</h1>

        <motion.form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" variants={containerVariants}>
          {/* Attendance Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2" htmlFor="attendanceName">
              Attendance Name
            </label>
            <motion.div animate={shakeIf(!!errors.name)}>
              <input
                id="attendanceName"
                type="text"
                name="attendanceName"
                placeholder="e.g. CSC101 - Lecture 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "attendanceName-error" : undefined}
                className={`w-full px-4 py-2 border rounded-lg outline-none bg-white
                            focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                            hover:border-blue-300 transition duration-200
                            ${errors.name ? "border-red-500" : "border-gray-300"}`}
                required
              />
            </motion.div>
            {errors.name && (
              <p id="attendanceName-error" className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </motion.div>

          {/* Duration */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" htmlFor="duration">
              <FaClock className="text-blue-500" /> Duration
            </label>
            <motion.div animate={shakeIf(!!errors.duration)}>
              <select
                id="duration"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg outline-none bg-white
                            focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                            hover:border-blue-300 transition duration-200 cursor-pointer
                            ${errors.duration ? "border-red-500" : "border-gray-300"}`}
              >
                {[...Array(10).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>
                    {n + 1}
                  </option>
                ))}
                <option value="custom">Custom…</option>
              </select>
            </motion.div>
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}

            {duration === "custom" && (
              <motion.div className="mt-2" animate={shakeIf(!!errors.customDuration)}>
                <input
                  type="number"
                  name="customDuration"
                  min="1"
                  placeholder="Enter custom duration"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  aria-invalid={!!errors.customDuration}
                  className={`w-full px-4 py-2 border rounded-lg outline-none bg-white
                              focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                              hover:border-blue-300 transition duration-200
                              ${errors.customDuration ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.customDuration && (
                  <p className="text-red-500 text-sm mt-1">{errors.customDuration}</p>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Duration Unit */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2" htmlFor="durationUnit">
              Duration Unit
            </label>
            <motion.div animate={shakeIf(!!errors.unit)}>
              <select
                id="durationUnit"
                name="durationUnit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg outline-none bg-white
                            focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                            hover:border-blue-300 transition duration-200 cursor-pointer
                            ${errors.unit ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
                <option value="seconds">Seconds</option>
              </select>
            </motion.div>
            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
          </motion.div>

          {/* Range */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" htmlFor="range">
              <FaRulerCombined className="text-green-500" /> Range (meters)
            </label>
            <motion.div animate={shakeIf(!!errors.range)}>
              <select
                id="range"
                name="range"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg outline-none bg-white
                            focus:ring-2 focus:ring-green-400 focus:border-green-400
                            hover:border-green-300 transition duration-200 cursor-pointer
                            ${errors.range ? "border-red-500" : "border-gray-300"}`}
              >
                {[20, 50, 100, 200, 500, 1000].map((r) => (
                  <option key={r} value={String(r)}>
                    {r}
                  </option>
                ))}
              </select>
            </motion.div>
            {errors.range && <p className="text-red-500 text-sm mt-1">{errors.range}</p>}
          </motion.div>

          {/* Submit / Success */}
          <motion.div className="flex justify-center mt-6" variants={itemVariants}>
            {!success ? (
              <motion.button
                type="submit"
                disabled={loading}
                              className="w-full py-3 bg-gradient-to-r  from-indigo-500 to-sky-400 text-lg shadow-md hover:from-indigo-600 hover:to-sky-500 text-white font-semibold rounded-lg 
                active:scale-95 transition duration-200 cursor-pointer flex items-center justify-center disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.04 }}
                whileTap={{ scale: loading ? 1 : 0.96 }}
              >
                {loading ? "Creating..." : "Create Session"}
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center"
              >
                <FaCheck className="text-white text-xl" />
              </motion.div>
            )}
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}


const Spinner = () => {
  return (
    <motion.div
      className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
};
