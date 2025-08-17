import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// ➕ Add a book
router.post("/", async (req, res) => {
  try {
    const docRef = await db.collection("books").add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📚 Get all books
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("books").get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
