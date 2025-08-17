import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// ✅ Check if user is admin
router.get("/:email", async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.params.email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userDoc.data();
    res.json({ isAdmin: userData.role === "admin" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
