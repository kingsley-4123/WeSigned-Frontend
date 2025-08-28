import React, { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import getOrCreateDeviceId from './util.js';
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

  const navigate = useNavigate();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Still dont how this works
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!isLogin) {
      const { firstname, middlename, surname, email, password } = form;
      if (!firstname || !middlename || !surname || !email || !password) {
        setError('All fields are required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      let user = { firstname, middlename, surname, email, password };

      try {
        const deviceId = await getOrCreateDeviceId();
        const {data: options} = await signup(user, deviceId);
        console.log('Options:', options);
        const registrationResponse = await startRegistration({optionsJSON: options});
        console.log('Registration Response:', registrationResponse);
        if (registrationResponse.error) {
          setError(registrationResponse.error);
          return;
        }
        const response = await verifySignup(registrationResponse);
        console.log('Signup Response:', response);
        if (response.data) {
          localStorage.setItem('token', response.headers['x-auth-token']);
          navigate('/dashboard');
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error(error.response ? error.response.data : console.error(error));
      }

    } else {
      const { email, password } = form;
      if (!email || !password) {
        setError('Email and Password are required');
        return;
      }
      user = { email, password };
      try {
        const {data: options} = await login(email, password);
        console.log('Login Response:', options);
        const authResponse = await startAuthentication({ optionsJSON: options });
        console.log('Authentication Response:', authResponse);
        if (authResponse.error) { 
          setError(authResponse.error);
          return;
        }
        const response = await verifyLogin(authResponse);
        console.log('Verification Response:', response);
        // Store the token if login is successful
        console.log('Response Data:', response.data);

        if (response.data) {
          localStorage.setItem('token', response.headers['x-auth-token']);
          navigate('/dashboard');
        } else {
          localStorage.removeItem('token');
        }
      }catch (error) {
          console.error(error.response ? error.response.data : console.error(error));
        setError(error.response ? error.response.data : 'An error occurred during login');
      }
    }
    // Reset form fields after submission
    setForm({
      firstname: '',
      middlename: '',
      surname: '',
      email: '',
      password: ''
    });
    setConfirmPassword('');

    // If all validations pass
    setError(''); // Clear any previous errors
  };

  if (error) {
    alert(error);
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="#4F46E5" strokeWidth="6" fill="#EEF2FF" />
            <text x="40" y="58" fill="#4F46E5" fontSize="22" fontWeight="bold" fontFamily="'Segoe UI', Arial, sans-serif"></text>
            <text x="72" y="58" fill="#4F46E5" fontSize="22" fontWeight="bold" fontFamily="'Segoe UI', Arial, sans-serif"></text>
            <text x="60" y="88" textAnchor="middle" fill="#6366F1" fontSize="20" fontWeight="600" fontFamily="'Segoe UI', Arial, sans-serif">WE SIGN</text>
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-indigo-500 tracking-wide">
            {isLogin ? 'Welcome Back!' : 'Create an Account'}
          </h2>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">First name</label>
              <input
                type="text"
                name='firstname'
                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
                placeholder="Your Name"
                value={form.firstname}
                onChange={handleChange}
              />
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Middle name</label>
              <input
                type="text"
                name="middlename"
                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
                placeholder="Your Middle Name"
                value={form.middlename}
                onChange={handleChange}
              />
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Surname</label>
              <input
                type="text"
                name="surname"
                className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
                placeholder="Your Surname"
                value={form.surname}
                onChange={handleChange}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
            <input
              type="email"
              name='email'
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
              placeholder="you@email.com"
              value={form.email}
              autoComplete='email'
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">Password</label>
            <input
              type="password"
              name='password'
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900"
              placeholder="Password"
              value={form.password}
              autoComplete='current-password'
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
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold text-lg shadow-md hover:from-indigo-600 hover:to-sky-500 transition-all"
            onClick={handleSubmit}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            className="text-indigo-600 hover:underline font-medium"
            onClick={() => setIsLogin((prev) => !prev)}
            type="button"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
  
}

export default AuthForm;
