import express from "express";
import { db } from "../config/firebase.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const snap = await db.collection("users").doc(uid).get();
    const data = snap.exists ? snap.data() : {};

    const now = new Date();

    // ✅ Firestore Timestamp safe handling
    const expiresAt =
      data.expiresAt?.toDate?.() ||
      (data.expiresAt ? new Date(data.expiresAt) : null);

    const isPremium = !!(
      data.isPremium &&
      expiresAt &&
      expiresAt > now
    );

    res.json({
      isPremium,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      subscriptionPlan: data.subscriptionPlan || null,
    });
  } catch (err) {
    console.error("❌ /api/me error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user status" });
  }
});

export default router;
