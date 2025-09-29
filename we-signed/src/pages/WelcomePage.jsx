import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FeatureSection from "../components/FeatureSection";
import { useRef } from "react";

export default function WelcomePage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Create Attendance in Seconds",
      text: "Lecturers can easily create a new attendance session by entering the subject, time duration, and attendance range. A unique code is instantly generated and ready to be shared with students.",
      image: "/images/create-session.png",
      reverse: false,
    },
    {
      title: "Sign Attendance with Ease",
      text: "Students simply enter the unique attendance code, confirm their details, and sign in securely with their device. No more signing for absent friends — everyone signs in only once with their own device.",
      image: "/images/student-sign.png",
      reverse: true,
    },
    {
      title: "Works Online & Offline",
      text: "Whether in a large hall with internet access or in areas with poor connectivity, WeSigned works perfectly. Lecturers can run sessions online or offline — students just connect to the lecturer’s hotspot to sign in.",
      image: "/images/offline-mode.png",
      reverse: false,
    },
    {
      title: "Get Your Attendance Reports",
      text: "At the end of each session, lecturers can export attendance in Excel or PDF formats. You can also combine multiple sessions to see how many times each student attended your classes.",
      image: "/images/export-reports.png",
      reverse: true,
    },
    {
      title: "Your Attendance, Organized",
      text: "Students can always check their signed attendances. Lecturers can view and manage all past attendance sessions from their dashboard.",
      image: "/images/dashboard.png",
      reverse: false,
    },
  ];

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hero button inView tracking
  const heroBtnRef = useRef(null);
  const heroBtnInView = useInView(heroBtnRef, { amount: 0.5 });

  const ctaBtnRef = useRef(null);
  const ctaBtnInView = useInView(ctaBtnRef, { amount: 0.5 });

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen px-6">
        <motion.img
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          src="/images/welcomeLogo.png"
          alt="WeSigned Logo"
          className="w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 max-w-full object-contain -mb-15 -mt-12 drop-shadow-lg"
        />
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold text-blue-700 mb-4 -mt-8"
        >
          WeSigned — Smart, Secure, Simple Attendance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8"
        >
          Taking away the stress of paper-based attendance and making it effortless for both lecturers and students.
        </motion.p>

        {/* Button with fade in/out */}
        <motion.div
          ref={heroBtnRef}
          initial={{ opacity: 0, y: 20 }}
          animate={heroBtnInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <button
            size="lg"
            className="bg-[#9ec551] hover:bg-blue-700 hover:cursor-pointer text-white rounded-2xl px-8 py-6"
            onClick={scrollToFeatures}
          >
            Explore Features
          </button>
        </motion.div>
      </section>

      {/* Feature Sections */}
      <div id="features">
        {sections.map((sec, idx) => (
          <FeatureSection key={idx} sec={sec} reverse={sec.reverse} />
        ))}
      </div>

      {/* Final CTA */}
      <section className="flex flex-col items-center justify-center text-center py-32 bg-blue-50">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-blue-700 mb-6"
        >
          Ready to make attendance stress-free?
        </motion.h2>
        <motion.div
          ref={ctaBtnRef}
          initial={{ opacity: 0, y: 20 }}
          animate={ctaBtnInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}>
          <button
            className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-medium rounded-2xl px-8 py-4 text-lg transition-transform transform hover:scale-105"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </button>
        </motion.div>
      </section>
    </div>
  );
}

