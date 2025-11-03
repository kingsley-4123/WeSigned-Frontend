import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 px-2 py-8">
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex flex-col items-center"
      >
        <div className="relative flex items-center justify-center mb-6">
          {/* Logo */}
          <motion.img
            src="/images/logo.png"
            alt="WeSigned Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Animated Check Mark */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="absolute -right-6 bottom-0 w-14 h-14 sm:w-16 sm:h-16"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
          >
            <circle cx="24" cy="24" r="22" fill="#94c04c" />
            <motion.path
              d="M15 25l7 7 11-13"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 0.7, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>

        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-700 text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          Thank you for your subscription. Hope you do enjoy<span className='text-[#273c72] font-bold'> We</span><span className="text-[#94c04c] font-bold">Signed.</span>
        </motion.p>

        <motion.button
          onClick={() => navigate("/dashboard")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#273c72] to-[#94c04c] text-white font-semibold text-lg shadow-md hover:from-[#23376b] hover:to-[#669b11] cursor-pointer transition-all"
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
