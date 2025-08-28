import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

export default function ComponentOffline() {
    const navigate = useNavigate();

    return (
      
        <main className="flex-1 p-20 bg-gray-100">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Student Card */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => navigate('/student/attendance')}
                    >
                    <FaUserGraduate size={40} className="text-blue-600 mb-4" />
                    <h2 className="text-xl font-semibold">Student</h2>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        View your successfully signed attendance records.
                    </p>
                    </motion.div>

                    {/* Lecturer Card */}
                    <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => navigate('/lecturer/attendance-session')}
                    >
                    <FaChalkboardTeacher size={40} className="text-green-600 mb-4" />
                    <h2 className="text-xl font-semibold">Lecturer</h2>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        Manage and view the attendances you’ve collected.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
