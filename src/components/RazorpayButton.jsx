import React, { useState } from "react";
import axios from "axios";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

const RazorpayButton = ({
  amount,
  plan = "subscription",
  user = {},
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  // Load Razorpay SDK
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
    setLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Payment gateway failed to load. Please refresh.");
      setLoading(false);
      return;
    }

    const key = import.meta.env.VITE_RZP_KEY_ID;
    if (!key) {
      toast.error("Payment configuration missing.");
      setLoading(false);
      return;
    }

    try {
      const orderRes = await axios.post(
        `${API_BASE}/api/payment/create-order`,
        {
          amount: Math.round(Number(amount) * 100),
          notes: { plan, email: user?.email || "guest@example.com" },
        }
      );

      const { id: order_id, amount: orderAmount, currency } =
        orderRes.data;

      const options = {
        key,
        order_id,
        amount: orderAmount,
        currency,
        name: "StudyYatra",
        description: `${plan} plan subscription`,
        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "guest@example.com",
          contact: user?.phone || "",
        },
        theme: { color: "#4F46E5" },

        handler: async (rsp) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/api/payment/verify`,
              {
                razorpay_order_id: rsp.razorpay_order_id,
                razorpay_payment_id: rsp.razorpay_payment_id,
                razorpay_signature: rsp.razorpay_signature,
              }
            );

            if (verifyRes.data?.ok) {
              toast.success("Payment successful!");
              if (typeof onSuccess === "function") onSuccess();
              else window.location.reload();
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (e) {
            console.error("Verification error", e);
            toast.error("Payment succeeded but verification failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        console.error("Payment failed", resp?.error);
        toast.error(
          resp?.error?.description || "Payment failed. Please try again."
        );
      });

      rzp.open();
    } catch (err) {
      console.error("Order creation error", err?.response?.data || err?.message);
      toast.error("Could not initiate payment.");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="
        inline-flex items-center justify-center gap-2
        bg-indigo-600 hover:bg-indigo-700
        text-white font-medium
        px-6 py-2.5 rounded-xl
        shadow-sm hover:shadow-md
        transition disabled:opacity-70
      "
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Subscribe ₹{amount}
        </>
      )}
    </button>
  );
};

export default RazorpayButton;