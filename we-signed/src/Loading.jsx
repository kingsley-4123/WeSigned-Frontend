import { motion, AnimatePresence } from "framer-motion";

function Loading({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 via-indigo-300 to-sky-100 z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center">
            {/* Logo */}
            <motion.img
              src="/images/logo.png"
              alt="WeSigned Logo"
              className="w-32 h-32 md:w-38 md:h-38 mb-4"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
              }}
            />

            {/* App name */}
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              WeSigned
            </motion.h1>

            {/* Loading dots */}
            <motion.div
              className="flex space-x-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2, 3].map((dot) => (
                <motion.span
                  key={dot}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: dot * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default Loading;
