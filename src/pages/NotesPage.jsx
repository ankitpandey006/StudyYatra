import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import {
  FileText,
  Eye,
  X,
  Download,
  Lock,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { usePremium } from "../hooks/usePremium";
import SEO from "../components/SEO";

/* =========================
   Razorpay Loader (keep)
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
   Small Hook: Debounce ✅
========================= */
const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

/* =========================
   UI Helpers (same as yours)
========================= */
const Badge = ({ children, tone = "gray" }) => {
  const toneMap = {
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-green-50 text-green-700 ring-green-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    purple: "bg-purple-50 text-purple-700 ring-purple-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-5">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse" />
      <div className="flex-1">
        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
        <div className="mt-2 h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
    <div className="mt-5 flex gap-3">
      <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  </div>
);

const Banner = ({ type = "info", title, message, onClose }) => {
  const map = {
    success: {
      wrap: "bg-emerald-50 text-emerald-800 ring-emerald-200",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    error: {
      wrap: "bg-red-50 text-red-800 ring-red-200",
      icon: <AlertCircle className="h-5 w-5" />,
    },
    info: {
      wrap: "bg-blue-50 text-blue-800 ring-blue-200",
      icon: <Info className="h-5 w-5" />,
    },
  };

  return (
    <div
      className={`rounded-2xl ring-1 p-4 flex items-start justify-between gap-3 ${map[type].wrap}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{map[type].icon}</div>
        <div>
          {title ? <div className="font-black">{title}</div> : null}
          {message ? <div className="text-sm mt-0.5">{message}</div> : null}
        </div>
      </div>
      {onClose ? (
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-black/5 transition"
          aria-label="Close message"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
};

/* =========================
   Preview Modal ✅ (iframe lazy)
========================= */
const PreviewModal = React.memo(({ note, onClose }) => {
  if (!note) return null;

  const viewUrl = getViewUrl(note.fileUrl);
  const downloadUrl = getDownloadUrl(note.fileUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b">
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">
              {note.title || note.subject}
            </h3>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone="blue">Class {note.classLevel}</Badge>
              <Badge tone="purple">{note.subject}</Badge>
              <Badge tone={note.isFree ? "green" : "red"}>
                {note.isFree ? "Free" : "Premium"}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="Close preview"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 p-2 sm:p-3 bg-gray-50">
          {/* ✅ lazy iframe */}
          <iframe
            loading="lazy"
            src={viewUrl}
            title="note preview"
            className="w-full h-full border-0 rounded-xl bg-white"
          />
        </div>

        <div className="p-4 sm:p-5 border-t flex justify-end gap-3">
          <a
            href={downloadUrl}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 font-semibold transition"
          >
            <Download size={16} /> Download
          </a>
        </div>
      </div>
    </div>
  );
});

/* =========================
   Main Component
========================= */
const NotesPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
  const { isPremium } = usePremium();

  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300); // ✅

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);
  const [banner, setBanner] = useState(null);

  const subjects = useMemo(
    () => [
      "Hindi",
      "English",
      "Math",
      "Science",
      "Social Science",
      "Physics",
      "Chemistry",
      "Biology",
      "Sanskrit",
    ],
    []
  );

  // ✅ cache + cancel request
  const cacheRef = useRef(new Map());
  const abortRef = useRef(null);

  const fetchNotes = useCallback(async () => {
    const params = {
      type: "notes",
      classLevel: selectedClass,
      language: selectedLanguage,
      ...(selectedSubject ? { subject: selectedSubject } : {}),
    };

    const cacheKey = JSON.stringify(params);
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setNotes(cached);
      return;
    }

    try {
      setLoading(true);
      setBanner(null);

      // cancel previous request ✅
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await axios.get(`${API_URL}/api/upload/public`, {
        params,
        signal: abortRef.current.signal,
      });

      const uploads = res?.data?.uploads || [];
      cacheRef.current.set(cacheKey, uploads);
      setNotes(uploads);
    } catch (err) {
      // ignore abort
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

      console.error("Notes fetch error:", err);
      setNotes([]);
      setBanner({
        type: "error",
        title: "Unable to load notes",
        message: "Please check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, selectedClass, selectedLanguage, selectedSubject]);

  useEffect(() => {
    fetchNotes();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchNotes]);

  const handleBuyPremium = useCallback(async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        setBanner({
          type: "info",
          title: "Login required",
          message: "Please login to purchase premium access.",
        });
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) {
        setBanner({
          type: "error",
          title: "Payment SDK not loaded",
          message: "Please check your connection and try again.",
        });
        return;
      }

      const token = await user.getIdToken();

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

          setBanner({
            type: "success",
            title: "Premium activated",
            message: "You can now access all premium content.",
          });

          // ✅ avoid full reload if possible (better: refetch premium context)
          setTimeout(() => window.location.reload(), 600);
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
      setBanner({
        type: "error",
        title: "Payment failed",
        message: err?.response?.data?.error || "Please try again.",
      });
    }
  }, [API_URL]);

  // ✅ filter only by debouncedSearch (class filter removed because server already returns classLevel)
  const filteredNotes = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return notes || [];
    return (notes || []).filter((n) => {
      const hay = `${n.title || ""} ${n.subject || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, debouncedSearch]);

  const clearFilters = useCallback(() => {
    setSelectedSubject("");
    setSelectedLanguage("hi");
    setSearch("");
  }, []);

  const renderNoteCard = useCallback(
    (note) => {
      if (!note?.fileUrl) return null;

      const canAccess = note.isFree || isPremium;
      const downloadUrl = getDownloadUrl(note.fileUrl);

      return (
        <div
          key={note.id}
          className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 hover:shadow-md transition"
        >
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-black text-gray-900 text-base sm:text-lg truncate">
                {note.title || note.subject}
              </h4>

              <p className="text-sm text-gray-500 mt-0.5">
                Class {note.classLevel} • {note.subject} •{" "}
                {selectedLanguage === "hi" ? "Hindi" : "English"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="blue">Notes</Badge>
                <Badge tone="purple">{note.subject}</Badge>
                <Badge tone={note.isFree ? "green" : "red"}>
                  {note.isFree ? "Free" : "Premium"}
                </Badge>
              </div>

              {!canAccess && (
                <div className="mt-3 text-red-600 text-sm flex items-center gap-1 font-semibold">
                  <Lock size={14} /> Premium Required
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-3 flex-wrap">
            {canAccess ? (
              <>
                <button
                  onClick={() => setPreviewNote(note)}
                  className="text-sm px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl inline-flex items-center gap-2 font-semibold transition"
                >
                  <Eye size={16} /> Preview
                </button>

                <a
                  href={downloadUrl}
                  className="text-sm px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl inline-flex items-center gap-2 font-semibold transition"
                >
                  <Download size={16} /> Download
                </a>
              </>
            ) : (
              <button
                onClick={handleBuyPremium}
                className="text-sm px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl inline-flex items-center gap-2 font-semibold transition"
              >
                <Lock size={16} /> Buy Premium
              </button>
            )}
          </div>
        </div>
      );
    },
    [handleBuyPremium, isPremium, selectedLanguage]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 scroll-smooth">
      <SEO
        title="Class Notes | StudyYatra"
        description="Download Class 10 and 12 notes (Hindi/English). Preview and download PDFs quickly on StudyYatra."
        canonical="https://studyyatra.in/notes"
      />

      {previewNote && (
        <PreviewModal note={previewNote} onClose={() => setPreviewNote(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold">
              <Sparkles className="h-4 w-4" />
              StudyYatra Resources
            </div>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black text-gray-900">
              Class Notes
            </h1>
            <p className="mt-1 text-gray-600 text-sm sm:text-base">
              Preview, download and save your notes — smooth, fast, mobile-friendly.
            </p>
          </div>
        </div>

        {/* Banner */}
        {banner ? (
          <div className="mt-5">
            <Banner
              type={banner.type}
              title={banner.title}
              message={banner.message}
              onClose={() => setBanner(null)}
            />
          </div>
        ) : null}

        {/* Sticky Filter Bar */}
        <div className="mt-6 sticky top-2 z-10">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-sm ring-1 ring-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <Filter className="h-4 w-4" /> Filters
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Class */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="10">Class 10</option>
                <option value="12">Class 12</option>
              </select>

              {/* Subject */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Language */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="hi">Hindi</option>
                <option value="en">English</option>
              </select>

              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes by title or subject..."
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">Class: {selectedClass}</Badge>
                <Badge tone="purple">
                  Lang: {selectedLanguage === "hi" ? "Hindi" : "English"}
                </Badge>
                {selectedSubject ? (
                  <Badge tone="gray">Subject: {selectedSubject}</Badge>
                ) : null}
                {debouncedSearch ? (
                  <Badge tone="gray">Search: “{debouncedSearch}”</Badge>
                ) : null}
              </div>

              <button
                onClick={clearFilters}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold">{filteredNotes.length}</span>{" "}
                  notes
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredNotes.map(renderNoteCard)}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-black text-gray-800">No Notes Found</h3>
              <p className="text-gray-500 mt-1">
                Try changing filters or search keywords.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Info className="h-4 w-4" />
          Use filters and search to quickly find Class 10/12 notes.
        </div>
      </div>
    </div>
  );
};

export default NotesPage;