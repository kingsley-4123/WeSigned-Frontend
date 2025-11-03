import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { getSubTimestamp } from '../utils/service';
import { useAlert } from './AlertContext';


export default function SubProgress() {
    const [progress, setProgress] = useState(0);
    const [animateBar, setAnimateBar] = useState(false);
    const [startDate, setStartDate] = useState(0);
    const [total, setTotal] = useState(0);

    const { showAlert } = useAlert();

    // Set your subscription start and expiration dates here
    useEffect(() => {
        async function getTimestamps() {
            try {
                const response = await getSubTimestamp();
                if (response.data) {
                    const { expiration, start, message } = response.data
                    const total = expiration - start;
                    console.log("START", start, "EXPIRATION", expiration);
                    setStartDate(start);
                    setTotal(total);
                } else {
                    setStartDate(0);
                    setTotal(0);
                }
            } catch (err) {
                setStartDate(0);
                setTotal(0);
                if(err.response) showAlert(err.response.data.message, "warning");
                console.error(err.response ? err.response.data : err);
            }
        }
        getTimestamps();
    }, []);

    // Calculate the actual progress
    const getActualProgress = () => {
        if (!total || total <= 0) return 0;
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
    let barColor = "bg-blue-500";
    let label = "Active";
    if (!total || total <= 0) {
        barColor = "bg-gray-400";
        label = "Subscribe";
    } else if (progress >= 100) {
        barColor = "bg-red-600";
        label = "Expired";
    } else if (progress >= 70) {
        barColor = "bg-orange-500";
        label = "Active";
    }

    // Optional: bounce in with keyframes using tween
    return (
        <motion.div
            className="w-full max-w-xl mx-auto bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl shadow-lg p-2 mb-20 sm:-mb-32"
            initial={{ y: -140, opacity: 0 }}
            animate={{ y: [ -140, 0, -20, 0 ] , opacity: 1 }}
            transition={{
                y: { type: "tween", duration: 1.1, ease: "easeOut" },
                opacity: { duration: 0.7, delay: 0.1 }
            }}
        >
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-gray-700 font-semibold text-lg">Subscription Progress</span>
                <span className="text-gray-600 text-base">{!total || total <= 0 ? '--' : Math.round(progress).toFixed(1) + '%'}</span>
            </div>
            <div className="relative w-full h-8 rounded-xl overflow-hidden bg-gray-300">
                <motion.div
                    className={`absolute left-0 top-0 h-full ${barColor} shadow-md flex items-center pl-4 text-white font-bold text-base`}
                    initial={{ width: 0 }}
                    animate={animateBar ? { width: `${progress}%` } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.15, type: "tween", ease: "easeInOut" }}
                    style={{ minWidth: progress > 5 ? undefined : 32, transitionProperty: 'width, background-color' }}
                >
                    <span className="drop-shadow-lg">{label}</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
