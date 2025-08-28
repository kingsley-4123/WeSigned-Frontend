import Loading from './Loading';
import AuthForm from './AuthForm';
import AttendanceSession from './AttendanceSession';
import AttendancePage from './Attendance';  
import HomePage from './HomePage';
import TimerPage from './LecturerTimerPage';
import WelcomePage from './WelcomePage';
import AboutPage from './AboutPage';
import StudentPage from './StudentPage';
import ContactPage from './ContactPage';
import AttendanceTablePage from './LecturerPage';
import AttendanceDetail from './AttendanceDetail';
import NotFound from './PageNotFound';
import DashboardLayout from './DashboardLayout';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000); // 5s loading
    return () => clearTimeout(timer);
  }, []);

  if(loading) return <Loading isLoading={loading} />;
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/dashboard" element={<DashboardLayout />} >
          <Route path="lecturer/attendance-session" element={<AttendanceSession />} />  
          <Route path="student/attendance/:id" element={<AttendanceDetail />} />
          <Route path="student/attendance" element={<AttendancePage />} />
          <Route path="lecturer/timer" element={<TimerPage />} />
          <Route path="lecturer" element={<AttendanceTablePage />} />
          <Route path="student" element={<StudentPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
