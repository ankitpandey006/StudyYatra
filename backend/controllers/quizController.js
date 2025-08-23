// controllers/quizController.js
import { db } from "../config/firebase.js"; // अब firebase.js से db import होगा

export const getQuizzes = async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quizzes", error: error.message });
  }
};

export const addQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;
    await db.collection("quizzes").add({ 
      title, 
      questions, 
      createdAt: new Date().toISOString() 
    });
    res.json({ success: true, message: "Quiz added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding quiz", error: error.message });
  }
};
