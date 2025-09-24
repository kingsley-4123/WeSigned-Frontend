import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Loading from "./Loading";
import AuthForm from "./AuthForm";
import AttendanceSession from "./AttendanceSession";
import AttendancePage from "./Attendance";
import HomePage from "./HomePage";
import TimerPage from "./LecturerTimerPage";
import WelcomePage from "./WelcomePage";
import AboutPage from "./AboutPage";
import StudentPage from "./StudentPage";
import ContactPage from "./ContactPage";
import AttendanceTablePage from "./lecturerViewPage";
import LecturerPage from "./LecturerPage";
import AttendanceDetail from "./AttendanceDetail";
import NotFound from "./PageNotFound";
import DashboardLayout from "./DashboardLayout";
import ComponentOffline from "./ComponentOffline";
import { triggerAttendanceSync, triggerSessionsSync } from "./registerSw";
import OfflinePage from "./OfflinePage"; // Create this page

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return <Loading isLoading={loading} />;
  }

  return (
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
            <Route path="/lecturer-offline" element={<LecturerPage />} />
            <Route path="/student-offline" element={<StudentPage />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
// Note: This App component handles routing and online/offline states. When offline, it restricts access to certain pages and shows an OfflinePage.