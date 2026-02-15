import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiDownload,
  FiX,
  FiEye,
  FiLock,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
import { usePremium } from "../hooks/usePremium";
import SEO from "../components/SEO";
import { Sparkles } from "lucide-react";

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
   Small UI helpers
========================= */
const Badge = ({ children, tone = "gray" }) => {
  const map = {
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    purple: "bg-purple-50 text-purple-700 ring-purple-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${map[tone]}`}
    >
      {children}
    </span>
  );
};

const Banner = ({ type = "info", title, message, onClose }) => {
  const map = {
    info: "bg-blue-50 text-blue-800 ring-blue-200",
    error: "bg-red-50 text-red-800 ring-red-200",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  };
  return (
    <div className={`rounded-2xl ring-1 p-4 flex items-start justify-between gap-3 ${map[type]}`}>
      <div>
        {title ? <div className="font-black">{title}</div> : null}
        {message ? <div className="text-sm mt-0.5">{message}</div> : null}
      </div>
      {onClose ? (
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-black/5 transition"
          aria-label="Close message"
        >
          <FiX />
        </button>
      ) : null}
    </div>
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

/* =========================
   Preview Modal
========================= */
const PreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const viewUrl = getViewUrl(file.fileUrl);
  const downloadUrl = getDownloadUrl(file.fileUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between p-4 sm:p-5 border-b">
          <div className="min-w-0">
            <h3 className="font-black text-base sm:text-lg truncate">
              {file.subject} • {file.year}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="blue">Class {file.classLevel}</Badge>
              <Badge tone="purple">{file.subject}</Badge>
              <Badge tone={file.isFree ? "green" : "red"}>{file.isFree ? "Free" : "Premium"}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="Close preview"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="flex-1 p-2 sm:p-3 bg-gray-50">
          <iframe
            src={viewUrl}
            title="Preview"
            className="w-full h-full border-0 rounded-xl bg-white"
          />
        </div>

        <div className="p-4 sm:p-5 border-t flex justify-end">
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            <FiDownload /> Download
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* =========================
   PYQ Card
========================= */
const PYQCard = ({ pyq, isPremium, onPreview, onBuy, view = "grid" }) => {
  const canAccess = pyq.isFree || isPremium;
  const downloadUrl = getDownloadUrl(pyq.fileUrl);

  const cardBase =
    "bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition overflow-hidden";

  if (view === "list") {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardBase}>
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-lg font-black text-gray-900">
                {pyq.subject} • {pyq.year}
              </div>
              <Badge tone="blue">Class {pyq.classLevel}</Badge>
              <Badge tone={pyq.isFree ? "green" : "red"}>{pyq.isFree ? "Free" : "Premium"}</Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Paper: {pyq.subject} | Year: {pyq.year}
            </div>

            {!canAccess ? (
              <div className="mt-2 text-red-700 text-sm font-semibold inline-flex items-center gap-2">
                <FiLock /> Premium Required
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 flex-wrap">
            {canAccess ? (
              <>
                <button
                  onClick={onPreview}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                >
                  <FiEye /> Preview
                </button>
                <a
                  href={downloadUrl}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                >
                  <FiDownload /> Download
                </a>
              </>
            ) : (
              <button
                onClick={onBuy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
              >
                <FiLock /> Buy Premium
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // grid
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardBase}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-black text-gray-900 truncate">
              {pyq.subject} • {pyq.year}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Class {pyq.classLevel} • {pyq.subject}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="blue">PYQ</Badge>
              <Badge tone="purple">{pyq.subject}</Badge>
              <Badge tone={pyq.isFree ? "green" : "red"}>{pyq.isFree ? "Free" : "Premium"}</Badge>
            </div>

            {!canAccess ? (
              <div className="mt-3 text-red-700 text-sm font-semibold inline-flex items-center gap-2">
                <FiLock /> Premium Required
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-gray-100">
        {canAccess ? (
          <>
            <button
              onClick={onPreview}
              className="inline-flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition font-semibold text-gray-800"
            >
              <FiEye /> Preview
            </button>
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center gap-2 py-3 hover:bg-emerald-50 transition font-semibold text-gray-800"
            >
              <FiDownload /> Download
            </a>
          </>
        ) : (
          <button
            onClick={onBuy}
            className="col-span-2 inline-flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            <FiLock /> Buy Premium
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* =========================
   Main Component
========================= */
const PYQPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
  const { isPremium } = usePremium();

  const [loading, setLoading] = useState(true);
  const [allPapers, setAllPapers] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  // filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // grid | list

  // message banner (icons only, no emojis)
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/upload/public`, {
          params: { type: "pyq" },
        });
        setAllPapers(res.data?.uploads || []);
      } catch (e) {
        console.error(e);
        setBanner({
          type: "error",
          title: "Unable to load PYQs",
          message: "Please check your internet connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_URL]);

  const subjects = useMemo(() => {
    const set = new Set();
    (allPapers || []).forEach((p) => p?.subject && set.add(p.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allPapers]);

  const years = useMemo(() => {
    const set = new Set();
    (allPapers || []).forEach((p) => p?.year && set.add(String(p.year)));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [allPapers]);

  const classLevels = useMemo(() => {
    const set = new Set();
    (allPapers || []).forEach((p) => p?.classLevel && set.add(String(p.classLevel)));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [allPapers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (allPapers || [])
      .filter((p) => (selectedClass ? String(p.classLevel) === String(selectedClass) : true))
      .filter((p) => (selectedSubject ? p.subject === selectedSubject : true))
      .filter((p) => (selectedYear ? String(p.year) === String(selectedYear) : true))
      .filter((p) => {
        if (!q) return true;
        const hay = `${p.subject || ""} ${p.year || ""} ${p.classLevel || ""}`.toLowerCase();
        return hay.includes(q);
      });
  }, [allPapers, selectedClass, selectedSubject, selectedYear, search]);

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedYear("");
    setSearch("");
  };

  // Buy Premium (no emojis)
  const handleBuyPremium = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 scroll-smooth">
      <SEO
        title="PYQ Papers | StudyYatra"
        description="Previous Year Question papers for Class 10 and 12. Preview and download PYQs by year and subject on StudyYatra."
        canonical="https://studyyatra.in/pyq"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold">
              <Sparkles className="h-4 w-4" />
              StudyYatra Resources
            </div>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black text-gray-900">
              PYQ Papers
            </h1>
            <p className="mt-1 text-gray-600 text-sm sm:text-base">
              Find previous year papers by class, subject and year.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition font-semibold ${
                view === "grid"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              aria-label="Grid view"
            >
              <FiGrid /> Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition font-semibold ${
                view === "list"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              aria-label="List view"
            >
              <FiList /> List
            </button>
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
              <FiFilter /> Filters
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Class */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Classes</option>
                {classLevels.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
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

              {/* Year */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="lg:col-span-3 relative">
                <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by subject, year, class..."
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Year chips */}
            {years.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {years.slice(0, 10).map((y) => {
                  const active = String(selectedYear) === String(y);
                  return (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(active ? "" : String(y))}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {selectedClass ? <Badge tone="blue">Class: {selectedClass}</Badge> : null}
                {selectedSubject ? <Badge tone="purple">Subject: {selectedSubject}</Badge> : null}
                {selectedYear ? <Badge tone="gray">Year: {selectedYear}</Badge> : null}
                {search ? <Badge tone="gray">Search: “{search}”</Badge> : null}
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
          ) : filtered.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold">{filtered.length}</span> papers
                </p>
              </div>

              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {filtered.map((pyq) => (
                  <PYQCard
                    key={pyq.id}
                    pyq={pyq}
                    isPremium={isPremium}
                    onPreview={() => setPreviewFile(pyq)}
                    onBuy={handleBuyPremium}
                    view={view}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
              <div className="text-gray-900 font-black text-lg">No PYQs Found</div>
              <div className="text-gray-500 mt-1 text-sm">
                Try changing filters or search keywords.
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default PYQPage;