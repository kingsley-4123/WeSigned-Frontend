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
                  className="w-40 h-40 sm:w-44 sm:h-44 md:w-44 md:h-44 lg:w-48 lg:h-48 max-w-full mb-5 object-contain drop-shadow-lg"
                />

            {/* Loading dots */}
                <motion.div
                  className="flex space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2, 3].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-3 h-3 bg-blue-400 rounded-full shadow"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                        delay: dot * 0.18,
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
