import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { getAuth } from "firebase/auth";
import {
  Sparkles,
  UserCircle,
  LayoutDashboard,
  Upload,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
  ClipboardList,
  ExternalLink,
} from "lucide-react";

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

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

  const [statsData, setStatsData] = useState({
    totalUploads: "—",
    notes: "—",
    pyqs: "—",
    ebooks: "—",
    quizzes: "—",
  });

  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Please login as admin first.");
    return await user.getIdToken();
  };

  // helper: normalize stats response
  const normalizeStats = (data) => {
    const s = data?.stats ?? data ?? {}; // support {stats:{...}} OR direct object
    return {
      totalUploads: Number(s.totalUploads ?? s.total ?? 0),
      notes: Number(s.notes ?? 0),
      pyqs: Number(s.pyqs ?? 0),
      ebooks: Number(s.ebooks ?? 0),
      quizzes: Number(s.quizzes ?? 0),
    };
  };

  // helper: normalize uploads response
  const normalizeUploads = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.uploads)) return data.uploads;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const [statsRes, recentRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/upload?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStatsData(normalizeStats(statsRes.data));
      setRecentUploads(normalizeUploads(recentRes.data));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      // fallback to 0 (so UI doesn't stay "—" forever)
      setStatsData({
        totalUploads: 0,
        notes: 0,
        pyqs: 0,
        ebooks: 0,
        quizzes: 0,
      });
      setRecentUploads([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    {
      label: "Total Uploads",
      value: statsData.totalUploads,
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Notes",
      value: statsData.notes,
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: "PYQs",
      value: statsData.pyqs,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Ebooks",
      value: statsData.ebooks,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Quizzes",
      value: statsData.quizzes,
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ];

  const quickActions = [
    { label: "Upload PYQ", to: "/admin/upload/pyq", icon: <Upload className="w-5 h-5" /> },
    { label: "Upload Notes", to: "/admin/upload/notes", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Upload Ebook", to: "/admin/upload/ebook", icon: <FileText className="w-5 h-5" /> },
    { label: "Upload Quiz (JSON)", to: "/admin/upload/quiz", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Manage Uploads", to: "/admin/manage", icon: <Settings className="w-5 h-5" /> },
    { label: "Manage Quizzes", to: "/admin/quizzes", icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  const formatType = (type) => {
    if (!type) return "Upload";
    const t = String(type).toLowerCase();
    if (t.includes("note")) return "Notes";
    if (t.includes("pyq")) return "PYQ";
    if (t.includes("ebook")) return "Ebook";
    if (t.includes("quiz")) return "Quiz";
    if (t.includes("audio")) return "Audio";
    return type;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <section className="w-full bg-white/90 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 sm:top-6 sm:right-6 text-indigo-200 w-10 h-10 animate-pulse pointer-events-none" />
            <LayoutDashboard className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-purple-200 w-14 h-14 opacity-70 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0">
                <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-400 drop-shadow-lg" />
              </div>

              <div className="flex-1">
                <p className="text-gray-500 text-sm sm:text-base">{greeting} 👋</p>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {adminName}!
                  </span>
                </h1>

                <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2">
                  Manage StudyYatra content: uploads, quizzes, categories, analytics, and more.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>

                  <Link
                    to="/admin/manage"
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Open Manage Uploads
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mt-6">
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

          {/* Quick Actions + Recent Uploads */}
          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Actions */}
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

            {/* Recent Uploads */}
            <div className="bg-white/90 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Recent Uploads</h2>

              {loading ? (
                <div className="text-gray-600 text-sm">Loading recent uploads...</div>
              ) : recentUploads.length === 0 ? (
                <div className="text-gray-600 text-sm">
                  <p className="mb-2">No recent uploads found.</p>
                  <p className="text-gray-500">Upload something and it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUploads.map((u) => (
                    <div
                      key={u.id || u._id || `${u.title}-${u.createdAt}`}
                      className="p-4 rounded-2xl border border-gray-100 bg-white flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {u.title || u.name || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatType(u.type || u.category)} • {u.class ? `Class ${u.class}` : ""}{" "}
                          {u.subject ? `• ${u.subject}` : ""}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(u.createdAt || u.updatedAt)}
                        </p>
                      </div>

                      {u.url ? (
                        <a
                          href={u.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 shrink-0">No link</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

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