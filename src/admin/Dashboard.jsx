import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  Sparkles,
  UserCircle,
  LayoutDashboard,
  Upload,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const adminName =
    localStorage.getItem("adminName") ||
    localStorage.getItem("name") ||
    "Admin";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // ✅ Placeholder stats (baad me Firestore se dynamic bana dena)
  const stats = [
    { label: "Total Uploads", value: "—", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Notes", value: "—", icon: <BookOpen className="w-5 h-5" /> },
    { label: "PYQs", value: "—", icon: <FileText className="w-5 h-5" /> },
    { label: "Ebooks", value: "—", icon: <FileText className="w-5 h-5" /> },
  ];

  const quickActions = [
    { label: "Upload PYQ", to: "/admin/upload/pyq", icon: <Upload className="w-5 h-5" /> },
    { label: "Upload Notes", to: "/admin/upload/notes", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Upload Ebook", to: "/admin/upload/ebook", icon: <FileText className="w-5 h-5" /> },
    { label: "Manage Uploads", to: "/admin/manage", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <section className="w-full bg-white/90 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            {/* Decorative icons */}
            <Sparkles className="absolute top-4 right-4 sm:top-6 sm:right-6 text-indigo-200 w-10 h-10 animate-pulse pointer-events-none" />
            <LayoutDashboard className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-purple-200 w-14 h-14 opacity-70 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-400 drop-shadow-lg" />
              </div>

              <div className="flex-1">
                <p className="text-gray-500 text-sm sm:text-base">
                  {greeting} 👋
                </p>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {adminName}!
                  </span>
                </h1>

                <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2">
                  Manage StudyYatra content: uploads, categories, analytics, and more.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-lg font-bold text-gray-800">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition"
                  >
                    <div className="text-indigo-600">{a.icon}</div>
                    <span className="font-semibold text-gray-700">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Uploads Placeholder */}
            <div className="bg-white/90 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Recent Uploads</h2>

              {/* Later: Firestore se recent 5 items fetch karke map kar dena */}
              <div className="text-gray-600 text-sm">
                <p className="mb-2">No recent uploads shown yet.</p>
                <p className="text-gray-500">
                  Tip: Manage page se recent uploads list show kar sakte ho.
                </p>
              </div>

              <div className="mt-4">
                <Link
                  to="/admin/manage"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  <Settings className="w-4 h-4" />
                  Open Manage Uploads
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
