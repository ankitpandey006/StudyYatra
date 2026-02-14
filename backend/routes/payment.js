// backend/routes/payment.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "../firebaseAdmin.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * ✅ SINGLE PREMIUM PLAN (Platform-wide)
 * Razorpay amount is in paise:
 * ₹49 => 4900
 */
const PREMIUM_PLAN = "premium_yearly";
const PREMIUM_PRICE_PAISE = 4900; // ✅ always ₹49
const PREMIUM_DURATION_DAYS = 365;

const addDaysISO = (days) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing in backend .env");
  }
  return { razorpay: new Razorpay({ key_id, key_secret }), key_id, key_secret };
};

// ✅ receipt max 40 chars
const makeReceipt = (uid) => {
  const shortUid = String(uid || "").slice(0, 10);
  const t = Date.now().toString(36);
  return `rcpt_${shortUid}_p_${t}`.slice(0, 40);
};

/**
 * POST /api/payment/create-order
 * body: {} or { plan: anything } (we ignore plan and force ₹49 yearly)
 */
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const amount = PREMIUM_PRICE_PAISE;

    const { razorpay, key_id } = getRazorpay();

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: makeReceipt(uid),
      notes: { uid, plan: PREMIUM_PLAN },
    });

    await db.collection("orders").doc(order.id).set({
      uid,
      plan: PREMIUM_PLAN,
      amount,
      currency: "INR",
      status: "created",
      razorpayOrderId: order.id,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      key: key_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: PREMIUM_PLAN,
    });
  } catch (err) {
    console.error("❌ create-order error:", err?.statusCode, err?.error || err?.message || err);

    return res.status(err?.statusCode || 500).json({
      error: err?.error?.description || err?.message || "Failed to create order",
    });
  }
});

/**
 * POST /api/payment/verify
 * body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ ok: false, error: "RAZORPAY_KEY_SECRET missing in backend .env" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // ✅ signature verify
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // ✅ fetch order in firestore
    const orderRef = db.collection("orders").doc(razorpay_order_id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ ok: false, error: "Order not found" });
    }

    const orderData = orderSnap.data();

    // ✅ ensure same user
    if (orderData.uid !== uid) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    // ✅ already verified
    if (orderData.status === "paid") {
      return res.json({
        ok: true,
        alreadyVerified: true,
        expiresAt: orderData.expiresAt || null,
        plan: orderData.plan || PREMIUM_PLAN,
      });
    }

    // ✅ always 1 year premium
    const expiresAt = addDaysISO(PREMIUM_DURATION_DAYS);

    await db.runTransaction(async (t) => {
      t.update(orderRef, {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date().toISOString(),
        plan: PREMIUM_PLAN,
        expiresAt,
      });

      // ✅ platform-wide unlock flag in users/{uid}
      t.set(
        db.collection("users").doc(uid),
        {
          isPremium: true,
          subscriptionPlan: PREMIUM_PLAN,
          subscribedAt: new Date().toISOString(),
          expiresAt,
        },
        { merge: true }
      );
    });

    return res.json({ ok: true, expiresAt, plan: PREMIUM_PLAN });
  } catch (err) {
    console.error("❌ verify error:", err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || "Verification failed" });
  }
});

export default router;