import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { putData, getAllData, deleteData } from "../utils/db.js";
import {getRandomGradient} from "../utils/randomGradients.js"

export default function StudentPage() {
  const [attendances, setAttendances] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const savedStudentRes = JSON.parse(localStorage.getItem("studentAttendanceObj"));
  const { title, lecturer, date } = savedStudentRes || {};

  // Load attendances from IndexedDB
  useEffect(() => {
    getAllData("studentAttendances").then(setAttendances);
  }, []);

  // Add a new attendance with random gradient
  useEffect(() => {
    if (title && lecturer && date) {
      const randomGradient = getRandomGradient();

      const newCard = {
        title: title,
        lecturer: lecturer,
        date: date,
        gradient: randomGradient,
        status: "online"
      };

      putData("studentAttendances", newCard).then(() => {
        setAttendances((prev) => [newCard, ...prev]);
        localStorage.removeItem("studentAttendanceObj");
      });
    }
    // eslint-disable-next-line
  }, [title, lecturer, date]);

  // Delete card
  const deleteAttendance = async (id) => {
    await deleteData("studentAttendances",id);
    setAttendances((prev) => prev.filter((a) => a.id !== id));
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
              to={`/dashboard/student/attendance/${att.id}`}
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