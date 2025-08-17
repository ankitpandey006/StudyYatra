import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// ➕ Upload quiz
router.post("/", async (req, res) => {
  try {
    const docRef = await db.collection("quizzes").add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📝 Get all quizzes
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
