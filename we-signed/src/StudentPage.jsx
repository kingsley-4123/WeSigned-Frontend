import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import {useClearLocationState} from "./ClearLocation"
import { motion, AnimatePresence } from "framer-motion";

/** Storage key */
const ATTENDANCE_KEY = "studentAttendances";

/** Available gradient classes */
const gradients = [
  "from-indigo-500 to-sky-400",
  "from-purple-500 to-pink-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-yellow-400",
  "from-rose-500 to-red-400",
  "from-teal-500 to-cyan-400",
];

/** Helpers */
const loadJSON = (k, fb) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fb;
  } catch {
    return fb;
  }
};
const saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export default function StudentPage() {
  const [attendances, setAttendances] = useState(() =>
    loadJSON(ATTENDANCE_KEY, [])
  );
  const [confirmDelete, setConfirmDelete] = useState(null);

  const state = useClearLocationState();
  const {newAttendance} = state || {};

  // Add a new attendance with random gradient
  const addAttendance = (title, lecturer, date) => {
    const randomGradient =
      gradients[Math.floor(Math.random() * gradients.length)];

    const newCard = {
      id: Date.now(),
      title,
      lecturer,
      date,
      gradient: randomGradient,
    };
    const updated = [newCard, ...attendances];
    setAttendances(updated);
    saveJSON(ATTENDANCE_KEY, updated);
  };

  // Handle navigation state
  useEffect(() => {
    if (newAttendance) {
      addAttendance(
        newAttendance.title,
        newAttendance.lecturer,
        newAttendance.date
      );
      
    }
  }, [newAttendance]);

  // Delete card
  const deleteAttendance = (id) => {
    const updated = attendances.filter((a) => a.id !== id);
    setAttendances(updated);
    saveJSON(ATTENDANCE_KEY, updated);
    setConfirmDelete(null);
  };

  return (
    <div className="relative p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Attendances</h1>
      </div>

      {/* Cards */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {attendances.map((att) => (
          <div
            key={att.id}
            className="relative rounded-xl shadow-lg overflow-hidden group"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setConfirmDelete(att.id);
              }}
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
              title="Delete"
            >
              <FaTrash className="text-red-500 hover:text-red-700" />
            </button>

            {/* Card */}
            <Link
              to={`/student/attendance/${att.id}`}
              state={att}
              className="block"
            >
              {/* Gradient top with title */}
              <div
                className={`h-32 bg-gradient-to-r ${att.gradient} flex items-center justify-start`}
              >
                <h1 className="text-white text-lg font-semibold px-2">
                  {att.title}
                </h1>
              </div>

              {/* White bottom with lecturer + date */}
              <div className="flex justify-between items-center px-4 py-5 bg-white">
                <span className="text-sm text-gray-700 font-medium">
                  {att.lecturer}
                </span>
                <span className="text-sm text-gray-500">{att.date}</span>
              </div>
            </Link>
          </div>
        ))}

        {attendances.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No attendance signed yet.
          </p>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 w-80 text-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold mb-4">
                Delete this attendance?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => deleteAttendance(confirmDelete)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
