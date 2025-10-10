import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getDataById } from "../utils/db.js";


export default function AttendanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const data = await getDataById("studentAttendances", id);
        setAttendance(data);
        setLoading(false);
      } catch (err) {
        console.error("error in attendance details:", err);
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading attendance...</p>;
  }

  if (!attendance) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Attendance not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Gradient Header */}
      <div
        className={`relative rounded-xl shadow-lg overflow-hidden mb-6 bg-gradient-to-r ${attendance.gradient}`}
      >
        {/* Back Button in top-left */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="h-40 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white text-center px-4">
            {attendance.title}
          </h1>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 font-medium">
            Created by: {attendance.lecturer}
          </span>
          <span className="text-gray-500">{attendance.date}</span>
        </div>

        <p className="text-gray-600">
          This attendance was successfully signed and stored on your device.
          You can access it offline anytime.
        </p>
      </div>
    </motion.div>
  );
}
