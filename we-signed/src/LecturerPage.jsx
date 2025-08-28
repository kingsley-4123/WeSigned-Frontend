import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useClearLocationState } from "./ClearLocation";

export default function AttendanceTablePage() {
  const state = useClearLocationState();
  const { attendance } = state || {};
    
  // Example data — replace with API response
  const students = [
    { id: 1, name: "John Doe", studentId: "STU123", signedAt: "2025-08-23 10:00" },
    { id: 2, name: "Jane Smith", studentId: "STU456", signedAt: "2025-08-23 10:05" },
    { id: 3, name: "Michael Lee", studentId: "STU789", signedAt: "2025-08-23 10:10" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-700 mb-6"
      >
        Attendance Records
      </motion.h1>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Student ID</th>
              <th className="px-6 py-3">Signed At</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-3">{i + 1}</td>
                <td className="px-6 py-3">{s.name}</td>
                <td className="px-6 py-3">{s.studentId}</td>
                <td className="px-6 py-3">{s.signedAt}</td>
            {/* {attendance.map((s, i) => (
              <motion.tr
                key={s._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-3">{i + 1}</td>
                <td className="px-6 py-3">{s.full_name}</td>
                <td className="px-6 py-3">{s.matric_no}</td>
                <td className="px-6 py-3">{s.signedAt}</td> */}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
