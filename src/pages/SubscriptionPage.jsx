import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Crown } from "lucide-react";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const SubscriptionPage = () => {
  const { currentUser } = useAuth();
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <p className="text-center text-red-500 mt-10 px-4">
        🔐 Please log in to subscribe.
      </p>
    );
  }

  // ✅ (optional) expiry check: agar expiresAt future me hai tabhi premium
  const isActivePremium =
    currentUser?.isPremium &&
    (!currentUser?.expiresAt || new Date(currentUser.expiresAt) > new Date());

  if (isActivePremium) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center mt-10 bg-green-50 border border-green-300 rounded-lg shadow">
        <Crown className="mx-auto text-green-500 mb-2" size={40} />
        <h1 className="text-3xl font-bold text-green-700 mb-1">
          🎉 You’re a Premium Member!
        </h1>
        <p className="text-lg">
          Your Plan:{" "}
          <strong className="text-green-800">
            {currentUser.subscriptionPlan || "Premium"}
          </strong>
        </p>
        <p className="text-gray-600 mt-2">
          Expiry Date:{" "}
          <strong>
            {currentUser.expiresAt
              ? new Date(currentUser.expiresAt).toLocaleDateString()
              : "—"}
          </strong>
        </p>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setLoading(true);

      const ok = await loadRazorpay();
      if (!ok) {
        alert("Razorpay SDK load failed. Check internet.");
        return;
      }

      // ✅ Firebase ID token for verifyToken middleware
      const token = await currentUser.getIdToken();

      // ✅ Create order (NO plan) -> backend will always make ₹49 order
      const { data: order } = await axios.post(
        `${API}/api/payment/create-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // order: { key, orderId, amount, currency, plan }
      const options = {
        key: order.key, // ✅ use backend key
        amount: order.amount,
        currency: order.currency,
        name: "StudyYatra",
        description: "Premium (1 Year) Subscription",
        order_id: order.orderId,
        handler: async function (rsp) {
          try {
            await axios.post(
              `${API}/api/payment/verify`,
              {
                razorpay_order_id: rsp.razorpay_order_id,
                razorpay_payment_id: rsp.razorpay_payment_id,
                razorpay_signature: rsp.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("🎉 Payment successful! Premium activated.");

            // ✅ simplest: reload to refetch user premium state
            window.location.reload();

            // (optional) Agar tum chaho to premium ke baad redirect:
            // window.location.href = "/notes";
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr?.response?.data || verifyErr);
            alert("⚠️ Payment ok but verification failed. Please contact support.");
          }
        },
        prefill: {
          name: currentUser.displayName || "StudyYatra User",
          email: currentUser.email,
        },
        theme: { color: "#6366F1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err?.response?.data || err);
      alert(err?.response?.data?.error || "❌ Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto mt-10">
      <div className="bg-white border border-yellow-300 rounded-lg p-6 sm:p-8 shadow-md text-center">
        <Crown className="text-yellow-500 mx-auto mb-4" size={48} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
          🚀 Go Premium & Unlock Everything
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Get unlimited access to all mock tests, notes, and PYQs for 12 months.
        </p>

        <div className="mb-6 flex items-center justify-center flex-wrap gap-2">
          <span className="text-3xl sm:text-4xl font-bold text-green-700">
            ₹49
          </span>
          <span className="text-gray-500 line-through text-lg">₹100</span>
          <span className="bg-yellow-300 text-yellow-900 text-sm px-2 py-1 rounded-full font-semibold">
            51% OFF
          </span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full sm:w-auto bg-yellow-500 disabled:opacity-60 text-white text-lg font-semibold px-6 py-3 rounded-full shadow hover:bg-yellow-600 transition"
        >
          {loading ? "Processing..." : "Subscribe Now"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Premium access is valid for 1 year from the payment date.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;