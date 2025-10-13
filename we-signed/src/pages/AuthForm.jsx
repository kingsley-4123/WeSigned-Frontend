import React, { useState, useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { putData, getDataById } from '../utils/db.js';
import { signup, verifySignup, login, verifyLogin, sendOTP, verIfyOTP, reRegister } from '../utils/service.js';
import { useNavigate } from 'react-router-dom';
import { encryptText } from '../utils/cryptoUtils.js';
import toast from 'react-hot-toast';
import PasswordInput from '../components/PasswordComponent.jsx';
import { useAlert } from '../components/AlertContext.jsx';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    firstname: '',
    middlename: '',
    surname: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill("")); // 6-digit OTP
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    if (!isLogin) {
      try {
        const { firstname, middlename, surname, email, password } = form;
        if (!firstname || !middlename || !surname || !email || !password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const user = { firstname, middlename, surname, email, password };
        const signupRes = await signup(user);
        const result = signupRes.data.options;
        const userId = signupRes.data.userID;
        
        console.log("Options", signupRes);
        const registrationResponse = await startRegistration({ optionsJSON: result });
        console.log("regRes", registrationResponse);
        if (registrationResponse.error) {
          showAlert(registrationResponse.error, 'error');
          setLoading(false);
          return;
        }

        const response = await verifySignup(registrationResponse);
        if (response.data) {
          user.userId = encryptText(userId);
          await putData('user', user);
          showAlert('Registration successful!', 'success');
          localStorage.setItem('token', response.headers['x-auth-token']);
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 1500);
        } else localStorage.removeItem('token');
      } catch (err) {
        console.error(err.response ? err.response.data : err);
        setError('Something went wrong!');
      }
    } else {
      const { email } = form;
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      try {
        const loginRes = await login(email);
        const result = loginRes.data.authOptions;
        console.log('authOptions', result);
        const authResponse = await startAuthentication({ optionsJSON: result });
        console.log('authResponse', authResponse);
        if (authResponse.error) {
          showAlert(authResponse.error, 'error');
          setLoading(false);
          return;
        }

        const response = await verifyLogin(authResponse);
        if (response.data) {
          localStorage.setItem('token', response.headers['x-auth-token']);
          // Check if user data exists in IndexedDB, if not, restore it
          const userId = loginRes.data.userId;
          const userData = loginRes.data.user;
          const existingUser = await getDataById('user', 1);
          if (!existingUser && userData) {
            await putData('user', { ...userData, userId: encryptText(userId) });
          }
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 1500);
        } else localStorage.removeItem('token');
      } catch (err) {
        if (err.name === "NotAllowedError") {
          setShowFallback(true); // Show popup
        } else {
          console.error("Unexpected error:", err);
          showAlert("Unexpected error", 'error');
        }
      }
    }
    setLoading(false);
    setForm({ firstname: '', middlename: '', surname: '', email: '', password: '' });
    setConfirmPassword('');
  };

  // Handle OTP input typing
  const handleOTPChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input if digit is entered
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace to go back
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSendOtp = async () => {
    try {
      const { email } = form;
      const res = await sendOTP(email);
      showAlert(res.data.message, 'success');
      console.log(res.data);
      setShowOtpInput(true);
    } catch (err) {
      showAlert("Mail not sent Successfully.", 'error');
      setError("Email sending issues.");
      console.log(err);
    }
    

  };

  const handleVerifyOtp = async () => {
    try {
      const otpValue = otp.join("");
      console.log(`OTP: ${otpValue}`);
      const res = await verIfyOTP(otpValue);
      console.log(res);
      if (res.data.success) {
        showAlert(res.data.message, 'success');
        setShowFallback(false);
        setShowOtpInput(false);
        setOtp(Array(6).fill(""));
        const reReg = await reRegister(res.data.email);
        const result = reReg.data.options;
        console.log("Options", result);

        const registrationResponse = await startRegistration({optionsJSON: result});
        console.log("regRes", registrationResponse);
        if (registrationResponse.error) {
          setError(registrationResponse.error);
          setLoading(false);
          return;
        }

        const response = await verifySignup(registrationResponse);
        if (response.data) {
          localStorage.setItem('token', response.headers['x-auth-token']);
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 1500);
        } else localStorage.removeItem('token');
      } else {
        showAlert(res.data.message, 'error');
      }
    }catch(err){
      showAlert("Something is wrong.", 'error');
      setError("Something is wrong.")
      console.log(err);
    }
  };

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
              className="absolute inset-0 bg-white/70 flex items-center justify-center"
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
              className="absolute inset-0 bg-white/80 flex items-center justify-center"
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
                  className="h-12 w-12 text-green-600"
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
            {isLogin ? 'Welcome Back!' : 'Create an Account'}
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
          {!isLogin && (
            <>
              {['firstname', 'middlename', 'surname'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-indigo-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={field}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
                    placeholder={`Your ${field}`}
                    value={form[field]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
              placeholder="you@email.com"
              value={form.email}
              autoComplete="email"
              onChange={handleChange}
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Password</label>
              <PasswordInput
                name="password"
                placeholder='Password'
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold text-base sm:text-lg shadow-md hover:from-indigo-600 hover:to-sky-500 transition-all hover:cursor-pointer"
          >
            {isLogin ? 'Login With Passkey' : 'Sign Up'}
          </motion.button>
        </motion.form>

        {/* Switch Auth Mode */}
        <motion.div
          className="mt-4 sm:mt-6 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <button
            className="text-indigo-600 hover:underline font-medium cursor-pointer"
            onClick={() => setIsLogin((prev) => !prev)}
            type="button"
          >
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span className="text-green-600 hover:underline">Sign Up</span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="text-green-600 hover:underline">Login</span>
              </>
            )}
          </button>
        </motion.div>
      </motion.div>

      {/* AnimatePresence handles smooth mounting/unmounting */}
      <AnimatePresence>
        {showFallback && (
          <>
            {/* Background Blur */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Popup Card */}
            <motion.div
              className="fixed z-50 top-1/2 left-1/2 bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-11/12 max-w-xs sm:max-w-sm text-center transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <h2 className="text-lg font-semibold mb-2">Having issues logging in?</h2>
              <p className="text-sm text-gray-600 mb-4">
                {!showOtpInput ? "Don’t worry, we’ll get you up and running in no time. Maybe this wasn’t the device you registered with":`Enter the code sent to ${form.email}`}
                <span className='text-sm text-indigo-500'>{!showOtpInput ? "Enter your Email to proceed." : ""}</span>
              </p>

              {!showOtpInput && (
                <div> 
                  <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
                    placeholder="you@email.com"
                    value={form.email}
                    autoComplete="email"
                    onChange={handleChange}
                  />
                </div> 
              )}  

              {/* Multi-digit OTP Input */}
              {showOtpInput && (
                <>
                  <div className="flex justify-center gap-2 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOTPChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-8 h-10 sm:w-10 sm:h-12 border rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={!showOtpInput ? handleSendOtp : handleVerifyOtp}
                className="bg-green-500 mt-2 text-white px-4 py-2 rounded-lg w-full hover:cursor-pointer text-base sm:text-lg"
              >
                { showOtpInput ? "verify code" : "verify email"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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


export default AuthForm;