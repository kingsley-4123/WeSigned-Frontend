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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg px-6 py-4 z-50 flex flex-col items-center">
      <div className="mb-2 text-indigo-700 font-semibold text-center">
        Enable notifications to get important updates, like when your attendance or session is synced!
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleAllow}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
        >
          Allow Notifications
        </button>
        <button
          onClick={handleDeny}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
