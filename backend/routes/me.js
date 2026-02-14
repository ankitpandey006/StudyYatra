import express from "express";
import { db } from "../firebaseAdmin.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db.collection("users").doc(uid).get();
    const data = snap.exists ? snap.data() : {};

    const now = new Date();
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const isPremium =
      data.isPremium &&
      expiresAt &&
      expiresAt > now;

    res.json({
      isPremium: !!isPremium,
      expiresAt: data.expiresAt || null,
      subscriptionPlan: data.subscriptionPlan || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user status" });
  }
});

export default router;