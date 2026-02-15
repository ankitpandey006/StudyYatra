import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  Filter,
  Search,
  Lock,
  Play,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Timer,
  Layers,
} from "lucide-react";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";

const LOCAL_KEY = "studynest_mocktest_attempted";

const Badge = ({ children, tone = "gray" }) => {
  const toneMap = {
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    purple: "bg-purple-50 text-purple-700 ring-purple-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
};

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
      icon: <AlertCircle className="h-5 w-5" />,
    },
  };

  return (
    <div className={`rounded-2xl ring-1 p-4 flex items-start justify-between gap-3 ${map[type].wrap}`}>
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
          ✕
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
    <div className="mt-5 h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
  </div>
);

const normalizeStr = (v) => String(v ?? "").trim();

const MockTestPage = () => {
  const [mockTests, setMockTests] = useState([]);
  const [attempted, setAttempted] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);

  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/quizzes`);
        const list = Array.isArray(res.data?.quizzes) ? res.data.quizzes : [];
        setMockTests(list);
      } catch (err) {
        console.error("Failed to load mock tests:", err);
        setMockTests([]);
        setBanner({
          type: "error",
          title: "Unable to load mock tests",
          message: "Please check your internet connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [API_URL]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(attempted));
  }, [attempted]);

  const handleStartTest = (test) => {
    if (!test.isFree && !currentUser?.isPremium) {
      setBanner({
        type: "info",
        title: "Premium required",
        message: "This mock test is premium. Please upgrade to unlock.",
      });
      return navigate("/subscribe");
    }

    setAttempted((prev) => ({ ...prev, [test.id]: true }));
    navigate(`/mocktest/${test.id}`);
  };

  const classOptions = useMemo(() => {
    return [
      ...new Set(mockTests.map((t) => normalizeStr(t.class)).filter(Boolean)),
    ].sort((a, b) => Number(a) - Number(b));
  }, [mockTests]);

  const subjectOptions = useMemo(() => {
    return [
      ...new Set(
        mockTests
          .filter((t) => (selectedClass ? normalizeStr(t.class) === selectedClass : true))
          .map((t) => normalizeStr(t.subject))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [mockTests, selectedClass]);

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (mockTests || []).filter((test) => {
      const cls = normalizeStr(test.class);
      const subj = normalizeStr(test.subject);
      const title = normalizeStr(test.title);

      const matchClass = selectedClass ? cls === selectedClass : true;
      const matchSubject = selectedSubject ? subj === selectedSubject : true;

      const matchSearch = q
        ? `${title} ${subj} ${cls}`.toLowerCase().includes(q)
        : true;

      return matchClass && matchSubject && matchSearch;
    });
  }, [mockTests, selectedClass, selectedSubject, search]);

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSearch("");
  };

  const groupByClass = useMemo(() => {
    const map = {};
    filteredTests.forEach((t) => {
      const cls = normalizeStr(t.class) || "Other";
      map[cls] = map[cls] || [];
      map[cls].push(t);
    });

    // sort tests inside each class by title (optional)
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => normalizeStr(a.title).localeCompare(normalizeStr(b.title)));
    });

    // class sort numeric
    const keys = Object.keys(map).sort((a, b) => Number(a) - Number(b));
    return { keys, map };
  }, [filteredTests]);

  const TestCard = ({ test }) => {
    const isLocked = !test.isFree && !currentUser?.isPremium;
    const isAttempted = !!attempted[test.id];

    const duration = normalizeStr(test.duration) || "30 mins";
    const totalQ =
      test.totalQuestions ?? (Array.isArray(test.questions) ? test.questions.length : 0) ?? 0;

    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 hover:shadow-md transition">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black text-gray-900 text-base sm:text-lg truncate">
              {test.title || "Untitled Test"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="blue">Class {normalizeStr(test.class) || "—"}</Badge>
              <Badge tone="purple">{normalizeStr(test.subject) || "—"}</Badge>
              <Badge tone={test.isFree ? "green" : "amber"}>
                {test.isFree ? "Free" : "Premium"}
              </Badge>
              {isAttempted ? <Badge tone="gray">Attempted</Badge> : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-gray-400" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <span>{totalQ} Questions</span>
              </div>
            </div>

            {isLocked ? (
              <div className="mt-3 text-red-700 text-sm font-semibold inline-flex items-center gap-2">
                <Lock size={14} /> Premium Required
              </div>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => handleStartTest(test)}
          className={`mt-5 w-full py-2.5 rounded-xl font-semibold transition inline-flex items-center justify-center gap-2
            ${
              isLocked
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : isAttempted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          disabled={isLocked}
        >
          {isLocked ? (
            <>
              <Lock size={16} /> Upgrade to Unlock
            </>
          ) : isAttempted ? (
            <>
              <RefreshCcw size={16} /> Resume Test
            </>
          ) : (
            <>
              <Play size={16} /> Start Test
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 scroll-smooth">
      <SEO
        title="Mock Tests | StudyYatra"
        description="Practice mock tests for Class 10 and 12. Filter by class and subject, then start or resume tests on StudyYatra."
        canonical="https://studyyatra.in/mocktest"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold">
              <Sparkles className="h-4 w-4" />
              StudyYatra Practice
            </div>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black text-gray-900">
              Mock Tests
            </h1>
            <p className="mt-1 text-gray-600 text-sm sm:text-base">
              Filter tests, then start or resume where you left off.
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

        {/* Sticky Filters */}
        <div className="mt-6 sticky top-2 z-10">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-sm ring-1 ring-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <Filter className="h-4 w-4" /> Filters
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Class */}
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject("");
                }}
              >
                <option value="">All Classes</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>

              {/* Subject */}
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjectOptions.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="lg:col-span-4 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, subject, class..."
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {selectedClass ? <Badge tone="blue">Class: {selectedClass}</Badge> : null}
                {selectedSubject ? <Badge tone="purple">Subject: {selectedSubject}</Badge> : null}
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
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-black text-gray-800">No tests found</h3>
              <p className="text-gray-500 mt-1">
                Try changing filters or search keywords.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold">{filteredTests.length}</span> tests
                </p>
              </div>

              {groupByClass.keys.map((cls) => (
                <div key={cls} className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      Class {cls}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupByClass.map[cls].map((test) => (
                      <TestCard key={test.id} test={test} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockTestPage;