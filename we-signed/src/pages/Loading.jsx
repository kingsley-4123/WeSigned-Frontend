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
                  className="w-30 h-30 sm:w-32 sm:h-32 md:w-34 md:h-34 max-w-full mb-5 object-contain drop-shadow-lg"
                />
                <div className="text-3xl md:text-4xl font-bold text-[#273c72] tracking-tight whitespace-nowrap mb-5">
                  WeS<span className="text-[#91c04d]">igned</span>
                </div>

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
