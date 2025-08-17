import React from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ FIXED PATH
import { Crown } from "lucide-react";

const SubscriptionPage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <p className="text-center text-red-500 mt-10 px-4">
        🔐 Please log in to subscribe.
      </p>
    );
  }

  if (currentUser.isPremium) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center mt-10 bg-green-50 border border-green-300 rounded-lg shadow">
        <Crown className="mx-auto text-green-500 mb-2" size={40} />
        <h1 className="text-3xl font-bold text-green-700 mb-1">🎉 You’re a Premium Member!</h1>
        <p className="text-lg">
          Your Plan: <strong className="text-green-800">{currentUser.subscriptionPlan}</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Expiry Date: <strong>{new Date(currentUser.expiresAt).toLocaleDateString()}</strong>
        </p>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      const amount = 4900;

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"}/api/payment/create-order`, // ✅ Use env
        {
          amount,
          plan: "yearly",
          userEmail: currentUser.email,
        }
      );

      const order = response.data;

      const options = {
        key: import.meta.env.VITE_RZP_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "StudyNest",
        description: "Yearly Subscription",
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"}/api/payment/verify`,
              {
                response,
                plan: "yearly",
                userEmail: currentUser.email,
                amount,
              }
            );

            alert("🎉 Payment successful! Receipt sent to your email.");
            window.location.reload();
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("⚠️ Payment succeeded but verification failed. Contact support.");
          }
        },
        prefill: {
          name: currentUser.displayName || "StudyNest User",
          email: currentUser.email,
        },
        theme: {
          color: "#6366F1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Payment failed. Please try again.");
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
          <span className="text-3xl sm:text-4xl font-bold text-green-700">₹49</span>
          <span className="text-gray-500 line-through text-lg">₹100</span>
          <span className="bg-yellow-300 text-yellow-900 text-sm px-2 py-1 rounded-full font-semibold">
            51% OFF
          </span>
        </div>

        <button
          onClick={handlePayment}
          className="w-full sm:w-auto bg-yellow-500 text-white text-lg font-semibold px-6 py-3 rounded-full shadow hover:bg-yellow-600 transition"
        >
          Subscribe Now
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Premium access is valid for 1 year from the payment date.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
