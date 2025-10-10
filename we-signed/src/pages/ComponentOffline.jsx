import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

export default function ComponentOffline() {
    const navigate = useNavigate();

    return (
        <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-20 xl:px-32 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
                {/* Student Card */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center w-full h-full min-h-[220px]"
                    onClick={() => navigate('/offline-header/student-offline')}
                >
                    <FaUserGraduate size={40} className="text-blue-600 mb-4" />
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Student</h2>
                    <p className="text-gray-500 text-lg sm:text-base md:text-xl mt-2 text-center">
                        Access attendance and course materials.
                    </p>
                </motion.div>

                {/* Lecturer Card */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center w-full h-full min-h-[220px]"
                    onClick={() => navigate('/offline-header/lecturer-offline')}
                >
                    <FaChalkboardTeacher size={40} className="text-[#94c04c] mb-4" />
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Lecturer</h2>
                    <p className="text-gray-500 text-lg sm:text-base md:text-xl mt-2 text-center">
                        Manage classes and student records.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
