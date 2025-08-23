// controllers/paymentController.js
export const createPayment = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // यहां Payment Gateway Integration (Razorpay / Stripe) का code आएगा
    res.json({ success: true, message: "Payment processed successfully" });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Payment error", 
      error: error.message 
    });
  }
};
