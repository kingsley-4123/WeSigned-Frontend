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
        className="w-20 h-20 rounded-full mb-4"
        />
    );
}

function Card({ title, description, role, gender, onClick }) {

    return (
        <div
        onClick={onClick}
        className="flex flex-col items-center text-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer bg-white"
        >
        <Avatar role={role} gender={gender} />
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-500 text-sm mt-2">{description}</p>
        </div>
    );
}

function ComponentOnline({ gender }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-20 bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card
          title="STUDENT"
          description="Access attendance and course materials."
          role="student"
          gender={gender}
          onClick={() => navigate("/student/attendance")}
        />
        <Card
          title="LECTURER"
          description="Manage classes and student records."
          role="lecturer"
          gender={gender}
          onClick={() => navigate("/lecturer/attendance-session")}
        />
      </div>
    </div>
  );
}

export default ComponentOnline;