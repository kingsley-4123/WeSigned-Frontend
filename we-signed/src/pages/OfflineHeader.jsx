import { Outlet } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export default function OfflineHeader() {
  const [profileImg, setProfileImg] = useState(null);
  const fileInputRef = useRef();

  // Load image from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wesigned_profile_img");
    if (saved) setProfileImg(saved);
  }, []);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImg(ev.target.result);
      localStorage.setItem("wesigned_profile_img", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 flex flex-col">
      <header className="w-full flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 bg-white/80 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src="/images/logo.png"
            alt="WeSigned Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <span className="text-lg sm:text-2xl font-bold text-[#273c72] tracking-tight whitespace-nowrap">
            WeS<span className="text-[#94c04c]">igned</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="profile-upload" className="cursor-pointer group relative">
            <img
              src={profileImg}
              alt="Profile"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 object-cover group-hover:opacity-80 transition"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            />
            <input
              id="profile-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-white/80 px-1 rounded opacity-0 group-hover:opacity-100 transition">Change</span>
          </label>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}