import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { getSubTimestamp } from '../utils/service';


export default function SubProgress() {
    const [progress, setProgress] = useState(0);
    const [animateBar, setAnimateBar] = useState(false);
    const [startDate, setStartDate] = useState(0);
    const [total, setTotal] = useState(0);

    // Set your subscription start and expiration dates here
    useEffect(() => {
        async function getTimestamps() {
            try {
                const response = await getSubTimestamp();
                if (response.data) {
                    const { expiration, start, message } = response.data;
                    alert(message);
                    const total = expiration - start;
                    setStartDate(start);
                    setTotal(total);
                }
            } catch (err) {
                alert("Error getting subscription timestamps");
                console.error("Error getting subscription timestamps", err);
            }
        }
        getTimestamps()
    }, []);

    // Calculate the actual progress
    const getActualProgress = () => {
        const now = Date.now();
        const elapsed = now - startDate;
        return Math.min((elapsed / total) * 100, 100);
    };

    // Animate drop-in, then fill bar
    useEffect(() => {
        // Wait for drop-in animation, then start bar fill
        const dropTimeout = setTimeout(() => {
            setAnimateBar(true);
        }, 600); // match drop-in duration
        return () => clearTimeout(dropTimeout);
    }, []);

    useEffect(() => {
        if (!animateBar) return;
        setProgress(0); // reset before animating
        function updateProgress() {
            setProgress(getActualProgress());
        }
        updateProgress();
        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [animateBar]);


    // Determine color based on progress
    let barColor = "bg-[#4caf50]"; // green
    if (progress >= 100) {
        barColor = "bg-red-600";
    } else if (progress >= 70) {
        barColor = "bg-orange-500";
    }

    return (
        <motion.div
            className="w-full max-w-xl mx-auto bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl shadow-lg p-2 my-5"
            initial={{ y: -140, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 7, delay: 0.3, duration: 1.1 }}
        >
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-gray-700 font-semibold text-lg">Subscription Progress</span>
                <span className="text-gray-600 text-base">{Math.round(progress).toFixed(1)}%</span>
            </div>
            <div className="relative w-full h-8 rounded-xl overflow-hidden bg-gray-300">
                <motion.div
                    className={`absolute left-0 top-0 h-full ${barColor} shadow-md flex items-center pl-4 text-white font-bold text-base`}
                    initial={{ width: 0 }}
                    animate={animateBar ? { width: `${progress}%` } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.15, type: "tween", ease: "easeInOut" }}
                    style={{ minWidth: progress > 5 ? undefined : 32, transitionProperty: 'width, background-color' }}
                >
                    {progress > 10 && progress < 100 && (
                        <span className="drop-shadow-lg">{progress >= 100 ? "Expired" : "Active"}</span>
                    )}
                    {progress >= 100 && (
                        <span className="drop-shadow-lg">Expired</span>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
