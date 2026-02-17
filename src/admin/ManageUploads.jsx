import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { toast } from "react-toastify";
import { Trash2, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { getAuth } from "firebase/auth";

const TABS = {
  UPLOADS: "uploads",
  QUIZZES: "quizzes",
};

// ✅ API Base URL (Vercel/Netlify env se)
const API_URL = import.meta.env.VITE_API_URL;

// ✅ helper to safely join URL paths
const api = (path = "") => {
  if (!API_URL) return path; // safeguard
  const base = API_URL.replace(/\/+$/, "");
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

const ManageUploads = () => {
  const [activeTab, setActiveTab] = useState(TABS.UPLOADS);

  // uploads
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);

  // quizzes
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  // ui
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // first load
    refreshActiveTab();
    // eslint-disable-next-line
  }, [activeTab]);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Please login as admin first.");
    return await user.getIdToken();
  };

  /* ============================
      FETCH UPLOADS (Admin Protected)
  ============================ */
  const fetchUploads = async () => {
    try {
      if (!API_URL) {
        toast.error("VITE_API_URL missing. Add it in .env / Vercel env variables.");
        setUploads([]);
        setFilteredUploads([]);
        return;
      }

      setLoading(true);
      const token = await getToken();

      const res = await axios.get(api("/api/upload"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data?.uploads) ? res.data.uploads : [];
      setUploads(data);
      setFilteredUploads(data);
    } catch (err) {
      console.error("Fetch uploads error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to fetch uploads");
      setUploads([]);
      setFilteredUploads([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============================
      FETCH QUIZZES
  ============================ */
  const fetchQuizzes = async () => {
    try {
      if (!API_URL) {
        toast.error("VITE_API_URL missing. Add it in .env / Vercel env variables.");
        setQuizzes([]);
        setFilteredQuizzes([]);
        return;
      }

      setLoading(true);

      // quizzes list public hai but admin panel me token attach (optional)
      let headers = {};
      try {
        const token = await getToken();
        headers = { Authorization: `Bearer ${token}` };
      } catch {
        // ignore if not logged in
      }

      const res = await axios.get(api("/api/quizzes"), { headers });

      const data = Array.isArray(res.data?.quizzes) ? res.data.quizzes : [];
      setQuizzes(data);
      setFilteredQuizzes(data);
    } catch (err) {
      console.error("Fetch quizzes error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to fetch quizzes");
      setQuizzes([]);
      setFilteredQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveTab = async () => {
    if (activeTab === TABS.UPLOADS) return fetchUploads();
    return fetchQuizzes();
  };

  /* ============================
      DELETE UPLOAD
  ============================ */
  const handleDeleteUpload = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      if (!API_URL) {
        toast.error("VITE_API_URL missing. Add it in .env / Vercel env variables.");
        return;
      }

      const token = await getToken();

      await axios.delete(api(`/api/upload/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("File deleted successfully ✅");
      await fetchUploads();
    } catch (err) {
      console.error("Delete upload error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to delete file");
    }
  };

  /* ============================
      DELETE QUIZ
  ============================ */
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      if (!API_URL) {
        toast.error("VITE_API_URL missing. Add it in .env / Vercel env variables.");
        return;
      }

      const token = await getToken();

      await axios.delete(api(`/api/quizzes/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Quiz deleted successfully ✅");
      await fetchQuizzes();
    } catch (err) {
      console.error("Delete quiz error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to delete quiz");
    }
  };

  /* ============================
      UI Helpers
  ============================ */
  const uploadsCount = useMemo(() => filteredUploads.length, [filteredUploads]);
  const quizzesCount = useMemo(() => filteredQuizzes.length, [filteredQuizzes]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Manage</h2>
            <p className="text-sm text-gray-500">
              Uploads = Notes/PYQ/Ebook/Audio • Quizzes = Firestore quizzes
            </p>
            {!API_URL && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Missing VITE_API_URL. Set it to https://studyyatra-backend.onrender.com
              </p>
            )}
          </div>

          <button
            onClick={refreshActiveTab}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab(TABS.UPLOADS)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === TABS.UPLOADS
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Uploads ({uploadsCount})
          </button>
          <button
            onClick={() => setActiveTab(TABS.QUIZZES)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === TABS.QUIZZES
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Quizzes ({quizzesCount})
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <>
            {/* ============================
                UPLOADS TAB
            ============================ */}
            {activeTab === TABS.UPLOADS && (
              <>
                {filteredUploads.length === 0 ? (
                  <p className="text-gray-500 text-center">No uploads found.</p>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-gray-100 text-left">
                            <th className="p-3 border-b">Title</th>
                            <th className="p-3 border-b">Type</th>
                            <th className="p-3 border-b">Class</th>
                            <th className="p-3 border-b">Subject</th>
                            <th className="p-3 border-b">Uploaded On</th>
                            <th className="p-3 border-b text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUploads.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 border-b">{item.title || "Untitled"}</td>
                              <td className="p-3 border-b capitalize">{item.type || "-"}</td>
                              <td className="p-3 border-b">{item.classLevel || "-"}</td>
                              <td className="p-3 border-b">{item.subject || "-"}</td>
                              <td className="p-3 border-b">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="p-3 border-b text-center">
                                <div className="flex gap-2 justify-center">
                                  {(item.fileUrl || item.url) && (
                                    <a
                                      href={item.fileUrl || item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-4 h-4" /> Open
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUpload(item.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {filteredUploads.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-md space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-indigo-600">{item.title || "Untitled"}</h3>
                            <button
                              onClick={() => handleDeleteUpload(item.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>

                          <p className="text-gray-500 capitalize">
                            {item.type || "-"} • Class {item.classLevel || "-"} • {item.subject || "-"}
                          </p>

                          {(item.fileUrl || item.url) && (
                            <a
                              className="text-indigo-600 underline text-sm"
                              href={item.fileUrl || item.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open file
                            </a>
                          )}

                          <p className="text-gray-400 text-sm">
                            Uploaded on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ============================
                QUIZZES TAB
            ============================ */}
            {activeTab === TABS.QUIZZES && (
              <>
                {filteredQuizzes.length === 0 ? (
                  <p className="text-gray-500 text-center">No quizzes found.</p>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-gray-100 text-left">
                            <th className="p-3 border-b">Title</th>
                            <th className="p-3 border-b">Class</th>
                            <th className="p-3 border-b">Subject</th>
                            <th className="p-3 border-b">Questions</th>
                            <th className="p-3 border-b">Created</th>
                            <th className="p-3 border-b text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuizzes.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 border-b">{q.title || "Untitled Quiz"}</td>
                              <td className="p-3 border-b">{q.class || "-"}</td>
                              <td className="p-3 border-b">{q.subject || "-"}</td>
                              <td className="p-3 border-b">{q.totalQuestions ?? q.questions?.length ?? 0}</td>
                              <td className="p-3 border-b">
                                {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="p-3 border-b text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleDeleteQuiz(q.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {filteredQuizzes.map((q) => (
                        <div key={q.id} className="bg-white p-4 rounded-xl shadow-md space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-indigo-600">{q.title || "Untitled Quiz"}</h3>
                            <button
                              onClick={() => handleDeleteQuiz(q.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>

                          <p className="text-gray-500">
                            Class {q.class || "-"} • {q.subject || "-"} • Questions:{" "}
                            {q.totalQuestions ?? q.questions?.length ?? 0}
                          </p>

                          <p className="text-gray-400 text-sm">
                            Created on: {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUploads;
