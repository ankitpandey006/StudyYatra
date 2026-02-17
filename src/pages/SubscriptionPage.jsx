import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { usePremium } from "../hooks/usePremium"; // ✅ ADD THIS
import {
  Crown,
  Lock,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";

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
  const { isPremium, loading: premiumLoading } = usePremium(); // ✅ USE HOOK
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
  const [loading, setLoading] = useState(false);

  // Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-6 sm:p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
            <Lock className="text-gray-700" />
          </div>
          <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
            Sign in required
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please log in to view subscription options and activate Premium.
          </p>
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 font-medium shadow-md hover:shadow-lg hover:brightness-105 transition"
            >
              Go to Login <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ✅ IMPORTANT: premium check loading guard (reload flash fix)
  if (premiumLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-sm text-gray-600">Checking subscription...</div>
      </div>
    );
  }

  // ✅ Premium status from hook
  const isActivePremium = !!isPremium;

  // Premium view
  if (isActivePremium) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center shadow-sm">
                <Crown className="text-green-700" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Premium is active
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  You have full access to premium content.
                </p>
              </div>
            </div>

            {/* NOTE: subscriptionPlan/expiresAt tum /api/me me return karwa rahe ho,
               to unko show karna ho to hook ko extend karke data return kara do */}
            <div className="sm:text-right">
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold text-gray-900">Premium</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Unlimited Mock Tests", "Notes & PYQs Access", "Priority Updates"].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-green-100 bg-green-50/60 px-4 py-3 flex items-center gap-2"
              >
                <CheckCircle2 className="text-green-700" size={18} />
                <span className="text-sm font-medium text-green-900">{t}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              If you face any access issue, please contact support.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
            >
              Continue to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Payment
  const handlePayment = async () => {
    try {
      setLoading(true);

      const ok = await loadRazorpay();
      if (!ok) {
        alert("Razorpay SDK failed to load. Please check your internet.");
        return;
      }

      // ✅ always get fresh token (esp. after reload)
      const token = await currentUser.getIdToken(true);

      const { data: order } = await axios.post(
        `${API}/api/payment/create-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "StudyYatra",
        description: "Premium (1 Year) Subscription",
        order_id: order.orderId,

        handler: async function (rsp) {
          try {
            // ✅ get fresh token again inside handler
            const freshToken = await currentUser.getIdToken(true);

            await axios.post(
              `${API}/api/payment/verify`,
              {
                razorpay_order_id: rsp.razorpay_order_id,
                razorpay_payment_id: rsp.razorpay_payment_id,
                razorpay_signature: rsp.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${freshToken}` } }
            );

            alert("Payment successful. Premium activated.");
            window.location.reload(); // now reload will show Activated ✅
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr?.response?.data || verifyErr);
            alert("Payment completed but verification failed. Please contact support.");
          }
        },

        prefill: {
          name: currentUser.displayName || "StudyYatra User",
          email: currentUser.email,
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err?.response?.data || err);
      alert(err?.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-4 py-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shadow-sm">
                <Crown className="text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Upgrade to Premium
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Unlock full access to mock tests, notes, and PYQs for 12 months.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Unlimited access to all mock tests",
                "Download notes and previous year questions",
                "New content updates during your plan",
                "One-year validity from activation date",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <CheckCircle2 className="text-green-700 mt-0.5" size={18} />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-4 flex items-start gap-3">
              <ShieldCheck className="text-indigo-700 mt-0.5" size={18} />
              <p className="text-sm text-indigo-900">
                Secure payment powered by Razorpay. We do not store your card/UPI details.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Annual Plan</p>
              <span className="text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 px-3 py-1">
                Limited offer
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                  ₹49
                </span>
                <span className="text-lg text-gray-500 line-through">₹100</span>
                <span className="text-sm font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  Save 51%
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Billed once. Access valid for 12 months.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CreditCard size={18} className="text-gray-700" />
                <span>UPI, Cards, Netbanking supported</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Premium access is activated after payment verification.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Subscribe now"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              By subscribing, you agree to StudyYatra’s Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;