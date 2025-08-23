// controllers/bookController.js
import { db } from "../config/firebase.js"; // firebase.js में ESM export होना चाहिए

export const getBooks = async (req, res) => {
  try {
    const snapshot = await db.collection("books").get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(books);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching books", 
      error: error.message 
    });
  }
};

export const addBook = async (req, res) => {
  try {
    const { title, author, fileUrl } = req.body;
    await db.collection("books").add({
      title, 
      author, 
      fileUrl, 
      createdAt: new Date().toISOString()
    });
    res.json({ success: true, message: "Book added successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error adding book", 
      error: error.message 
    });
  }
};
