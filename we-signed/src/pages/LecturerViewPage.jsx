import { motion } from "framer-motion";
import { putData } from "../utils/db.js";
import { useNavigate } from "react-router-dom";
import {
  attendanceExport,
  getAttendances,
  getSyncedAttendance,
  exportOfflineAttendance,
} from "../utils/service.js";
import { useState, useEffect } from "react";
import { useAlert } from "../components/AlertContext.jsx";
import { ArrowLeft } from "lucide-react";
import { getRandomGradient } from "../utils/randomGradients.js";


export default function AttendanceTablePage() {
  const [loadingFile, setLoadingFile] = useState(null);
  const [isAttendance, setIsAttendance] = useState(false);
  const [newAttendance, setNewAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const savedTimerData = JSON.parse(localStorage.getItem("latestAttendanceObj"));
  const { special_id, attendance, attendance_name, lecturer, date } =
    savedTimerData || {};

  const savedLecturePageData = JSON.parse(
    localStorage.getItem("offlineAttendanceObj")
  );
  const {
    specialId: reViewId,
    title: reViewName,
    status: reViewStatus,
  } = savedLecturePageData || {};

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    async function saveAttendance() {
      if (attendance_name && lecturer && date && special_id) {
        const randomGradient = getRandomGradient();

        const newCard = {
          title: attendance_name,
          lecturer,
          date,
          gradient: randomGradient,
          specialId: special_id,
          status: "online",
        };

        await putData("lecturerView", newCard);
      }
    }
    saveAttendance();
  }, [attendance_name, lecturer, date, special_id]);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        setIsLoading(true);
        console.log("FETCHED DATA", savedLecturePageData);
        console.log("FETCHED ID", reViewId, "FETCHED STATUS", reViewStatus);
        let res;
        if (reViewStatus === "offline") {
          res = await getSyncedAttendance(reViewId, reViewName);
        } else {
          res = await getAttendances(reViewId);
        }
        console.log("FETCHED RES", res);

        if (!res.data.success) {
          showAlert("Error while downloading document.", "error");
          setNewAttendance([]);
          return;
        }
        setNewAttendance(res.data.attendanceList);
        setIsAttendance(true);
      } catch (err) {
        console.error(err.response ? err.response.data : err);
        if (err.response) showAlert(err.response.data.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAttendance();
  }, [reViewStatus, reViewId, reViewName]);

  const handleDownload = async (type) => {
    setLoadingFile(type);
    try {
      let fileName = "";
      let blobData = null;

      if (reViewStatus === "offline") {
        const exportRes = await exportOfflineAttendance(type, reViewId, reViewName);
        blobData = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        fileName = `${reViewName}.${type}`;
        const disposition = exportRes.headers["content-disposition"];
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) fileName = match[1].replace(/['"]/g, "");
        }
      } else if (reViewStatus === 'online') {
        const res = await attendanceExport(type, reViewId);
        if (res) {
          console.log("DOWNLOAD RS", res);
        }
        blobData = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        fileName = `${attendance_name}.${type}`;
        const disposition = res.headers["content-disposition"];
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) fileName = match[1].replace(/['"]/g, "");
        }
      } else {
        const res = await attendanceExport(type, special_id);
        blobData = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        fileName = `${attendance_name}.${type}`;
        const disposition = res.headers["content-disposition"];
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) fileName = match[1].replace(/['"]/g, "");
        }
      }

      if (blobData) {
        showAlert("Be patient your download will start shortly.", "info", { duration: 4000 });
        const url = window.URL.createObjectURL(blobData);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      showAlert("❌ Download failed. Please try again.", "error");
      console.error(err);
    } finally {
      setLoadingFile(null);
    }
  };

  const dataToRender = Array.isArray(isAttendance ? newAttendance : attendance)
    ? isAttendance
      ? newAttendance
      : attendance
    : [];

  return (
    <div className="min-h-screen bg-gray-100 mx-[-15px] sm:px-6 py-4 flex flex-col">
      {/* Header Section */}
      <div className="relative flex flex-col items-center mb-6">
        {/* Go Back Button */}
        <motion.button
          onClick={() => {
            localStorage.removeItem("latestAttendanceObj");
            localStorage.removeItem("offlineAttendanceObj");
            navigate(-1);
          }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-0 left-0 items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-full shadow hover:bg-gray-200 transition cursor-pointer"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* Header Title */}
        <div className="h-20 flex justify-center items-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 text-center">
            Attendance Records
          </h1>
        </div>
        

        {/* Download Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload("xlsx")}
            disabled={loadingFile === "xlsx"}
            className={`flex justify-center items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-white shadow transition cursor-pointer ${loadingFile === "xlsx"
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {loadingFile === "xlsx" ? (
              <>
                <span className="loader"></span> Excel...
              </>
            ) : (
              "Download Excel"
            )}
          </button>

          <button
            onClick={() => handleDownload("pdf")}
            disabled={loadingFile === "pdf"}
            className={`flex justify-center items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-white shadow transition cursor-pointer ${loadingFile === "pdf"
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {loadingFile === "pdf" ? (
              <>
                <span className="loader"></span> PDF...
              </>
            ) : (
              "Download PDF"
            )}
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="w-full flex-grow overflow-x-auto bg-white shadow-lg rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full"
            ></motion.div>
          </div>
        ) : dataToRender.length > 0 ? (
          <table className="min-w-[360px] w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-gray-200 text-gray-700 sticky top-0">
              <tr>
                <th className="px-2 sm:px-4 py-2">#</th>
                <th className="px-2 sm:px-4 py-2">Name</th>
                <th className="px-2 sm:px-4 py-2">Reg No</th>
                <th className="px-2 sm:px-4 py-2">Signed At</th>
              </tr>
            </thead>
            <tbody>
              {dataToRender.map((s, i) => (
                <motion.tr
                  key={s.id || s._id || s.matric_no || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-2 sm:px-4 py-2">{i + 1}</td>
                  <td className="px-2 sm:px-4 py-2 truncate">{s.full_name}</td>
                  <td className="px-2 sm:px-4 py-2">{s.matric_no}</td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                    {new Date(s.signedAt).toDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            No attendance records found
          </div>
        )}
      </div>

      {/* Spinner Loader */}
      <style>
        {`
        .loader {
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  );
}
