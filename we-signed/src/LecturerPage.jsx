import { motion } from "framer-motion";
import { useClearLocationState } from "./ClearLocation";
import axios from "axios";
import { useState } from "react";

export default function AttendanceTablePage() {
  const state = useClearLocationState();
  const { attendance, specialId, lecturerId } = state || {};
  const [loadingFile, setLoadingFile] = useState(null); // "pdf" | "excel" | null

  // Example data — replace with API response
  const students = [
    { id: 1, name: "John Doe", studentId: "STU123", signedAt: "2025-08-23 10:00" },
    { id: 2, name: "Jane Smith", studentId: "STU456", signedAt: "2025-08-23 10:05" },
    { id: 3, name: "Michael Lee", studentId: "STU789", signedAt: "2025-08-23 10:10" },
  ];

  // Download handler with axios
  const handleDownload = async (type) => {
    try {
      setLoadingFile(type);
      const res = await axios.get(
        `http://localhost:5000/api/attendance.${type}/${lecturerId}/${specialId}`,
        { responseType: "blob" }
      );

       console.log("All headers:", res.headers);

    // Log only the Content-Disposition header
    console.log("Content-Disposition:", res.headers["content-disposition"]);

    // Your existing filename logic
    let fileName = `attendance.${type}`;
    const disposition = res.headers["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, "");
      }
    }

    console.log("Final filename:", fileName);

      // Create blob link for download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("❌ Download failed. Please try again.");
      console.error(err);
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header + Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-700"
        >
          Attendance Records
        </motion.h1>

        {/* Download Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload("xlsx")}
            disabled={loadingFile === "xlsx"}
            className={`px-4 py-2 rounded-lg shadow text-white transition ${
              loadingFile === "xlsx"
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loadingFile === "xlsx" ? "Generating..." : "Download Excel"}
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={loadingFile === "pdf"}
            className={`px-4 py-2 rounded-lg shadow text-white transition ${
              loadingFile === "pdf"
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loadingFile === "pdf" ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Attendance Table */}
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
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
