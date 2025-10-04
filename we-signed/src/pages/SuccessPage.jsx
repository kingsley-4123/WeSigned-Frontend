import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Assume payment status is passed as state: { status: 'success' | 'fail' }
  const status = location.state?.status || "success";

  useEffect(() => {
    // Optionally redirect after a delay
    if (status === "success") {
      const timer = setTimeout(() => navigate("/dashboard"), 4000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 px-2 py-8">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
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
                transition={{ duration: 1, type: "spring" }}
              />
              {/* Animated Good Mark */}
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
              className="text-lg sm:text-xl text-gray-700 text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Thank you for your subscription. You will be redirected shortly.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="fail"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
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
                transition={{ duration: 1, type: "spring" }}
              />
              {/* Animated Fail Mark */}
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="absolute -right-6 bottom-0 w-14 h-14 sm:w-16 sm:h-16"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
              >
                <circle cx="24" cy="24" r="22" fill="#e53e3e" />
                <motion.path
                  d="M17 17l14 14M31 17l-14 14"
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
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-700 mb-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Payment Failed
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-700 text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Sorry, your transaction could not be completed. Please try again.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
