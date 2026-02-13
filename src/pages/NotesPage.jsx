import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FileText, Filter, BookOpen, Loader2, Eye, X, Download } from "lucide-react";

/**
 * ✅ Cloudinary helper (safe)
 * - Keeps the actual resource type from the stored URL (image/raw/video) to prevent 404
 * - View: open in browser
 * - Download: add fl_attachment:true to force download
 */
const normalizeCloudinaryUrl = (url = "") => {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;

  const match = url.match(/\/(image|raw|video)\/upload\//);
  const resourceType = match?.[1] || "raw";

  return url
    .replace("/image/upload/", `/${resourceType}/upload/`)
    .replace("/raw/upload/", `/${resourceType}/upload/`)
    .replace("/video/upload/", `/${resourceType}/upload/`);
};

const getCloudinaryViewUrl = (url = "") => normalizeCloudinaryUrl(url);

const getCloudinaryDownloadUrl = (url = "") => {
  let u = normalizeCloudinaryUrl(url);
  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

/* =========================
   ✅ Preview Modal (PYQ-like)
========================= */
const PreviewModal = ({ note, onClose }) => {
  if (!note) return null;

  const viewUrl = getCloudinaryViewUrl(note.fileUrl);
  const downloadUrl = getCloudinaryDownloadUrl(note.fileUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {note.title || note.subject}
            </h3>
            <p className="text-sm text-gray-500">
              Class {note.classLevel} • {note.subject} •{" "}
              {note.language === "hi" ? "Hindi" : "English"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-2 bg-gray-50">
          <iframe
            src={viewUrl}
            title={`Preview of ${note.title || note.publicId || "note"}`}
            className="w-full h-full border-0 rounded-lg bg-white"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" /> Download
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NotesPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  // Filters
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");

  // Data
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Preview modal state
  const [previewNote, setPreviewNote] = useState(null);

  const subjects = [
    "Hindi",
    "English",
    "Math",
    "Science",
    "Social Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Sanskrit",
  ];

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const params = {
        type: "notes",
        classLevel: selectedClass,
        language: selectedLanguage,
      };
      if (selectedSubject) params.subject = selectedSubject;

      const res = await axios.get(`${API_URL}/api/upload/public`, { params });

      const uploads = res?.data?.uploads || [];

      // newest first
      uploads.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setNotes(uploads);
    } catch (err) {
      console.error("Notes fetch error:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, [selectedClass, selectedSubject, selectedLanguage]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const okClass = String(n.classLevel) === String(selectedClass);
      const okLang = String(n.language) === String(selectedLanguage);
      const okSub = !selectedSubject || String(n.subject) === String(selectedSubject);
      return okClass && okLang && okSub;
    });
  }, [notes, selectedClass, selectedSubject, selectedLanguage]);

  const renderNoteCard = (note) => {
    if (!note?.fileUrl) return null;

    const downloadUrl = getCloudinaryDownloadUrl(note.fileUrl);

    return (
      <div
        key={note.id}
        className="bg-white rounded-xl shadow p-4 flex flex-col justify-between hover:shadow-md transition"
      >
        <div className="flex items-start mb-3">
          <FileText className="h-6 w-6 text-blue-500 mr-2 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-600 text-lg">
              {note.title || note.subject}
            </h4>

            <p className="text-sm text-gray-500">
              Class {note.classLevel} • {note.subject} •{" "}
              {note.language === "hi" ? "Hindi" : "English"}
            </p>

            {note.chapterOrTopic && (
              <p className="text-xs text-gray-400 mt-1">
                Topic: {note.chapterOrTopic}
              </p>
            )}
          </div>
        </div>

        {note.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {note.description}
          </p>
        )}

        <div className="mt-auto flex gap-3">
          {/* ✅ PREVIEW (modal) */}
          <button
            onClick={() => setPreviewNote(note)}
            className="text-sm px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>

          {/* ✅ DOWNLOAD (force download) */}
          <a
            href={downloadUrl}
            className="text-sm px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ✅ Modal */}
      {previewNote && (
        <PreviewModal note={previewNote} onClose={() => setPreviewNote(null)} />
      )}

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Class Notes
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-white shadow rounded-lg p-4">
          {/* Class Toggle */}
          <div className="flex gap-2">
            {["10", "12"].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-md font-semibold ${
                  selectedClass === cls
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Class {cls}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading notes...</span>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map(renderNoteCard)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No Notes Found</h3>
            <p className="text-gray-500">Try changing class/subject/language filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;