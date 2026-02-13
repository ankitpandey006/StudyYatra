import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Upload, BookOpen, FileText, Settings, Menu, X } from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Upload PYQ", path: "/admin/upload/pyq", icon: <Upload className="w-5 h-5" /> },
    { name: "Upload Notes", path: "/admin/upload/notes", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Upload Ebook", path: "/admin/upload/ebook", icon: <FileText className="w-5 h-5" /> },
    { name: "Manage Uploads", path: "/admin/manage", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      <div className="md:hidden flex justify-between items-center bg-gray-900 text-gray-100 p-4 shadow-lg">
        <h2 className="text-xl font-bold text-indigo-400">Admin Panel</h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-gray-100 p-6 flex flex-col shadow-lg
        transform md:translate-x-0 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
      >
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-indigo-400">Admin Panel</h2>
          <p className="text-sm text-gray-400">Manage your platform</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                  ${isActive ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-800 hover:text-indigo-400"}`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-700 hidden md:block">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Admin Dashboard</p>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
