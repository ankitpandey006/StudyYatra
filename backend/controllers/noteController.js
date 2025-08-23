// controllers/noteController.js
import { db } from "../config/firebase.js"; // ESM import

export const getNotes = async (req, res) => {
  try {
    const snapshot = await db.collection("notes").get();
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching notes", 
      error: error.message 
    });
  }
};

export const addNote = async (req, res) => {
  try {
    const { title, subject, fileUrl } = req.body;
    await db.collection("notes").add({
      title,
      subject,
      fileUrl,
      createdAt: new Date().toISOString()
    });
    res.json({ success: true, message: "Note added successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error adding note", 
      error: error.message 
    });
  }
};
