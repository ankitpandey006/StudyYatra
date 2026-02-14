import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, Lock } from "lucide-react";
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
   Main Component
========================= */
const AudioPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
  const { isPremium } = usePremium();

  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState(null);

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
      } finally {
        setLoading(false);
      }
    };
    fetchAudio();
  }, [API_URL]);

  /* =========================
     Filters
  ========================== */
  const filteredAudio = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return audioBooks.filter((a) => {
      const okClass = !selectedClass || String(a.classLevel) === String(selectedClass);
      const okSub = !selectedSubject || a.subject === selectedSubject;
      const okSearch =
        !q ||
        `${a.title} ${a.subject} class ${a.classLevel}`
          .toLowerCase()
          .includes(q);

      return okClass && okSub && okSearch;
    });
  }, [audioBooks, selectedClass, selectedSubject, searchTerm]);

  const currentTrack = currentIndex >= 0 ? filteredAudio[currentIndex] : null;

  /* =========================
     Premium Buy (₹49 fixed)
  ========================== */
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

  /* =========================
     Play Logic (Protected)
  ========================== */
  const playAtIndex = (idx) => {
    const track = filteredAudio[idx];
    if (!track) return;

    const canAccess = track.isFree || isPremium;

    if (!canAccess) {
      handleBuyPremium();
      return;
    }

    setCurrentIndex(idx);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!audioEl || !currentTrack) return;

    const canAccess = currentTrack.isFree || isPremium;
    if (!canAccess) return;

    audioEl.src = getStreamUrl(currentTrack.fileUrl);
    audioEl.play().catch(() => {});
  }, [audioEl, currentTrack, isPremium]);

  /* =========================
     UI
  ========================== */
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-32">
      <h1 className="text-3xl font-bold mb-6">Audio Books</h1>

      {/* Optional filters UI (you can add select/search inputs here) */}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAudio.map((a, idx) => {
            const canAccess = a.isFree || isPremium;

            return (
              <div key={a.id} className="bg-white p-4 rounded-xl shadow border">
                <h3 className="font-bold">{a.title}</h3>
                <p className="text-sm text-gray-600">
                  Class {a.classLevel} • {a.subject}
                </p>

                {!canAccess && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <Lock size={14} /> Premium Required
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  {canAccess ? (
                    <>
                      <button
                        onClick={() => playAtIndex(idx)}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded"
                      >
                        Play
                      </button>

                      <a
                        href={getDownloadUrl(a.fileUrl)}
                        className="bg-emerald-600 text-white px-3 py-2 rounded"
                      >
                        <Download size={16} />
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={handleBuyPremium}
                      className="flex-1 bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
                    >
                      <Lock size={16} /> Buy Premium
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden Audio */}
      <audio
        ref={(el) => setAudioEl(el)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default AudioPage;