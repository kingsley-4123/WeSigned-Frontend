import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllData } from "../utils/db";
import { useAlert } from "../components/AlertContext";
import { useNavigate } from "react-router-dom"; 
import { decryptText } from "../utils/cryptoUtils";
import PasswordInput from "../components/PasswordComponent";

export default function OfflineLoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccess(false);

        if(!email || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        const savedUsers = await getAllData('user');
        if (savedUsers.length <= 0) {
            showAlert("There's no existing user available!", 'error');
            setLoading(false);
            return;
        }
        const user = savedUsers.find(u => u.email === email);
        if (!user) {
            setError('Incorrect username or password.');
            setLoading(false);
            return;
        }

        const decryptedPassword = await decryptText(user.password);
        if(decryptedPassword !== password) {
            setError('Incorrect username or password.');
            setLoading(false);
            return;
        }
        setSuccess(true);
        setError('');
        localStorage.setItem('offlineUserEmail', JSON.stringify(email));
        setTimeout(() => {
            navigate('/offline-header/component-offline');
        }, 1000);

    }

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 px-2 sm:px-4">
              <motion.div
                className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-8 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Loading Spinner Overlay */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-white/70 flex items-center justify-center z-[9999]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Spinner />
                    </motion.div>
                  )}
                </AnimatePresence>
        
                {/* Success Check Overlay */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      className="absolute inset-0 bg-white/80 flex items-center justify-center z-[9998]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="bg-green-100 rounded-full p-6"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-[#94c04c]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
        
                {/* Logo Section */}
                <motion.div
                  className="flex flex-col items-center mb-6 sm:mb-8"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src="/images/logo.png"
                    alt="WeSigned log"
                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 pt-3 -mt-6 object-contain"
                  />
                  <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-indigo-500 tracking-wide text-center">
                    Welcome Back!
                  </h2>
                </motion.div>
        
                {/* Error Box */}
                {error && (
                  <motion.div
                    className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded-lg text-center"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                  >
                    {error}
                  </motion.div>
                )}
        
                {/* Form */}
                <motion.form
                  className="space-y-4 sm:space-y-5"
                  onSubmit={handleSubmit}
                  autoComplete="off"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ delay: 0.3 }}
                >
                    <div>
                        <label className="block text-md font-medium text-indigo-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
                            placeholder="you@email.com"
                            value={email}
                            autoComplete="email"
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-md font-medium text-indigo-700 mb-1">Password</label>
                        <PasswordInput
                            name="password"
                            placeholder='Password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="hover:scale-105 active:scale-95 w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold text-base sm:text-lg shadow-md hover:from-indigo-600 hover:to-sky-500 transition-all hover:cursor-pointer"
                    >
                        Login
                    </button>
                </motion.form>
            </motion.div>
        </div>
    );
}


const Spinner = () => {
  return (
    <motion.div
      className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
};