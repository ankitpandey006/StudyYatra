import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FileText,
  Loader2,
  Eye,
  X,
  Download,
  Lock,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { usePremium } from "../hooks/usePremium";

/* =========================
   Razorpay Loader
========================= */
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* =========================
   Cloudinary Helper
========================= */
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

const getViewUrl = (url = "") => normalizeCloudinaryUrl(url);

const getDownloadUrl = (url = "") => {
  let u = normalizeCloudinaryUrl(url);
  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

/* =========================
   Preview Modal
========================= */
const PreviewModal = ({ note, onClose }) => {
  if (!note) return null;

  const viewUrl = getViewUrl(note.fileUrl);
  const downloadUrl = getDownloadUrl(note.fileUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-lg">{note.title || note.subject}</h3>
            <p className="text-sm text-gray-500">
              Class {note.classLevel} • {note.subject}
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex-1 p-2 bg-gray-50">
          <iframe
            src={viewUrl}
            title="note preview"
            className="w-full h-full border-0 rounded-lg bg-white"
          />
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <a
            href={downloadUrl}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={16} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Main Component
========================= */
const NotesPage = () => {
  // ✅ keep env consistent (prefer VITE_API_URL everywhere)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
  const { isPremium } = usePremium();

  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSubject, selectedLanguage]);

  // ✅ Buy Premium -> always ₹49 (single plan)
  const handleBuyPremium = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return alert("Please login first");

      const ok = await loadRazorpay();
      if (!ok) return alert("Razorpay SDK load failed. Check internet.");

      const token = await user.getIdToken();

      // ✅ NO plan (backend fixed ₹49)
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "StudyYatra",
        description: "Premium (1 Year)",
        order_id: data.orderId,
        handler: async function (rsp) {
          await axios.post(
            `${API_URL}/api/payment/verify`,
            {
              razorpay_order_id: rsp.razorpay_order_id,
              razorpay_payment_id: rsp.razorpay_payment_id,
              razorpay_signature: rsp.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert("🎉 Premium Activated! Now you can access everything.");
          window.location.reload();
        },
        prefill: {
          name: user.displayName || "StudyYatra User",
          email: user.email,
        },
        theme: { color: "#6366F1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Buy Premium error:", err?.response?.data || err);
      alert(err?.response?.data?.error || "❌ Payment failed. Please try again.");
    }
  };

  const renderNoteCard = (note) => {
    if (!note?.fileUrl) return null;

    const canAccess = note.isFree || isPremium;
    const downloadUrl = getDownloadUrl(note.fileUrl);

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
              Class {note.classLevel} • {note.subject}
            </p>
          </div>
        </div>

        {!canAccess && (
          <div className="text-red-600 text-sm mb-2 flex items-center gap-1">
            <Lock size={14} /> Premium Required
          </div>
        )}

        <div className="mt-auto flex gap-3">
          {canAccess ? (
            <>
              <button
                onClick={() => setPreviewNote(note)}
                className="text-sm px-4 py-2 bg-indigo-700 text-white rounded inline-flex items-center gap-2"
              >
                <Eye size={16} /> Preview
              </button>

              <a
                href={downloadUrl}
                className="text-sm px-4 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2"
              >
                <Download size={16} /> Download
              </a>
            </>
          ) : (
            <button
              onClick={handleBuyPremium}
              className="text-sm px-4 py-2 bg-red-600 text-white rounded inline-flex items-center gap-2"
            >
              <Lock size={16} /> Buy Premium
            </button>
          )}
        </div>
      </div>
    );
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => String(n.classLevel) === selectedClass);
  }, [notes, selectedClass]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {previewNote && (
        <PreviewModal note={previewNote} onClose={() => setPreviewNote(null)} />
      )}

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Class Notes
        </h2>

        {/* ✅ filters (optional, keep as is) */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="10">Class 10</option>
              <option value="12">Class 12</option>
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map(renderNoteCard)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No Notes Found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;