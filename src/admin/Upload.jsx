import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import { UploadCloud } from "lucide-react";
import { getAuth } from "firebase/auth";

const allowedTypes = ["pyq", "notes", "ebook", "audiobook", "quiz"];

// ✅ Basic options (edit as per your platform)
const CLASS_OPTIONS = ["10", "12"];
const SUBJECT_OPTIONS = [
  "Hindi",
  "English",
  "Math",
  "Science",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Civics",
];
const LANGUAGE_OPTIONS = [
  { label: "Hindi", value: "hi" },
  { label: "English", value: "en" },
];

const Upload = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // ✅ optional (recommended)
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Metadata (section-wise)
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("");
  const [year, setYear] = useState("");
  const [chapterOrTopic, setChapterOrTopic] = useState("");

  const needsYear = type === "pyq";
  const showChapter = type === "notes";

  const currentYear = new Date().getFullYear();
  const YEAR_OPTIONS = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= currentYear - 15; y--) arr.push(String(y));
    return arr;
  }, [currentYear]);

  // ✅ Reset type-specific fields when type changes
  useEffect(() => {
    setYear("");
    setChapterOrTopic("");
  }, [type]);

  if (!allowedTypes.includes(type)) {
    toast.error("Invalid upload type!");
    return <Navigate to="/admin" replace />;
  }

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Please login first!");
    return await user.getIdToken();
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // ✅ Required checks
    if (!title.trim()) return toast.error("Title is required!");
    if (!classLevel) return toast.error("Please select class!");
    if (!subject) return toast.error("Please select subject!");
    if (!language) return toast.error("Please select language!");
    if (needsYear && !year) return toast.error("Please select year!");
    if (!file) return toast.error("Please select a file!");
    if (file.size > 20 * 1024 * 1024) return toast.error("File size must be under 20MB");

    try {
      setLoading(true);

      const token = await getToken();

      const formData = new FormData();

      // ✅ main fields
      formData.append("title", title.trim());
      formData.append("description", description.trim()); // optional
      formData.append("type", type);

      // ✅ metadata fields (section-wise)
      formData.append("classLevel", classLevel); // "10" / "12"
      formData.append("subject", subject);
      formData.append("language", language); // "hi" / "en"

      if (needsYear) formData.append("year", year);
      if (showChapter && chapterOrTopic.trim()) formData.append("chapterOrTopic", chapterOrTopic.trim());

      // ✅ file
      formData.append("file", file);

      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`${type.toUpperCase()} uploaded successfully ✅`);

      // ✅ reset
      setTitle("");
      setDescription("");
      setFile(null);
      setClassLevel("");
      setSubject("");
      setLanguage("");
      setYear("");
      setChapterOrTopic("");

      navigate("/admin/manage");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <AdminSidebar />

      <div className="flex-1 flex justify-center items-start md:items-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 opacity-30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-200 opacity-30 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full shadow">
              <UploadCloud className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 drop-shadow">
                Upload {type.toUpperCase()}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-400">
                Fill metadata so users get content section-wise.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
            {/* ✅ Title */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g., Class 10 Science Notes - Ch 1 (Hindi)"
                className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* ✅ Description (optional) */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-1">
                Description <span className="text-indigo-400 font-medium">(optional)</span>
              </label>
              <textarea
                placeholder="Short info about this file..."
                className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition min-h-[80px] sm:min-h-[100px] bg-indigo-50/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ✅ Metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Class */}
              <div>
                <label className="block text-sm font-semibold text-indigo-700 mb-1">Class</label>
                <select
                  className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-indigo-700 mb-1">Subject</label>
                <select
                  className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-indigo-700 mb-1">Language</label>
                <select
                  className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ Type-specific: PYQ year */}
            {needsYear && (
              <div>
                <label className="block text-sm font-semibold text-indigo-700 mb-1">Year</label>
                <select
                  className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ✅ Type-specific: Notes topic/chapter */}
            {showChapter && (
              <div>
                <label className="block text-sm font-semibold text-indigo-700 mb-1">
                  Chapter / Topic <span className="text-indigo-400 font-medium">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chapter 1 / Motion"
                  className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                  value={chapterOrTopic}
                  onChange={(e) => setChapterOrTopic(e.target.value)}
                />
              </div>
            )}

            {/* ✅ File Upload */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-1">File Upload</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 p-6 sm:p-8 rounded-xl cursor-pointer hover:border-indigo-400 transition bg-indigo-50/40">
                <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500 mb-2 animate-bounce" />
                <span className="text-indigo-700 text-sm sm:text-base font-medium">
                  {file ? file.name : "Click to choose a file"}
                </span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
              </label>
              <p className="text-xs text-indigo-400 mt-1">Max size: 20MB</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 sm:py-3 rounded-xl font-bold text-lg shadow transition ${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              }`}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
