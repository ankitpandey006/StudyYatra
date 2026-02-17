import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Download,
  Lock,
  Search,
  Filter,
  Sparkles,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { usePremium } from "../hooks/usePremium";
import SEO from "../components/SEO";

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
  const resourceType = match?.[1] || "video";

  return url
    .replace("/image/upload/", `/${resourceType}/upload/`)
    .replace("/raw/upload/", `/${resourceType}/upload/`)
    .replace("/video/upload/", `/${resourceType}/upload/`);
};

const getStreamUrl = (url = "") => normalizeCloudinaryUrl(url);

const getDownloadUrl = (url = "") => {
  let u = normalizeCloudinaryUrl(url);
  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

/* =========================
   UI Helpers
========================= */
const Badge = ({ children, tone = "gray" }) => {
  const toneMap = {
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
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

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-5">
    <div className="flex items-start gap-3">
      <div className="h-11 w-11 rounded-xl bg-gray-100 animate-pulse" />
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
      <div className="h-10 w-14 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  </div>
);

const fmtTime = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

/* =========================
   Main Component
========================= */
const AudioPage = () => {
  // ✅ Production-safe base URL (trims trailing slash)
  const API_URL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5050";

  const { isPremium } = usePremium();

  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const [banner, setBanner] = useState(null);

  // player state
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.9);

  /* =========================
     Fetch
  ========================== */
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/upload/public`, {
          params: { type: "audiobook" },
        });
        setAudioBooks(res.data?.uploads || []);
      } catch (err) {
        console.error(err);
        setAudioBooks([]);
        setBanner({
          type: "error",
          title: "Unable to load audiobooks",
          message: "Please check your internet connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAudio();
    // ✅ API_URL is constant at runtime, so empty deps avoids re-fetch loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Filters
  ========================== */
  const classOptions = useMemo(() => {
    const set = new Set();
    (audioBooks || []).forEach(
      (a) => a?.classLevel && set.add(String(a.classLevel))
    );
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [audioBooks]);

  const subjectOptions = useMemo(() => {
    const set = new Set();
    (audioBooks || [])
      .filter((a) =>
        selectedClass ? String(a.classLevel) === String(selectedClass) : true
      )
      .forEach((a) => a?.subject && set.add(a.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [audioBooks, selectedClass]);

  const filteredAudio = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (audioBooks || [])
      .filter((a) => !!a?.fileUrl)
      .filter((a) =>
        !selectedClass ? true : String(a.classLevel) === String(selectedClass)
      )
      .filter((a) => (!selectedSubject ? true : a.subject === selectedSubject))
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.title || ""} ${a.subject || ""} class ${
          a.classLevel || ""
        }`.toLowerCase();
        return hay.includes(q);
      });
  }, [audioBooks, selectedClass, selectedSubject, searchTerm]);

  const currentTrack = currentIndex >= 0 ? filteredAudio[currentIndex] : null;

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSearchTerm("");
  };

  /* =========================
     Premium Buy (₹49 fixed)
  ========================== */
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

  /* =========================
     Player Actions
  ========================== */
  const canAccessTrack = (track) => !!track && (track.isFree || isPremium);

  const loadAndPlay = async (idx) => {
    const track = filteredAudio[idx];
    if (!track) return;

    if (!canAccessTrack(track)) {
      handleBuyPremium();
      return;
    }

    setCurrentIndex(idx);

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = getStreamUrl(track.fileUrl);
    audio.volume = volume;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      if (filteredAudio.length) loadAndPlay(0);
      return;
    }

    if (!canAccessTrack(currentTrack)) {
      handleBuyPremium();
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (!filteredAudio.length) return;
    const next = currentIndex < 0 ? 0 : (currentIndex + 1) % filteredAudio.length;
    loadAndPlay(next);
  };

  const playPrev = () => {
    if (!filteredAudio.length) return;
    const prev =
      currentIndex <= 0 ? Math.max(filteredAudio.length - 1, 0) : currentIndex - 1;
    loadAndPlay(prev);
  };

  const onSeek = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(value);
    setCurrentTime(Number(value));
  };

  const onSetVolume = (v) => {
    const audio = audioRef.current;
    const nv = Number(v);
    setVolume(nv);
    if (audio) audio.volume = nv;
  };

  /* =========================
     Audio element listeners
  ========================== */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => playNext();
    const onPlayEv = () => setIsPlaying(true);
    const onPauseEv = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlayEv);
    audio.addEventListener("pause", onPauseEv);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlayEv);
      audio.removeEventListener("pause", onPauseEv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, filteredAudio]);

  /* =========================
     Card
  ========================== */
  const TrackCard = ({ track, idx }) => {
    const canAccess = canAccessTrack(track);
    const isActive = idx === currentIndex;
    return (
      <div
        className={`bg-white rounded-2xl shadow-sm ring-1 p-5 transition hover:shadow-md ${
          isActive ? "ring-indigo-200" : "ring-gray-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
            <Music className="h-6 w-6 text-indigo-600" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black text-gray-900 text-base sm:text-lg truncate">
              {track.title || "Audio Book"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Class {track.classLevel} • {track.subject}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="blue">Audio</Badge>
              <Badge tone="purple">{track.subject}</Badge>
              <Badge tone={track.isFree ? "green" : "red"}>
                {track.isFree ? "Free" : "Premium"}
              </Badge>
              {isActive ? <Badge tone="gray">Now Playing</Badge> : null}
            </div>

            {!canAccess ? (
              <div className="mt-3 text-red-700 text-sm font-semibold inline-flex items-center gap-2">
                <Lock size={14} /> Premium Required
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex gap-3 flex-wrap">
          {canAccess ? (
            <>
              <button
                onClick={() => loadAndPlay(idx)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl inline-flex items-center gap-2 font-semibold transition"
              >
                <Play size={16} /> Play
              </button>

              <a
                href={getDownloadUrl(track.fileUrl)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl inline-flex items-center gap-2 font-semibold transition"
              >
                <Download size={16} /> Download
              </a>
            </>
          ) : (
            <button
              onClick={handleBuyPremium}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl inline-flex items-center gap-2 font-semibold transition"
            >
              <Lock size={16} /> Buy Premium
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 scroll-smooth pb-36">
      <SEO
        title="Audio Books | StudyYatra"
        description="Listen to audiobooks for Class 10 and 12. Filter by class and subject, then play or download on StudyYatra."
        canonical="https://studyyatra.in/audiobooks"
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
              Audio Books
            </h1>
            <p className="mt-1 text-gray-600 text-sm sm:text-base">
              Filter, play and download audiobooks with a smooth player.
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

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Class */}
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject("");
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Classes</option>
                {classOptions.map((c) => (
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
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="lg:col-span-4 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, subject, class..."
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {selectedClass ? <Badge tone="blue">Class: {selectedClass}</Badge> : null}
                {selectedSubject ? (
                  <Badge tone="purple">Subject: {selectedSubject}</Badge>
                ) : null}
                {searchTerm ? <Badge tone="gray">Search: “{searchTerm}”</Badge> : null}
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

        {/* Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAudio.length ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold">{filteredAudio.length}</span> audiobooks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAudio.map((a, idx) => (
                  <TrackCard key={a.id || `${a.fileUrl}-${idx}`} track={a} idx={idx} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
              <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-black text-gray-800">No Audio Found</h3>
              <p className="text-gray-500 mt-1">Try changing filters or search keywords.</p>
            </div>
          )}
        </div>

        <div className="mt-10 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Info className="h-4 w-4" />
          Tip: Use filters and search to quickly find the right audiobook.
        </div>
      </div>

      {/* Bottom Player */}
      <div className="fixed left-0 right-0 bottom-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg ring-1 ring-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Track info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
                  <Music className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-gray-900 truncate">
                    {currentTrack?.title || "Select an audiobook to play"}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {currentTrack
                      ? `Class ${currentTrack.classLevel} • ${currentTrack.subject}`
                      : " "}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-1">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={playPrev}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                    aria-label="Previous"
                    disabled={!filteredAudio.length}
                  >
                    <SkipBack />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-2xl bg-gray-900 text-white hover:bg-black transition"
                    aria-label="Play/Pause"
                    disabled={!filteredAudio.length}
                  >
                    {isPlaying ? <Pause /> : <Play />}
                  </button>

                  <button
                    onClick={playNext}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                    aria-label="Next"
                    disabled={!filteredAudio.length}
                  >
                    <SkipForward />
                  </button>
                </div>

                {/* Seek */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-10 text-right">
                    {fmtTime(currentTime)}
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, duration)}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(e) => onSeek(e.target.value)}
                    className="w-full"
                    disabled={!currentTrack}
                  />

                  <div className="text-xs text-gray-500 w-10">{fmtTime(duration)}</div>
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center justify-between md:justify-end gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-gray-500" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => onSetVolume(e.target.value)}
                  />
                </div>

                {currentTrack ? (
                  canAccessTrack(currentTrack) ? (
                    <a
                      href={getDownloadUrl(currentTrack.fileUrl)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2 transition"
                    >
                      <Download size={16} /> Download
                    </a>
                  ) : (
                    <button
                      onClick={handleBuyPremium}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center gap-2 transition"
                    >
                      <Lock size={16} /> Buy Premium
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default AudioPage;
