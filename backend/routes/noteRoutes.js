import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// ➕ Upload note
router.post("/", async (req, res) => {
  try {
    const docRef = await db.collection("notes").add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📒 Get all notes
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("notes").get();
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
