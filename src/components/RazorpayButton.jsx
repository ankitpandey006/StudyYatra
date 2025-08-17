import React from 'react';
import axios from 'axios';

const RazorpayButton = ({ amount, plan = 'subscription', user = {}, onSuccess }) => {
  // 🔁 Load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('❌ Razorpay SDK failed to load. Please refresh and try again.');
      return;
    }

    const key = import.meta.env.VITE_RZP_KEY_ID;
    if (!key) {
      alert('❌ Razorpay Key not found. Check your .env setup.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5050/api/payment/create-order', {
        amount: amount * 100, // paise
        plan,
        userEmail: user?.email || 'anonymous@example.com',
      });

      const { id: order_id, amount: orderAmount, currency } = response.data;

      const options = {
        key,
        amount: orderAmount,
        currency,
        name: 'StudyNest',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
        order_id,
        handler: async function (paymentResponse) {
          alert(`🎉 Payment successful! Payment ID: ${paymentResponse.razorpay_payment_id}`);

          try {
            await axios.post('http://localhost:5050/api/payment/verify', {
              response: paymentResponse,
              plan,
              userEmail: user?.email || 'anonymous@example.com',
            });

            if (typeof onSuccess === 'function') {
              onSuccess(); // ⏎ Optional callback for post-payment action
            } else {
              window.location.reload(); // 🔁 reload to update UI
            }
          } catch (verifyErr) {
            console.error('❌ Verification failed:', verifyErr);
            alert('⚠️ Payment succeeded but verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || 'anonymous@example.com',
          contact: user?.phone || '',
        },
        theme: {
          color: '#6366F1',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('❌ Order creation failed:', err);
      alert('⚠️ Could not initiate payment. Please try again.');
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
