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
                  src="/images/loadingLogo.png"
                  alt="WeSigned Logo"
                  className="w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 max-w-full mb-2 object-contain drop-shadow-lg"
                  animate={{
                    scale: [1, 1.12, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "linear",
                  }}
                />

            {/* Loading dots */}
                <motion.div
                  className="flex space-x-2 -mt-15"
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
