// backend/middlewares/authMiddleware.js
import { auth, db } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await auth.verifyIdToken(token);

    req.user = decoded; // uid, email etc.
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // ✅ UID से fetch करो
    const userRef = db.collection("users").doc(req.user.uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.status(403).json({ message: "User not found" });
    }

    const userData = snap.data();

    if (userData.role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    next();
  } catch (error) {
    console.error("❌ Admin check failed:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
