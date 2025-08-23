// src/admin/Dashboard.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";

const Dashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the admin panel! Choose an action from the sidebar.</p>
      </div>
    </div>
  );
};

export default Dashboard;
