// backend/routes/quizRoutes.js
import express from "express";
import { db } from "../config/firebase.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Helper: normalize/validate quiz payload
 * Expected JSON (example):
 * {
 *   "title": "Test 1",
 *   "class": "10",
 *   "subject": "Science",
 *   "duration": "60",
 *   "isFree": true,
 *   "questions": [
 *     { "question": "...", "options": ["A","B","C","D"], "correctIndex": 2 }
 *   ]
 * }
 */
const normalizeQuiz = (data = {}) => {
  const title = String(data.title || "Untitled Quiz").trim();
  const className = String(data.class || "").trim(); // "10", "12"
  const subject = String(data.subject || "General").trim();
  const duration = String(data.duration || "").trim(); // "60"
  const isFree = data.isFree === true || data.isFree === "true";

  const questions = Array.isArray(data.questions) ? data.questions : [];

  const normalizedQuestions = questions.map((q, idx) => {
    const question = String(q.question || "").trim();
    const options = Array.isArray(q.options) ? q.options.map(String) : [];
    const correctIndex =
      typeof q.correctIndex === "number" ? q.correctIndex : Number(q.correctIndex);

    return {
      qNo: q.qNo ?? idx + 1,
      question,
      options,
      correctIndex,
      explanation: q.explanation ? String(q.explanation) : "",
    };
  });

  return {
    title,
    class: className,
    subject,
    duration,
    isFree,
    questions: normalizedQuestions,
  };
};

const validateQuiz = (quiz) => {
  if (!quiz.title) return "Title is required";
  if (!quiz.questions || quiz.questions.length === 0) return "Questions array is required";

  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    if (!q.question) return `Question text missing at #${i + 1}`;
    if (!Array.isArray(q.options) || q.options.length < 2)
      return `Options must have at least 2 items at #${i + 1}`;
    if (Number.isNaN(q.correctIndex)) return `correctIndex missing at #${i + 1}`;
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
      return `correctIndex out of range at #${i + 1}`;
  }
  return null;
};

/**
 * ✅ ADMIN: Create quiz (direct JSON / form submit)
 * POST /api/quizzes
 */
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const normalized = normalizeQuiz(req.body);
    const err = validateQuiz(normalized);
    if (err) return res.status(400).json({ message: err });

    const payload = {
      ...normalized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: req.body.isPublished ?? true,
      createdBy: req.user?.uid || null,
    };

    const docRef = await db.collection("quizzes").add(payload);

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quizId: docRef.id,
    });
  } catch (error) {
    console.error("🔥 Quiz create error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ✅ ADMIN: Import quiz (Admin panel JSON upload)
 * POST /api/quizzes/import
 */
router.post("/import", verifyToken, requireAdmin, async (req, res) => {
  try {
    const normalized = normalizeQuiz(req.body);
    const err = validateQuiz(normalized);
    if (err) return res.status(400).json({ message: err });

    const payload = {
      ...normalized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: req.body.isPublished ?? true,
      createdBy: req.user?.uid || null,
      importSource: "admin-panel",
    };

    const docRef = await db.collection("quizzes").add(payload);

    return res.status(201).json({
      success: true,
      message: "Quiz imported successfully",
      quizId: docRef.id,
      totalQuestions: payload.questions.length,
    });
  } catch (error) {
    console.error("🔥 Quiz import error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ✅ PUBLIC: Get all quizzes
 * GET /api/quizzes
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").orderBy("createdAt", "desc").get();

    const quizzes = snapshot.docs.map((doc) => {
      const data = doc.data();
      const { questions, ...rest } = data; // list view me questions mat bhejo
      return { id: doc.id, ...rest, totalQuestions: questions?.length || 0 };
    });

    return res.json({ success: true, quizzes });
  } catch (error) {
    console.error("🔥 Quiz list error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ✅ PUBLIC: Get quiz by ID (includes questions)
 * GET /api/quizzes/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const quizRef = db.collection("quizzes").doc(req.params.id);
    const snap = await quizRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    return res.json({ success: true, quiz: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error("🔥 Quiz getById error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ✅ ADMIN: Delete quiz
 * DELETE /api/quizzes/:id
 */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const quizRef = db.collection("quizzes").doc(req.params.id);
    const snap = await quizRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    await quizRef.delete();

    return res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("🔥 Quiz delete error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;