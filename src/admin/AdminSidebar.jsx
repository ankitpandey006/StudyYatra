// src/admin/AdminSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-3">
        <Link
          to="/admin"
          className="block px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Dashboard
        </Link>
        <Link
          to="/admin/upload/pyq"
          className="block px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Upload PYQ
        </Link>
        <Link
          to="/admin/upload/notes"
          className="block px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Upload Notes
        </Link>
        <Link
          to="/admin/upload/ebook"
          className="block px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Upload Ebook
        </Link>
        <Link
          to="/admin/manage"
          className="block px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Manage Uploads
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
