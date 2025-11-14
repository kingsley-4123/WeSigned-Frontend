import React, { useState, useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { putData, getAllData, deleteData, isStoreEmpty } from '../utils/db.js';
import { signup, login, sendOTP, verIfyOTP, updatePassword} from '../utils/service.js';
import { useNavigate } from 'react-router-dom';
import { encryptText, decryptText } from '../utils/cryptoUtils.js';
import PasswordInput from '../components/PasswordComponent.jsx';
import { useAlert } from '../components/AlertContext.jsx';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    firstname: '',
    middlename: '',
    surname: '',
    email: '',
    password: '',
    school: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill("")); // 6-digit OTP
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
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
        const { firstname, middlename, surname, email, password, school } = form;
        console.log("Form Data:", form);
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

        const isEmpty = await isStoreEmpty('user');
        if (!isEmpty) {
          showAlert('An account already exists on this device. Please login instead.', 'error');
          setLoading(false);
          return;
        }
        const payload = { firstname, middlename, surname, email, password, school };
        const signupRes = await signup(payload);

        if (signupRes.data.ok) {
          const userId = signupRes.data.userID;
          const token = signupRes.data.token;
          const encryptedUserId = await encryptText(userId); 
          const encryptedPassword = await encryptText(password);
          payload.password = encryptedPassword;
          payload.userId = encryptedUserId;
          const user = payload;
          console.log("Payload", payload);
          console.log("User", user);
          await putData('user', user);
          localStorage.setItem('token', token);
          setSuccess(true);
          showAlert('Registration successful!', 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          localStorage.removeItem('token');
          setError('Registration failed!');
        }

      } catch (err) {
        console.error("ERROR", err.response ? err.response.data : err);
        if (err.response) showAlert(err.response.data.message, 'warning');
      }
    } else {
      const { email, password } = form;
      if (!email || !password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      try {
        const payload = { email, password };
        const loginRes = await login(payload);
        console.log('LOGINRES', loginRes);

        if (loginRes.data.ok) {
          const userId = loginRes.data.userId;
          const userData = loginRes.data.user;
          const token = loginRes.data.token;
          const isEmpty = await isStoreEmpty('user');
          
          if (isEmpty && userData) {
            showAlert("Can't find your registration data on this device. Please kindly re-register.", "error");
            setLoading(false);
          } else if (!isEmpty) {
            const existingUsers = await getAllData('user');
            const existingUser = existingUsers.find((u) => u.email === email);
            if (!existingUser) {
              showAlert("This is not the registered device.", "warning");
              setLoading(false);
              return;
            }
            const decryptedId = await decryptText(existingUser.userId);
            if (decryptedId !== userId) {
              showAlert("This is not the registered device.", 'warning');
              setLoading(false);
              return;
            }
            localStorage.setItem('token', token);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
          } else {
            localStorage.setItem('token', token);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
          }
          
        } else {
          showAlert(loginRes.data.message, 'error');
          setLoading(false);
        }
      } catch (err) {
        console.error('LOGIN_ERROR', err.response ? err.response.data : err);
        if (err.response) {
          showAlert(err.response.data.message, 'warning');
          setLoading(false);
          setForm((prev) => ({ ...prev, password: '', email: '' }));
          return;
        }
      }
    }
    setLoading(false);
    setForm({ firstname: '', middlename: '', surname: '', email: '', password: '', school: '' });
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
    setLoading(true);
    try {
      const { email } = form;
      const existingUsers = await getAllData('user');
      const existingUser = await existingUsers.find((u) => u.email === email);
      if(!existingUser){
        showAlert('Email not registered.', 'error');
        setLoading(false);
        return;
      }
      const res = await sendOTP(email);
      if(!res.data.ok) {
        showAlert(res.data.message, 'error');
        setError("Email sending issues.");
        setLoading(false);
        return;
      }
      showAlert('OTP sent successfully.', 'success');
      console.log('SEND_OTP_RESPONSE', res.data.message);
      setShowOtpInput(true);
    } catch (err) {
      if(err.response) showAlert(err.response.data.message, 'warning'); 
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const otpValue = otp.join("");
      console.log(`OTP: ${otpValue}`);
      const res = await verIfyOTP(otpValue);
      console.log(res);
      if (res.data.success) {
        showAlert(res.data.message, 'success')
        setShowOtpInput(false);
        setOtp(Array(6).fill(""));
        setShowNewPasswordInput(true);
      } else {
        showAlert(res.data.message, 'error');
        setLoading(false);
      }
    } catch (err) {
      if (err.response) {
        showAlert(err.response.data.message, 'error');
        setLoading(false); 
      }
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    try {
      if (newPassword !== confirmNewPassword) {
        showAlert("Passwords do not match.", 'error');
        setLoading(false);
        return;
      }
      const res = await updatePassword(form.email, newPassword);
      if (res.data.ok) {
        const existingUsers = await getAllData('user');
        const existingUser = existingUsers.find((u) => u.email === form.email);
        if (!existingUser) {
          showAlert("User not found.", 'error');
          setLoading(false);
          return;
        }
        const encryptedPassword = await encryptText(newPassword);
        existingUser.password = encryptedPassword;
        await putData("user", existingUser);
        showAlert(res.data.message, 'success');
      } else {
        showAlert(res.data.message, 'error');
        setLoading(false);
        return;
      }
    } catch (err) {
      if (err.response) {
        showAlert(err.response.data.message, 'error');
        setLoading(falsr);
        return;
      }
    }
    setShowNewPasswordInput(false);
    setShowFallback(false);
    setForm((prev) => ({ ...prev, email: ''}));
    setNewPassword('');
    setConfirmNewPassword('');
    setLoading(false);
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
                  <label className="block text-md font-medium text-indigo-700 mb-1">
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
            <label className="block text-md font-medium text-indigo-700 mb-1">Email</label>
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
          {isLogin && (
            <div>
              <label className="block text-md font-medium text-indigo-700 mb-1">Password</label>
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
              <label className="block text-md font-medium text-indigo-700 mb-1">School <span className='text-gray-400'> (optional) </span></label>
              <input
                type="text"
                name='school'
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
                placeholder="Your School Name."
                value={form.school}
                onChange={handleChange}
              />
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-md font-medium text-indigo-700 mb-1">Password</label>
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
              <label className="block text-md font-medium text-indigo-700 mb-1">Confirm Password</label>
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
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="hover:scale-105 active:scale-95 w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold text-base sm:text-lg shadow-md hover:from-indigo-600 hover:to-sky-500 transition-all hover:cursor-pointer"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
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
                <span className="text-[#94c04c] hover:underline">Sign Up</span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="text-[#94c04c] hover:underline">Login</span>
              </>
            )}
          </button>
            
          {isLogin && (
            <>
              <hr className='mt-4 text-gray-500 text-[20px] font-bold' />
              <div className='flex justify-between'>
                <button
                  className="block mt-4 text-[#669b11] hover:underline font-medium cursor-pointer"
                  onClick={() => setShowFallback(true)}
                >
                  Forgot Password?
                </button>
                <button
                  className="block mt-4 text-[#669b11] hover:underline font-medium cursor-pointer"
                  onClick={() => navigate('/reregistration')}
                >
                  Re-register
                </button>
              </div>
            </>
          )}
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
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-50">
                  <Spinner />
                </div>
              )}

              <h2 className="text-lg font-semibold mb-2">Having issues logging in?</h2>
              {!showNewPasswordInput && !showOtpInput && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {!showOtpInput ? "Don’t worry, we’ll help you regain access shortly.":`Enter the code sent to ${form.email}`}
                    <span className='text-sm text-indigo-500'>{!showOtpInput ? " Enter your Email to proceed." : ""}</span>
                  </p>
                  <div className='mb-4 text-left'> 
                    <label className="block text-md font-medium text-indigo-700 mb-1">Email</label>
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
                </>
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
              {!showNewPasswordInput && (
                <button
                  onClick={!showOtpInput ? handleSendOtp : handleVerifyOtp}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#273c72] to-[#94c04c] hover:from-[#23376b] hover:to-[#669b11] hover:scale-3d transition-all mt-2 font-semibold text-white px-4 py-2 rounded-lg w-full hover:cursor-pointer text-base sm:text-lg"
                >
                  { showOtpInput ? "verify code" : "verify email"}
                </button>
              )}

              {showNewPasswordInput && (
                <>
                  <div className='mb-4 text-left'>
                    <label className="block text-md font-medium text-indigo-700 mb-1">New Password</label>
                    <PasswordInput
                      name="newPassword"
                      placeholder='Password'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mb-4 text-left">
                    <label className="block text-md font-medium text-indigo-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      className="w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {showNewPasswordInput && (
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#273c72] to-[#94c04c] hover:from-[#23376b] hover:to-[#669b11] hover:scale-3d transition-all mt-2 text-white px-4 py-2 rounded-lg w-full hover:cursor-pointer text-base sm:text-lg"
                >
                  Update Password
                </button>
              )}  
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