// backend/routes/payment.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  Razorpay env vars missing. Check backend .env");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Expects: { amount } where amount is in paise (integer)
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount,            // already in paise from frontend
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: req.body.notes || {},
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error("❌ create-order error:", err?.message, err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

/**
 * POST /api/payment/verify
 * Expects: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // 👉 Mark user as premium, save payment to DB, send email, etc.
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ verify error:", err?.message, err);
    return res.status(500).json({ ok: false, error: "Verification failed" });
  }
});

export default router;
