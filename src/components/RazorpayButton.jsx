import React from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

const RazorpayButton = ({ amount, plan = "subscription", user = {}, onSuccess }) => {
  // Load Razorpay SDK once
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("❌ Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    const key = import.meta.env.VITE_RZP_KEY_ID;
    if (!key) {
      alert("❌ Missing VITE_RZP_KEY_ID in frontend .env");
      return;
    }

    try {
      // ✅ Multiply ONCE here (to paise)
      const orderRes = await axios.post(`${API_BASE}/api/payment/create-order`, {
        amount: Math.round(Number(amount) * 100),
        notes: { plan, email: user?.email || "anonymous@example.com" },
      });

      const { id: order_id, amount: orderAmount, currency } = orderRes.data;

      const options = {
        key,
        order_id,
        amount: orderAmount,
        currency,
        name: "StudyYatra",
        description: `${plan} plan subscription`,
        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "anonymous@example.com",
          contact: user?.phone || "",
        },
        theme: { color: "#6366F1" },

        // ✅ On success, verify on backend
        handler: async (rsp) => {
          try {
            const verifyRes = await axios.post(`${API_BASE}/api/payment/verify`, {
              razorpay_order_id: rsp.razorpay_order_id,
              razorpay_payment_id: rsp.razorpay_payment_id,
              razorpay_signature: rsp.razorpay_signature,
            });

            if (verifyRes.data?.ok) {
              alert(`🎉 Payment successful! ID: ${rsp.razorpay_payment_id}`);
              if (typeof onSuccess === "function") onSuccess();
              else window.location.reload();
            } else {
              alert("⚠️ Payment could not be verified. Please contact support.");
            }
          } catch (e) {
            console.error("verify error", e);
            alert("⚠️ Payment succeeded but verification failed.");
          }
        },
      };

      // ✅ Also catch failures from the checkout modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        console.error("payment.failed", resp?.error);
        alert(`❌ Payment failed: ${resp?.error?.description || "Unknown error"}`);
      });

      rzp.open();
    } catch (err) {
      console.error("order/create error", err?.response?.data || err?.message);
      alert("⚠️ Could not initiate payment. See console for details.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Subscribe ₹{amount}
    </button>
  );
};

export default RazorpayButton;
