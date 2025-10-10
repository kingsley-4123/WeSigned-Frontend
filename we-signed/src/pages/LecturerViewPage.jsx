import { motion } from "framer-motion";
import { useClearLocationState } from "../utils/ClearLocation.jsx";
import { useNavigate } from "react-router-dom";
import { attendanceExport, getAttendances, getSyncedAttendance, exportOfflineAttendance } from "../utils/service.js";
import { toast } from "react-hot-toast";
import { useState } from "react";

export default function AttendanceTablePage() {
  const [loadingFile, setLoadingFile] = useState(null); // "pdf" | "excel" | null
  const [isAttendance, setIsAttendance] = useState(false);
  const [newAttendance, setNewAttendance] = useState([]);

  const state = useClearLocationState();
  const newData1 = state.obj === 'lecturerPage' ? state.reViewData : {};
  const newData2 = state.obj === 'lecturerTimer' ? state.timerData : {};
  const { reViewId, reViewName, reViewStatus } = newData1;
  const { special_id, attendance, attendance_name, lecturer, date } = newData2;
  
  const navigator = useNavigate();

  // Example data — replace with API response
  // const attendance = [
  //   { id: 1, name: "John Doe", studentId: "STU123", signedAt: "2025-08-23 10:00" },
  //   { id: 2, name: "Jane Smith", studentId: "STU456", signedAt: "2025-08-23 10:05" },
  //   { id: 3, name: "Michael Lee", studentId: "STU789", signedAt: "2025-08-23 10:10" },
  // ];

  // Download handler with axios
  const handleDownload = async (type) => {
    setLoadingFile(type);
    try {
      let fileName = "";
      let blobData = null;

      if (reViewStatus === "offline") {
        // Fetch offline attendance for table
        const res = await getSyncedAttendance(reViewId, reViewName);
        setNewAttendance(res.data.attendanceList);
        toast.success("Offline attendance fetched.");
        if (res.error) return toast.error("Error fetching offline attendance.");

        // Export offline attendance (assumes exportOfflineAttendance exists)
        const exportRes = await exportOfflineAttendance(type, reViewId, reViewName);
        blobData = exportRes.data;
        fileName = `${reViewName}.${type}`;
        const disposition = exportRes.headers["content-disposition"];
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, "");
          }
        }
      } else {
        // Online export
        const res = await attendanceExport(type, reViewId);
        blobData = res.data;
        fileName = `${reViewName}.${type}`;
        const disposition = res.headers["content-disposition"];
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, "");
          }
        }
      }

      if (blobData) {
        const url = window.URL.createObjectURL(new Blob([blobData]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert("❌ Download failed. Please try again.");
      console.error(err);
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-2 sm:px-4 py-6">
      {/* Header + Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold text-gray-700"
        >
          Attendance Records
        </motion.h1>

        {/* Download Buttons */}
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
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
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-4">
        <table className="min-w-[420px] w-full text-left border-collapse text-sm sm:text-base">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3">#</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3">Name</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3">Reg No</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3">Signed At</th>
            </tr>
          </thead>
          <tbody>
            {(isAttendance ? newAttendance : attendance ).map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-3 sm:px-6 py-2 sm:py-3">{i + 1}</td>
                <td className="px-3 sm:px-6 py-2 sm:py-3">{s.full_name}</td>
                <td className="px-3 sm:px-6 py-2 sm:py-3">{s.matric_no}</td>
                <td className="px-3 sm:px-6 py-2 sm:py-3">{s.signedAt.toISOString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
