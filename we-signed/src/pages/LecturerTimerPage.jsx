import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAttendances } from "../utils/service.js";
import { useClearLocationState } from "../utils/ClearLocation.jsx";

export default function TimerPage() {
  const state = useClearLocationState();
  const { attSession, lecturer, date } = state || {};
  const { lecturer_id, special_id, duration, attendance_name } = attSession || {
    lecturer_id: null,
    special_id: null,
    duration: 0
  };

   if (!lecturer_id || !special_id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-lg">No active attendance session found.</p>
      </div>
    );
  }

  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  // Countdown logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Get percentage left
  const percentage = (timeLeft / duration) * 100;

  // Circle color based on time
  let color = "text-green-500 border-green-500";
  if (percentage <= 60 && percentage > 30) {
    color = "text-orange-500 border-orange-500";
  } else if (percentage <= 30) {
    color = "text-red-500 border-red-500";
  }

  // Navigate to table
  const handleGetAttendance = async () => {
    try {
      const res = await getAttendances(special_id );
      console.log("Fetched attendances:", res.data);
      navigate("/lecturer", {
        state: {
          obj: "lecturerTimer",
          timerData: {
            attendance: res.data.attendanceList,
            special_id,
            attendance_name,
            lecturer,
            date
          }
        }
      });
    } catch (err) {
      console.error("Error fetching attendances:", err.response ? err.response.data : err);
      alert("Failed to fetch attendance records.");
    }

    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">

      <motion.div
        className={`relative flex items-center justify-center rounded-full border-[12px] ${color}`}
        style={{
          width: "250px",
          height: "250px",
          background: `conic-gradient(currentColor ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {/* Time Text */}
        <span className="text-4xl font-bold z-10">{timeLeft}s</span>
      </motion.div>
      
      <div className="text-2xl font-bold ">{special_id}</div>

      {isFinished && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleGetAttendance}
          className="absolute bottom-12 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
        >
          Get Attendance
        </motion.button>
      )}
    </div>
  );
}
