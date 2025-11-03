import { useState, useEffect, useRef } from "react";
import { saveSignIn, putData, getAllData } from "../utils/db.js";
import { Html5Qrcode } from 'html5-qrcode';
import FlippingNumber from "../components/FlippingNumber";
import {decryptText} from "../utils/cryptoUtils.js";
import { motion } from "framer-motion";
import { useAlert } from "../components/AlertContext.jsx";  
import {getRandomGradient} from "../utils/randomGradients.js"


export default function Student() {
  const [sessionId, setSessionId] = useState("");
  const [regNo, setRegNo] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [expired, setExpired] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [durationUnit, setDurationUnit] = useState("minutes");
  const timerRef = useRef();

  const savedUserEmail = JSON.parse(localStorage.getItem('offlineUserEmail'));
  const email = savedUserEmail || '';

  async function signAttendance() {
    const users = await getAllData('user');
    const user = users.find(u => u.email === email);
    if (!user) {
      return showAlert("User not found. Please login again.", "warning");
    }
    const { userId, surname, middlename, firstname } = user;
    const name = `${surname} ${middlename ? middlename + ' ' : ''}${firstname}`;
    console.log("encrypted student ID:", userId); 
    const decryptedId = await decryptText(userId);

    const signin = {
      sessionId, 
      regNo,
      sessionName: scannedData.attendanceName,
      fullName: name,
      studentId: decryptedId,
      signedAt: Date.now(),
      timestamp: new Date().toISOString(),
      synced: false
    };
    console.log("Decrypted student ID:", signin.studentId);

    const randomGradient = getRandomGradient();
    const newCard = {
      title: scannedData.attendanceName,
      lecturer: null,
      date: signin.timestamp,
      gradient: randomGradient,
      status: "offline"
    };

    await saveSignIn(signin);
    await putData("studentAttendances", newCard)
    setRegNo("");
    setSessionId("");
    alert("Signed offline. Will sync when online.");
  }

  // QR scan result handler for html5-qrcode
  const html5QrCodeRef = useRef(null);
  const qrRegionId = "qr-reader-region";

  useEffect(() => {
    if (showQR) {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      }
      html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const parsedData = JSON.parse(decodedText);
            setScannedData(parsedData);
            setSessionId(parsedData.specialId);
            setDurationUnit(parsedData.unit || "minutes");
            setShowQR(false);
            html5QrCodeRef.current && html5QrCodeRef.current.stop();
          } catch (e) {
            alert("Invalid QR code data");
          }
        },
        (errorMessage) => {
          // Optionally handle scan errors
        }
      );
    } else if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQR]);

  // Expiration and timer logic
  useEffect(() => {
    if (scannedData && scannedData.expirationTime) {
      if (Date.now() > scannedData.expirationTime) {
        setExpired(true);
        setCountdown(0);
      } else {
        setExpired(false);
        const secs = Math.floor((scannedData.expirationTime - Date.now()) / 1000);
        setCountdown(secs);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          const left = Math.max(0, Math.floor((scannedData.expirationTime - Date.now()) / 1000));
          setCountdown(left);
          if (left <= 0) {
            setExpired(true);
            clearInterval(timerRef.current);
          }
        }, 1000);
      }
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [scannedData]);

  // Format time mm:ss
  function formatTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 px-2 py-8">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col items-center text-center">
        <motion.h1
          className="text-xl sm:text-2xl font-bold mb-4 text-indigo-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Student Panel
        </motion.h1>

        {/* QR Scanner Button */}
        {!scannedData && !showQR && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-semibold py-2 rounded-lg shadow-md mb-4"
            onClick={() => setShowQR(true)}
          >
            Sign Attendance (Scan QR)
          </motion.button>
        )}

        {/* QR Scanner */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full mb-4"
          >
            <div id={qrRegionId} className="w-full max-w-xs mx-auto" style={{ minHeight: 250 }} />
            <p className="mt-2 text-gray-500 text-sm">Scan the session QR code to sign attendance.</p>
          </motion.div>
        )}

        {/* QR Expired Message */}
        {scannedData && expired && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-red-500 font-semibold mb-4"
          >
            QR Code expired. Attendance session is closed.
          </motion.div>
        )}

        {/* Attendance Form and Timer if QR valid */}
        {scannedData && !expired && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            {/* Attendance Name Display */}
            <div className="mb-4 w-full flex flex-col items-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1 tracking-wide">
                {scannedData.attendanceName}
              </span>
              <span className="block text-blue-600 font-bold tracking-widest text-lg">{scannedData.specialId}</span>
            </div>
            <div className="flex gap-1 justify-center mb-4">
              {formatTime(countdown || 0).split("").map((digit, idx) =>
                digit === ":" ? (
                  <span key={idx} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-500 px-1">:</span>
                ) : (
                  <div
                    key={idx}
                    className="w-7 sm:w-10 md:w-12 flex justify-center"
                  >
                    <FlippingNumber number={digit} />
                  </div>
                )
              )}
            </div>
            <form className="space-y-4 w-full" onSubmit={e => { e.preventDefault(); signAttendance(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Reg No</label>
                <input
                  type="text"
                  name="regNo"
                  required
                  value={regNo}
                  onChange={e => setRegNo(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none hover:border-blue-300 transition duration-200"
                  disabled={expired}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 hover:from-indigo-500 hover:to-sky-400 text-white text-lg py-3 rounded-lg font-semibold shadow-md active:scale-95 transition duration-200 cursor-pointer"
                disabled={expired}
              >
                Sign Attendance
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Note: This page allows students to sign attendance offline. Sign-ins are stored in IndexedDB and will sync when online.  