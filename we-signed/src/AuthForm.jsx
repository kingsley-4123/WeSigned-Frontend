import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { signup, verifySignup, login, verifyLogin } from './service.js';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      if (!isLogin) {
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
        const { data: options } = await signup(user);
        const registrationResponse = await startRegistration({ optionsJSON: options });

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
        const { email, password } = form;
        if (!email || !password) {
          setError('Email and Password are required');
          setLoading(false);
          return;
        }

        const { data: options } = await login(email, password);
        const authResponse = await startAuthentication({ optionsJSON: options });

        if (authResponse.error) {
          setError(authResponse.error);
          setLoading(false);
          return;
        }

        const response = await verifyLogin(authResponse);
        if (response.data) {
          localStorage.setItem('token', response.headers['x-auth-token']);
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 1500);
        } else localStorage.removeItem('token');
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      setError('Something went wrong!');
    }

    setLoading(false);
    setForm({ firstname: '', middlename: '', surname: '', email: '', password: '' });
    setConfirmPassword('');
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200">
      <motion.div
        className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
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
          className="flex flex-col items-center mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <img
            src="/images/logo.png"
            alt="WeSigned log"
          className='w-28 h-28 md:w-34 md:h-34 pt-3 -mt-13'/>
          <h2 className="mt-4 text-2xl font-bold text-indigo-500 tracking-wide">
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
          className="space-y-5"
          onSubmit={handleSubmit}
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
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
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
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
              placeholder="you@email.com"
              value={form.email}
              autoComplete="email"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
              placeholder="Password"
              value={form.password}
              autoComplete="current-password"
              onChange={handleChange}
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold text-lg shadow-md hover:from-indigo-600 hover:to-sky-500 transition-all"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </motion.button>
        </motion.form>

        {/* Switch Auth Mode */}
        <motion.div
          className="mt-6 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <button
            className="text-indigo-600 hover:underline font-medium"
            onClick={() => setIsLogin((prev) => !prev)}
            type="button"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </motion.div>
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


export default AuthForm;
