import { motion, AnimatePresence } from "framer-motion";

const FlippingNumber = ({ number }) => {
  return (
    <div className="relative w-12 h-16 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={number} // triggers re-animation on change
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute text-3xl font-bold text-blue-600"
        >
          {number}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FlippingNumber;  