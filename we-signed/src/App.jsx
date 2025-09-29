import { useState, useEffect } from "react";
import { detectIncognito } from 'detect-incognito';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Loading from "./pages/Loading";
import AuthForm from "./pages/AuthForm";
import AttendanceSession from "./pages/AttendanceSession";
import AttendancePage from "./pages/Attendance";
import HomePage from "./pages/HomePage";
import TimerPage from "./pages/LecturerTimerPage";
import WelcomePage from "./pages/WelcomePage";
import AboutPage from "./pages/AboutPage";
import StudentPage from "./pages/StudentPage";
import ContactPage from "./pages/ContactPage";
import AttendanceTablePage from "./pages/lecturerViewPage";
import LecturerPage from "./pages/LecturerPage";
import AttendanceDetail from "./pages/AttendanceDetail";
import NotFound from "./pages/PageNotFound";
import DashboardLayout from "./pages/DashboardLayout";
import ComponentOffline from "./pages/ComponentOffline";
import StudentPageOffline from "./pages/StudentPageOffline";
import LecturerPageOffline from "./pages/LecturerPageOffline";
import { triggerAttendanceSync, triggerSessionsSync } from "./registerSw";
import OfflinePage from "./pages/OfflinePage"; 
import NotificationPrompt from './components/NotificationPrompt';
import ExcelComparePage from './pages/ExcelComparePage';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIncognito, setIsIncognito] = useState(false);

  useEffect(() => {
    // Simulate loading for 3s
    const timer = setTimeout(() => setLoading(false), 3000);

    // Listen for online/offline changes
    function handleOnline() {
      setIsOnline(true);
      // Trigger syncs when back online
      triggerAttendanceSync();
      triggerSessionsSync();
    }

    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Detect incognito mode
    detectIncognito().then(result => {
      setIsIncognito(result.isPrivate);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return <Loading isLoading={loading} />;
  }

  // Show incognito warning banner and block navigation if incognito
  if (isIncognito) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100">
        <div className="w-full bg-yellow-200 text-yellow-900 text-center py-2 px-4 font-semibold z-50">
          Warning: You are using Incognito/Private mode. Data will not persist after you close this window.<br />
          Please exit private/incognito mode to use this application.
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationPrompt />
      <Router>
        <Routes>
        {isOnline ? (
          <>
            {/* Normal flow when online */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="lecturer/attendance-session" element={<AttendanceSession />} />  
              <Route path="student/attendance/:id" element={<AttendanceDetail />} />
              <Route path="student/attendance" element={<AttendancePage />} />
              <Route path="lecturer/timer" element={<TimerPage />} />
              <Route path="lecturer-page" element={<LecturerPage />} />
              <Route path="lecturer" element={<AttendanceTablePage />} />
              <Route path="compare-page" element={<ExcelComparePage />} />
              <Route path="student" element={<StudentPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
              <Route index element={<HomePage />} />
            </Route>
          </>
        ) : (
          <>
            {/* Offline flow and I need to design thesse pages.*/}
            <Route path="/" element={<OfflinePage />} />
            <Route path="/component-offline" element={<ComponentOffline />} />
            <Route path="/lecturer-offline" element={<LecturerPageOffline />} />
            <Route path="/student-offline" element={<StudentPageOffline />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
        </Routes>
      </Router>
    </>
  );
}
// Note: This App component handles routing and online/offline states. When offline, it restricts access to certain pages and shows an OfflinePage.