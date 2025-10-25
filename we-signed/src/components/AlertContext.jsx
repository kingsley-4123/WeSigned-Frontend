import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const AlertContext = createContext();

const alertStyles = {
  success: {
    icon: <CheckCircle className="w-6 h-6 text-white mr-3" />,
    bg: "bg-green-600",
  },
  error: {
    icon: <XCircle className="w-6 h-6 text-white mr-3" />,
    bg: "bg-red-600",
  },
  info: {
    icon: <Info className="w-6 h-6 text-white mr-3" />,
    bg: "bg-blue-600",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-white mr-3" />,
    bg: "bg-yellow-500",
  },
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    message: "",
    type: "info",
    visible: false,
    duration: 3000, // default to 3s
    closable: false, // default no close button
  });

  const showAlert = useCallback(
    (message, type = "info", options = {}) => {
      const { duration = 3000, closable = false } = options;

      setAlert({ message, type, visible: true, duration, closable });

      // Only auto close if not closable
      if (!closable && duration > 0) {
        setTimeout(() => {
          setAlert((prev) => ({ ...prev, visible: false }));
        }, duration);
      }
    },
    []
  );

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const getAnimation = (type) => {
    return {
      initial: { scale: 0.8, opacity: 0, y: -20 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0.8, opacity: 0, y: 20 },
    };
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <AnimatePresence>
        {alert.visible && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
          >
            <motion.div
              key="alert"
              {...getAnimation(alert.type)}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 12,
                mass: 0.8,
              }}
              className={`${
                alertStyles[alert.type].bg
              } text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between max-w-sm w-[80%]`}
            >
              <div className="flex items-center flex-1">
                {alertStyles[alert.type].icon}
                <span className="font-medium text-center flex-1">
                  {alert.message}
                </span>
              </div>

              {alert.closable && (
                <button
                  onClick={closeAlert}
                  className="ml-3 text-white/80 hover:text-white transition"
                >
                  <X className="w-5 h-5 bg-red-500 hover:cursor-pointer" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
