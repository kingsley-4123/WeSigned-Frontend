import React from "react";
import { useNavigate } from "react-router-dom";

function Avatar({ role, gender }) {
  // choose avatar style based on role
  const style = role === "student" ? "adventurer" : "avataaars";
  const seed = `${gender}-${role}-${Math.floor(Math.random() * 1000)}`;
  const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <img
      src={avatarUrl}
      alt={`${role} avatar`}
      className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full mb-4"
    />
  );
}

function Card({ title, description, role, gender, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center text-center p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer bg-white w-full h-full min-h-[260px]"
    >
      <Avatar role={role} gender={gender} />
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{title}</h2>
      <p className="text-gray-500 text-sm sm:text-base mt-2">{description}</p>
    </div>
  );
}

function ComponentOnline({ gender }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-20 xl:px-32 bg-gray-100 min-h-screen flex items-center justify-center -mt-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <Card
          title="STUDENT"
          description="Access attendance and course materials."
          role="student"
          gender={gender}
          onClick={() => navigate("student/attendance")}
        />
        <Card
          title="LECTURER"
          description="Manage classes and student records."
          role="lecturer"
          gender={gender}
          onClick={() => navigate("lecturer/attendance-session")}
        />
      </div>
    </div>
  );
}

export default ComponentOnline;