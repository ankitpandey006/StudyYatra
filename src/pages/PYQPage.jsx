import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiDownload,
  FiX,
  FiEye,
  FiLock,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
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

const getViewUrl = (url) => normalizeCloudinaryUrl(url);

const getDownloadUrl = (url) => {
  let u = normalizeCloudinaryUrl(url);
  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

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
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">
            {file.subject} - {file.year}
          </h3>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </header>

        <div className="flex-1 p-2">
          <iframe
            src={viewUrl}
            title="Preview"
            className="w-full h-full border-0 rounded"
          />
        </div>

        <div className="p-4 border-t flex justify-end">
          <a
            href={downloadUrl}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
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
const PYQCard = ({ pyq, isPremium, onPreview, onBuy }) => {
  const canAccess = pyq.isFree || isPremium;
  const downloadUrl = getDownloadUrl(pyq.fileUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-md flex flex-col justify-between border"
    >
      <div className="p-4">
        <h3 className="text-lg font-bold">{pyq.year}</h3>
        <p className="text-sm text-gray-600">
          Class {pyq.classLevel} – {pyq.subject}
        </p>

        {!canAccess && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <FiLock /> Premium Required
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 border-t">
        {canAccess ? (
          <>
            <button
              onClick={onPreview}
              className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100"
            >
              <FiEye /> Preview
            </button>
            <a
              href={downloadUrl}
              className="flex items-center justify-center gap-2 py-2 hover:bg-indigo-100"
            >
              <FiDownload /> Download
            </a>
          </>
        ) : (
          <button
            onClick={onBuy}
            className="col-span-2 flex items-center justify-center gap-2 py-2 bg-red-600 text-white"
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/upload/public`, {
          params: { type: "pyq" },
        });
        setAllPapers(res.data?.uploads || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_URL]);

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allPapers.map((pyq) => (
            <PYQCard
              key={pyq.id}
              pyq={pyq}
              isPremium={isPremium}
              onPreview={() => setPreviewFile(pyq)}
              onBuy={handleBuyPremium}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {previewFile && (
          <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PYQPage;