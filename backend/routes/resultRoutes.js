import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// ➕ Save result
router.post("/", async (req, res) => {
  try {
    const docRef = await db.collection("results").add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 Get results
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("results").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
