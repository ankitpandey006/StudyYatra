// backend/routes/authRoutes.js
import express from "express";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";
import { auth, db } from "../config/firebase.js";

const router = express.Router();

/**
 * ✅ REGISTER USER
 * User signs up via Firebase Auth (frontend), then entry stored in Firestore
 */
router.post("/register", async (req, res) => {
  try {
    const { uid, email, name } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Firestore user entry
    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        uid,
        email,
        name: name || "",
        role: "user", // default role
        createdAt: new Date(),
      },
      { merge: true }
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ✅ LOGIN USER
 * Firebase ID Token verify & return user profile
 */
router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    // Verify Firebase ID token
    const decoded = await auth.verifyIdToken(token);

    // Fetch user from Firestore
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Login successful",
      user: userSnap.data(),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
});

/**
 * ✅ CHECK ADMIN
 * Secure endpoint for verifying admin role
 */
router.get("/check-admin", verifyToken, requireAdmin, async (req, res) => {
  res.json({ isAdmin: true });
});

export default router;
