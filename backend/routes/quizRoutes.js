// backend/routes/quizRoutes.js
import express from "express";
import { db } from "../firebaseAdmin.js";

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

// 📝 Get single quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quizRef = db.collection("quizzes").doc(req.params.id);
    const quizDoc = await quizRef.get();

    if (!quizDoc.exists) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json({ id: quizDoc.id, ...quizDoc.data() });
  } catch (error) {
    console.error("🔥 Quiz Fetch By ID Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
