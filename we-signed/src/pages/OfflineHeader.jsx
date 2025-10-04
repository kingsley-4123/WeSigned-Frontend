import { Outlet } from "react-router-dom";

export default function OfflineHeader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-100 to-indigo-200 flex flex-col">
      <header className="w-full flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 bg-white/80 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src="/images/logo.png"
            alt="WeSigned Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <span className="text-lg sm:text-2xl font-bold text-[#94c04c] tracking-tight whitespace-nowrap">
            WeSigned
          </span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 object-cover"
          />
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}