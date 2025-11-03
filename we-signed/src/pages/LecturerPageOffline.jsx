import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { putData, saveSession, getAllData } from "../utils/db.js";
import { nanoid } from "nanoid";
import getDurationInMs from "../utils/timeUtils.js";
import FlippingNumber from "../components/FlippingNumber";
import { decryptText } from "../utils/cryptoUtils.js";
import { motion } from "framer-motion";
import { useAlert } from "../components/AlertContext.jsx";
import { getRandomGradient } from "../utils/randomGradients.js";


export default function Lecturer() {
  const [attendanceName, setAttendanceName] = useState("");
  const [duration, setDuration] = useState(1);
  const [unit, setUnit] = useState("minutes");
  const [specialID, setSpecialID] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef();

  const savedUserEmail = JSON.parse(localStorage.getItem('offlineUserEmail'));
  const email = savedUserEmail || '';

  const {showAlert} = useAlert();

  async function startSession() {
    if (!attendanceName || !duration || !unit) {
      return alert("Enter attendance name, duration, and unit");
    }

    const randomGradient = getRandomGradient();
    const users = await getAllData('user');
    const user = users.find(u => u.email === email);
    if (!user) {
      return showAlert("User not found. Please login again.", "warning");
    }
    const { userId, surname, middlename, firstname } = user;
    const name = `${surname} ${middlename ? middlename + ' ' : ''}${firstname}`;
    console.log("encrypted lecturer ID:", userId);

    // Generate unique specialID
    const id = nanoid(10); // 10-digit unique ID
    setSpecialID(id);

    const now = Date.now();
    const durationMs = getDurationInMs(Number(duration), unit);
    const decryptedId = await decryptText(userId);
    const session = {
      id, // this is the specialID students will type in
      attendanceName: `attendanceName ${now}`,
      duration: Number(duration),
      unit,
      lecturerId: decryptedId,
      createdAt: now,
      expiresAt: now + durationMs,
      synced: false
    };
    console.log("Decrypted lecturer ID:", session.lecturerId);

    const newCard = {
      title: attendanceName,
      lecturer: name,
      date: new Date(now).toLocaleString(),
      gradient: randomGradient,
      specialId: id,
      status: "offline"
    };

    // Save session offline
    await saveSession('sessions', session);
    await putData('lecturerView', newCard);

    setExpiresAt(now + durationMs);
    setCountdown(Math.floor(durationMs / 1000));

    // Reset form
    setAttendanceName("");
    setDuration(1);
    setUnit("minutes");
  }

  // Countdown effect
  useEffect(() => {
    if (!expiresAt) return;
    function updateCountdown() {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setCountdown(secondsLeft);
      if (secondsLeft <= 0 && timerRef.current) clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(timerRef.current);
  }, [expiresAt]);

  // Format time hh:mm:ss
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
          Lecturer Panel
        </motion.h1>

        {!specialID && (
          <motion.form
            className="w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onSubmit={e => { e.preventDefault(); startSession(); }}
          >
            <input
              className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Attendance Name"
              value={attendanceName}
              onChange={(e) => setAttendanceName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                className="border p-2 w-1/2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Duration"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
              <select
                className="border p-2 w-1/2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="seconds">Seconds</option>
              </select>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-green-500 to-sky-400 text-white px-4 py-2 rounded-lg w-full font-semibold shadow-md mt-2 hover:cursor-pointer"
            >
              Start Session
            </motion.button>
          </motion.form>
        )}

        {specialID && (
          <motion.div
            className="mt-6 w-full flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="flex flex-col items-center w-full">
              <span className="text-gray-500 text-sm mb-2">Session ID</span>
              <span className="text-2xl font-bold text-blue-600 tracking-widest mb-4 break-all">{specialID}</span>
              <div className="flex justify-center w-full mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    attendanceName,
                    expirationTime: expiresAt,
                    specialId: specialID
                  })}
                  size={220}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#2563eb"
                  className="mx-auto rounded-lg shadow-md"
                />
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-gray-500 text-sm mb-1">Time Left</span>
                <div className="flex gap-1 justify-center">
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
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
