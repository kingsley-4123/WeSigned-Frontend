import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAttendances } from "../utils/service.js";
import { useAlert } from "../components/AlertContext.jsx";

export default function TimerPage() {
  const savedSessionData = JSON.parse(localStorage.getItem("latestSessionObj"));
  console.log("Saved session data from localStorage:", savedSessionData);

  const { attSession, lecturer, date } = savedSessionData || {};
  const {
    special_id,
    duration = 0,
    duration_unit = "seconds",
    attendance_name,
    createdAt,
  } = attSession || {};

  console.log("SESSION_SPECIALID:", special_id, "SESSION_LECTURER:", lecturer);

  if (!special_id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-lg">
          No active attendance session found.
        </p>
      </div>
    );
  }

  // 🔹 Convert duration into seconds based on unit
  const safeDuration = Number(duration) || 0;
  const durationInSeconds = useMemo(() => {
    switch (duration_unit) {
      case "minutes":
        return safeDuration * 60;
      case "hours":
        return safeDuration * 3600;
      default:
        return safeDuration;
    }
  }, [duration, duration_unit]);

  // 🔹 Calculate elapsed time since session started
  const elapsedTimeInSeconds = useMemo(() => {
    const createdAtTime = Number(createdAt);
    if (isNaN(createdAtTime)) return 0;
    return Math.floor((Date.now() - createdAtTime) / 1000);
  })
  
  const initialTimeLeft = Math.max(durationInSeconds - elapsedTimeInSeconds, 0);

  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isFinished, setIsFinished] = useState(initialTimeLeft <= 0);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // 🔹 Countdown logic (stable, even on refresh)
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // 🔹 Percentage left (for circle progress)
  const percentage = (timeLeft / durationInSeconds) * 100;

  // 🔹 Circle color based on time remaining
  const color =
    percentage <= 30
      ? "text-red-500 border-red-500"
      : percentage <= 60
      ? "text-orange-500 border-orange-500"
      : "text-green-500 border-green-500";

  // 🔹 Format time (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // 🔹 Fetch attendance after timer ends
  const handleGetAttendance = async () => {
    try {
      const res = await getAttendances(special_id);
      console.log("GET ATTENDANCE RES", res.data);

      if (!res.data) {
        showAlert("No attendance data found.", "error");
        return;
      }

      const timerData = {
        attendance: res.data.attendanceList,
        special_id,
        attendance_name,
        lecturer,
        date,
      };

      localStorage.removeItem("latestSessionObj");
      const storedData = JSON.parse(localStorage.getItem("latestAttendanceObj"));
      if (storedData) localStorage.removeItem("latestAttendanceObj");
      localStorage.setItem("latestAttendanceObj", JSON.stringify(timerData));
      navigate("/dashboard/lecturer");
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      if (err.response) {
        showAlert(err.response.data.message, "error");
        return;
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-8 p-6 text-center">
      {/* Session Info */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Attendance: <span className="text-blue-600">{attendance_name}</span>
        </h2>
        <p className="text-gray-500 font-semibold mt-1">
          Session ID:{" "}
          <span className="font-medium text-lg tracking-[0.06em] text-[#94c04c] ml-3">
            {special_id}
          </span>
        </p>
      </div>

      {/* Timer Circle */}
      <motion.div
        className={`relative flex items-center justify-center rounded-full border-[12px] ${color} shadow-lg`}
        style={{
          width: "250px",
          height: "250px",
          background: `conic-gradient(currentColor ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="flex flex-col items-center z-10">
          <span className="text-4xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 mt-1">Time Remaining</span>
        </div>
      </motion.div>

      {/* Get Attendance Button */}
      {isFinished && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleGetAttendance}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-sky-300 text-white font-medium rounded-lg shadow hover:from-indigo-600 hover:to-sky-400 cursor-pointer transition"
        >
          Get Attendance
        </motion.button>
      )}
    </div>
  );
}
