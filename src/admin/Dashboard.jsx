import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Sparkles, UserCircle, LayoutDashboard } from "lucide-react";

const Dashboard = () => {
  const adminName = localStorage.getItem("adminName") || "Admin";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 flex flex-col items-center relative overflow-hidden">
          {/* Decorative Sparkles */}
          <Sparkles className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-6 md:right-8 text-indigo-200 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-pulse pointer-events-none" />
          <LayoutDashboard className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-6 md:left-8 text-purple-200 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 opacity-70 pointer-events-none" />

          {/* Avatar */}
          <div className="mb-4 sm:mb-6">
            <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-indigo-400 drop-shadow-lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-indigo-700 mb-2 text-center drop-shadow">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {adminName}!
            </span>
          </h1>

          <p className="text-gray-600 text-sm sm:text-base md:text-xl text-center mb-4 sm:mb-6">
            This is your{" "}
            <span className="font-semibold text-indigo-500">Admin Dashboard</span>.
            <br />
            Use the sidebar to manage resources, view analytics, and more.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
