// backend/middlewares/authMiddleware.js
import { auth, db } from "../config/firebase.js";

/**
 * verifyToken
 * - Expects: Authorization: Bearer <FIREBASE_ID_TOKEN>
 * - Adds: req.user (decoded token: uid, email, etc.)
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const token = authHeader.slice(7); // after "Bearer "
    const decoded = await auth.verifyIdToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error?.message || error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * requireAdmin
 * - Requires verifyToken before this middleware
 * - Checks Firestore: users/{uid}.role === "admin"
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) {
      return res
        .status(403)
        .json({ success: false, message: "User not found in Firestore" });
    }

    const userData = snap.data();
    if (userData?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access denied" });
    }

    next();
  } catch (error) {
    console.error("❌ Admin check failed:", error?.message || error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};
