import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Search,
  Filter,
  X,
} from "lucide-react";

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

const getCloudinaryStreamUrl = (url = "") => normalizeCloudinaryUrl(url);

const getCloudinaryDownloadUrl = (url = "") => {
  let u = normalizeCloudinaryUrl(url);
  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

/* =========================
   Main Component
========================= */
const AudioPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters + search
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // player state
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // ref to audio element
  const [audioEl, setAudioEl] = useState(null);

  /* =========================
     Fetch from backend
  ========================== */
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/upload/public`, {
          params: { type: "audiobook" },
        });

        const uploads = res.data?.uploads || [];
        // safest normalization (string trim)
        const normalized = uploads.map((u) => ({
          ...u,
          classLevel: String(u.classLevel || "").trim(),
          subject: String(u.subject || "").trim(),
          title: String(u.title || "").trim(),
          fileUrl: String(u.fileUrl || "").trim(),
        }));

        setAudioBooks(normalized);
      } catch (err) {
        console.error("Audio fetch error:", err);
        setAudioBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [API_URL]);

  /* =========================
     Dynamic filter options
  ========================== */
  const classes = useMemo(() => {
    const set = new Set(audioBooks.map((a) => a.classLevel).filter(Boolean));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [audioBooks]);

  const subjects = useMemo(() => {
    const set = new Set(audioBooks.map((a) => a.subject).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [audioBooks]);

  /* =========================
     Filtered list = playlist
  ========================== */
  const filteredAudioBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return audioBooks.filter((a) => {
      const okClass = !selectedClass || a.classLevel === selectedClass;
      const okSub = !selectedSubject || a.subject === selectedSubject;

      const hay = `${a.title} ${a.subject} class ${a.classLevel}`.toLowerCase();
      const okSearch = !q || hay.includes(q);

      return okClass && okSub && okSearch && a.fileUrl;
    });
  }, [audioBooks, selectedClass, selectedSubject, searchTerm]);

  const currentTrack = useMemo(() => {
    if (currentIndex < 0) return null;
    return filteredAudioBooks[currentIndex] || null;
  }, [filteredAudioBooks, currentIndex]);

  /* =========================
     Keep index valid when filters change
  ========================== */
  useEffect(() => {
    // if current selection disappears due to filtering, stop player
    if (!currentTrack) {
      setCurrentIndex(-1);
      setIsPlaying(false);
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }
    // eslint-disable-next-line
  }, [filteredAudioBooks.length]);

  /* =========================
     Play selected track
  ========================== */
  const playAtIndex = (idx) => {
    if (idx < 0 || idx >= filteredAudioBooks.length) return;
    setCurrentIndex(idx);
    setIsPlaying(true);
  };

  /* =========================
     Next / Prev (wrap)
  ========================== */
  const playNext = () => {
    if (!filteredAudioBooks.length) return;
    const next = currentIndex < 0 ? 0 : (currentIndex + 1) % filteredAudioBooks.length;
    playAtIndex(next);
  };

  const playPrev = () => {
    if (!filteredAudioBooks.length) return;
    const prev =
      currentIndex < 0
        ? 0
        : (currentIndex - 1 + filteredAudioBooks.length) % filteredAudioBooks.length;
    playAtIndex(prev);
  };

  /* =========================
     When currentTrack changes: load & autoplay
  ========================== */
  useEffect(() => {
    if (!audioEl) return;
    if (!currentTrack) return;

    const src = getCloudinaryStreamUrl(currentTrack.fileUrl);
    if (audioEl.src !== src) audioEl.src = src;

    if (isPlaying) {
      // try to play (some browsers need user gesture)
      audioEl.play().catch(() => {});
    }
    // eslint-disable-next-line
  }, [currentTrack, audioEl]);

  /* =========================
     Toggle play/pause
  ========================== */
  const togglePlay = () => {
    if (!audioEl) return;

    // if nothing selected, play first item
    if (!currentTrack && filteredAudioBooks.length) {
      playAtIndex(0);
      return;
    }

    if (audioEl.paused) {
      audioEl.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audioEl.pause();
      setIsPlaying(false);
    }
  };

  /* =========================
     Auto next on end
  ========================== */
  const handleEnded = () => {
    playNext();
  };

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Audio Books</h1>
            <p className="text-slate-600">
              Listen online, preview, and download audio lessons.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 bg-white rounded-2xl shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title / subject / class..."
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Class */}
            <div className="flex items-center gap-2">
              <Filter className="text-slate-500 w-5 h-5" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-2">
              <Filter className="text-slate-500 w-5 h-5" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{filteredAudioBooks.length}</span> items
            </p>

            <button
              onClick={clearFilters}
              className="text-sm px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-4 h-36 animate-pulse" />
              ))}
            </div>
          ) : filteredAudioBooks.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-28">
              {filteredAudioBooks.map((a, idx) => {
                const active = idx === currentIndex;
                return (
                  <div
                    key={a.id || `${a.title}-${idx}`}
                    className={`bg-white rounded-2xl shadow p-4 border transition ${
                      active ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-1">
                          {a.title || "Untitled Audio"}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Class {a.classLevel} • {a.subject}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        Audio
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => playAtIndex(idx)}
                        className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>

                      <a
                        href={getCloudinaryDownloadUrl(a.fileUrl)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow p-10 text-center pb-28">
              <p className="text-slate-700 font-semibold text-lg">No audio found</p>
              <p className="text-slate-500 mt-1">Try changing filters or search keywords.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element (controlled) */}
      <audio
        ref={(el) => setAudioEl(el)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      />

      {/* Sticky Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white/90 backdrop-blur border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {/* Track info */}
            <div className="min-w-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow">
                <Music className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {currentTrack ? currentTrack.title : "Select an audio to play"}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {currentTrack
                    ? `Class ${currentTrack.classLevel} • ${currentTrack.subject}`
                    : "Use Play on any card"}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={playPrev}
                disabled={!filteredAudioBooks.length}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-40"
                title="Previous"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!filteredAudioBooks.length}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow disabled:opacity-40"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={playNext}
                disabled={!filteredAudioBooks.length}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-40"
                title="Next"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Download */}
            <div className="hidden sm:flex items-center gap-2">
              <a
                href={currentTrack ? getCloudinaryDownloadUrl(currentTrack.fileUrl) : "#"}
                onClick={(e) => {
                  if (!currentTrack) e.preventDefault();
                }}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
                  currentTrack
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                title="Download current"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>

          {/* Optional mini progress hint */}
          <div className="h-1 w-full bg-slate-200">
            <div className="h-1 w-0 bg-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPage;