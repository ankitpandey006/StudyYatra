// backend/routes/quizRoutes.js
import express from "express";
import { db } from "../firebaseAdmin.js";   // ✅ use only this

const router = express.Router();

// ➕ Upload quiz
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const normalized = {
      ...data,
      class: String(data.class || "").trim(),
      isFree: data.isFree === true || data.isFree === "true",
      duration: String(data.duration || ""),
      title: data.title || "Untitled Quiz",
      subject: data.subject || "General",
      questions: Array.isArray(data.questions) ? data.questions : [],
    };

    const docRef = await db.collection("quizzes").add(normalized);
    res.status(201).json({ id: docRef.id, ...normalized });
  } catch (error) {
    console.error("🔥 Quiz Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📝 Get all quizzes
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    const quizzes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(quizzes);
  } catch (error) {
    console.error("🔥 Quiz Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
