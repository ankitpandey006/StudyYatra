import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// ➕ Register or update user
router.post("/", async (req, res) => {
  try {
    const { email, ...userData } = req.body;
    await db.collection("users").doc(email).set(userData, { merge: true });
    res.status(201).json({ message: "User saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👤 Get user by email
router.get("/:email", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.email).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
