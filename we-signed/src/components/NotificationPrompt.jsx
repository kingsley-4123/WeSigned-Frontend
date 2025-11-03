import { useState, useEffect } from "react";

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      setShowPrompt(true);
    }
  }, []);

  const handleAllow = () => {
    Notification.requestPermission().then((perm) => {
      setPermission(perm);
      setShowPrompt(false);
    });
  };

  const handleDeny = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || permission !== "default") return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-md bg-white border border-gray-200 shadow-2xl rounded-xl px-4 sm:px-6 py-3 sm:py-4 z-50 flex flex-col items-center animate-slideDown">
      <div className="mb-2 text-indigo-700 font-semibold text-center text-sm sm:text-base">
        Enable notifications to get important updates, like when your attendance or session is synced!, or when your re-registered account is been activated!.
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 w-full justify-center">
        <button
          onClick={handleAllow}
          className="bg-[#94c04c] hover:bg-[#669b11] text-white px-4 py-2 rounded hover:cursor-pointer font-medium w-full sm:w-auto"
        >
          Allow Notifications
        </button>
        <button
          onClick={handleDeny}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 hover:cursor-pointer font-medium w-full sm:w-auto"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
