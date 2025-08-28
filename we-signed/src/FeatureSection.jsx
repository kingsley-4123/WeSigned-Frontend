import { motion } from "framer-motion";
import {useInView} from "react-intersection-observer" // for monitoring when element enters and leaves the viewport.

export default function FeatureSection({ sec, reverse }) {
  const [ref, inView] = useInView({
    triggerOnce: false, // animate on enter AND leave
    threshold: 0.2, // trigger when 20% visible
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 50, scale: 0.95 }
      }
      transition={{ duration: 0.7, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center 
        px-8 md:px-20 py-16 
        rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl 
        transition-all duration-300 bg-white
        my-12 mx-6 md:mx-20
        ${reverse ? "md:flex-row-reverse" : ""}
      `}
    >
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 100 : -100 }}
        animate={
          inView
            ? { opacity: 1, x: 0 }
            : { opacity: 0, x: reverse ? 100 : -100 }
        }
        transition={{ duration: 0.7 }}
        className="flex flex-col"
      >
        <h2 className="text-3xl font-bold text-blue-700 mb-4">{sec.title}</h2>
        <p className="text-gray-600 text-lg leading-relaxed">{sec.text}</p>
      </motion.div>

      {/* Image */}
      <motion.img
        initial={{ opacity: 0, x: reverse ? -100 : 100 }}
        animate={
          inView
            ? { opacity: 1, x: 0 }
            : { opacity: 0, x: reverse ? -100 : 100 }
        }
        transition={{ duration: 0.7 }}
        src={sec.image}
        alt={sec.title}
        className="w-full max-w-md mx-auto rounded-xl shadow-md"
      />
    </motion.section>
  );
}
